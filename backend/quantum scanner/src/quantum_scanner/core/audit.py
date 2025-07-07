"""
Blockchain Audit Trail Service

This module provides immutable audit logging using blockchain-inspired
merkle trees and cryptographic verification for security compliance.
"""

import hashlib
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from enum import Enum
from uuid import uuid4, UUID

from .logging import get_logger
from .cache import cached

logger = get_logger(__name__)


class AuditEventType(str, Enum):
    """Types of audit events."""
    SCAN_INITIATED = "scan_initiated"
    SCAN_COMPLETED = "scan_completed"
    VULNERABILITY_DETECTED = "vulnerability_detected"
    MITIGATION_APPLIED = "mitigation_applied"
    CONFIGURATION_CHANGED = "configuration_changed"
    ACCESS_GRANTED = "access_granted"
    ACCESS_DENIED = "access_denied"
    THREAT_PREDICTED = "threat_predicted"
    ANOMALY_DETECTED = "anomaly_detected"
    COMPLIANCE_VIOLATION = "compliance_violation"


class AuditSeverity(str, Enum):
    """Audit event severity levels."""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class AuditEvent:
    """Immutable audit event record."""
    event_id: UUID = field(default_factory=uuid4)
    event_type: AuditEventType = AuditEventType.SCAN_INITIATED
    severity: AuditSeverity = AuditSeverity.INFO
    timestamp: datetime = field(default_factory=datetime.utcnow)
    actor: str = "system"
    resource: str = "unknown"
    action: str = ""
    details: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Ensure timestamp is set if not provided."""
        if not isinstance(self.timestamp, datetime):
            self.timestamp = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert audit event to dictionary."""
        return {
            "event_id": str(self.event_id),
            "event_type": self.event_type.value,
            "severity": self.severity.value,
            "timestamp": self.timestamp.isoformat(),
            "actor": self.actor,
            "resource": self.resource,
            "action": self.action,
            "details": self.details,
            "metadata": self.metadata
        }
    
    def calculate_hash(self) -> str:
        """Calculate cryptographic hash of the event."""
        event_data = self.to_dict()
        # Remove non-deterministic fields for consistent hashing
        stable_data = {k: v for k, v in event_data.items() if k != "metadata"}
        json_str = json.dumps(stable_data, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(json_str.encode()).hexdigest()


@dataclass
class AuditBlock:
    """Block in the audit chain containing multiple events."""
    block_id: UUID = field(default_factory=uuid4)
    block_number: int = 0
    timestamp: datetime = field(default_factory=datetime.utcnow)
    previous_hash: str = ""
    events: List[AuditEvent] = field(default_factory=list)
    merkle_root: str = ""
    block_hash: str = ""
    
    def __post_init__(self):
        """Calculate merkle root and block hash after initialization."""
        if self.events and not self.merkle_root:
            self.merkle_root = self._calculate_merkle_root()
        if not self.block_hash:
            self.block_hash = self._calculate_block_hash()
    
    def add_event(self, event: AuditEvent):
        """Add an event to the block."""
        self.events.append(event)
        self.merkle_root = self._calculate_merkle_root()
        self.block_hash = self._calculate_block_hash()
    
    def _calculate_merkle_root(self) -> str:
        """Calculate Merkle root of all events in the block."""
        if not self.events:
            return hashlib.sha256(b"").hexdigest()
        
        # Get hashes of all events
        hashes = [event.calculate_hash() for event in self.events]
        
        # Build Merkle tree
        while len(hashes) > 1:
            new_hashes = []
            for i in range(0, len(hashes), 2):
                if i + 1 < len(hashes):
                    combined = hashes[i] + hashes[i + 1]
                else:
                    combined = hashes[i] + hashes[i]  # Duplicate if odd number
                new_hashes.append(hashlib.sha256(combined.encode()).hexdigest())
            hashes = new_hashes
        
        return hashes[0] if hashes else hashlib.sha256(b"").hexdigest()
    
    def _calculate_block_hash(self) -> str:
        """Calculate hash of the entire block."""
        block_data = {
            "block_id": str(self.block_id),
            "block_number": self.block_number,
            "timestamp": self.timestamp.isoformat(),
            "previous_hash": self.previous_hash,
            "merkle_root": self.merkle_root,
            "event_count": len(self.events)
        }
        json_str = json.dumps(block_data, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(json_str.encode()).hexdigest()
    
    def verify_integrity(self) -> bool:
        """Verify the integrity of the block."""
        # Recalculate merkle root
        expected_merkle_root = self._calculate_merkle_root()
        if expected_merkle_root != self.merkle_root:
            return False
        
        # Recalculate block hash
        expected_block_hash = self._calculate_block_hash()
        return expected_block_hash == self.block_hash
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert block to dictionary."""
        return {
            "block_id": str(self.block_id),
            "block_number": self.block_number,
            "timestamp": self.timestamp.isoformat(),
            "previous_hash": self.previous_hash,
            "merkle_root": self.merkle_root,
            "block_hash": self.block_hash,
            "event_count": len(self.events),
            "events": [event.to_dict() for event in self.events]
        }


class BlockchainAuditTrail:
    """Blockchain-inspired audit trail for immutable logging."""
    
    def __init__(self, max_events_per_block: int = 100):
        """Initialize the audit trail."""
        self.max_events_per_block = max_events_per_block
        self.blocks: List[AuditBlock] = []
        self.current_block: Optional[AuditBlock] = None
        self.total_events = 0
        
        # Initialize genesis block
        self._create_genesis_block()
    
    def _create_genesis_block(self):
        """Create the genesis block."""
        genesis_event = AuditEvent(
            event_type=AuditEventType.SCAN_INITIATED,
            severity=AuditSeverity.INFO,
            actor="system",
            resource="audit_trail",
            action="initialize_blockchain",
            details={"message": "Blockchain audit trail initialized"}
        )
        
        genesis_block = AuditBlock(
            block_number=0,
            previous_hash="0" * 64,  # Genesis block has no predecessor
            events=[genesis_event]
        )
        
        self.blocks.append(genesis_block)
        self.current_block = genesis_block
        self.total_events = 1
        
        logger.info("Blockchain audit trail initialized with genesis block")
    
    def add_event(self, event: AuditEvent):
        """Add an audit event to the blockchain."""
        if not self.current_block or len(self.current_block.events) >= self.max_events_per_block:
            self._create_new_block()
        
        self.current_block.add_event(event)
        self.total_events += 1
        
        logger.debug(f"Added audit event: {event.event_type.value}", 
                    event_id=str(event.event_id),
                    block_number=self.current_block.block_number)
    
    def _create_new_block(self):
        """Create a new block in the chain."""
        block_number = len(self.blocks)
        previous_hash = self.blocks[-1].block_hash if self.blocks else "0" * 64
        
        new_block = AuditBlock(
            block_number=block_number,
            previous_hash=previous_hash
        )
        
        self.blocks.append(new_block)
        self.current_block = new_block
        
        logger.info(f"Created new audit block #{block_number}")
    
    def verify_chain_integrity(self) -> bool:
        """Verify the integrity of the entire blockchain."""
        if not self.blocks:
            return True
        
        # Verify genesis block
        if self.blocks[0].previous_hash != "0" * 64:
            logger.error("Genesis block has invalid previous hash")
            return False
        
        # Verify each block
        for i, block in enumerate(self.blocks):
            # Verify block internal integrity
            if not block.verify_integrity():
                logger.error(f"Block {i} failed integrity check")
                return False
            
            # Verify chain linkage
            if i > 0:
                if block.previous_hash != self.blocks[i - 1].block_hash:
                    logger.error(f"Block {i} has invalid previous hash")
                    return False
        
        return True
    
    def get_events(self, 
                   event_type: Optional[AuditEventType] = None,
                   severity: Optional[AuditSeverity] = None,
                   actor: Optional[str] = None,
                   since: Optional[datetime] = None,
                   limit: Optional[int] = None) -> List[AuditEvent]:
        """Query audit events with filters."""
        events = []
        
        for block in self.blocks:
            for event in block.events:
                # Apply filters
                if event_type and event.event_type != event_type:
                    continue
                if severity and event.severity != severity:
                    continue
                if actor and event.actor != actor:
                    continue
                if since and event.timestamp < since:
                    continue
                
                events.append(event)
                
                # Apply limit
                if limit and len(events) >= limit:
                    return events
        
        return events
    
    def get_chain_summary(self) -> Dict[str, Any]:
        """Get summary of the blockchain audit trail."""
        if not self.blocks:
            return {}
        
        # Calculate event distribution
        event_types = {}
        severity_counts = {}
        
        for block in self.blocks:
            for event in block.events:
                event_types[event.event_type.value] = event_types.get(event.event_type.value, 0) + 1
                severity_counts[event.severity.value] = severity_counts.get(event.severity.value, 0) + 1
        
        return {
            "total_blocks": len(self.blocks),
            "total_events": self.total_events,
            "chain_start": self.blocks[0].timestamp.isoformat(),
            "chain_end": self.blocks[-1].timestamp.isoformat(),
            "event_types": event_types,
            "severity_distribution": severity_counts,
            "chain_integrity": self.verify_chain_integrity(),
            "latest_block_hash": self.blocks[-1].block_hash
        }
    
    def export_chain(self, include_events: bool = True) -> Dict[str, Any]:
        """Export the entire blockchain for backup or analysis."""
        chain_data = {
            "export_timestamp": datetime.utcnow().isoformat(),
            "total_blocks": len(self.blocks),
            "total_events": self.total_events,
            "chain_integrity": self.verify_chain_integrity(),
            "blocks": []
        }
        
        for block in self.blocks:
            block_data = {
                "block_id": str(block.block_id),
                "block_number": block.block_number,
                "timestamp": block.timestamp.isoformat(),
                "previous_hash": block.previous_hash,
                "merkle_root": block.merkle_root,
                "block_hash": block.block_hash,
                "event_count": len(block.events)
            }
            
            if include_events:
                block_data["events"] = [event.to_dict() for event in block.events]
            
            chain_data["blocks"].append(block_data)
        
        return chain_data


# Global audit trail instance
_audit_trail: Optional[BlockchainAuditTrail] = None


def get_audit_trail() -> BlockchainAuditTrail:
    """Get global audit trail instance."""
    global _audit_trail
    if _audit_trail is None:
        _audit_trail = BlockchainAuditTrail()
    return _audit_trail


def audit_event(
    event_type: AuditEventType,
    severity: AuditSeverity = AuditSeverity.INFO,
    actor: str = "system",
    resource: str = "unknown",
    action: str = "",
    details: Optional[Dict[str, Any]] = None,
    metadata: Optional[Dict[str, Any]] = None
):
    """Create and log an audit event."""
    event = AuditEvent(
        event_type=event_type,
        severity=severity,
        actor=actor,
        resource=resource,
        action=action,
        details=details or {},
        metadata=metadata or {}
    )
    
    trail = get_audit_trail()
    trail.add_event(event)
    
    return event


def audit_scan_start(scan_id: str, scan_type: str, actor: str = "system"):
    """Audit scan initiation."""
    return audit_event(
        event_type=AuditEventType.SCAN_INITIATED,
        severity=AuditSeverity.INFO,
        actor=actor,
        resource=f"scan:{scan_id}",
        action="start_scan",
        details={
            "scan_id": scan_id,
            "scan_type": scan_type
        }
    )


def audit_scan_complete(scan_id: str, results_summary: Dict[str, Any], actor: str = "system"):
    """Audit scan completion."""
    return audit_event(
        event_type=AuditEventType.SCAN_COMPLETED,
        severity=AuditSeverity.INFO,
        actor=actor,
        resource=f"scan:{scan_id}",
        action="complete_scan",
        details={
            "scan_id": scan_id,
            "results": results_summary
        }
    )


def audit_vulnerability_detected(vulnerability_info: Dict[str, Any], actor: str = "system"):
    """Audit vulnerability detection."""
    severity = AuditSeverity.CRITICAL if vulnerability_info.get("severity") == "critical" else AuditSeverity.WARNING
    
    return audit_event(
        event_type=AuditEventType.VULNERABILITY_DETECTED,
        severity=severity,
        actor=actor,
        resource=vulnerability_info.get("component", "unknown"),
        action="detect_vulnerability",
        details=vulnerability_info
    )


def audit_threat_prediction(prediction_info: Dict[str, Any], actor: str = "ai_system"):
    """Audit AI threat prediction."""
    threat_level = prediction_info.get("threat_level", "unknown")
    severity = AuditSeverity.CRITICAL if threat_level == "critical" else AuditSeverity.WARNING
    
    return audit_event(
        event_type=AuditEventType.THREAT_PREDICTED,
        severity=severity,
        actor=actor,
        resource="threat_prediction",
        action="predict_threat",
        details=prediction_info
    )


def audit_anomaly_detected(anomaly_info: Dict[str, Any], actor: str = "ai_system"):
    """Audit anomaly detection."""
    return audit_event(
        event_type=AuditEventType.ANOMALY_DETECTED,
        severity=AuditSeverity.WARNING,
        actor=actor,
        resource=anomaly_info.get("component", "unknown"),
        action="detect_anomaly",
        details=anomaly_info
    )


@cached(ttl=300, key_prefix="audit.chain_summary")  # Cache for 5 minutes
def get_audit_summary() -> Dict[str, Any]:
    """Get cached audit trail summary."""
    trail = get_audit_trail()
    return trail.get_chain_summary()


def verify_audit_integrity() -> bool:
    """Verify the integrity of the audit trail."""
    trail = get_audit_trail()
    return trail.verify_chain_integrity()
