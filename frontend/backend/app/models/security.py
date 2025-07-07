"""
Security analysis models and database schemas
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import enum

from ..core.config import settings

# Separate database for security analysis
security_engine = create_engine(
    settings.DATABASE_URL.replace("scorpius", "scorpius_security"),
    echo=settings.DATABASE_ECHO
)
SecurityBase = declarative_base()
SecuritySessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=security_engine)

class ScanStatus(enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class SeverityLevel(enum.Enum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class SecurityScan(SecurityBase):
    __tablename__ = "security_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)

    # Scan details
    tool = Column(String, nullable=False)  # slither, manticore, mythril
    target_type = Column(String, nullable=False)  # contract, address, file
    target = Column(Text, nullable=False)  # contract code, file path, or address

    # Status and progress
    status = Column(Enum(ScanStatus), default=ScanStatus.PENDING)
    progress = Column(Float, default=0.0)

    # Results
    vulnerabilities_found = Column(Integer, default=0)
    warnings_found = Column(Integer, default=0)
    info_found = Column(Integer, default=0)

    # Execution details
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    execution_time = Column(Float, nullable=True)  # seconds

    # Configuration
    scan_config = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    vulnerabilities = relationship("Vulnerability", back_populates="scan")
    logs = relationship("ScanLog", back_populates="scan")

class Vulnerability(SecurityBase):
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("security_scans.id"), nullable=False)

    # Vulnerability details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(Enum(SeverityLevel), nullable=False)
    category = Column(String, nullable=False)  # reentrancy, overflow, etc.

    # Location information
    file_path = Column(String, nullable=True)
    line_number = Column(Integer, nullable=True)
    column_number = Column(Integer, nullable=True)
    function_name = Column(String, nullable=True)

    # Technical details
    gas_estimate = Column(Integer, nullable=True)
    confidence = Column(String, nullable=True)  # high, medium, low

    # Fix suggestions
    recommendation = Column(Text, nullable=True)
    fix_code = Column(Text, nullable=True)

    # Additional data
    metadata = Column(JSON, nullable=True)

    # Status
    is_false_positive = Column(Boolean, default=False)
    is_acknowledged = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    scan = relationship("SecurityScan", back_populates="vulnerabilities")

class ScanLog(SecurityBase):
    __tablename__ = "scan_logs"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("security_scans.id"), nullable=False)

    # Log details
    level = Column(String, nullable=False)  # debug, info, warning, error
    message = Column(Text, nullable=False)
    component = Column(String, nullable=True)  # slither-core, manticore-engine, etc.

    # Additional context
    metadata = Column(JSON, nullable=True)

    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    scan = relationship("SecurityScan", back_populates="logs")

# Settings database
settings_engine = create_engine(
    settings.DATABASE_URL.replace("scorpius", "scorpius_settings"),
    echo=settings.DATABASE_ECHO
)
SettingsBase = declarative_base()
SettingsSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=settings_engine)

class SystemSetting(SettingsBase):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)

    # Setting details
    category = Column(String, nullable=False, index=True)  # rpc, analysis, notification
    key = Column(String, nullable=False, index=True)
    value = Column(Text, nullable=False)
    value_type = Column(String, nullable=False)  # string, number, boolean, json

    # Metadata
    description = Column(Text, nullable=True)
    is_encrypted = Column(Boolean, default=False)
    is_global = Column(Boolean, default=False)  # applies to all modules

    # Validation
    validation_rules = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ModuleConfiguration(SettingsBase):
    __tablename__ = "module_configurations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)

    # Module details
    module_name = Column(String, nullable=False, index=True)  # slither, manticore, mythril
    version = Column(String, nullable=True)

    # Configuration
    config_data = Column(JSON, nullable=False)
    env_variables = Column(JSON, nullable=True)  # Environment variables to set

    # Status
    is_enabled = Column(Boolean, default=True)
    is_configured = Column(Boolean, default=False)
    last_tested = Column(DateTime(timezone=True), nullable=True)
    test_result = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Monitoring database
monitoring_engine = create_engine(
    settings.DATABASE_URL.replace("scorpius", "scorpius_monitoring"),
    echo=settings.DATABASE_ECHO
)
MonitoringBase = declarative_base()
MonitoringSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=monitoring_engine)

class SystemMetric(MonitoringBase):
    __tablename__ = "system_metrics"

    id = Column(Integer, primary_key=True, index=True)

    # Metric details
    metric_name = Column(String, nullable=False, index=True)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String, nullable=True)

    # Context
    instance_id = Column(String, nullable=True)
    service_name = Column(String, nullable=True)
    tags = Column(JSON, nullable=True)

    # Timestamp
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)

class SecurityAlert(MonitoringBase):
    __tablename__ = "security_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)

    # Alert details
    alert_type = Column(String, nullable=False)
    severity = Column(Enum(SeverityLevel), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)

    # Source information
    source_tool = Column(String, nullable=True)
    source_scan_id = Column(Integer, nullable=True)

    # Status
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(Integer, nullable=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)

    # Additional data
    metadata = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Create all tables
def create_security_tables():
    SecurityBase.metadata.create_all(bind=security_engine)

def create_settings_tables():
    SettingsBase.metadata.create_all(bind=settings_engine)

def create_monitoring_tables():
    MonitoringBase.metadata.create_all(bind=monitoring_engine)

# Database dependency functions
def get_security_db():
    db = SecuritySessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_settings_db():
    db = SettingsSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_monitoring_db():
    db = MonitoringSessionLocal()
    try:
        yield db
    finally:
        db.close()
