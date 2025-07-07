"""Threat Intelligence Service - Core scanning and intelligence aggregation logic."""

import asyncio
# import aiohttp  # Temporarily commented out to fix server startup
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from xml.etree import ElementTree as ET
import json
import re

from ...core.logging import get_logger
from ...core.exceptions import ScanError
from .models import (
    Vulnerability,
    ResearchAlert,
    ThreatIntelligence,
    ThreatFeed,
    ThreatReport,
    MonitoringConfig,
    ThreatAnalysis,
    SeverityLevel,
    ThreatType,
    FeedType,
)

logger = get_logger(__name__)


class ThreatIntelligenceEngine:
    """Core threat intelligence aggregation and analysis engine."""

    def __init__(self):
        """Initialize the threat intelligence engine."""
        self.active_feeds = []
        self.quantum_keywords = [
            "quantum", "post-quantum", "pqc", "lattice", "isogeny",
            "shor", "grover", "kyber", "dilithium", "falcon", "sphincs",
            "ml-kem", "ml-dsa", "slh-dsa", "nist", "cryptographic agility"
        ]
        self.vulnerability_patterns = {
            "cve": re.compile(r'CVE-\d{4}-\d{4,7}', re.IGNORECASE),
            "crypto_algos": re.compile(r'\b(RSA|ECDSA|ECDH|DES|3DES|MD5|SHA-?1|RC4)\b', re.IGNORECASE),
            "pqc_algos": re.compile(r'\b(Kyber|Dilithium|Falcon|SPHINCS|ML-KEM|ML-DSA|SLH-DSA)\b', re.IGNORECASE),
        }

    async def initialize_default_feeds(self) -> List[ThreatFeed]:
        """Initialize default threat intelligence feeds."""
        default_feeds = [
            ThreatFeed(
                name="NIST National Vulnerability Database",
                feed_type=FeedType.CVE_FEED,
                source_url="https://services.nvd.nist.gov/rest/json/cves/2.0",
                description="Official NIST CVE database feed",
                update_frequency=6,  # Every 6 hours
                api_key_required=False
            ),
            ThreatFeed(
                name="arXiv Cryptography Papers",
                feed_type=FeedType.RESEARCH_FEED,
                source_url="http://export.arxiv.org/api/query",
                description="arXiv preprint server for cryptography research",
                update_frequency=24,  # Daily
                api_key_required=False,
                filters={"category": "cs.CR"}  # Computer Science - Cryptography
            ),
            ThreatFeed(
                name="NIST Post-Quantum Cryptography",
                feed_type=FeedType.NIST_UPDATES,
                source_url="https://csrc.nist.gov/projects/post-quantum-cryptography",
                description="NIST PQC standardization updates",
                update_frequency=168,  # Weekly
                api_key_required=False
            ),
            ThreatFeed(
                name="Quantum Computing Report",
                feed_type=FeedType.QUANTUM_NEWS,
                source_url="https://quantumcomputingreport.com/feed/",
                description="Quantum computing industry news and developments",
                update_frequency=24,  # Daily
                api_key_required=False
            ),
        ]
        
        self.active_feeds = default_feeds
        logger.info("Initialized default threat intelligence feeds", feed_count=len(default_feeds))
        return default_feeds

    async def collect_threat_intelligence(self, config: MonitoringConfig) -> ThreatReport:
        """Collect and analyze threat intelligence from configured feeds."""
        logger.info("Starting threat intelligence collection", config_name=config.name)
        
        try:
            vulnerabilities = []
            research_alerts = []
            threat_intelligence = []
            
            # Process each enabled feed
            for feed in self.active_feeds:
                if feed.id in config.enabled_feeds:
                    logger.debug("Processing threat feed", feed_name=feed.name)
                    
                    try:
                        if feed.feed_type == FeedType.CVE_FEED:
                            feed_vulns = await self._process_cve_feed(feed, config)
                            vulnerabilities.extend(feed_vulns)
                        elif feed.feed_type == FeedType.RESEARCH_FEED:
                            feed_research = await self._process_research_feed(feed, config)
                            research_alerts.extend(feed_research)
                        elif feed.feed_type in [FeedType.QUANTUM_NEWS, FeedType.NIST_UPDATES]:
                            feed_intel = await self._process_news_feed(feed, config)
                            threat_intelligence.extend(feed_intel)
                    except Exception as e:
                        logger.error("Feed processing failed", 
                                   feed_name=feed.name, 
                                   error=str(e))
                        continue
            
            # Analyze and correlate intelligence
            analyzed_threats = await self._analyze_intelligence(
                vulnerabilities, research_alerts, threat_intelligence, config
            )
            
            # Generate report
            report = await self._generate_threat_report(
                vulnerabilities, research_alerts, analyzed_threats, config
            )
            
            logger.info("Threat intelligence collection completed", 
                       vulnerabilities_count=len(vulnerabilities),
                       research_alerts_count=len(research_alerts),
                       threat_intelligence_count=len(analyzed_threats))
            
            return report
            
        except Exception as e:
            logger.error("Threat intelligence collection failed", error=str(e))
            raise ScanError(f"Intelligence collection failed: {str(e)}")

    async def _process_cve_feed(self, feed: ThreatFeed, config: MonitoringConfig) -> List[Vulnerability]:
        """Process CVE feed for cryptographic vulnerabilities."""
        vulnerabilities = []
        
        try:
            # Simulate CVE feed processing
            # In production, this would make actual API calls to NVD
            sample_cves = [
                {
                    "cve_id": "CVE-2024-1234",
                    "title": "Weak RSA Key Generation in Library X",
                    "description": "RSA key generation uses insufficient entropy, making keys predictable",
                    "severity": "HIGH",
                    "cvss_score": 7.5,
                    "affected_algorithms": ["RSA"],
                    "published": "2024-06-15T10:00:00Z"
                },
                {
                    "cve_id": "CVE-2024-5678",
                    "title": "Timing Attack in ECDSA Implementation",
                    "description": "ECDSA signature generation vulnerable to timing side-channel attacks",
                    "severity": "MEDIUM",
                    "cvss_score": 5.3,
                    "affected_algorithms": ["ECDSA"],
                    "published": "2024-06-20T14:30:00Z"
                }
            ]
            
            for cve_data in sample_cves:
                # Check if CVE matches monitoring criteria
                if self._matches_monitoring_criteria(cve_data, config):
                    vulnerability = Vulnerability(
                        cve_id=cve_data["cve_id"],
                        title=cve_data["title"],
                        description=cve_data["description"],
                        affected_algorithms=cve_data["affected_algorithms"],
                        severity=SeverityLevel(cve_data["severity"].lower()),
                        threat_type=ThreatType.IMPLEMENTATION_FLAW,
                        quantum_relevant=self._assess_quantum_relevance(cve_data),
                        cvss_score=cve_data["cvss_score"],
                        published_date=datetime.fromisoformat(cve_data["published"].replace("Z", "+00:00")),
                        mitigation_advice=self._generate_mitigation_advice(cve_data)
                    )
                    vulnerabilities.append(vulnerability)
            
        except Exception as e:
            logger.error("CVE feed processing failed", feed_name=feed.name, error=str(e))
        
        return vulnerabilities

    async def _process_research_feed(self, feed: ThreatFeed, config: MonitoringConfig) -> List[ResearchAlert]:
        """Process research feed for quantum cryptography developments."""
        research_alerts = []
        
        try:
            # Simulate arXiv feed processing
            sample_papers = [
                {
                    "title": "Improved Quantum Algorithms for Lattice-Based Cryptography",
                    "authors": ["Alice Smith", "Bob Jones"],
                    "institution": "University of Quantum Research",
                    "abstract": "We present new quantum algorithms that improve upon Shor's algorithm for certain lattice-based problems, with implications for post-quantum cryptography security.",
                    "arxiv_id": "2024.1234.5678",
                    "published": "2024-06-25T00:00:00Z",
                    "keywords": ["quantum algorithms", "lattice cryptography", "post-quantum"]
                },
                {
                    "title": "Side-Channel Analysis of ML-KEM Implementations",
                    "authors": ["Charlie Brown", "Diana Prince"],
                    "institution": "Crypto Security Labs",
                    "abstract": "Analysis of side-channel vulnerabilities in various ML-KEM implementations reveals potential weaknesses in power and timing channels.",
                    "arxiv_id": "2024.2345.6789",
                    "published": "2024-06-28T00:00:00Z",
                    "keywords": ["ML-KEM", "side-channel", "implementation security"]
                }
            ]
            
            for paper in sample_papers:
                if self._matches_research_criteria(paper, config):
                    significance_score = self._calculate_research_significance(paper)
                    
                    alert = ResearchAlert(
                        title=paper["title"],
                        authors=paper["authors"],
                        institution=paper["institution"],
                        abstract=paper["abstract"],
                        quantum_impact=self._assess_quantum_impact(paper),
                        algorithms_affected=self._extract_affected_algorithms(paper),
                        significance_score=significance_score,
                        published_date=datetime.fromisoformat(paper["published"].replace("Z", "+00:00")),
                        arxiv_id=paper["arxiv_id"],
                        keywords=paper["keywords"],
                        summary=self._generate_research_summary(paper),
                        implications=self._generate_research_implications(paper)
                    )
                    research_alerts.append(alert)
                    
        except Exception as e:
            logger.error("Research feed processing failed", feed_name=feed.name, error=str(e))
        
        return research_alerts

    async def _process_news_feed(self, feed: ThreatFeed, config: MonitoringConfig) -> List[ThreatIntelligence]:
        """Process news and update feeds for threat intelligence."""
        threat_intelligence = []
        
        try:
            # Simulate news feed processing
            sample_news = [
                {
                    "title": "IBM Announces 1000-Qubit Quantum Processor",
                    "description": "IBM's new quantum processor represents a significant milestone in quantum computing capabilities, potentially accelerating the quantum threat timeline.",
                    "source": "Quantum Computing Report",
                    "published": "2024-06-30T12:00:00Z",
                    "threat_type": "hardware_advancement",
                    "quantum_relevance": 0.9
                },
                {
                    "title": "NIST Publishes Updated PQC Migration Guidelines",
                    "description": "New guidelines provide updated timelines and recommendations for post-quantum cryptography migration in enterprise environments.",
                    "source": "NIST",
                    "published": "2024-07-01T09:00:00Z",
                    "threat_type": "policy_change",
                    "quantum_relevance": 0.8
                }
            ]
            
            for news_item in sample_news:
                if self._matches_news_criteria(news_item, config):
                    intel = ThreatIntelligence(
                        title=news_item["title"],
                        description=news_item["description"],
                        threat_type=ThreatType.RESEARCH_ADVANCEMENT,
                        severity=self._assess_news_severity(news_item),
                        confidence_level=0.8,
                        source_feeds=[feed.name],
                        quantum_relevance=news_item["quantum_relevance"],
                        recommendations=self._generate_news_recommendations(news_item)
                    )
                    threat_intelligence.append(intel)
                    
        except Exception as e:
            logger.error("News feed processing failed", feed_name=feed.name, error=str(e))
        
        return threat_intelligence

    async def _analyze_intelligence(self, vulnerabilities: List[Vulnerability],
                                  research_alerts: List[ResearchAlert],
                                  threat_intelligence: List[ThreatIntelligence],
                                  config: MonitoringConfig) -> List[ThreatIntelligence]:
        """Analyze and correlate collected intelligence."""
        analyzed_threats = []
        
        # Correlate vulnerabilities with research
        for vuln in vulnerabilities:
            related_research = [
                alert for alert in research_alerts
                if any(algo in alert.algorithms_affected for algo in vuln.affected_algorithms)
            ]
            
            if related_research:
                correlation = ThreatIntelligence(
                    title=f"Correlated Threat: {vuln.title}",
                    description=f"Vulnerability {vuln.cve_id} correlates with recent research findings",
                    threat_type=ThreatType.ALGORITHM_BREAK,
                    severity=vuln.severity,
                    confidence_level=0.9,
                    quantum_relevance=1.0 if vuln.quantum_relevant else 0.3,
                    recommendations=[
                        f"Monitor research developments related to {', '.join(vuln.affected_algorithms)}",
                        "Consider accelerated migration planning"
                    ]
                )
                analyzed_threats.append(correlation)
        
        # Add original threat intelligence
        analyzed_threats.extend(threat_intelligence)
        
        return analyzed_threats

    async def _generate_threat_report(self, vulnerabilities: List[Vulnerability],
                                    research_alerts: List[ResearchAlert],
                                    threat_intelligence: List[ThreatIntelligence],
                                    config: MonitoringConfig) -> ThreatReport:
        """Generate comprehensive threat intelligence report."""
        
        # Calculate severity breakdown
        severity_breakdown = {}
        for vuln in vulnerabilities:
            severity_breakdown[vuln.severity.value] = severity_breakdown.get(vuln.severity.value, 0) + 1
        
        # Identify trending threats
        trending_threats = self._identify_trending_threats(vulnerabilities, research_alerts, threat_intelligence)
        
        # Calculate quantum threat level
        quantum_threat_level = self._calculate_quantum_threat_level(vulnerabilities, research_alerts, threat_intelligence)
        
        # Generate key findings
        key_findings = self._generate_key_findings(vulnerabilities, research_alerts, threat_intelligence)
        
        # Generate recommendations
        recommendations = self._generate_report_recommendations(vulnerabilities, research_alerts, threat_intelligence)
        
        # Generate executive summary
        executive_summary = self._generate_executive_summary(
            vulnerabilities, research_alerts, threat_intelligence, quantum_threat_level
        )
        
        report = ThreatReport(
            title=f"Quantum Threat Intelligence Report - {datetime.now().strftime('%Y-%m-%d')}",
            report_period_start=datetime.now() - timedelta(days=7),
            report_period_end=datetime.now(),
            vulnerabilities=vulnerabilities,
            research_alerts=research_alerts,
            threat_intelligence=threat_intelligence,
            trending_threats=trending_threats,
            severity_breakdown=severity_breakdown,
            quantum_threat_level=quantum_threat_level,
            key_findings=key_findings,
            recommendations=recommendations,
            executive_summary=executive_summary
        )
        
        return report

    def _matches_monitoring_criteria(self, cve_data: Dict[str, Any], config: MonitoringConfig) -> bool:
        """Check if CVE matches monitoring criteria."""
        # Check severity threshold
        severity_map = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
        config_severity = severity_map.get(config.minimum_severity.value.upper(), 2)
        cve_severity = severity_map.get(cve_data["severity"], 1)
        
        if cve_severity < config_severity:
            return False
        
        # Check algorithm relevance
        if config.algorithms_of_interest:
            if not any(algo in cve_data.get("affected_algorithms", []) 
                      for algo in config.algorithms_of_interest):
                return False
        
        # Check keywords
        if config.keywords:
            text = f"{cve_data['title']} {cve_data['description']}".lower()
            if not any(keyword.lower() in text for keyword in config.keywords):
                return False
        
        return True

    def _matches_research_criteria(self, paper: Dict[str, Any], config: MonitoringConfig) -> bool:
        """Check if research paper matches monitoring criteria."""
        # Check keywords
        if config.keywords:
            text = f"{paper['title']} {paper['abstract']}".lower()
            if not any(keyword.lower() in text for keyword in config.keywords):
                return False
        
        # Check quantum relevance
        quantum_keywords_found = sum(
            1 for keyword in self.quantum_keywords
            if keyword.lower() in text
        )
        
        return quantum_keywords_found >= 2  # Require at least 2 quantum-related keywords

    def _matches_news_criteria(self, news_item: Dict[str, Any], config: MonitoringConfig) -> bool:
        """Check if news item matches monitoring criteria."""
        return news_item.get("quantum_relevance", 0) >= 0.7

    def _assess_quantum_relevance(self, cve_data: Dict[str, Any]) -> bool:
        """Assess if CVE is quantum-relevant."""
        text = f"{cve_data['title']} {cve_data['description']}".lower()
        
        # Check for quantum-vulnerable algorithms
        vulnerable_algos = ["rsa", "ecdsa", "ecdh", "dh", "dsa"]
        quantum_terms = ["quantum", "post-quantum", "pqc"]
        
        has_vulnerable_algo = any(algo in text for algo in vulnerable_algos)
        has_quantum_term = any(term in text for term in quantum_terms)
        
        return has_vulnerable_algo or has_quantum_term

    def _generate_mitigation_advice(self, cve_data: Dict[str, Any]) -> List[str]:
        """Generate mitigation advice for CVE."""
        advice = []
        
        affected_algos = cve_data.get("affected_algorithms", [])
        
        for algo in affected_algos:
            if algo.upper() in ["RSA", "ECDSA", "ECDH"]:
                advice.append(f"Consider migrating from {algo} to post-quantum alternatives")
                advice.append("Implement crypto-agility for future algorithm updates")
            elif algo.upper() in ["AES"]:
                advice.append("Ensure using AES-256 for quantum resistance")
            
        if not advice:
            advice.append("Apply vendor patches when available")
            advice.append("Review implementation for security best practices")
        
        return advice

    def _calculate_research_significance(self, paper: Dict[str, Any]) -> float:
        """Calculate research significance score."""
        score = 0.0
        
        # Check for breakthrough keywords
        breakthrough_terms = ["breakthrough", "novel", "improved", "efficient", "attack"]
        text = f"{paper['title']} {paper['abstract']}".lower()
        
        for term in breakthrough_terms:
            if term in text:
                score += 0.2
        
        # Check institution reputation (simplified)
        if "university" in paper["institution"].lower():
            score += 0.1
        
        # Check quantum relevance
        quantum_score = sum(0.1 for keyword in self.quantum_keywords if keyword.lower() in text)
        score += min(quantum_score, 0.5)
        
        return min(score, 1.0)

    def _assess_quantum_impact(self, paper: Dict[str, Any]) -> str:
        """Assess quantum impact of research."""
        text = f"{paper['title']} {paper['abstract']}".lower()
        
        if any(term in text for term in ["attack", "break", "compromise"]):
            return "Potential cryptographic weakness discovered"
        elif any(term in text for term in ["improved", "efficient", "optimized"]):
            return "Algorithm improvement that may affect security assumptions"
        elif any(term in text for term in ["implementation", "side-channel"]):
            return "Implementation security considerations"
        else:
            return "Theoretical advancement in quantum cryptography"

    def _extract_affected_algorithms(self, paper: Dict[str, Any]) -> List[str]:
        """Extract affected algorithms from research paper."""
        text = f"{paper['title']} {paper['abstract']}".lower()
        algorithms = []
        
        # Common algorithm patterns
        algo_patterns = {
            r'\brsa\b': "RSA",
            r'\becdsa\b': "ECDSA",
            r'\becdh\b': "ECDH",
            r'\bkyber\b': "Kyber",
            r'\bdilithium\b': "Dilithium",
            r'\bfalcon\b': "Falcon",
            r'\bsphincs\b': "SPHINCS+",
            r'\bml-kem\b': "ML-KEM",
            r'\bml-dsa\b': "ML-DSA",
            r'\bslh-dsa\b': "SLH-DSA",
        }
        
        for pattern, algo_name in algo_patterns.items():
            if re.search(pattern, text):
                algorithms.append(algo_name)
        
        return algorithms

    def _generate_research_summary(self, paper: Dict[str, Any]) -> str:
        """Generate research summary."""
        return f"Research from {paper['institution']} presents findings on {', '.join(paper['keywords'])} with potential implications for cryptographic security."

    def _generate_research_implications(self, paper: Dict[str, Any]) -> List[str]:
        """Generate research implications."""
        implications = []
        
        if "attack" in paper["title"].lower():
            implications.append("Review affected algorithms for potential vulnerabilities")
            implications.append("Consider impact on current cryptographic implementations")
        
        if "quantum" in paper["abstract"].lower():
            implications.append("Monitor for practical implementation of quantum techniques")
            implications.append("Assess impact on quantum threat timeline")
        
        implications.append("Include in next threat assessment review")
        
        return implications

    def _assess_news_severity(self, news_item: Dict[str, Any]) -> SeverityLevel:
        """Assess severity of news item."""
        if "breakthrough" in news_item["title"].lower():
            return SeverityLevel.HIGH
        elif "milestone" in news_item["title"].lower():
            return SeverityLevel.MEDIUM
        else:
            return SeverityLevel.LOW

    def _generate_news_recommendations(self, news_item: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on news item."""
        recommendations = []
        
        if "quantum processor" in news_item["title"].lower():
            recommendations.extend([
                "Review quantum threat timeline estimates",
                "Accelerate post-quantum cryptography planning",
                "Monitor quantum computing capabilities"
            ])
        elif "nist" in news_item["source"].lower():
            recommendations.extend([
                "Review updated NIST guidance",
                "Update compliance procedures",
                "Align with standardization efforts"
            ])
        
        return recommendations

    def _identify_trending_threats(self, vulnerabilities: List[Vulnerability],
                                 research_alerts: List[ResearchAlert],
                                 threat_intelligence: List[ThreatIntelligence]) -> List[str]:
        """Identify trending threats."""
        trends = []
        
        # Algorithm frequency analysis
        algo_counts = {}
        
        for vuln in vulnerabilities:
            for algo in vuln.affected_algorithms:
                algo_counts[algo] = algo_counts.get(algo, 0) + 1
        
        for alert in research_alerts:
            for algo in alert.algorithms_affected:
                algo_counts[algo] = algo_counts.get(algo, 0) + 1
        
        # Identify most mentioned algorithms
        if algo_counts:
            top_algos = sorted(algo_counts.items(), key=lambda x: x[1], reverse=True)[:3]
            trends.extend([f"Increased attention on {algo}" for algo, _ in top_algos])
        
        # Severity trends
        high_severity_count = sum(1 for vuln in vulnerabilities if vuln.severity in [SeverityLevel.HIGH, SeverityLevel.CRITICAL])
        if high_severity_count > len(vulnerabilities) * 0.3:
            trends.append("Rising high-severity vulnerabilities")
        
        return trends

    def _calculate_quantum_threat_level(self, vulnerabilities: List[Vulnerability],
                                      research_alerts: List[ResearchAlert],
                                      threat_intelligence: List[ThreatIntelligence]) -> float:
        """Calculate overall quantum threat level."""
        threat_level = 0.0
        
        # Vulnerability contribution
        vuln_score = 0.0
        if vulnerabilities:
            high_severity_vulns = [v for v in vulnerabilities if v.severity in [SeverityLevel.HIGH, SeverityLevel.CRITICAL]]
            quantum_vulns = [v for v in vulnerabilities if v.quantum_relevant]
            
            vuln_score = (len(high_severity_vulns) + len(quantum_vulns) * 2) / (len(vulnerabilities) * 3)
        
        # Research contribution
        research_score = 0.0
        if research_alerts:
            high_significance = [r for r in research_alerts if r.significance_score > 0.7]
            research_score = len(high_significance) / len(research_alerts)
        
        # Intelligence contribution
        intel_score = 0.0
        if threat_intelligence:
            high_relevance = [t for t in threat_intelligence if t.quantum_relevance > 0.7]
            intel_score = len(high_relevance) / len(threat_intelligence)
        
        # Weighted average
        weights = [0.4, 0.3, 0.3]  # vulnerabilities, research, intelligence
        scores = [vuln_score, research_score, intel_score]
        
        threat_level = sum(w * s for w, s in zip(weights, scores))
        
        return min(threat_level, 1.0)

    def _generate_key_findings(self, vulnerabilities: List[Vulnerability],
                             research_alerts: List[ResearchAlert],
                             threat_intelligence: List[ThreatIntelligence]) -> List[str]:
        """Generate key findings from intelligence."""
        findings = []
        
        if vulnerabilities:
            critical_vulns = [v for v in vulnerabilities if v.severity == SeverityLevel.CRITICAL]
            if critical_vulns:
                findings.append(f"{len(critical_vulns)} critical cryptographic vulnerabilities discovered")
        
        if research_alerts:
            significant_research = [r for r in research_alerts if r.significance_score > 0.8]
            if significant_research:
                findings.append(f"{len(significant_research)} significant research developments identified")
        
        # Algorithm-specific findings
        all_affected_algos = set()
        for vuln in vulnerabilities:
            all_affected_algos.update(vuln.affected_algorithms)
        for alert in research_alerts:
            all_affected_algos.update(alert.algorithms_affected)
        
        vulnerable_classical = [algo for algo in all_affected_algos if algo.upper() in ["RSA", "ECDSA", "ECDH"]]
        if vulnerable_classical:
            findings.append(f"Quantum-vulnerable algorithms in focus: {', '.join(vulnerable_classical)}")
        
        return findings

    def _generate_report_recommendations(self, vulnerabilities: List[Vulnerability],
                                       research_alerts: List[ResearchAlert],
                                       threat_intelligence: List[ThreatIntelligence]) -> List[str]:
        """Generate overall report recommendations."""
        recommendations = []
        
        # Vulnerability-based recommendations
        if vulnerabilities:
            critical_count = sum(1 for v in vulnerabilities if v.severity == SeverityLevel.CRITICAL)
            if critical_count > 0:
                recommendations.append("Implement emergency patches for critical vulnerabilities")
        
        # Research-based recommendations
        if research_alerts:
            quantum_research = [r for r in research_alerts if "quantum" in r.title.lower()]
            if quantum_research:
                recommendations.append("Monitor quantum computing developments closely")
                recommendations.append("Accelerate post-quantum cryptography planning")
        
        # General recommendations
        recommendations.extend([
            "Establish regular threat intelligence review cycles",
            "Implement automated vulnerability scanning",
            "Develop incident response procedures for cryptographic threats",
            "Train security teams on post-quantum cryptography"
        ])
        
        return recommendations

    def _generate_executive_summary(self, vulnerabilities: List[Vulnerability],
                                  research_alerts: List[ResearchAlert],
                                  threat_intelligence: List[ThreatIntelligence],
                                  quantum_threat_level: float) -> str:
        """Generate executive summary."""
        summary_parts = []
        
        summary_parts.append(f"Threat intelligence analysis reveals {len(vulnerabilities)} cryptographic vulnerabilities")
        summary_parts.append(f"and {len(research_alerts)} research developments")
        
        if quantum_threat_level > 0.7:
            summary_parts.append("indicating elevated quantum threat levels")
        elif quantum_threat_level > 0.4:
            summary_parts.append("showing moderate quantum threat activity")
        else:
            summary_parts.append("with baseline quantum threat levels")
        
        critical_vulns = sum(1 for v in vulnerabilities if v.severity == SeverityLevel.CRITICAL)
        if critical_vulns > 0:
            summary_parts.append(f"including {critical_vulns} critical vulnerabilities requiring immediate attention")
        
        summary_parts.append(f"Overall quantum threat level: {quantum_threat_level:.2f}/1.0")
        
        return ". ".join(summary_parts) + "."
