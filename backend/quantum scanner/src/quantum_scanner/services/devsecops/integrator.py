"""DevSecOps Integrator - CI/CD integration for quantum-safe development."""

import json
import yaml
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional
import subprocess
import asyncio

from quantum_scanner.core.logging import get_logger
from quantum_scanner.core.exceptions import ScanError
from .models import (
    PipelineConfig,
    ScanJob,
    PolicyViolation,
    ComplianceCheck,
    ComplianceResult,
    ScanConfiguration,
    PipelineReport,
    PolicyRule,
    ViolationSeverity,
    PolicyAction,
    ScanStatus,
    ScanTrigger,
    ComplianceFramework,
)

logger = get_logger(__name__)


class DevSecOpsIntegrator:
    """Core DevSecOps integration engine for quantum-safe CI/CD."""

    def __init__(self):
        """Initialize the DevSecOps integrator."""
        self.default_policies = self._initialize_default_policies()
        self.compliance_frameworks = self._initialize_compliance_frameworks()
        self.pipeline_templates = self._initialize_pipeline_templates()

    def _initialize_default_policies(self) -> List[PolicyRule]:
        """Initialize default security policies."""
        return [
            PolicyRule(
                name="Quantum Vulnerable Algorithms",
                description="Detect usage of quantum-vulnerable cryptographic algorithms",
                category="cryptography",
                severity=ViolationSeverity.CRITICAL,
                action=PolicyAction.BLOCK,
                quantum_specific=True,
                algorithms_scope=["RSA", "ECDSA", "ECDH", "DSA", "DH"],
                conditions={
                    "algorithm_patterns": [
                        r'\bRSA\b',
                        r'\bECDSA\b', 
                        r'\bECDH\b',
                        r'crypto\.rsa\.',
                        r'crypto\.ecdsa\.',
                    ]
                }
            ),
            PolicyRule(
                name="Weak Key Sizes",
                description="Detect cryptographic keys with insufficient size",
                category="cryptography",
                severity=ViolationSeverity.HIGH,
                action=PolicyAction.WARN,
                conditions={
                    "min_key_sizes": {
                        "RSA": 2048,
                        "AES": 256,
                        "ECDSA": 256
                    }
                }
            ),
            PolicyRule(
                name="Deprecated Hash Functions",
                description="Detect usage of deprecated hash functions",
                category="cryptography",
                severity=ViolationSeverity.HIGH,
                action=PolicyAction.BLOCK,
                conditions={
                    "deprecated_algorithms": ["MD5", "SHA1", "MD4"],
                    "patterns": [r'\bMD5\b', r'\bSHA1\b', r'\bmd5\b', r'\bsha1\b']
                }
            ),
            PolicyRule(
                name="Hard-coded Secrets",
                description="Detect hard-coded cryptographic secrets",
                category="secrets",
                severity=ViolationSeverity.CRITICAL,
                action=PolicyAction.BLOCK,
                conditions={
                    "patterns": [
                        r'password\s*=\s*["\'][^"\']+["\']',
                        r'api[_-]?key\s*=\s*["\'][^"\']+["\']',
                        r'secret\s*=\s*["\'][^"\']+["\']',
                        r'-----BEGIN [^-]+ KEY-----'
                    ]
                }
            ),
            PolicyRule(
                name="Insecure Random Number Generation",
                description="Detect usage of insecure random number generators",
                category="cryptography",
                severity=ViolationSeverity.MEDIUM,
                action=PolicyAction.WARN,
                conditions={
                    "insecure_patterns": [
                        r'random\.random\(',
                        r'Math\.random\(',
                        r'rand\(\s*\)',
                        r'srand\('
                    ]
                }
            ),
            PolicyRule(
                name="Missing PQC Migration Plan",
                description="Ensure post-quantum cryptography migration is documented",
                category="documentation",
                severity=ViolationSeverity.MEDIUM,
                action=PolicyAction.WARN,
                quantum_specific=True,
                conditions={
                    "required_files": ["PQC_MIGRATION.md", "crypto_inventory.json"],
                    "documentation_patterns": [
                        r'post.?quantum',
                        r'pqc.?migration',
                        r'quantum.?safe'
                    ]
                }
            )
        ]

    def _initialize_compliance_frameworks(self) -> List[ComplianceCheck]:
        """Initialize compliance framework checks."""
        return [
            ComplianceCheck(
                framework=ComplianceFramework.NIST_PQC,
                control_id="PQC-1",
                control_name="Cryptographic Algorithm Inventory",
                description="Maintain inventory of all cryptographic algorithms in use",
                requirement="Organizations must maintain a comprehensive inventory",
                test_procedure="Scan codebase for cryptographic usage",
                quantum_relevant=True,
                automation_supported=True,
                severity=ViolationSeverity.HIGH
            ),
            ComplianceCheck(
                framework=ComplianceFramework.NIST_PQC,
                control_id="PQC-2", 
                control_name="Migration Planning",
                description="Develop migration plan to post-quantum cryptography",
                requirement="Organizations must have documented migration plans",
                test_procedure="Verify existence of migration documentation",
                quantum_relevant=True,
                automation_supported=True,
                severity=ViolationSeverity.MEDIUM
            ),
            ComplianceCheck(
                framework=ComplianceFramework.FIPS_140,
                control_id="FIPS-140-2-1",
                control_name="Cryptographic Module Validation",
                description="Use FIPS 140-2 validated cryptographic modules",
                requirement="Cryptographic modules must be FIPS validated",
                test_procedure="Check for FIPS-validated implementations",
                quantum_relevant=False,
                automation_supported=True,
                severity=ViolationSeverity.HIGH
            ),
            ComplianceCheck(
                framework=ComplianceFramework.NIST_CSF,
                control_id="PR.DS-1",
                control_name="Data-at-rest Protection",
                description="Data-at-rest is protected with strong encryption",
                requirement="Implement appropriate encryption for data at rest",
                test_procedure="Verify encryption algorithms and key management",
                quantum_relevant=True,
                automation_supported=True,
                severity=ViolationSeverity.HIGH
            ),
            ComplianceCheck(
                framework=ComplianceFramework.NIST_CSF,
                control_id="PR.DS-2",
                control_name="Data-in-transit Protection",
                description="Data-in-transit is protected with strong encryption",
                requirement="Implement appropriate encryption for data in transit",
                test_procedure="Verify TLS/SSL configurations and cipher suites",
                quantum_relevant=True,
                automation_supported=True,
                severity=ViolationSeverity.HIGH
            )
        ]

    def _initialize_pipeline_templates(self) -> Dict[str, Dict[str, Any]]:
        """Initialize CI/CD pipeline templates."""
        return {
            "github_actions": {
                "name": "GitHub Actions Quantum Security Scan",
                "file": ".github/workflows/quantum-security.yml",
                "template": self._get_github_actions_template()
            },
            "jenkins": {
                "name": "Jenkins Quantum Security Pipeline",
                "file": "Jenkinsfile.quantum-security",
                "template": self._get_jenkins_template()
            },
            "gitlab_ci": {
                "name": "GitLab CI Quantum Security Pipeline",
                "file": ".gitlab-ci.quantum-security.yml",
                "template": self._get_gitlab_ci_template()
            },
            "azure_devops": {
                "name": "Azure DevOps Quantum Security Pipeline",
                "file": "azure-pipelines.quantum-security.yml",
                "template": self._get_azure_devops_template()
            }
        }

    async def create_scan_job(self, config: PipelineConfig, trigger_context: Dict[str, Any]) -> ScanJob:
        """Create a new scan job for the pipeline."""
        logger.info("Creating scan job", 
                   pipeline_config=config.name,
                   trigger=trigger_context.get("trigger"))
        
        scan_job = ScanJob(
            pipeline_config_id=config.id,
            job_name=f"quantum-scan-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            repository_url=config.repository_url,
            commit_hash=trigger_context.get("commit_hash", "unknown"),
            branch=trigger_context.get("branch", "main"),
            trigger=ScanTrigger(trigger_context.get("trigger", "manual")),
            scan_types=config.enabled_scans,
            status=ScanStatus.PENDING
        )
        
        return scan_job

    async def execute_scan_job(self, scan_job: ScanJob, scan_config: ScanConfiguration) -> PipelineReport:
        """Execute a scan job and generate report."""
        logger.info("Executing scan job", job_id=str(scan_job.id), job_name=scan_job.job_name)
        
        try:
            scan_job.status = ScanStatus.RUNNING
            scan_job.started_at = datetime.utcnow()
            
            violations = []
            compliance_results = []
            quantum_findings = {}
            
            # Run policy violations scan
            if "policy_scan" in scan_job.scan_types:
                violations.extend(await self._run_policy_scan(scan_job, scan_config))
            
            # Run compliance checks
            if "compliance_scan" in scan_job.scan_types:
                compliance_results.extend(await self._run_compliance_scan(scan_job, scan_config))
            
            # Run quantum-specific analysis
            if "quantum_scan" in scan_job.scan_types:
                quantum_findings = await self._run_quantum_scan(scan_job, scan_config)
            
            # Update scan job status
            scan_job.status = ScanStatus.COMPLETED
            scan_job.completed_at = datetime.utcnow()
            scan_job.execution_time_seconds = (
                scan_job.completed_at - scan_job.started_at
            ).total_seconds()
            scan_job.violations_found = len(violations)
            scan_job.critical_violations = len([v for v in violations if v.severity == ViolationSeverity.CRITICAL])
            
            # Generate comprehensive report
            report = await self._generate_pipeline_report(
                scan_job, violations, compliance_results, quantum_findings
            )
            
            logger.info("Scan job completed successfully",
                       job_id=str(scan_job.id),
                       violations_found=len(violations),
                       critical_violations=scan_job.critical_violations)
            
            return report
            
        except Exception as e:
            scan_job.status = ScanStatus.FAILED
            scan_job.error_message = str(e)
            scan_job.completed_at = datetime.utcnow()
            
            logger.error("Scan job failed", job_id=str(scan_job.id), error=str(e))
            raise ScanError(f"Scan job execution failed: {str(e)}")

    async def _run_policy_scan(self, scan_job: ScanJob, scan_config: ScanConfiguration) -> List[PolicyViolation]:
        """Run policy violation scanning."""
        logger.debug("Running policy scan", job_id=str(scan_job.id))
        violations = []
        
        try:
            # Get repository content (simplified - would use actual git operations)
            repo_content = await self._get_repository_content(scan_job.repository_url, scan_job.commit_hash)
            
            # Apply each policy rule
            for rule_id in scan_config.policy_rules:
                rule = next((r for r in self.default_policies if r.id == rule_id), None)
                if not rule or not rule.enabled:
                    continue
                
                rule_violations = await self._apply_policy_rule(rule, repo_content, scan_job)
                violations.extend(rule_violations)
            
        except Exception as e:
            logger.error("Policy scan failed", job_id=str(scan_job.id), error=str(e))
        
        return violations

    async def _run_compliance_scan(self, scan_job: ScanJob, scan_config: ScanConfiguration) -> List[ComplianceResult]:
        """Run compliance framework scanning."""
        logger.debug("Running compliance scan", job_id=str(scan_job.id))
        results = []
        
        try:
            # Apply each compliance check
            for check_id in scan_config.compliance_checks:
                check = next((c for c in self.compliance_frameworks if c.id == check_id), None)
                if not check:
                    continue
                
                result = await self._apply_compliance_check(check, scan_job)
                results.append(result)
            
        except Exception as e:
            logger.error("Compliance scan failed", job_id=str(scan_job.id), error=str(e))
        
        return results

    async def _run_quantum_scan(self, scan_job: ScanJob, scan_config: ScanConfiguration) -> Dict[str, Any]:
        """Run quantum-specific security analysis."""
        logger.debug("Running quantum scan", job_id=str(scan_job.id))
        findings = {
            "quantum_vulnerable_algorithms": [],
            "pqc_readiness_score": 0.0,
            "migration_recommendations": [],
            "crypto_inventory": []
        }
        
        try:
            # Simulate quantum-specific analysis
            repo_content = await self._get_repository_content(scan_job.repository_url, scan_job.commit_hash)
            
            # Scan for quantum-vulnerable algorithms
            vulnerable_algos = self._scan_for_vulnerable_algorithms(repo_content)
            findings["quantum_vulnerable_algorithms"] = vulnerable_algos
            
            # Calculate PQC readiness score
            findings["pqc_readiness_score"] = self._calculate_pqc_readiness_score(repo_content, vulnerable_algos)
            
            # Generate migration recommendations
            findings["migration_recommendations"] = self._generate_migration_recommendations(vulnerable_algos)
            
            # Create crypto inventory
            findings["crypto_inventory"] = self._create_crypto_inventory(repo_content)
            
        except Exception as e:
            logger.error("Quantum scan failed", job_id=str(scan_job.id), error=str(e))
        
        return findings

    async def _get_repository_content(self, repo_url: str, commit_hash: str) -> Dict[str, str]:
        """Get repository content for scanning (simplified implementation)."""
        # In production, this would clone the repository and read files
        # For demo purposes, return simulated content
        return {
            "src/crypto.py": """
import cryptography
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding

# Example of RSA usage (quantum vulnerable)
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
)

# Example of hardcoded secret (policy violation)
API_KEY = "sk_test_123456789abcdef"

# Example of weak hash (policy violation)
digest = hashes.Hash(hashes.MD5())
""",
            "src/main.py": """
import random

# Insecure random number generation
def generate_token():
    return str(random.random())

# AES usage (quantum resistant with proper key size)
from cryptography.fernet import Fernet
key = Fernet.generate_key()
""",
            "README.md": """
# Project Documentation

This project uses cryptographic libraries for security.

TODO: Implement post-quantum cryptography migration plan.
""",
            "requirements.txt": """
cryptography==41.0.0
pycryptodome==3.18.0
"""
        }

    async def _apply_policy_rule(self, rule: PolicyRule, repo_content: Dict[str, str], 
                               scan_job: ScanJob) -> List[PolicyViolation]:
        """Apply a single policy rule to repository content."""
        violations = []
        
        try:
            for file_path, content in repo_content.items():
                # Skip files based on exclusions
                if any(pattern in file_path for pattern in rule.conditions.get("exclusions", [])):
                    continue
                
                # Apply pattern-based rules
                if "patterns" in rule.conditions:
                    for pattern in rule.conditions["patterns"]:
                        import re
                        matches = re.finditer(pattern, content, re.IGNORECASE)
                        for match in matches:
                            line_number = content[:match.start()].count('\n') + 1
                            
                            violation = PolicyViolation(
                                scan_job_id=scan_job.id,
                                rule_id=rule.id,
                                rule_name=rule.name,
                                severity=rule.severity,
                                action_taken=rule.action,
                                violation_type=rule.category,
                                description=f"Pattern '{pattern}' found in {file_path}",
                                file_path=file_path,
                                line_number=line_number,
                                code_snippet=self._extract_code_snippet(content, line_number),
                                recommendation=self._generate_rule_recommendation(rule, match.group()),
                                risk_score=self._calculate_violation_risk_score(rule, match.group()),
                                quantum_impact=rule.quantum_specific
                            )
                            violations.append(violation)
                
                # Apply algorithm-specific rules
                if "algorithm_patterns" in rule.conditions:
                    for pattern in rule.conditions["algorithm_patterns"]:
                        import re
                        matches = re.finditer(pattern, content, re.IGNORECASE)
                        for match in matches:
                            line_number = content[:match.start()].count('\n') + 1
                            
                            violation = PolicyViolation(
                                scan_job_id=scan_job.id,
                                rule_id=rule.id,
                                rule_name=rule.name,
                                severity=rule.severity,
                                action_taken=rule.action,
                                violation_type="quantum_vulnerability",
                                description=f"Quantum-vulnerable algorithm detected: {match.group()}",
                                file_path=file_path,
                                line_number=line_number,
                                code_snippet=self._extract_code_snippet(content, line_number),
                                recommendation="Replace with post-quantum cryptographic algorithm",
                                risk_score=0.9,  # High risk for quantum vulnerabilities
                                quantum_impact=True
                            )
                            violations.append(violation)
                
        except Exception as e:
            logger.error("Policy rule application failed", rule_name=rule.name, error=str(e))
        
        return violations

    async def _apply_compliance_check(self, check: ComplianceCheck, scan_job: ScanJob) -> ComplianceResult:
        """Apply a compliance check."""
        try:
            # Simulate compliance checking logic
            compliant = True
            findings = []
            evidence = []
            
            if check.control_id == "PQC-1":  # Cryptographic Algorithm Inventory
                repo_content = await self._get_repository_content(scan_job.repository_url, scan_job.commit_hash)
                crypto_usage = self._find_crypto_usage(repo_content)
                
                if crypto_usage:
                    evidence.append(f"Found {len(crypto_usage)} cryptographic implementations")
                    compliant = True
                else:
                    findings.append("No cryptographic algorithm inventory found")
                    compliant = False
                    
            elif check.control_id == "PQC-2":  # Migration Planning
                repo_content = await self._get_repository_content(scan_job.repository_url, scan_job.commit_hash)
                has_migration_plan = any("pqc" in filename.lower() or "migration" in filename.lower() 
                                       for filename in repo_content.keys())
                
                if has_migration_plan:
                    evidence.append("Migration planning documentation found")
                    compliant = True
                else:
                    findings.append("No PQC migration plan documentation found")
                    compliant = False
            
            # Generate remediation steps
            remediation_steps = self._generate_remediation_steps(check, compliant, findings)
            
            return ComplianceResult(
                scan_job_id=scan_job.id,
                check_id=check.id,
                framework=check.framework,
                control_id=check.control_id,
                status="PASS" if compliant else "FAIL",
                compliant=compliant,
                evidence=evidence,
                findings=findings,
                remediation_steps=remediation_steps,
                risk_level=ViolationSeverity.LOW if compliant else check.severity
            )
            
        except Exception as e:
            logger.error("Compliance check failed", check_id=check.control_id, error=str(e))
            return ComplianceResult(
                scan_job_id=scan_job.id,
                check_id=check.id,
                framework=check.framework,
                control_id=check.control_id,
                status="ERROR",
                compliant=False,
                findings=[f"Check execution failed: {str(e)}"],
                remediation_steps=["Review check configuration and retry"],
                risk_level=ViolationSeverity.MEDIUM
            )

    def _scan_for_vulnerable_algorithms(self, repo_content: Dict[str, str]) -> List[Dict[str, Any]]:
        """Scan for quantum-vulnerable algorithms."""
        vulnerable_algos = []
        
        for file_path, content in repo_content.items():
            # RSA detection
            if "rsa" in content.lower():
                vulnerable_algos.append({
                    "algorithm": "RSA",
                    "file_path": file_path,
                    "vulnerability": "Quantum vulnerable to Shor's algorithm",
                    "replacement": "ML-KEM or other NIST PQC KEM"
                })
            
            # ECDSA detection
            if "ecdsa" in content.lower():
                vulnerable_algos.append({
                    "algorithm": "ECDSA",
                    "file_path": file_path,
                    "vulnerability": "Quantum vulnerable to Shor's algorithm",
                    "replacement": "ML-DSA or SLH-DSA"
                })
            
            # MD5/SHA1 detection
            if any(weak in content.lower() for weak in ["md5", "sha1"]):
                vulnerable_algos.append({
                    "algorithm": "Weak Hash Function",
                    "file_path": file_path,
                    "vulnerability": "Cryptographically broken",
                    "replacement": "SHA-256 or SHA-3"
                })
        
        return vulnerable_algos

    def _calculate_pqc_readiness_score(self, repo_content: Dict[str, str], vulnerable_algos: List[Dict[str, Any]]) -> float:
        """Calculate post-quantum cryptography readiness score."""
        total_files = len(repo_content)
        if total_files == 0:
            return 1.0
        
        vulnerable_files = len(set(algo["file_path"] for algo in vulnerable_algos))
        crypto_files = len([f for f in repo_content if "crypto" in f.lower() or "security" in f.lower()])
        
        if crypto_files == 0:
            return 1.0  # No crypto usage detected
        
        readiness_score = max(0.0, 1.0 - (vulnerable_files / crypto_files))
        return readiness_score

    def _generate_migration_recommendations(self, vulnerable_algos: List[Dict[str, Any]]) -> List[str]:
        """Generate migration recommendations."""
        recommendations = []
        
        if vulnerable_algos:
            recommendations.append("Immediate action required: Quantum-vulnerable algorithms detected")
            
            algo_counts = {}
            for algo in vulnerable_algos:
                algo_name = algo["algorithm"]
                algo_counts[algo_name] = algo_counts.get(algo_name, 0) + 1
            
            for algo_name, count in algo_counts.items():
                recommendations.append(f"Replace {count} instances of {algo_name}")
            
            recommendations.extend([
                "Implement crypto-agility framework",
                "Establish algorithm migration timeline",
                "Train development team on PQC best practices",
                "Set up automated vulnerability scanning"
            ])
        else:
            recommendations.extend([
                "Maintain crypto-agility for future algorithm updates",
                "Monitor NIST PQC standardization progress",
                "Establish quantum threat monitoring"
            ])
        
        return recommendations

    def _create_crypto_inventory(self, repo_content: Dict[str, str]) -> List[Dict[str, Any]]:
        """Create cryptographic inventory."""
        inventory = []
        
        for file_path, content in repo_content.items():
            # Detect various crypto libraries and algorithms
            if "cryptography" in content:
                inventory.append({
                    "file": file_path,
                    "library": "Python Cryptography",
                    "usage": "General cryptographic operations",
                    "quantum_safe": "Depends on algorithms used"
                })
            
            if "fernet" in content.lower():
                inventory.append({
                    "file": file_path,
                    "library": "Fernet (symmetric)",
                    "usage": "Symmetric encryption",
                    "quantum_safe": "Yes (with AES-256)"
                })
            
            if "rsa" in content.lower():
                inventory.append({
                    "file": file_path,
                    "library": "RSA",
                    "usage": "Asymmetric encryption/signatures",
                    "quantum_safe": "No - vulnerable to Shor's algorithm"
                })
        
        return inventory

    async def _generate_pipeline_report(self, scan_job: ScanJob, violations: List[PolicyViolation],
                                      compliance_results: List[ComplianceResult],
                                      quantum_findings: Dict[str, Any]) -> PipelineReport:
        """Generate comprehensive pipeline security report."""
        
        # Calculate risk score
        risk_score = self._calculate_overall_risk_score(violations, compliance_results, quantum_findings)
        
        # Generate scan summary
        scan_summary = {
            "total_violations": len(violations),
            "critical_violations": len([v for v in violations if v.severity == ViolationSeverity.CRITICAL]),
            "compliance_checks": len(compliance_results),
            "compliance_failures": len([c for c in compliance_results if not c.compliant]),
            "quantum_vulnerable_algorithms": len(quantum_findings.get("quantum_vulnerable_algorithms", [])),
            "pqc_readiness_score": quantum_findings.get("pqc_readiness_score", 0.0)
        }
        
        # Generate recommendations
        recommendations = self._generate_overall_recommendations(violations, compliance_results, quantum_findings)
        
        # Generate executive summary
        executive_summary = self._generate_executive_summary(scan_summary, risk_score)
        
        # Generate artifacts list
        artifacts = [
            f"scan_report_{scan_job.id}.json",
            f"violations_{scan_job.id}.csv",
            f"compliance_{scan_job.id}.pdf"
        ]
        
        return PipelineReport(
            scan_job_id=scan_job.id,
            repository_url=scan_job.repository_url,
            commit_hash=scan_job.commit_hash,
            branch=scan_job.branch,
            scan_summary=scan_summary,
            violations=violations,
            compliance_results=compliance_results,
            quantum_findings=quantum_findings,
            risk_score=risk_score,
            recommendations=recommendations,
            executive_summary=executive_summary,
            artifacts=artifacts
        )

    def _extract_code_snippet(self, content: str, line_number: int, context_lines: int = 2) -> str:
        """Extract code snippet around the specified line."""
        lines = content.split('\n')
        start = max(0, line_number - context_lines - 1)
        end = min(len(lines), line_number + context_lines)
        
        snippet_lines = []
        for i in range(start, end):
            prefix = ">>> " if i == line_number - 1 else "    "
            snippet_lines.append(f"{prefix}{i+1}: {lines[i]}")
        
        return '\n'.join(snippet_lines)

    def _generate_rule_recommendation(self, rule: PolicyRule, matched_text: str) -> str:
        """Generate recommendation for a policy rule violation."""
        if rule.quantum_specific:
            return f"Replace quantum-vulnerable algorithm '{matched_text}' with post-quantum alternative"
        elif "secret" in rule.name.lower():
            return "Move secrets to secure configuration or environment variables"
        elif "hash" in rule.name.lower():
            return "Use cryptographically secure hash function (SHA-256 or better)"
        elif "random" in rule.name.lower():
            return "Use cryptographically secure random number generator"
        else:
            return "Review and remediate according to security policy"

    def _calculate_violation_risk_score(self, rule: PolicyRule, matched_text: str) -> float:
        """Calculate risk score for a policy violation."""
        base_scores = {
            ViolationSeverity.CRITICAL: 0.9,
            ViolationSeverity.HIGH: 0.7,
            ViolationSeverity.MEDIUM: 0.5,
            ViolationSeverity.LOW: 0.3,
            ViolationSeverity.INFO: 0.1
        }
        
        base_score = base_scores.get(rule.severity, 0.5)
        
        # Increase score for quantum-related violations
        if rule.quantum_specific:
            base_score = min(1.0, base_score + 0.1)
        
        return base_score

    def _find_crypto_usage(self, repo_content: Dict[str, str]) -> List[str]:
        """Find cryptographic usage in repository."""
        crypto_indicators = []
        
        for file_path, content in repo_content.items():
            if any(indicator in content.lower() for indicator in 
                   ["crypto", "encrypt", "decrypt", "hash", "sign", "verify", "key", "cipher"]):
                crypto_indicators.append(file_path)
        
        return crypto_indicators

    def _generate_remediation_steps(self, check: ComplianceCheck, compliant: bool, findings: List[str]) -> List[str]:
        """Generate remediation steps for compliance check."""
        if compliant:
            return ["Continue monitoring compliance status"]
        
        steps = []
        
        if check.control_id == "PQC-1":
            steps.extend([
                "Create comprehensive cryptographic algorithm inventory",
                "Document all cryptographic libraries and their versions",
                "Implement automated crypto discovery tools"
            ])
        elif check.control_id == "PQC-2":
            steps.extend([
                "Develop post-quantum cryptography migration plan",
                "Establish migration timeline and milestones",
                "Identify critical systems for priority migration"
            ])
        else:
            steps.extend([
                "Review compliance requirements",
                "Implement necessary controls",
                "Document compliance procedures"
            ])
        
        return steps

    def _calculate_overall_risk_score(self, violations: List[PolicyViolation],
                                    compliance_results: List[ComplianceResult],
                                    quantum_findings: Dict[str, Any]) -> float:
        """Calculate overall risk score for the pipeline."""
        risk_components = []
        
        # Violations risk
        if violations:
            violation_risk = sum(v.risk_score for v in violations) / len(violations)
            risk_components.append(violation_risk)
        
        # Compliance risk
        if compliance_results:
            failed_checks = [c for c in compliance_results if not c.compliant]
            compliance_risk = len(failed_checks) / len(compliance_results)
            risk_components.append(compliance_risk)
        
        # Quantum risk
        pqc_readiness = quantum_findings.get("pqc_readiness_score", 1.0)
        quantum_risk = 1.0 - pqc_readiness
        risk_components.append(quantum_risk)
        
        # Calculate weighted average
        if risk_components:
            return sum(risk_components) / len(risk_components)
        else:
            return 0.0

    def _generate_overall_recommendations(self, violations: List[PolicyViolation],
                                        compliance_results: List[ComplianceResult],
                                        quantum_findings: Dict[str, Any]) -> List[str]:
        """Generate overall recommendations."""
        recommendations = []
        
        # Critical violations
        critical_violations = [v for v in violations if v.severity == ViolationSeverity.CRITICAL]
        if critical_violations:
            recommendations.append(f"Address {len(critical_violations)} critical security violations immediately")
        
        # Compliance failures
        failed_compliance = [c for c in compliance_results if not c.compliant]
        if failed_compliance:
            recommendations.append(f"Remediate {len(failed_compliance)} compliance failures")
        
        # Quantum readiness
        pqc_readiness = quantum_findings.get("pqc_readiness_score", 1.0)
        if pqc_readiness < 0.7:
            recommendations.append("Accelerate post-quantum cryptography migration")
        
        # General recommendations
        recommendations.extend([
            "Implement automated security scanning in CI/CD pipeline",
            "Establish regular security review cycles",
            "Train development teams on secure coding practices"
        ])
        
        return recommendations

    def _generate_executive_summary(self, scan_summary: Dict[str, Any], risk_score: float) -> str:
        """Generate executive summary."""
        summary_parts = []
        
        summary_parts.append(f"Security scan completed with {scan_summary['total_violations']} violations detected")
        
        if scan_summary['critical_violations'] > 0:
            summary_parts.append(f"including {scan_summary['critical_violations']} critical issues")
        
        summary_parts.append(f"Compliance assessment shows {scan_summary['compliance_failures']} failed checks")
        
        pqc_score = scan_summary.get('pqc_readiness_score', 0.0)
        summary_parts.append(f"Post-quantum cryptography readiness: {pqc_score:.1%}")
        
        summary_parts.append(f"Overall risk score: {risk_score:.2f}/1.0")
        
        if risk_score > 0.7:
            summary_parts.append("Immediate action required")
        elif risk_score > 0.4:
            summary_parts.append("Security improvements needed")
        else:
            summary_parts.append("Security posture acceptable")
        
        return ". ".join(summary_parts) + "."

    def _get_github_actions_template(self) -> str:
        """Get GitHub Actions pipeline template."""
        return """
name: Quantum Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quantum-security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
        
    - name: Install Quantum Scanner
      run: |
        pip install quantum-scanner
        
    - name: Run CBOM Scan
      run: |
        quantum-scanner cbom scan --target . --format json --output cbom-report.json
        
    - name: Run Quantum Agility Test
      run: |
        quantum-scanner agility test --system ci-cd --output agility-report.json
        
    - name: Run Attack Simulation
      run: |
        quantum-scanner attack simulate --algorithm rsa-2048 ecdsa-p256 --output attack-report.json
        
    - name: Upload Security Reports
      uses: actions/upload-artifact@v3
      with:
        name: quantum-security-reports
        path: |
          cbom-report.json
          agility-report.json
          attack-report.json
          
    - name: Comment PR with Results
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          const cbom = JSON.parse(fs.readFileSync('cbom-report.json', 'utf8'));
          const comment = `## Quantum Security Scan Results
          
          🔍 **CBOM Analysis**: ${cbom.total_components} crypto components found
          ⚠️  **Quantum Vulnerable**: ${cbom.quantum_vulnerable_count} components
          ✅ **FIPS Compliant**: ${cbom.fips_compliant_count} components
          
          [View full report](${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID})`;
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: comment
          });
"""

    def _get_jenkins_template(self) -> str:
        """Get Jenkins pipeline template."""
        return """
pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '''
                    python -m pip install --upgrade pip
                    pip install quantum-scanner
                '''
            }
        }
        
        stage('Quantum Security Scan') {
            parallel {
                stage('CBOM Scan') {
                    steps {
                        sh 'quantum-scanner cbom scan --target . --output cbom-report.json'
                    }
                }
                stage('Agility Test') {
                    steps {
                        sh 'quantum-scanner agility test --system jenkins --output agility-report.json'
                    }
                }
                stage('Attack Simulation') {
                    steps {
                        sh 'quantum-scanner attack simulate --algorithm rsa-2048 --output attack-report.json'
                    }
                }
            }
        }
        
        stage('Generate Reports') {
            steps {
                sh 'quantum-scanner full-scan --target . --output-dir reports/'
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'reports',
                    reportFiles: 'executive_summary.html',
                    reportName: 'Quantum Security Report'
                ])
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: '**/*-report.json', fingerprint: true
        }
        failure {
            emailext (
                subject: "Quantum Security Scan Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "The quantum security scan failed. Check the build logs for details.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
    }
}
"""

    def _get_gitlab_ci_template(self) -> str:
        """Get GitLab CI pipeline template."""
        return """
stages:
  - security-scan
  - report

variables:
  QUANTUM_SCANNER_VERSION: "latest"

quantum_security_scan:
  stage: security-scan
  image: python:3.11
  script:
    - pip install quantum-scanner==$QUANTUM_SCANNER_VERSION
    - quantum-scanner cbom scan --target . --output cbom-report.json
    - quantum-scanner agility test --system gitlab --output agility-report.json
    - quantum-scanner attack simulate --algorithm rsa-2048 ecdsa-p256 --output attack-report.json
  artifacts:
    reports:
      security: quantum-security-report.json
    paths:
      - "*-report.json"
    expire_in: 1 week
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

generate_report:
  stage: report
  image: python:3.11
  script:
    - pip install quantum-scanner==$QUANTUM_SCANNER_VERSION
    - quantum-scanner full-scan --target . --output-dir reports/
  artifacts:
    paths:
      - reports/
    expire_in: 1 month
  dependencies:
    - quantum_security_scan
"""

    def _get_azure_devops_template(self) -> str:
        """Get Azure DevOps pipeline template."""
        return """
trigger:
  branches:
    include:
      - main
      - develop

pr:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  pythonVersion: '3.11'

stages:
- stage: QuantumSecurityScan
  displayName: 'Quantum Security Scan'
  jobs:
  - job: ScanJob
    displayName: 'Run Security Scans'
    steps:
    - task: UsePythonVersion@0
      inputs:
        versionSpec: '$(pythonVersion)'
      displayName: 'Use Python $(pythonVersion)'
      
    - script: |
        python -m pip install --upgrade pip
        pip install quantum-scanner
      displayName: 'Install dependencies'
      
    - script: |
        quantum-scanner cbom scan --target . --output $(Agent.TempDirectory)/cbom-report.json
      displayName: 'CBOM Scan'
      
    - script: |
        quantum-scanner agility test --system azure-devops --output $(Agent.TempDirectory)/agility-report.json
      displayName: 'Agility Test'
      
    - script: |
        quantum-scanner attack simulate --algorithm rsa-2048 --output $(Agent.TempDirectory)/attack-report.json
      displayName: 'Attack Simulation'
      
    - task: PublishTestResults@2
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: '$(Agent.TempDirectory)/quantum-test-results.xml'
        failTaskOnFailedTests: true
      displayName: 'Publish Test Results'
      
    - task: PublishBuildArtifacts@1
      inputs:
        PathtoPublish: '$(Agent.TempDirectory)'
        ArtifactName: 'quantum-security-reports'
      displayName: 'Publish Security Reports'
"""

    async def generate_pipeline_integration(self, platform: str, config: PipelineConfig) -> Dict[str, str]:
        """Generate CI/CD pipeline integration files."""
        if platform not in self.pipeline_templates:
            raise ValueError(f"Unsupported platform: {platform}")
        
        template_info = self.pipeline_templates[platform]
        
        # Customize template based on configuration
        customized_template = template_info["template"]
        
        # Replace placeholders with actual configuration
        customized_template = customized_template.replace(
            "quantum-scanner", f"quantum-scanner"  # Could customize version, etc.
        )
        
        return {
            "filename": template_info["file"],
            "content": customized_template,
            "description": template_info["name"]
        }
