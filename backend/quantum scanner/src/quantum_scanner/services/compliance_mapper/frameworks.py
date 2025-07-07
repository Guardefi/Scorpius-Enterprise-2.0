"""
Compliance Frameworks - Specific framework implementations.
"""

from .models import ComplianceFramework, ComplianceFrameworkType


class NISTFramework:
    """NIST Cybersecurity Framework implementation."""
    
    @staticmethod
    def get_framework():
        return ComplianceFramework(
            name="NIST Cybersecurity Framework",
            framework_type=ComplianceFrameworkType.NIST_CSF,
            version="1.1",
            description="Framework for improving critical infrastructure cybersecurity",
            issuing_authority="National Institute of Standards and Technology",
            applicability=["Critical Infrastructure", "Government", "Private Sector"],
            quantum_considerations=True
        )


class FIPSFramework:
    """FIPS 140-2/3 framework implementation."""
    
    @staticmethod
    def get_framework():
        return ComplianceFramework(
            name="FIPS 140-2/3",
            framework_type=ComplianceFrameworkType.FIPS_140,
            version="140-3",
            description="Security Requirements for Cryptographic Modules",
            issuing_authority="National Institute of Standards and Technology",
            applicability=["Government", "Federal Contractors", "Regulated Industries"],
            quantum_considerations=True
        )


class SOXFramework:
    """Sarbanes-Oxley Act framework implementation."""
    
    @staticmethod
    def get_framework():
        return ComplianceFramework(
            name="Sarbanes-Oxley Act",
            framework_type=ComplianceFrameworkType.SOX,
            version="2002",
            description="Financial reporting and corporate governance requirements",
            issuing_authority="U.S. Congress",
            applicability=["Public Companies", "Financial Services"],
            quantum_considerations=False
        )


class HIPAAFramework:
    """HIPAA framework implementation."""
    
    @staticmethod
    def get_framework():
        return ComplianceFramework(
            name="Health Insurance Portability and Accountability Act",
            framework_type=ComplianceFrameworkType.HIPAA,
            version="1996",
            description="Healthcare data protection requirements",
            issuing_authority="U.S. Department of Health and Human Services",
            applicability=["Healthcare", "Health Plans", "Healthcare Clearinghouses"],
            quantum_considerations=False
        )


class GDPRFramework:
    """GDPR framework implementation."""
    
    @staticmethod
    def get_framework():
        return ComplianceFramework(
            name="General Data Protection Regulation",
            framework_type=ComplianceFrameworkType.GDPR,
            version="2018",
            description="EU data protection and privacy regulation",
            issuing_authority="European Union",
            applicability=["EU Organizations", "Global Organizations processing EU data"],
            quantum_considerations=False
        )
