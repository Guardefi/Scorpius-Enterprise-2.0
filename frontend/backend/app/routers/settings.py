"""
Settings management router for environment orchestration
"""
import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
import docker
import yaml

from ..models.security import (
    SystemSetting, ModuleConfiguration,
    get_settings_db
)
from ..routers.auth import get_verified_user
from ..models.user import User
from ..core.config import settings

router = APIRouter(prefix="/settings", tags=["settings"])

# Request/Response models
class SettingUpdate(BaseModel):
    category: str
    key: str
    value: str
    value_type: str = "string"
    description: Optional[str] = None

class ModuleConfig(BaseModel):
    module_name: str
    config_data: Dict[str, Any]
    env_variables: Optional[Dict[str, str]] = None
    is_enabled: bool = True

class RPCConfiguration(BaseModel):
    rpc_url: str
    network_name: str
    chain_id: Optional[int] = None
    block_explorer_url: Optional[str] = None
    api_key: Optional[str] = None
    
    @validator('rpc_url')
    def validate_rpc_url(cls, v):
        if not v.startswith(('http://', 'https://', 'ws://', 'wss://')):
            raise ValueError('RPC URL must start with http://, https://, ws://, or wss://')
        return v

class EnvironmentOrchestrator:
    """Orchestrates environment variables across all modules"""
    
    def __init__(self):
        self.docker_client = None
        self.module_configs = {
            "slither": {
                "env_file": ".env.slither",
                "required_vars": ["WEB3_PROVIDER_URI", "SOLC_VERSION"],
                "optional_vars": ["SLITHER_CACHE_DIR", "SLITHER_TIMEOUT"]
            },
            "manticore": {
                "env_file": ".env.manticore",
                "required_vars": ["WEB3_PROVIDER_URI", "MANTICORE_WORKSPACE"],
                "optional_vars": ["MANTICORE_VERBOSITY", "MANTICORE_TIMEOUT"]
            },
            "mythril": {
                "env_file": ".env.mythril",
                "required_vars": ["WEB3_PROVIDER_URI"],
                "optional_vars": ["MYTHRIL_DIR", "MYTHRIL_SOLC_VERSION"]
            },
            "honeypot": {
                "env_file": ".env.honeypot",
                "required_vars": ["RPC_URL", "PRIVATE_KEY"],
                "optional_vars": ["GAS_LIMIT", "GAS_PRICE"]
            },
            "forensics": {
                "env_file": ".env.forensics",
                "required_vars": ["BLOCKCHAIN_RPC", "ETHERSCAN_API_KEY"],
                "optional_vars": ["ARCHIVE_NODE_RPC", "IPFS_GATEWAY"]
            }
        }
    
    def get_docker_client(self):
        """Get Docker client for container management"""
        if not self.docker_client:
            self.docker_client = docker.from_env()
        return self.docker_client
    
    async def update_module_environments(self, rpc_config: RPCConfiguration, user_id: int):
        """Update all module environment files with new RPC configuration"""
        updates = {}
        
        for module_name, config in self.module_configs.items():
            env_vars = self.generate_module_env_vars(module_name, rpc_config)
            
            # Write environment file
            env_file_path = f"/app/modules/{module_name}/{config['env_file']}"
            await self.write_env_file(env_file_path, env_vars)
            
            # Restart module container if running
            await self.restart_module_container(module_name)
            
            updates[module_name] = {
                "env_file": env_file_path,
                "variables": env_vars,
                "status": "updated"
            }
        
        return updates
    
    def generate_module_env_vars(self, module_name: str, rpc_config: RPCConfiguration) -> Dict[str, str]:
        """Generate environment variables for specific module"""
        base_vars = {
            "WEB3_PROVIDER_URI": rpc_config.rpc_url,
            "RPC_URL": rpc_config.rpc_url,
            "BLOCKCHAIN_RPC": rpc_config.rpc_url,
            "NETWORK_NAME": rpc_config.network_name,
        }
        
        if rpc_config.chain_id:
            base_vars["CHAIN_ID"] = str(rpc_config.chain_id)
        
        if rpc_config.block_explorer_url:
            base_vars["BLOCK_EXPLORER_URL"] = rpc_config.block_explorer_url
        
        if rpc_config.api_key:
            base_vars["ETHERSCAN_API_KEY"] = rpc_config.api_key
            base_vars["API_KEY"] = rpc_config.api_key
        
        # Module-specific variables
        if module_name == "slither":
            base_vars.update({
                "SOLC_VERSION": "0.8.19",
                "SLITHER_CACHE_DIR": "/tmp/slither_cache",
                "SLITHER_TIMEOUT": "300"
            })
        elif module_name == "manticore":
            base_vars.update({
                "MANTICORE_WORKSPACE": "/tmp/manticore_workspace",
                "MANTICORE_VERBOSITY": "1",
                "MANTICORE_TIMEOUT": "600"
            })
        elif module_name == "mythril":
            base_vars.update({
                "MYTHRIL_DIR": "/tmp/mythril",
                "MYTHRIL_SOLC_VERSION": "0.8.19"
            })
        elif module_name == "honeypot":
            base_vars.update({
                "GAS_LIMIT": "21000",
                "GAS_PRICE": "20000000000"
            })
        elif module_name == "forensics":
            base_vars.update({
                "ARCHIVE_NODE_RPC": rpc_config.rpc_url,
                "IPFS_GATEWAY": "https://ipfs.io/ipfs/"
            })
        
        return base_vars
    
    async def write_env_file(self, file_path: str, env_vars: Dict[str, str]):
        """Write environment variables to file"""
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Write .env file
            with open(file_path, 'w') as f:
                for key, value in env_vars.items():
                    f.write(f"{key}={value}\n")
            
            print(f"Updated environment file: {file_path}")
        except Exception as e:
            print(f"Failed to write env file {file_path}: {e}")
            raise
    
    async def restart_module_container(self, module_name: str):
        """Restart module Docker container to reload environment"""
        try:
            client = self.get_docker_client()
            container_name = f"scorpius-{module_name}"
            
            try:
                container = client.containers.get(container_name)
                container.restart()
                print(f"Restarted container: {container_name}")
            except docker.errors.NotFound:
                print(f"Container {container_name} not found, skipping restart")
        except Exception as e:
            print(f"Failed to restart container {module_name}: {e}")
    
    async def test_module_configuration(self, module_name: str, env_vars: Dict[str, str]) -> Dict[str, Any]:
        """Test module configuration"""
        test_results = {
            "module": module_name,
            "status": "success",
            "tests": [],
            "errors": []
        }
        
        try:
            # Test RPC connection
            if "WEB3_PROVIDER_URI" in env_vars or "RPC_URL" in env_vars:
                rpc_url = env_vars.get("WEB3_PROVIDER_URI") or env_vars.get("RPC_URL")
                rpc_test = await self.test_rpc_connection(rpc_url)
                test_results["tests"].append(rpc_test)
                
                if not rpc_test["success"]:
                    test_results["status"] = "failed"
                    test_results["errors"].append(f"RPC connection failed: {rpc_test['error']}")
            
            # Module-specific tests
            if module_name == "slither":
                solc_test = await self.test_solc_installation()
                test_results["tests"].append(solc_test)
            elif module_name == "mythril":
                mythril_test = await self.test_mythril_installation()
                test_results["tests"].append(mythril_test)
            elif module_name == "manticore":
                manticore_test = await self.test_manticore_installation()
                test_results["tests"].append(manticore_test)
        
        except Exception as e:
            test_results["status"] = "failed"
            test_results["errors"].append(str(e))
        
        return test_results
    
    async def test_rpc_connection(self, rpc_url: str) -> Dict[str, Any]:
        """Test RPC connection"""
        try:
            import aiohttp
            
            async with aiohttp.ClientSession() as session:
                payload = {
                    "jsonrpc": "2.0",
                    "method": "eth_blockNumber",
                    "params": [],
                    "id": 1
                }
                
                async with session.post(rpc_url, json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        if "result" in data:
                            return {
                                "name": "RPC Connection",
                                "success": True,
                                "message": f"Connected to block {int(data['result'], 16)}"
                            }
                    
                    return {
                        "name": "RPC Connection",
                        "success": False,
                        "error": f"HTTP {response.status}"
                    }
        except Exception as e:
            return {
                "name": "RPC Connection",
                "success": False,
                "error": str(e)
            }
    
    async def test_solc_installation(self) -> Dict[str, Any]:
        """Test Solidity compiler installation"""
        try:
            process = await asyncio.create_subprocess_exec(
                'solc', '--version',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                version = stdout.decode().split('\n')[0]
                return {
                    "name": "Solc Installation",
                    "success": True,
                    "message": version
                }
            else:
                return {
                    "name": "Solc Installation",
                    "success": False,
                    "error": stderr.decode()
                }
        except Exception as e:
            return {
                "name": "Solc Installation",
                "success": False,
                "error": str(e)
            }
    
    async def test_mythril_installation(self) -> Dict[str, Any]:
        """Test Mythril installation"""
        try:
            process = await asyncio.create_subprocess_exec(
                'myth', 'version',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                return {
                    "name": "Mythril Installation",
                    "success": True,
                    "message": stdout.decode().strip()
                }
            else:
                return {
                    "name": "Mythril Installation",
                    "success": False,
                    "error": stderr.decode()
                }
        except Exception as e:
            return {
                "name": "Mythril Installation",
                "success": False,
                "error": str(e)
            }
    
    async def test_manticore_installation(self) -> Dict[str, Any]:
        """Test Manticore installation"""
        try:
            process = await asyncio.create_subprocess_exec(
                'python', '-c', 'import manticore; print(manticore.__version__)',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                return {
                    "name": "Manticore Installation",
                    "success": True,
                    "message": f"Version {stdout.decode().strip()}"
                }
            else:
                return {
                    "name": "Manticore Installation",
                    "success": False,
                    "error": stderr.decode()
                }
        except Exception as e:
            return {
                "name": "Manticore Installation",
                "success": False,
                "error": str(e)
            }

# Initialize orchestrator
orchestrator = EnvironmentOrchestrator()

@router.post("/rpc")
async def configure_rpc(
    rpc_config: RPCConfiguration,
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_settings_db)
):
    """Configure RPC settings for all modules"""
    
    try:
        # Update all module environments
        updates = await orchestrator.update_module_environments(rpc_config, current_user.id)
        
        # Store RPC configuration in database
        rpc_setting = SystemSetting(
            user_id=current_user.id,
            category="rpc",
            key="configuration",
            value=json.dumps(rpc_config.dict()),
            value_type="json",
            description="RPC configuration for blockchain connection"
        )
        
        # Remove existing RPC config
        db.query(SystemSetting).filter(
            SystemSetting.user_id == current_user.id,
            SystemSetting.category == "rpc",
            SystemSetting.key == "configuration"
        ).delete()
        
        db.add(rpc_setting)
        db.commit()
        
        return {
            "success": True,
            "message": "RPC configuration updated for all modules",
            "modules_updated": list(updates.keys()),
            "details": updates
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to configure RPC: {str(e)}"
        )

@router.get("/rpc")
async def get_rpc_configuration(
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_settings_db)
):
    """Get current RPC configuration"""
    
    rpc_setting = db.query(SystemSetting).filter(
        SystemSetting.user_id == current_user.id,
        SystemSetting.category == "rpc",
        SystemSetting.key == "configuration"
    ).first()
    
    if not rpc_setting:
        return {"configured": False}
    
    return {
        "configured": True,
        "configuration": json.loads(rpc_setting.value)
    }

@router.post("/modules/{module_name}/configure")
async def configure_module(
    module_name: str,
    config: ModuleConfig,
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_settings_db)
):
    """Configure specific module"""
    
    if module_name not in orchestrator.module_configs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown module: {module_name}"
        )
    
    try:
        # Test configuration
        env_vars = config.env_variables or {}
        test_results = await orchestrator.test_module_configuration(module_name, env_vars)
        
        # Store configuration
        existing_config = db.query(ModuleConfiguration).filter(
            ModuleConfiguration.user_id == current_user.id,
            ModuleConfiguration.module_name == module_name
        ).first()
        
        if existing_config:
            existing_config.config_data = config.config_data
            existing_config.env_variables = config.env_variables
            existing_config.is_enabled = config.is_enabled
            existing_config.test_result = test_results
            existing_config.is_configured = test_results["status"] == "success"
        else:
            module_config = ModuleConfiguration(
                user_id=current_user.id,
                module_name=module_name,
                config_data=config.config_data,
                env_variables=config.env_variables,
                is_enabled=config.is_enabled,
                test_result=test_results,
                is_configured=test_results["status"] == "success"
            )
            db.add(module_config)
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Module {module_name} configured successfully",
            "test_results": test_results
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to configure module: {str(e)}"
        )

