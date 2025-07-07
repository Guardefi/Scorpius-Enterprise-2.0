"""
SCORPIUS AI BLOCKCHAIN FORENSICS MODULE
Advanced AI-powered blockchain forensics and investigation platform.
"""

from .ai_blockchain_forensics import (
    BlockchainForensicsEngine,
    initialize_blockchain_forensics,
    ForensicsEventType,
    RiskLevel,
    ComplianceStandard,
    ForensicsAlert,
    TransactionPattern,
    AddressProfile,
    InvestigationCase,
    AIForensicsEngine
)
from .app import app

__all__ = [
    "BlockchainForensicsEngine",
    "initialize_blockchain_forensics",
    "ForensicsEventType",
    "RiskLevel",
    "ComplianceStandard",
    "ForensicsAlert",
    "TransactionPattern",
    "AddressProfile",
    "InvestigationCase",
    "AIForensicsEngine",
    "app"
]

__version__ = "1.0.0"
