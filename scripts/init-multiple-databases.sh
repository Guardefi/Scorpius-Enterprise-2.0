#!/bin/bash
set -e

# Function to create a database if it doesn't exist
function create_db_if_not_exists() {
    local database=$1
    echo "Creating database '$database' if it doesn't exist..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        SELECT 'CREATE DATABASE $database'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$database')\gexec
EOSQL
}

# Create databases for different services
create_db_if_not_exists "auth_proxy"
create_db_if_not_exists "audit_trail"
create_db_if_not_exists "scanner_ai"
create_db_if_not_exists "time_machine"
create_db_if_not_exists "reporting"
create_db_if_not_exists "settings"
create_db_if_not_exists "mempool"
create_db_if_not_exists "bytecode"
create_db_if_not_exists "bridge"
create_db_if_not_exists "mev_bot"
create_db_if_not_exists "mev_protection"
create_db_if_not_exists "honeypot"
create_db_if_not_exists "wallet_guard"
create_db_if_not_exists "quantum"
create_db_if_not_exists "quantum_crypto"
create_db_if_not_exists "simulation"
create_db_if_not_exists "ai_forensics"
create_db_if_not_exists "exploit_testing"
create_db_if_not_exists "integration_hub"

echo "All databases created successfully!"
