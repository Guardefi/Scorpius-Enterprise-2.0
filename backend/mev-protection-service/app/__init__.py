"""
SCORPIUS MEV PROTECTION MODULE
Advanced MEV protection, arbitrage detection, and cross-chain execution capabilities.
"""

from .mev_protection import MEVProtectionManager, EnhancedMEVProtection, MEVMetrics, TransactionSimulator
from .reinforcement_learning import RLAgent, RLTrainingSystem, RLEvaluation, ArbitrageDecisionSystem
from .cross_chain_executor import EnhancedCrossChainExecutor
from .mempool_monitor import MempoolMonitor
from .gas_optimizer import GasOptimizer
from .flashloan_executor import FlashLoanExecutor
from .config import load_mev_config

try:
    from .app import app
except ImportError:
    app = None

__all__ = [
    "MEVProtectionManager",
    "EnhancedMEVProtection", 
    "MEVMetrics",
    "TransactionSimulator",
    "RLAgent",
    "RLTrainingSystem",
    "RLEvaluation",
    "ArbitrageDecisionSystem",
    "EnhancedCrossChainExecutor",
    "MempoolMonitor",
    "GasOptimizer",
    "FlashLoanExecutor",
    "load_mev_config",
    "app"
]

__version__ = "1.0.0" 