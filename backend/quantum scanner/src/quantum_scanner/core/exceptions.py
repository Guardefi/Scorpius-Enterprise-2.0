"""Custom exceptions for the Quantum Security Platform."""


class QuantumScannerException(Exception):
    """Base exception for all Quantum Scanner errors."""
    
    def __init__(self, message: str, error_code: str = None, details: dict = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(message)


class ConfigurationError(QuantumScannerException):
    """Raised when there's a configuration issue."""
    pass


class CryptographicError(QuantumScannerException):
    """Raised when there's a cryptographic operation error."""
    pass


class ScanError(QuantumScannerException):
    """Raised when scanning operations fail."""
    pass


class ComplianceError(QuantumScannerException):
    """Raised when compliance checks fail."""
    pass


class QuantumAttackSimulationError(QuantumScannerException):
    """Raised when quantum attack simulation fails."""
    pass


class ThreatIntelligenceError(QuantumScannerException):
    """Raised when threat intelligence operations fail."""
    pass


class DatabaseError(QuantumScannerException):
    """Raised when database operations fail."""
    pass


class AuthenticationError(QuantumScannerException):
    """Raised when authentication fails."""
    pass


class TaskError(QuantumScannerException):
    """Raised when task queue operations fail."""
    pass


class PredictionError(QuantumScannerException):
    """Raised when AI prediction operations fail."""
    pass


class AuthorizationError(QuantumScannerException):
    """Raised when authorization fails."""
    pass


class ValidationError(QuantumScannerException):
    """Raised when data validation fails."""
    pass
