"""
Scorpius Configuration Orchestrator
Centralized configuration management with security and automation
"""

import os
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

import yaml
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jsonschema
from jinja2 import Template
import docker
import hvac  # HashiCorp Vault client

# Initialize FastAPI app
app = FastAPI(
    title="Scorpius Configuration Orchestrator",
    description="Centralized configuration management and deployment automation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Configuration
MODULES_DIR = Path("modules")
CONFIGS_DIR = Path("configs")
VAULT_URL = os.getenv("VAULT_URL", "http://localhost:8200")
VAULT_TOKEN = os.getenv("VAULT_TOKEN")
DOCKER_SOCKET = os.getenv("DOCKER_SOCKET", "/var/run/docker.sock")

# Initialize clients
docker_client = docker.from_env()
vault_client = hvac.Client(url=VAULT_URL, token=VAULT_TOKEN) if VAULT_TOKEN else None

# Pydantic models
class ConfigRequest(BaseModel):
    module: str
    values: Dict[str, Any]
    encrypt_secrets: bool = True
    auto_deploy: bool = True

class ModuleInfo(BaseModel):
    name: str
    schema: Dict[str, Any]
    template: str
    description: str
    version: str

class DeploymentStatus(BaseModel):
    module: str
    status: str
    timestamp: datetime
    logs: List[str]

# In-memory store for deployment status
deployment_status: Dict[str, DeploymentStatus] = {}

class ConfigOrchestrator:
    """Core orchestration logic"""
    
    @staticmethod
    async def load_module_manifest(module_name: str) -> Dict[str, Any]:
        """Load module schema and template"""
        module_path = MODULES_DIR / module_name
        
        if not module_path.exists():
            raise HTTPException(status_code=404, detail=f"Module {module_name} not found")
        
        schema_path = module_path / "config.schema.json"
        template_path = module_path / "env.template"
        manifest_path = module_path / "manifest.yaml"
        
        if not schema_path.exists() or not template_path.exists():
            raise HTTPException(
                status_code=400, 
                detail=f"Module {module_name} missing schema or template"
            )
        
        with open(schema_path) as f:
            schema = json.load(f)
        
        with open(template_path) as f:
            template = f.read()
        
        manifest = {}
        if manifest_path.exists():
            with open(manifest_path) as f:
                manifest = yaml.safe_load(f)
        
        return {
            "schema": schema,
            "template": template,
            "manifest": manifest
        }
    
    @staticmethod
    def validate_config(schema: Dict[str, Any], values: Dict[str, Any]) -> None:
        """Validate configuration against JSON schema"""
        try:
            jsonschema.validate(values, schema)
        except jsonschema.ValidationError as e:
            raise HTTPException(status_code=400, detail=f"Validation error: {e.message}")
    
    @staticmethod
    async def store_secrets(module_name: str, values: Dict[str, Any]) -> Dict[str, Any]:
        """Store secrets in Vault and return sanitized values"""
        if not vault_client or not vault_client.is_authenticated():
            return values
        
        secret_fields = ["privateKey", "apiKey", "secretKey", "password", "token"]
        secrets = {}
        sanitized_values = values.copy()
        
        for field in secret_fields:
            if field in values:
                secret_path = f"scorpius/{module_name}/{field}"
                vault_client.secrets.kv.v2.create_or_update_secret(
                    path=secret_path,
                    secret={"value": values[field]}
                )
                secrets[field] = f"vault:{secret_path}"
                sanitized_values[field] = f"{{{{vault:{secret_path}}}}}"
        
        return sanitized_values
    
    @staticmethod
    async def retrieve_secrets(values: Dict[str, Any]) -> Dict[str, Any]:
        """Retrieve secrets from Vault"""
        if not vault_client:
            return values
        
        resolved_values = values.copy()
        
        for key, value in values.items():
            if isinstance(value, str) and value.startswith("vault:"):
                secret_path = value.replace("vault:", "")
                try:
                    secret = vault_client.secrets.kv.v2.read_secret_version(path=secret_path)
                    resolved_values[key] = secret["data"]["data"]["value"]
                except Exception as e:
                    print(f"Failed to retrieve secret {secret_path}: {e}")
        
        return resolved_values
    
    @staticmethod
    async def render_config(template: str, values: Dict[str, Any]) -> str:
        """Render configuration template"""
        jinja_template = Template(template)
        return jinja_template.render(**values)
    
    @staticmethod
    async def write_config_file(module_name: str, content: str) -> Path:
        """Write configuration to file"""
        config_path = CONFIGS_DIR / f"{module_name}.env"
        CONFIGS_DIR.mkdir(exist_ok=True)
        
        with open(config_path, 'w') as f:
            f.write(content)
        
        return config_path
    
    @staticmethod
    async def update_docker_compose_override(modules: List[str]) -> None:
        """Generate docker-compose.override.yml"""
        services = {}
        
        for module in modules:
            services[module] = {
                "env_file": [f"./configs/{module}.env"]
            }
        
        override_content = {
            "version": "3.8",
            "services": services
        }
        
        with open("docker-compose.override.yml", 'w') as f:
            yaml.dump(override_content, f, default_flow_style=False)
    
    @staticmethod
    async def restart_service(module_name: str) -> List[str]:
        """Restart Docker service"""
        logs = []
        try:
            container_name = f"{module_name}_1"
            container = docker_client.containers.get(container_name)
            container.restart()
            logs.append(f"Successfully restarted container {container_name}")
        except docker.errors.NotFound:
            logs.append(f"Container {module_name}_1 not found")
        except Exception as e:
            logs.append(f"Failed to restart {module_name}: {str(e)}")
        
        return logs

# API Endpoints
@app.get("/")
async def root():
    """Health check"""
    return {
        "service": "Scorpius Configuration Orchestrator",
        "version": "1.0.0",
        "vault_connected": vault_client.is_authenticated() if vault_client else False,
        "docker_connected": True,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/modules", response_model=List[ModuleInfo])
async def list_modules():
    """List all available modules"""
    modules = []
    
    if not MODULES_DIR.exists():
        return modules
    
    for module_dir in MODULES_DIR.iterdir():
        if module_dir.is_dir():
            try:
                manifest = await ConfigOrchestrator.load_module_manifest(module_dir.name)
                
                module_info = ModuleInfo(
                    name=module_dir.name,
                    schema=manifest["schema"],
                    template=manifest["template"],
                    description=manifest["manifest"].get("description", "No description"),
                    version=manifest["manifest"].get("version", "1.0.0")
                )
                modules.append(module_info)
            except Exception as e:
                print(f"Failed to load module {module_dir.name}: {e}")
    
    return modules

@app.get("/modules/{module_name}")
async def get_module(module_name: str):
    """Get specific module configuration schema"""
    manifest = await ConfigOrchestrator.load_module_manifest(module_name)
    return {
        "name": module_name,
        "schema": manifest["schema"],
        "description": manifest["manifest"].get("description", "No description"),
        "fields": manifest["schema"].get("properties", {}),
        "required": manifest["schema"].get("required", [])
    }

@app.post("/config")
async def update_config(
    config_request: ConfigRequest,
    background_tasks: BackgroundTasks,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update module configuration"""
    module_name = config_request.module
    
    # Load module manifest
    manifest = await ConfigOrchestrator.load_module_manifest(module_name)
    
    # Validate configuration
    ConfigOrchestrator.validate_config(manifest["schema"], config_request.values)
    
    # Process configuration
    processing_values = config_request.values.copy()
    
    # Store secrets if requested
    if config_request.encrypt_secrets:
        processing_values = await ConfigOrchestrator.store_secrets(
            module_name, processing_values
        )
    
    # Render configuration
    config_content = await ConfigOrchestrator.render_config(
        manifest["template"], processing_values
    )
    
    # Write configuration file
    config_path = await ConfigOrchestrator.write_config_file(module_name, config_content)
    
    # Update deployment status
    deployment_status[module_name] = DeploymentStatus(
        module=module_name,
        status="configuring",
        timestamp=datetime.utcnow(),
        logs=[f"Configuration written to {config_path}"]
    )
    
    # Schedule deployment if requested
    if config_request.auto_deploy:
        background_tasks.add_task(deploy_module, module_name)
    
    return {
        "message": "Configuration updated successfully",
        "module": module_name,
        "config_path": str(config_path),
        "auto_deploy": config_request.auto_deploy
    }

async def deploy_module(module_name: str):
    """Background task to deploy module"""
    logs = []
    
    try:
        # Update docker-compose override
        existing_modules = [f.stem for f in CONFIGS_DIR.glob("*.env")]
        await ConfigOrchestrator.update_docker_compose_override(existing_modules)
        logs.append("Updated docker-compose.override.yml")
        
        # Restart service
        restart_logs = await ConfigOrchestrator.restart_service(module_name)
        logs.extend(restart_logs)
        
        # Update status
        deployment_status[module_name] = DeploymentStatus(
            module=module_name,
            status="deployed",
            timestamp=datetime.utcnow(),
            logs=logs
        )
        
    except Exception as e:
        deployment_status[module_name] = DeploymentStatus(
            module=module_name,
            status="failed",
            timestamp=datetime.utcnow(),
            logs=logs + [f"Deployment failed: {str(e)}"]
        )

@app.get("/deployment/{module_name}")
async def get_deployment_status(module_name: str):
    """Get deployment status for a module"""
    if module_name not in deployment_status:
        raise HTTPException(status_code=404, detail="Module deployment status not found")
    
    return deployment_status[module_name]

@app.get("/configs")
async def list_configs():
    """List all generated configurations"""
    configs = []
    
    if CONFIGS_DIR.exists():
        for config_file in CONFIGS_DIR.glob("*.env"):
            stat = config_file.stat()
            configs.append({
                "module": config_file.stem,
                "path": str(config_file),
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
            })
    
    return configs

@app.post("/deploy/{module_name}")
async def manual_deploy(module_name: str, background_tasks: BackgroundTasks):
    """Manually trigger deployment for a module"""
    config_path = CONFIGS_DIR / f"{module_name}.env"
    
    if not config_path.exists():
        raise HTTPException(
            status_code=404, 
            detail=f"Configuration for {module_name} not found"
        )
    
    background_tasks.add_task(deploy_module, module_name)
    
    return {
        "message": f"Deployment triggered for {module_name}",
        "module": module_name
    }

@app.delete("/config/{module_name}")
async def delete_config(module_name: str):
    """Delete module configuration"""
    config_path = CONFIGS_DIR / f"{module_name}.env"
    
    if config_path.exists():
        config_path.unlink()
        
        # Clean up deployment status
        if module_name in deployment_status:
            del deployment_status[module_name]
        
        return {"message": f"Configuration for {module_name} deleted"}
    
    raise HTTPException(status_code=404, detail="Configuration not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8090, reload=True)