@router.get("/modules")
async def get_module_configurations(
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_settings_db)
):
    """Get all module configurations"""
    
    configs = db.query(ModuleConfiguration).filter(
        ModuleConfiguration.user_id == current_user.id
    ).all()
    
    result = {}
    for config in configs:
        result[config.module_name] = {
            "is_enabled": config.is_enabled,
            "is_configured": config.is_configured,
            "config_data": config.config_data,
            "env_variables": config.env_variables,
            "last_tested": config.last_tested.isoformat() if config.last_tested else None,
            "test_result": config.test_result
        }
    
    return result

@router.post("/modules/{module_name}/test")
async def test_module_configuration(
    module_name: str,
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_settings_db)
):
    """Test module configuration"""
    
    config = db.query(ModuleConfiguration).filter(
        ModuleConfiguration.user_id == current_user.id,
        ModuleConfiguration.module_name == module_name
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module configuration not found"
        )
    
    try:
        test_results = await orchestrator.test_module_configuration(
            module_name, config.env_variables or {}
        )
        
        # Update test results
        config.test_result = test_results
        config.last_tested = func.now()
        config.is_configured = test_results["status"] == "success"
        db.commit()
        
        return test_results
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to test module: {str(e)}"
        )

@router.get("/system")
async def get_system_settings(
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_settings_db)
):
    """Get all system settings"""
    
    settings_list = db.query(SystemSetting).filter(
        SystemSetting.user_id == current_user.id
    ).all()
    
    result = {}
    for setting in settings_list:
        if setting.category not in result:
            result[setting.category] = {}
        
        value = setting.value
        if setting.value_type == "json":
            value = json.loads(setting.value)
        elif setting.value_type == "number":
            value = float(setting.value)
        elif setting.value_type == "boolean":
            value = setting.value.lower() == "true"
        
        result[setting.category][setting.key] = {
            "value": value,
            "type": setting.value_type,
            "description": setting.description
        }
    
    return result

@router.put("/system")
async def update_system_setting(
    setting: SettingUpdate,
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_settings_db)
):
    """Update system setting"""
    
    # Find existing setting
    existing = db.query(SystemSetting).filter(
        SystemSetting.user_id == current_user.id,
        SystemSetting.category == setting.category,
        SystemSetting.key == setting.key
    ).first()
    
    if existing:
        existing.value = setting.value
        existing.value_type = setting.value_type
        existing.description = setting.description
    else:
        new_setting = SystemSetting(
            user_id=current_user.id,
            category=setting.category,
            key=setting.key,
            value=setting.value,
            value_type=setting.value_type,
            description=setting.description
        )
        db.add(new_setting)
    
    db.commit()
    
    return {"success": True, "message": "Setting updated successfully"}
