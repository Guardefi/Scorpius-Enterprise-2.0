"""
Quantum Security Platform - Enterprise Quantum-Ready Vulnerability Scanner

A comprehensive 10-pillar architecture platform for quantum-safe cryptographic
asset discovery, vulnerability assessment, and compliance reporting.
"""

__version__ = "1.0.0"
__author__ = "Quantum Security Team"
__email__ = "team@quantum-security.io"

from .core.config import settings
from .core.logging import get_logger

# Initialize package-level logger
logger = get_logger(__name__)

# Package metadata
__all__ = [
    "__version__",
    "__author__",
    "__email__",
    "settings",
    "get_logger",
]
