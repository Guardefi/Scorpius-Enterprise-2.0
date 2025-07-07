"""Services module containing the 10-pillar microservices architecture."""

# Import all service modules for easy access
from . import cbom_engine

# Import other services if available
try:
    from . import quantum_agility_tester
except ImportError:
    quantum_agility_tester = None

try:
    from . import attack_simulator
except ImportError:
    attack_simulator = None

# Placeholder imports for remaining services
threat_intelligence = None
hybrid_inspector = None
key_audit = None
firmware_scanner = None
compliance_mapper = None
dashboard = None
devsecops = None

__all__ = [
    "cbom_engine",
    "quantum_agility_tester", 
    "attack_simulator",
    "threat_intelligence",
    "hybrid_inspector",
    "key_audit",
    "firmware_scanner",
    "compliance_mapper",
    "dashboard",
    "devsecops",
]
