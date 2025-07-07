# Copilot Instructions for Quantum Security Platform

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is an enterprise-grade quantum-ready vulnerability scanner with a 10-pillar microservices architecture. The platform provides comprehensive cryptographic asset discovery, quantum attack simulation, and compliance reporting capabilities.

## Code Style and Standards

- **Python Style**: Follow PEP 8 with 88-character line length (Black formatting)
- **Type Hints**: Use comprehensive type hints for all functions and methods
- **Documentation**: Use detailed docstrings for all public functions, classes, and modules
- **Error Handling**: Implement comprehensive error handling with custom exceptions
- **Logging**: Use structured logging with contextual information

## Architecture Patterns

### 10-Pillar Services
1. **CBOM Engine** - Cryptographic bill of materials generation
2. **Quantum-Agility Tester** - PQC migration performance testing
3. **Attack Simulator** - Quantum attack demonstration
4. **Threat Intelligence** - PQC CVE and research monitoring
5. **Hybrid Inspector** - Protocol-level hybrid crypto detection
6. **Key Audit** - HSM/KMS quantum readiness assessment
7. **Firmware Scanner** - IoT/embedded crypto discovery
8. **Compliance Mapper** - Regulatory framework mapping
9. **Dashboard** - Executive risk visualization
10. **DevSecOps** - CI/CD integration hooks

### Service Structure
Each service should follow this structure:
```
services/{service_name}/
├── __init__.py
├── models.py        # Pydantic data models
├── api.py          # FastAPI router
├── scanner.py      # Core business logic
├── parsers.py      # Asset-specific parsers
└── classifiers.py  # Classification logic
```

## Cryptographic Standards

### Post-Quantum Cryptography (PQC)
- **NIST Winners**: Kyber (ML-KEM), Dilithium (ML-DSA), SPHINCS+ (SLH-DSA), Falcon
- **Key Exchange**: Prefer Kyber768 or ML-KEM-768
- **Digital Signatures**: Prefer Dilithium3 or ML-DSA-65
- **Hash-based Signatures**: Use SPHINCS+ or SLH-DSA for long-term signatures

### FIPS Compliance
- **FIPS 203**: ML-KEM (Key Encapsulation Mechanisms)
- **FIPS 204**: ML-DSA (Digital Signature Algorithm)
- **FIPS 205**: SLH-DSA (Stateless Hash-based Digital Signatures)

### Quantum Vulnerability Assessment
- **Vulnerable**: RSA, ECDSA, ECDH, DSA, DH
- **Deprecated**: MD5, SHA-1, DES, 3DES, RC4
- **Quantum-Safe**: AES-256, SHA-3, ML-KEM, ML-DSA, SLH-DSA

## API Design Principles

### FastAPI Best Practices
- Use Pydantic models for request/response validation
- Implement proper HTTP status codes
- Use dependency injection for shared resources
- Include comprehensive OpenAPI documentation
- Implement proper error handling middleware

### Async Programming
- Use `async/await` for I/O-bound operations
- Implement proper exception handling in async functions
- Use background tasks for long-running operations

## Security Considerations

### Authentication & Authorization
- Implement JWT-based authentication
- Use role-based access control (RBAC)
- Validate all inputs using Pydantic models
- Implement rate limiting for API endpoints

### Cryptographic Implementation
- Never implement custom cryptographic algorithms
- Use well-vetted libraries (cryptography, liboqs, etc.)
- Implement proper key management
- Use secure random number generation

## Testing Guidelines

### Test Structure
- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test service interactions
- **E2E Tests**: Test complete workflows
- **Performance Tests**: Validate quantum-agility performance

### Test Patterns
```python
import pytest
from fastapi.testclient import TestClient

@pytest.mark.asyncio
async def test_cbom_generation():
    # Test implementation
    pass

@pytest.mark.integration
def test_service_integration():
    # Integration test
    pass
```

## Database and Storage

### Data Models
- Use SQLAlchemy for relational data
- Use Neo4j for graph relationships (CBOM dependencies)
- Implement proper data validation and constraints
- Use UUIDs for primary keys

### Caching Strategy
- Use Redis for session storage and caching
- Implement proper cache invalidation
- Cache expensive cryptographic operations

## Observability and Monitoring

### Logging
```python
from quantum_scanner.core.logging import get_logger

logger = get_logger(__name__)

logger.info("Operation completed", 
           user_id=user.id, 
           operation="cbom_scan",
           component_count=len(components))
```

### Metrics
- Implement Prometheus metrics for all services
- Track performance metrics for PQC operations
- Monitor quantum vulnerability trends

## Development Workflow

### Git Workflow
- Use feature branches for development
- Implement pre-commit hooks for code quality
- Require code review for all changes
- Use conventional commit messages

### CI/CD Pipeline
- Run linting and formatting checks
- Execute comprehensive test suite
- Perform security scanning
- Generate CBOM for the codebase itself

## Common Patterns

### Error Handling
```python
from quantum_scanner.core.exceptions import ScanError

try:
    result = await scanner.scan(asset)
except Exception as e:
    logger.error("Scan failed", asset_id=asset.id, error=str(e))
    raise ScanError(f"Failed to scan asset {asset.name}: {str(e)}")
```

### Configuration Management
```python
from quantum_scanner.core.config import settings

# Access configuration
if settings.cbom_deep_scan:
    # Perform deep scanning
    pass
```

### Service Communication
- Use HTTP/REST for synchronous communication
- Use async message queues for background processing
- Implement proper retry logic and circuit breakers

## Quantum-Specific Guidelines

### Algorithm Migration
- Always provide migration paths from quantum-vulnerable to quantum-safe algorithms
- Implement hybrid approaches during transition periods
- Consider performance impacts of PQC algorithms

### Compliance Reporting
- Generate reports in standard formats (CycloneDX, SPDX)
- Map findings to relevant compliance frameworks
- Provide executive-level summaries and technical details

### Performance Considerations
- PQC algorithms have larger key sizes and signatures
- Implement caching for expensive cryptographic operations
- Provide performance benchmarking capabilities

## Dependencies and Libraries

### Core Dependencies
- **FastAPI**: Web framework
- **Pydantic**: Data validation
- **SQLAlchemy**: Database ORM
- **Structlog**: Structured logging
- **Click**: CLI interface

### Cryptographic Libraries
- **cryptography**: Python cryptographic library
- **liboqs**: Open Quantum Safe library
- **pycryptodome**: Additional crypto functions

### Testing and Development
- **pytest**: Testing framework
- **black**: Code formatting
- **mypy**: Type checking
- **pre-commit**: Git hooks

## Questions and Assistance

When implementing new features:
1. Follow the established service patterns
2. Implement comprehensive error handling
3. Add appropriate logging and monitoring
4. Include unit and integration tests
5. Update documentation and type hints
6. Consider quantum-safety implications
7. Validate against compliance requirements

For quantum cryptography questions, refer to:
- NIST Post-Quantum Cryptography standards
- Open Quantum Safe documentation
- FIPS 203-205 specifications
