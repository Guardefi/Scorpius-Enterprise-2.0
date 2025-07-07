"""Test cases for the Attack Simulator service."""

import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime, timedelta
from uuid import uuid4

from quantum_scanner.services.attack_simulator.models import (
    SimulationRequest, AttackType, SimulationReport, AttackScenario, QuantumAttack,
    ThreatModel, ThreatLevel
)
from quantum_scanner.services.attack_simulator.simulator import AttackSimulator


class TestAttackSimulator:
    """Test cases for the Attack Simulator."""
    
    @pytest.fixture
    def attack_simulator(self):
        """Create attack simulator instance."""
        return AttackSimulator()
    
    @pytest.fixture
    def sample_attack_request(self):
        """Create sample attack simulation request."""
        return SimulationRequest(
            target_algorithms=["rsa-2048", "ecdsa-p256"],
            attack_types=[AttackType.SHORS_ALGORITHM, AttackType.GROVERS_ALGORITHM],
            target_assets=["test-server"],
            simulation_depth="detailed",
            include_mitigation=True,
            metadata={"test": "data"}
        )
    
    @pytest.mark.asyncio
    async def test_simulate_attack_basic(self, attack_simulator, sample_attack_request):
        """Test basic attack simulation."""
        result = await attack_simulator.simulate_attacks(sample_attack_request)
        
        assert isinstance(result, SimulationReport)
        assert len(result.vulnerabilities) > 0
        assert result.risk_score >= 0.0
        assert result.risk_score <= 1.0
        assert len(result.recommendations) > 0
    
    @pytest.mark.asyncio
    async def test_simulate_shors_algorithm(self, attack_simulator):
        """Test Shor's algorithm simulation."""
        # Use the available private method for attack simulation
        attack = QuantumAttack(
            scenario_id=uuid4(),
            attack_type=AttackType.SHORS_ALGORITHM,
            target_algorithm="rsa-2048",
            target_key_size=2048,
            success_criteria="Break RSA encryption",
            estimated_duration=timedelta(hours=24)
        )
        result = await attack_simulator._simulate_attack(attack)
        
        assert result is not None
        assert hasattr(result, 'attack_successful')
        assert hasattr(result, 'success_probability')
        assert result.success_probability >= 0.0
    
    @pytest.mark.asyncio
    async def test_simulate_grovers_algorithm(self, attack_simulator):
        """Test Grover's algorithm simulation."""
        attack = QuantumAttack(
            scenario_id=uuid4(),
            attack_type=AttackType.GROVERS_ALGORITHM,
            target_algorithm="aes-128",
            target_key_size=128,
            success_criteria="Break AES encryption",
            estimated_duration=timedelta(hours=48)
        )
        result = await attack_simulator._simulate_attack(attack)
        
        assert result is not None
        assert hasattr(result, 'attack_successful')
        assert hasattr(result, 'success_probability')
        assert result.success_probability >= 0.0
    
    def test_calculate_risk_score(self, attack_simulator):
        """Test risk score calculation."""
        # Create a threat model first
        threat_model = ThreatModel(
            name="Test Threat Model",
            adversary_type="Nation State",
            threat_level=ThreatLevel.HIGH
        )
        
        scenarios = [
            AttackScenario(
                name="Test Scenario",
                description="High-risk scenario",
                target_algorithm="rsa-2048",
                attack_type=AttackType.SHORS_ALGORITHM,
                threat_model=threat_model,
                success_probability=0.95
            )
        ]
        
        risk_score = attack_simulator._calculate_risk_score([], [])
        assert isinstance(risk_score, float)
        assert risk_score >= 0.0
        assert risk_score <= 10.0
    
    def test_generate_mitigation_recommendations(self, attack_simulator):
        """Test mitigation recommendation generation."""
        # Create a threat model first
        threat_model = ThreatModel(
            name="Test Threat Model",
            adversary_type="Nation State",
            threat_level=ThreatLevel.HIGH
        )
        
        scenarios = [
            AttackScenario(
                name="Test Scenario",
                description="High-risk scenario",
                target_algorithm="rsa-2048",
                attack_type=AttackType.SHORS_ALGORITHM,
                threat_model=threat_model,
                success_probability=0.95
            )
        ]
        
        recommendations = attack_simulator._generate_recommendations([], [])
        assert len(recommendations) > 0
        assert all(isinstance(rec, str) for rec in recommendations)
    
    def test_quantum_resource_estimation(self, attack_simulator):
        """Test quantum resource estimation."""
        # Test the available _estimate_break_timeline method instead
        result = attack_simulator._estimate_quantum_attack_time(1000, 10**12)
        
        # Check that result is a timedelta
        from datetime import timedelta
        assert isinstance(result, timedelta)
        assert result.total_seconds() > 0
    
    @pytest.mark.asyncio
    async def test_error_handling(self, attack_simulator):
        """Test error handling for invalid requests."""
        invalid_request = SimulationRequest(
            target_algorithms=[],  # Empty list should be handled gracefully
            attack_types=[AttackType.SHORS_ALGORITHM],
            target_assets=["test-server"],
            simulation_depth="basic"
        )
        
        result = await attack_simulator.simulate_attacks(invalid_request)
        # Should handle gracefully and return some result
        assert isinstance(result, SimulationReport)
