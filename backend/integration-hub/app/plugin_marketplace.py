"""
SCORPIUS PLUGIN MARKETPLACE
Advanced plugin system for managing security modules and third-party integrations.
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

class PluginType(Enum):
    """Types of plugins available in the marketplace."""
    SECURITY_SCANNER = "security_scanner"
    THREAT_DETECTOR = "threat_detector"
    VULNERABILITY_ANALYZER = "vulnerability_analyzer"
    BLOCKCHAIN_ANALYZER = "blockchain_analyzer"
    COMPLIANCE_CHECKER = "compliance_checker"
    CUSTOM_INTEGRATION = "custom_integration"

class PluginStatus(Enum):
    """Status of a plugin."""
    AVAILABLE = "available"
    INSTALLED = "installed"
    ACTIVE = "active"
    DISABLED = "disabled"
    UPDATING = "updating"
    ERROR = "error"

@dataclass
class Plugin:
    """Plugin information."""
    plugin_id: str
    name: str
    description: str
    version: str
    plugin_type: PluginType
    author: str
    status: PluginStatus = PluginStatus.AVAILABLE
    dependencies: List[str] = field(default_factory=list)
    config: Dict[str, Any] = field(default_factory=dict)
    install_date: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    execution_count: int = 0
    rating: float = 0.0
    
class PluginMarketplace:
    """
    Advanced plugin marketplace for Scorpius security platform.
    Manages plugin installation, updates, and execution.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.plugins: Dict[str, Plugin] = {}
        self.installed_plugins: Dict[str, Any] = {}
        self.execution_stats: Dict[str, Dict[str, Any]] = {}
        
        # Initialize built-in plugins
        self._initialize_builtin_plugins()
    
    def _initialize_builtin_plugins(self):
        """Initialize built-in security plugins."""
        builtin_plugins = [
            Plugin(
                plugin_id="slither_scanner",
                name="Slither Static Analysis",
                description="Advanced static analysis for Solidity smart contracts",
                version="1.0.0",
                plugin_type=PluginType.SECURITY_SCANNER,
                author="Scorpius Security",
                status=PluginStatus.AVAILABLE,
                rating=4.8
            ),
            Plugin(
                plugin_id="mythril_scanner",
                name="Mythril Security Scanner",
                description="Symbolic execution engine for smart contract security",
                version="1.0.0",
                plugin_type=PluginType.VULNERABILITY_ANALYZER,
                author="Scorpius Security",
                status=PluginStatus.AVAILABLE,
                rating=4.7
            ),
            Plugin(
                plugin_id="manticore_analyzer",
                name="Manticore Dynamic Analysis",
                description="Dynamic symbolic execution for binary analysis",
                version="1.0.0",
                plugin_type=PluginType.VULNERABILITY_ANALYZER,
                author="Scorpius Security",
                status=PluginStatus.AVAILABLE,
                rating=4.6
            ),
            Plugin(
                plugin_id="threat_detector",
                name="AI Threat Detection",
                description="Machine learning-based threat detection system",
                version="1.0.0",
                plugin_type=PluginType.THREAT_DETECTOR,
                author="Scorpius Security",
                status=PluginStatus.AVAILABLE,
                rating=4.9
            ),
            Plugin(
                plugin_id="blockchain_analyzer",
                name="Blockchain Transaction Analyzer",
                description="Advanced blockchain transaction analysis and monitoring",
                version="1.0.0",
                plugin_type=PluginType.BLOCKCHAIN_ANALYZER,
                author="Scorpius Security",
                status=PluginStatus.AVAILABLE,
                rating=4.8
            ),
            Plugin(
                plugin_id="compliance_checker",
                name="Regulatory Compliance Checker",
                description="Automated compliance checking for various regulations",
                version="1.0.0",
                plugin_type=PluginType.COMPLIANCE_CHECKER,
                author="Scorpius Security",
                status=PluginStatus.AVAILABLE,
                rating=4.7
            )
        ]
        
        for plugin in builtin_plugins:
            self.plugins[plugin.plugin_id] = plugin
    
    async def list_plugins(self, plugin_type: Optional[PluginType] = None) -> List[Plugin]:
        """List available plugins, optionally filtered by type."""
        plugins = list(self.plugins.values())
        
        if plugin_type:
            plugins = [p for p in plugins if p.plugin_type == plugin_type]
        
        return sorted(plugins, key=lambda p: p.rating, reverse=True)
    
    async def get_plugin(self, plugin_id: str) -> Optional[Plugin]:
        """Get plugin information by ID."""
        return self.plugins.get(plugin_id)
    
    async def install_plugin(self, plugin_id: str, config: Optional[Dict[str, Any]] = None) -> bool:
        """Install a plugin."""
        try:
            plugin = self.plugins.get(plugin_id)
            if not plugin:
                self.logger.error(f"Plugin {plugin_id} not found")
                return False
            
            # Check dependencies
            for dep in plugin.dependencies:
                if dep not in self.installed_plugins:
                    self.logger.error(f"Missing dependency: {dep}")
                    return False
            
            # Update plugin status
            plugin.status = PluginStatus.INSTALLED
            plugin.install_date = datetime.now()
            plugin.config = config or {}
            
            # Add to installed plugins
            self.installed_plugins[plugin_id] = plugin
            
            # Initialize execution stats
            self.execution_stats[plugin_id] = {
                "total_executions": 0,
                "successful_executions": 0,
                "failed_executions": 0,
                "average_execution_time": 0.0,
                "last_execution": None
            }
            
            self.logger.info(f"Plugin {plugin_id} installed successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Error installing plugin {plugin_id}: {e}")
            return False
    
    async def execute_plugin(self, plugin_id: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a plugin with given task data."""
        start_time = datetime.now()
        
        try:
            if plugin_id not in self.installed_plugins:
                return {"error": f"Plugin {plugin_id} not installed"}
            
            plugin = self.plugins[plugin_id]
            if plugin.status != PluginStatus.ACTIVE:
                return {"error": f"Plugin {plugin_id} not active"}
            
            # Simulate plugin execution based on type
            result = await self._simulate_plugin_execution(plugin, task_data)
            
            # Update execution stats
            self._update_execution_stats(plugin_id, start_time, True)
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error executing plugin {plugin_id}: {e}")
            self._update_execution_stats(plugin_id, start_time, False)
            return {"error": str(e)}
    
    async def _simulate_plugin_execution(self, plugin: Plugin, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate plugin execution based on plugin type."""
        await asyncio.sleep(0.1)  # Simulate processing time
        
        if plugin.plugin_type == PluginType.SECURITY_SCANNER:
            return {
                "plugin_id": plugin.plugin_id,
                "plugin_name": plugin.name,
                "scan_type": "security_scan",
                "target": task_data.get("target", "unknown"),
                "vulnerabilities_found": 3,
                "severity_distribution": {
                    "critical": 1,
                    "high": 1,
                    "medium": 1,
                    "low": 0
                },
                "recommendations": [
                    "Implement input validation",
                    "Add access controls",
                    "Use safe arithmetic operations"
                ]
            }
        
        elif plugin.plugin_type == PluginType.THREAT_DETECTOR:
            return {
                "plugin_id": plugin.plugin_id,
                "plugin_name": plugin.name,
                "detection_type": "threat_detection",
                "target": task_data.get("target", "unknown"),
                "threats_detected": 2,
                "threat_types": ["malicious_transaction", "suspicious_pattern"],
                "confidence_scores": [0.95, 0.87],
                "mitigation_strategies": [
                    "Block suspicious transactions",
                    "Increase monitoring frequency"
                ]
            }
        
        else:
            return {
                "plugin_id": plugin.plugin_id,
                "plugin_name": plugin.name,
                "execution_type": "generic",
                "status": "completed",
                "data": task_data
            }
    
    def _update_execution_stats(self, plugin_id: str, start_time: datetime, success: bool):
        """Update execution statistics for a plugin."""
        if plugin_id not in self.execution_stats:
            return
        
        stats = self.execution_stats[plugin_id]
        execution_time = (datetime.now() - start_time).total_seconds()
        
        stats["total_executions"] += 1
        stats["last_execution"] = datetime.now()
        
        if success:
            stats["successful_executions"] += 1
        else:
            stats["failed_executions"] += 1
        
        # Update average execution time
        current_avg = stats["average_execution_time"]
        total_executions = stats["total_executions"]
        stats["average_execution_time"] = (current_avg * (total_executions - 1) + execution_time) / total_executions
    
    async def get_marketplace_stats(self) -> Dict[str, Any]:
        """Get overall marketplace statistics."""
        total_plugins = len(self.plugins)
        installed_plugins = len(self.installed_plugins)
        active_plugins = len([p for p in self.plugins.values() if p.status == PluginStatus.ACTIVE])
        
        total_executions = sum(stats["total_executions"] for stats in self.execution_stats.values())
        
        return {
            "total_plugins": total_plugins,
            "installed_plugins": installed_plugins,
            "active_plugins": active_plugins,
            "total_executions": total_executions,
            "plugin_types": {
                plugin_type.value: len([p for p in self.plugins.values() if p.plugin_type == plugin_type])
                for plugin_type in PluginType
            },
            "average_plugin_rating": sum(p.rating for p in self.plugins.values()) / total_plugins if total_plugins > 0 else 0.0
        }

# Global marketplace instance
marketplace = PluginMarketplace()

async def initialize_plugin_marketplace() -> PluginMarketplace:
    """Initialize the plugin marketplace."""
    return marketplace

async def get_plugin_marketplace() -> PluginMarketplace:
    """Get the plugin marketplace instance."""
    return marketplace 