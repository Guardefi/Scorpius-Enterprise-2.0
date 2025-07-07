# Copilot Instructions for Quantum Mempool Monitor

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is an enterprise-grade quantum-assisted brute-force detection system for blockchain mempool monitoring. The system provides real-time detection of quantum computing attacks against legacy Bitcoin addresses and implements automated emergency response mechanisms.

## Code Generation Guidelines

### Architecture Patterns
- Use async/await patterns for all I/O operations
- Implement dependency injection for enterprise components
- Follow hexagonal architecture principles
- Use dataclasses for structured data
- Implement comprehensive error handling and logging

### Security Standards
- All cryptographic operations must use enterprise-grade libraries (cryptography, pycryptodome)
- Implement proper key management with HSM integration
- Use secure random generation for all cryptographic material
- Follow OWASP guidelines for secure coding
- Implement audit logging for all security-critical operations

### Enterprise Integration
- Use established enterprise patterns (Strategy, Factory, Observer)
- Implement proper configuration management with environment-specific configs
- Follow enterprise logging standards (structured logging with correlation IDs)
- Implement health checks and metrics for all services
- Use typed interfaces for all external integrations

### Blockchain Integration
- Use web3.py for Ethereum interactions
- Implement proper transaction parsing and validation
- Use Bitcoin Core RPC for Bitcoin operations
- Implement proper mempool monitoring with websockets
- Handle blockchain reorganizations and network partitions

### Compliance and Auditing
- All sensitive operations must be auditable
- Implement immutable audit trails using blockchain
- Follow SOX, GDPR, and other regulatory requirements
- Implement proper data retention and purging policies
- Use cryptographic signatures for audit integrity

### Testing and Quality
- Write comprehensive unit tests with pytest
- Implement integration tests for external services
- Use property-based testing for cryptographic functions
- Implement load testing for high-throughput scenarios
- Follow test-driven development principles

### Documentation
- Use comprehensive docstrings for all public methods
- Document all enterprise integration points
- Provide runbooks for operational procedures
- Document incident response procedures
- Include compliance and regulatory documentation
