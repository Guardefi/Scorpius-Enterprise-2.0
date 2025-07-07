"""Attack Simulator - Quantum attack demonstration and timeline prediction."""

import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from uuid import uuid4

from quantum_scanner.core.logging import get_logger
from quantum_scanner.core.exceptions import ScanError
from .models import (
    AttackScenario,
    QuantumAttack,
    AttackResult,
    AttackType,
    AlgorithmVulnerability,
    QuantumCapability,
    TimelineEstimate,
    ThreatModel,
    ThreatLevel,
    QuantumHardware,
    SimulationRequest,
    SimulationReport,
)

logger = get_logger(__name__)


class AttackSimulator:
    """Core quantum attack simulation engine."""

    def __init__(self):
        """Initialize the attack simulator."""
        self.algorithm_parameters = {
            "rsa": {
                1024: {"classical_time_years": 1000, "quantum_qubits": 2048, "quantum_gates": 10**6},
                2048: {"classical_time_years": 10000, "quantum_qubits": 4096, "quantum_gates": 10**7},
                3072: {"classical_time_years": 100000, "quantum_qubits": 6144, "quantum_gates": 10**8},
                4096: {"classical_time_years": 1000000, "quantum_qubits": 8192, "quantum_gates": 10**8},
            },
            "ecdsa": {
                256: {"classical_time_years": 100, "quantum_qubits": 2330, "quantum_gates": 10**5},
                384: {"classical_time_years": 10000, "quantum_qubits": 3484, "quantum_gates": 10**6},
                521: {"classical_time_years": 100000, "quantum_qubits": 4719, "quantum_gates": 10**7},
            },
            "aes": {
                128: {"classical_time_years": 1000000, "quantum_qubits": 6400, "quantum_gates": 10**8},
                192: {"classical_time_years": 10000000, "quantum_qubits": 9600, "quantum_gates": 10**9},
                256: {"classical_time_years": 100000000, "quantum_qubits": 12800, "quantum_gates": 10**10},
            }
        }
        
        self.quantum_roadmap = self._initialize_quantum_roadmap()

    def _initialize_quantum_roadmap(self) -> List[QuantumCapability]:
        """Initialize quantum computing capability roadmap."""
        return [
            QuantumCapability(
                year=2024,
                logical_qubits=100,
                gate_fidelity=0.999,
                coherence_time_ms=100,
                gate_time_ns=50,
                error_rate=0.001,
                hardware_type=QuantumHardware.GATE_BASED
            ),
            QuantumCapability(
                year=2027,
                logical_qubits=1000,
                gate_fidelity=0.9995,
                coherence_time_ms=500,
                gate_time_ns=20,
                error_rate=0.0005,
                hardware_type=QuantumHardware.GATE_BASED
            ),
            QuantumCapability(
                year=2030,
                logical_qubits=10000,
                gate_fidelity=0.9999,
                coherence_time_ms=1000,
                gate_time_ns=10,
                error_rate=0.0001,
                hardware_type=QuantumHardware.GATE_BASED
            ),
            QuantumCapability(
                year=2035,
                logical_qubits=100000,
                gate_fidelity=0.99995,
                coherence_time_ms=5000,
                gate_time_ns=5,
                error_rate=0.00005,
                hardware_type=QuantumHardware.GATE_BASED
            ),
        ]

    async def simulate_attacks(self, request: SimulationRequest) -> SimulationReport:
        """Perform comprehensive quantum attack simulation."""
        logger.info("Starting attack simulation", 
                   algorithms=request.target_algorithms,
                   attack_types=request.attack_types)
        
        try:
            vulnerabilities = []
            attack_results = []
            timeline_estimates = []
            
            # Analyze vulnerabilities for each algorithm
            for algorithm in request.target_algorithms:
                for key_size in request.key_sizes or self._get_default_key_sizes(algorithm):
                    vulnerability = await self._assess_algorithm_vulnerability(
                        algorithm, key_size, request.attack_types
                    )
                    vulnerabilities.append(vulnerability)
                    
                    # Simulate attacks
                    for attack_type in request.attack_types or [AttackType.SHORS_ALGORITHM]:
                        attack = QuantumAttack(
                            scenario_id=uuid4(),  # Generate proper UUID
                            attack_type=attack_type,
                            target_algorithm=algorithm,
                            target_key_size=key_size,
                            estimated_duration=timedelta(hours=1),  # Placeholder
                            success_criteria="Algorithm broken",
                            quantum_resources={
                                "logical_qubits": vulnerability.logical_qubits_required,
                                "gate_depth": vulnerability.gate_depth
                            }
                        )
                        
                        result = await self._simulate_attack(attack)
                        attack_results.append(result)
                    
                    # Generate timeline estimates
                    if request.include_timeline:
                        timeline = await self._estimate_break_timeline(
                            algorithm, key_size, request.confidence_level
                        )
                        timeline_estimates.append(timeline)
            
            # Calculate overall risk assessment
            risk_score = self._calculate_risk_score(vulnerabilities, attack_results)
            threat_assessment = self._generate_threat_assessment(vulnerabilities, timeline_estimates)
            recommendations = self._generate_recommendations(vulnerabilities, attack_results)
            executive_summary = self._generate_executive_summary(
                vulnerabilities, attack_results, timeline_estimates, risk_score
            )
            
            return SimulationReport(
                request_id=uuid4(),  # Generate proper UUID
                vulnerabilities=vulnerabilities,
                attack_results=attack_results,
                timeline_estimates=timeline_estimates,
                threat_assessment=threat_assessment,
                risk_score=risk_score,
                executive_summary=executive_summary,
                recommendations=recommendations,
                metadata={
                    "simulation_parameters": request.dict(),
                    "quantum_roadmap": [cap.dict() for cap in self.quantum_roadmap]
                }
            )
            
        except Exception as e:
            logger.error("Attack simulation failed", error=str(e))
            raise ScanError(f"Attack simulation failed: {str(e)}")

    async def _assess_algorithm_vulnerability(self, algorithm: str, key_size: int, 
                                            attack_types: List[AttackType]) -> AlgorithmVulnerability:
        """Assess vulnerability of a specific algorithm and key size."""
        logger.debug("Assessing vulnerability", algorithm=algorithm, key_size=key_size)
        
        # Get algorithm parameters
        algo_key = algorithm.lower().replace("-", "").replace("_", "")
        if algo_key not in self.algorithm_parameters:
            # Default parameters for unknown algorithms
            params = {
                "classical_time_years": 1000,
                "quantum_qubits": key_size * 2,
                "quantum_gates": 10**6
            }
        else:
            # Find closest key size
            available_sizes = list(self.algorithm_parameters[algo_key].keys())
            closest_size = min(available_sizes, key=lambda x: abs(x - key_size))
            params = self.algorithm_parameters[algo_key][closest_size]
        
        # Determine primary attack type
        attack_type = self._get_primary_attack_type(algorithm)
        
        # Calculate quantum advantage
        classical_time = timedelta(days=params["classical_time_years"] * 365)
        quantum_time = self._estimate_quantum_attack_time(
            params["quantum_qubits"], 
            params["quantum_gates"]
        )
        
        quantum_advantage = classical_time.total_seconds() / quantum_time.total_seconds()
        
        # Calculate vulnerability score
        vulnerability_score = self._calculate_vulnerability_score(
            algorithm, key_size, quantum_advantage
        )
        
        return AlgorithmVulnerability(
            algorithm_name=algorithm,
            key_size=key_size,
            attack_type=attack_type,
            quantum_advantage=quantum_advantage,
            logical_qubits_required=params["quantum_qubits"],
            gate_depth=int(math.log2(params["quantum_gates"])),
            estimated_time_classical=classical_time,
            estimated_time_quantum=quantum_time,
            vulnerability_score=vulnerability_score
        )

    async def _simulate_attack(self, attack: QuantumAttack) -> AttackResult:
        """Simulate a quantum attack."""
        logger.debug("Simulating attack", 
                    algorithm=attack.target_algorithm,
                    attack_type=attack.attack_type)
        
        # Determine if attack would be successful with current/near-future hardware
        current_capability = self._get_current_quantum_capability()
        required_qubits = attack.quantum_resources.get("logical_qubits", 1000)
        
        attack_successful = current_capability.logical_qubits >= required_qubits
        success_probability = min(1.0, current_capability.logical_qubits / required_qubits)
        
        # Calculate time to break
        if attack_successful:
            time_to_break = attack.estimated_duration
        else:
            # Estimate when sufficient hardware will be available
            time_to_break = self._estimate_time_until_capability(required_qubits)
        
        recommendations = self._generate_attack_recommendations(attack, attack_successful)
        limitations = self._identify_attack_limitations(attack, current_capability)
        
        return AttackResult(
            attack_id=attack.id,
            simulation_successful=True,
            attack_successful=attack_successful,
            time_to_break=time_to_break,
            quantum_resources_used={
                "logical_qubits": min(required_qubits, current_capability.logical_qubits),
                "gate_fidelity": current_capability.gate_fidelity,
                "coherence_time": current_capability.coherence_time_ms
            },
            success_probability=success_probability,
            confidence_interval={"lower": success_probability * 0.8, "upper": min(1.0, success_probability * 1.2)},
            limitations=limitations,
            recommendations=recommendations,
            metadata={
                "hardware_type": current_capability.hardware_type.value,
                "simulation_assumptions": [
                    "Perfect quantum error correction",
                    "Optimal algorithm implementation",
                    "No hardware failures"
                ]
            }
        )

    async def _estimate_break_timeline(self, algorithm: str, key_size: int, 
                                     confidence_level: float) -> TimelineEstimate:
        """Estimate timeline for when algorithm will be breakable."""
        logger.debug("Estimating break timeline", algorithm=algorithm, key_size=key_size)
        
        # Get required quantum resources
        algo_key = algorithm.lower().replace("-", "").replace("_", "")
        if algo_key in self.algorithm_parameters:
            available_sizes = list(self.algorithm_parameters[algo_key].keys())
            closest_size = min(available_sizes, key=lambda x: abs(x - key_size))
            required_qubits = self.algorithm_parameters[algo_key][closest_size]["quantum_qubits"]
        else:
            required_qubits = key_size * 2  # Conservative estimate
        
        # Find when this capability will be available
        conservative_year = None
        optimistic_year = None
        
        for capability in self.quantum_roadmap:
            if capability.logical_qubits >= required_qubits:
                if optimistic_year is None:
                    optimistic_year = capability.year
                if conservative_year is None:
                    conservative_year = capability.year + 2  # Add buffer
                break
        
        # If not in roadmap, extrapolate
        if optimistic_year is None:
            last_capability = self.quantum_roadmap[-1]
            growth_rate = 10  # 10x growth every 5 years (rough estimate)
            years_needed = math.log(required_qubits / last_capability.logical_qubits) / math.log(growth_rate) * 5
            optimistic_year = int(last_capability.year + years_needed)
            conservative_year = int(optimistic_year + 5)
        
        conservative_date = datetime(conservative_year, 1, 1)
        optimistic_date = datetime(optimistic_year, 1, 1)
        
        return TimelineEstimate(
            algorithm_name=algorithm,
            key_size=key_size,
            conservative_estimate=conservative_date,
            optimistic_estimate=optimistic_date,
            confidence_level=confidence_level,
            assumptions=[
                f"Requires {required_qubits} logical qubits",
                "Assumes continued quantum hardware progress",
                "Perfect quantum error correction",
                "Optimal algorithm implementation"
            ],
            risk_factors=[
                "Quantum hardware breakthroughs",
                "Algorithm improvements",
                "Error correction advances",
                "Industry investment changes"
            ]
        )

    def _get_primary_attack_type(self, algorithm: str) -> AttackType:
        """Determine the primary attack type for an algorithm."""
        algo_lower = algorithm.lower()
        
        if any(name in algo_lower for name in ["rsa", "dh", "ecdh", "ecdsa"]):
            return AttackType.SHORS_ALGORITHM
        elif any(name in algo_lower for name in ["aes", "chacha", "hash"]):
            return AttackType.GROVERS_ALGORITHM
        else:
            return AttackType.SHORS_ALGORITHM  # Default

    def _estimate_quantum_attack_time(self, qubits: int, gates: int) -> timedelta:
        """Estimate time for quantum attack given resources."""
        # Simplified calculation - in reality much more complex
        gate_time_ns = 10  # Optimistic gate time
        total_time_s = (gates * gate_time_ns) / 1e9
        return timedelta(seconds=total_time_s)

    def _calculate_vulnerability_score(self, algorithm: str, key_size: int, quantum_advantage: float) -> float:
        """Calculate vulnerability score for algorithm."""
        # Base vulnerability based on algorithm type
        base_scores = {
            "rsa": 0.9,
            "ecdsa": 0.9,
            "ecdh": 0.9,
            "aes": 0.3,  # Grover's provides quadratic speedup only
        }
        
        algo_key = algorithm.lower().replace("-", "").replace("_", "")
        base_score = base_scores.get(algo_key, 0.5)
        
        # Adjust for key size (smaller keys = higher vulnerability)
        key_factor = 1.0 / (1.0 + key_size / 1000.0)
        
        # Adjust for quantum advantage
        advantage_factor = min(1.0, math.log10(quantum_advantage) / 10.0)
        
        return min(1.0, base_score * (1 + key_factor + advantage_factor) / 3)

    def _get_current_quantum_capability(self) -> QuantumCapability:
        """Get current quantum computing capability."""
        current_year = datetime.now().year
        
        # Find the most recent capability
        for capability in self.quantum_roadmap:
            if capability.year <= current_year:
                current_capability = capability
            else:
                break
        
        return current_capability or self.quantum_roadmap[0]

    def _estimate_time_until_capability(self, required_qubits: int) -> timedelta:
        """Estimate time until required quantum capability is available."""
        current_capability = self._get_current_quantum_capability()
        
        if current_capability.logical_qubits >= required_qubits:
            return timedelta(0)
        
        # Find next suitable capability
        for capability in self.quantum_roadmap:
            if capability.logical_qubits >= required_qubits:
                years_remaining = capability.year - datetime.now().year
                return timedelta(days=years_remaining * 365)
        
        # If not in roadmap, extrapolate
        last_capability = self.quantum_roadmap[-1]
        growth_rate = 10  # 10x every 5 years
        years_needed = math.log(required_qubits / last_capability.logical_qubits) / math.log(growth_rate) * 5
        return timedelta(days=(last_capability.year - datetime.now().year + years_needed) * 365)

    def _get_default_key_sizes(self, algorithm: str) -> List[int]:
        """Get default key sizes to test for an algorithm."""
        defaults = {
            "rsa": [2048, 3072, 4096],
            "ecdsa": [256, 384, 521],
            "aes": [128, 192, 256],
        }
        
        algo_key = algorithm.lower().replace("-", "").replace("_", "")
        return defaults.get(algo_key, [256, 512, 1024])

    def _calculate_risk_score(self, vulnerabilities: List[AlgorithmVulnerability], 
                            attack_results: List[AttackResult]) -> float:
        """Calculate overall risk score."""
        if not vulnerabilities and not attack_results:
            return 0.0
        
        vulnerability_scores = [v.vulnerability_score for v in vulnerabilities]
        success_probabilities = [r.success_probability for r in attack_results]
        
        avg_vulnerability = sum(vulnerability_scores) / len(vulnerability_scores) if vulnerability_scores else 0
        avg_success_prob = sum(success_probabilities) / len(success_probabilities) if success_probabilities else 0
        
        return (avg_vulnerability + avg_success_prob) / 2

    def _generate_threat_assessment(self, vulnerabilities: List[AlgorithmVulnerability], 
                                  timeline_estimates: List[TimelineEstimate]) -> Dict[str, Any]:
        """Generate threat assessment."""
        high_risk_algorithms = [v.algorithm_name for v in vulnerabilities if v.vulnerability_score > 0.7]
        near_term_threats = [t for t in timeline_estimates 
                           if t.optimistic_estimate.year <= datetime.now().year + 10]
        
        return {
            "high_risk_algorithms": high_risk_algorithms,
            "near_term_threats": len(near_term_threats),
            "earliest_threat": min([t.optimistic_estimate for t in timeline_estimates], 
                                 default=datetime.now()),
            "latest_safe_estimate": max([t.conservative_estimate for t in timeline_estimates], 
                                      default=datetime.now()),
            "critical_algorithms": [v.algorithm_name for v in vulnerabilities if v.vulnerability_score > 0.9]
        }

    def _generate_recommendations(self, vulnerabilities: List[AlgorithmVulnerability], 
                                attack_results: List[AttackResult]) -> List[str]:
        """Generate security recommendations."""
        recommendations = []
        
        # Check for highly vulnerable algorithms
        critical_vulns = [v for v in vulnerabilities if v.vulnerability_score > 0.8]
        if critical_vulns:
            recommendations.append(
                f"Immediately begin migration from quantum-vulnerable algorithms: "
                f"{', '.join(set(v.algorithm_name for v in critical_vulns))}"
            )
        
        # Check for successful attacks
        successful_attacks = [r for r in attack_results if r.attack_successful]
        if successful_attacks:
            recommendations.append(
                "Deploy post-quantum cryptography for algorithms that can be broken today"
            )
        
        # General recommendations
        recommendations.extend([
            "Implement crypto-agility to enable rapid algorithm updates",
            "Monitor quantum computing developments and threat intelligence",
            "Establish quantum-safe cryptographic policies and procedures",
            "Train security teams on post-quantum cryptography",
            "Conduct regular quantum threat assessments"
        ])
        
        return recommendations

    def _generate_attack_recommendations(self, attack: QuantumAttack, successful: bool) -> List[str]:
        """Generate recommendations for a specific attack."""
        recommendations = []
        
        if successful:
            recommendations.extend([
                f"Migrate from {attack.target_algorithm} immediately",
                "Use post-quantum alternative algorithms",
                "Implement hybrid classical-quantum approaches during transition"
            ])
        else:
            recommendations.extend([
                f"Plan migration timeline for {attack.target_algorithm}",
                "Monitor quantum hardware development",
                "Prepare quantum-safe alternatives"
            ])
        
        return recommendations

    def _identify_attack_limitations(self, attack: QuantumAttack, 
                                   capability: QuantumCapability) -> List[str]:
        """Identify limitations of the attack simulation."""
        limitations = []
        
        required_qubits = attack.quantum_resources.get("logical_qubits", 1000)
        if capability.logical_qubits < required_qubits:
            limitations.append(f"Insufficient qubits: need {required_qubits}, have {capability.logical_qubits}")
        
        if capability.gate_fidelity < 0.999:
            limitations.append("Gate fidelity too low for reliable computation")
        
        limitations.extend([
            "Assumes perfect quantum error correction",
            "Ignores classical preprocessing optimizations",
            "Does not account for hardware-specific constraints"
        ])
        
        return limitations

    def _generate_executive_summary(self, vulnerabilities: List[AlgorithmVulnerability],
                                  attack_results: List[AttackResult],
                                  timeline_estimates: List[TimelineEstimate],
                                  risk_score: float) -> str:
        """Generate executive summary of simulation results."""
        critical_vulns = len([v for v in vulnerabilities if v.vulnerability_score > 0.8])
        successful_attacks = len([r for r in attack_results if r.attack_successful])
        earliest_threat = min([t.optimistic_estimate.year for t in timeline_estimates], 
                            default=datetime.now().year + 20)
        
        return (
            f"Quantum threat assessment reveals {critical_vulns} critically vulnerable algorithms "
            f"with {successful_attacks} algorithms breakable with current/near-term quantum capabilities. "
            f"The earliest estimated threat emerges in {earliest_threat}. "
            f"Overall risk score: {risk_score:.2f}/1.0. "
            f"Immediate migration planning recommended for RSA and ECDSA deployments."
        )
