-- Initialize multiple databases for SCORPIUS
-- Main application database
CREATE DATABASE IF NOT EXISTS scorpius;

-- Security analysis database
CREATE DATABASE IF NOT EXISTS scorpius_security;

-- Settings and configuration database  
CREATE DATABASE IF NOT EXISTS scorpius_settings;

-- Monitoring and metrics database
CREATE DATABASE IF NOT EXISTS scorpius_monitoring;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE scorpius TO scorpius;
GRANT ALL PRIVILEGES ON DATABASE scorpius_security TO scorpius;
GRANT ALL PRIVILEGES ON DATABASE scorpius_settings TO scorpius;
GRANT ALL PRIVILEGES ON DATABASE scorpius_monitoring TO scorpius;
