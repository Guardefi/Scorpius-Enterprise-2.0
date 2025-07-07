-- Initialize PostgreSQL databases for both services

-- Create Quantum Scanner database
CREATE DATABASE quantum_scanner;
CREATE USER quantum WITH PASSWORD 'quantum123';
GRANT ALL PRIVILEGES ON DATABASE quantum_scanner TO quantum;

-- Create Scorpius database
CREATE DATABASE scorpius;
CREATE USER scorpius WITH PASSWORD 'scorpius123';
GRANT ALL PRIVILEGES ON DATABASE scorpius TO scorpius;

-- Connect to quantum_scanner database and create tables
\c quantum_scanner;

-- CBOM scan results table
CREATE TABLE IF NOT EXISTS cbom_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    scan_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantum_risk_score FLOAT NOT NULL DEFAULT 0.0,
    vulnerabilities JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES cbom_scans(id),
    threat_score FLOAT NOT NULL,
    threat_types TEXT[],
    confidence FLOAT NOT NULL,
    mitigation_steps TEXT[],
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Anomaly detections table
CREATE TABLE IF NOT EXISTS anomaly_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES cbom_scans(id),
    is_anomaly BOOLEAN NOT NULL,
    anomaly_score FLOAT NOT NULL,
    anomaly_types TEXT[],
    confidence FLOAT NOT NULL,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_cbom_scans_asset_id ON cbom_scans(asset_id);
CREATE INDEX idx_cbom_scans_timestamp ON cbom_scans(scan_timestamp);
CREATE INDEX idx_ai_predictions_scan_id ON ai_predictions(scan_id);
CREATE INDEX idx_anomaly_detections_scan_id ON anomaly_detections(scan_id);
