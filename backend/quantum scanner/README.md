# Quantum Security Platform

[![Build Status](https://github.com/quantum-security/quantum-scanner/workflows/CI/badge.svg)](https://github.com/quantum-security/quantum-scanner/actions)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=quantum-security_quantum-scanner&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=quantum-security_quantum-scanner)
[![Coverage](https://codecov.io/gh/quantum-security/quantum-scanner/branch/main/graph/badge.svg)](https://codecov.io/gh/quantum-security/quantum-scanner)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)

Enterprise-grade quantum-ready vulnerability scanner with comprehensive cryptographic asset discovery, quantum attack simulation, and compliance reporting capabilities.

## 🚀 Features

### 10-Pillar Architecture

1. **🔍 CBOM Engine** - Deep cryptographic asset discovery and bill of materials generation
2. **⚡ Quantum-Agility Tester** - Automated PQC migration performance assessment
3. **🎯 Attack Simulator** - GPU-accelerated quantum attack demonstration
4. **📡 Threat Intelligence** - Automated PQC CVE and research feed monitoring
5. **🔗 Hybrid Inspector** - Protocol-level hybrid cryptography detection
6. **🔐 Key Management Audit** - HSM/KMS quantum readiness assessment
7. **📱 Firmware Scanner** - Lightweight SBOM for embedded systems and IoT
8. **📋 Compliance Mapper** - Automated regulatory framework mapping
9. **📊 Threat Dashboard** - Executive risk visualization and heat maps
10. **🔧 DevSecOps Hooks** - CI/CD pipeline integration and automation

### Enterprise-Grade Capabilities

- **Multi-Cloud Deployment** - AWS, Azure, GCP, and hybrid environments
- **Microservices Architecture** - Scalable, resilient, containerized services
- **Zero-Trust Security** - Quantum-safe identity, device attestation, network segmentation
- **Advanced Observability** - Comprehensive monitoring, alerting, and analytics
- **TOGAF Alignment** - Enterprise architecture methodology compliance
- **Cryptographic Agility** - Seamless algorithm migration and policy governance

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Quantum Security Platform                    │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│ CBOM Engine │ Attack Sim  │ Threat Feed │ Compliance Mapper   │
├─────────────┼─────────────┼─────────────┼─────────────────────┤
│ Agility     │ Hybrid      │ Key Audit   │ Firmware Scanner    │
│ Tester      │ Inspector   │             │                     │
├─────────────┼─────────────┼─────────────┼─────────────────────┤
│ Dashboard   │ DevSecOps Hooks          │                     │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
```

## 🚦 Quick Start

### Prerequisites

- Python 3.9+
- Docker and Docker Compose
- Kubernetes (optional, for production deployment)
- NVIDIA GPU (optional, for quantum attack simulation)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/quantum-security/quantum-scanner.git
   cd quantum-scanner
   ```

2. **Set up Python environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -e ".[dev]"
   ```

3. **Start the platform**

   ```bash
   # Development mode
   qscan start --dev

   # Production with Docker Compose
   docker-compose up -d

   # Kubernetes deployment
   kubectl apply -f deploy/k8s/
   ```

### First Scan

```bash
# Generate CBOM for a target
qscan-cbom scan --target https://example.com --output cbom.json

# Run quantum attack simulation
qscan-attack-sim demo --algorithm RSA-2048 --target-key key.pem

# View dashboard
qscan-dashboard start --port 8080
```

## 📖 Documentation

- [Architecture Guide](docs/architecture.md)
- [API Reference](docs/api/)
- [Deployment Guide](docs/deployment.md)
- [Development Setup](docs/development.md)
- [Security Guidelines](docs/security.md)

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=quantum_scanner

# Run specific test suites
pytest tests/unit/
pytest tests/integration/
pytest tests/e2e/
```

## 🚀 Deployment

### Docker Compose (Development)

```bash
docker-compose up -d
```

### Kubernetes (Production)

```bash
# Apply configurations
kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -f deploy/k8s/configmaps/
kubectl apply -f deploy/k8s/secrets/
kubectl apply -f deploy/k8s/services/

# Deploy with Helm
helm install quantum-scanner deploy/helm/quantum-scanner
```

### Cloud Providers

- [AWS EKS Deployment](docs/deployment/aws.md)
- [Azure AKS Deployment](docs/deployment/azure.md)
- [GCP GKE Deployment](docs/deployment/gcp.md)

## 🔧 Configuration

The platform uses environment-based configuration:

```bash
# Core settings
QUANTUM_ENV=production
QUANTUM_LOG_LEVEL=INFO
QUANTUM_DATABASE_URL=postgresql://user:pass@localhost/quantum_db

# Service-specific settings
CBOM_DEEP_SCAN=true
ATTACK_SIM_GPU_ENABLED=true
THREAT_INTEL_UPDATE_INTERVAL=3600

# Security settings
JWT_SECRET_KEY=your-secret-key
ENCRYPTION_KEY=your-encryption-key
PQC_ALGORITHMS=Kyber768,Dilithium3,SPHINCS+
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code of conduct
- Development process
- Pull request guidelines
- Issue reporting

### Development Setup

```bash
# Install development dependencies
pip install -e ".[dev]"

# Set up pre-commit hooks
pre-commit install

# Run linting and formatting
black src/ tests/
isort src/ tests/
flake8 src/ tests/
mypy src/
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: <support@quantum-security.io>
- 💬 Discord: [Quantum Security Community](https://discord.gg/quantum-security)
- 📖 Documentation: [quantum-security.readthedocs.io](https://quantum-security.readthedocs.io)
- 🐛 Issues: [GitHub Issues](https://github.com/quantum-security/quantum-scanner/issues)

## 🎯 Roadmap

- [ ] **Q3 2025** - NIST PQC Standards compliance (FIPS 203-205)
- [ ] **Q4 2025** - EU NIS2 Directive compliance
- [ ] **Q1 2026** - Quantum Key Distribution (QKD) integration
- [ ] **Q2 2026** - AI-powered threat prediction
- [ ] **Q3 2026** - Blockchain-based audit trails

## Acknowledgments

Special thanks to:

- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [Open Quantum Safe Project](https://openquantumsafe.org/)
- [CycloneDX SBOM Standard](https://cyclonedx.org/)
- Our amazing [contributors](https://github.com/quantum-security/quantum-scanner/graphs/contributors)

---

### Credits

Made with ❤️ by the Quantum Security Team
