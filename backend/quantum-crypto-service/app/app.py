"""
SCORPIUS QUANTUM CRYPTOGRAPHY API
FastAPI application for quantum-resistant cryptographic operations.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn
import base64

# Import Quantum Crypto components
from .quantum_cryptography import (
    QuantumCryptographyEngine,
    initialize_quantum_crypto,
    QuantumAlgorithm,
    SecurityLevel,
    QuantumKey,
    QuantumSignature,
    QuantumEncryptionResult,
    LatticeBasedCrypto,
    HashBasedSignatures,
    QuantumKeyDistribution
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic models for API requests/responses
class KeyGenerationRequest(BaseModel):
    algorithm: str = Field(..., description="Quantum algorithm type")
    security_level: int = Field(default=3, description="Security level (1, 3, or 5)")
    key_purpose: str = Field(default="general", description="Purpose of the key")
    expiry_days: Optional[int] = Field(default=None, description="Key expiry in days")

class EncryptionRequest(BaseModel):
    message: str = Field(..., description="Message to encrypt (base64 encoded)")
    public_key_id: str = Field(..., description="Public key ID for encryption")
    algorithm: Optional[str] = Field(default=None, description="Specific algorithm to use")

class DecryptionRequest(BaseModel):
    encrypted_data_id: str = Field(..., description="ID of encrypted data")
    private_key_id: str = Field(..., description="Private key ID for decryption")

class SigningRequest(BaseModel):
    message: str = Field(..., description="Message to sign (base64 encoded)")
    private_key_id: str = Field(..., description="Private key ID for signing")
    algorithm: Optional[str] = Field(default=None, description="Specific algorithm to use")

class VerificationRequest(BaseModel):
    message: str = Field(..., description="Original message (base64 encoded)")
    signature_id: str = Field(..., description="Signature ID to verify")
    public_key_id: str = Field(..., description="Public key ID for verification")

class QuantumChannelRequest(BaseModel):
    peer_id: str = Field(..., description="Peer ID for quantum channel establishment")
    channel_type: str = Field(default="secure", description="Type of quantum channel")
    security_params: Dict[str, Any] = Field(default_factory=dict, description="Security parameters")

class SecurityAuditRequest(BaseModel):
    scope: str = Field(default="full", description="Audit scope (full, keys, algorithms)")
    include_recommendations: bool = Field(default=True, description="Include security recommendations")

# FastAPI app
app = FastAPI(
    title="Scorpius Quantum Cryptography API",
    description="Advanced quantum-resistant cryptographic operations and post-quantum security",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global quantum crypto engine instance
quantum_engine: Optional[QuantumCryptographyEngine] = None

@app.on_event("startup")
async def startup_event():
    """Initialize the Quantum Cryptography engine on startup."""
    global quantum_engine
    
    try:
        logger.info("Starting Quantum Cryptography API...")
        
        # Initialize quantum crypto engine
        quantum_engine = QuantumCryptographyEngine()
        success = await initialize_quantum_crypto()
        
        if not success:
            logger.error("Failed to initialize Quantum Cryptography engine")
            raise RuntimeError("Quantum Cryptography engine initialization failed")
        
        logger.info("Quantum Cryptography API started successfully")
        
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down Quantum Cryptography API...")

def get_quantum_engine() -> QuantumCryptographyEngine:
    """Get quantum crypto engine instance."""
    if quantum_engine is None:
        raise HTTPException(status_code=500, detail="Quantum crypto engine not initialized")
    return quantum_engine

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Quantum Cryptography API"
    }

# Performance statistics endpoint
@app.get("/statistics")
async def get_performance_statistics(
    engine: QuantumCryptographyEngine = Depends(get_quantum_engine)
):
    """Get quantum cryptography performance statistics."""
    try:
        stats = await engine.get_performance_stats()
        return JSONResponse(content=stats)
    except Exception as e:
        logger.error(f"Error getting performance statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Key generation endpoint
@app.post("/keys/generate")
async def generate_quantum_keypair(
    request: KeyGenerationRequest,
    background_tasks: BackgroundTasks,
    engine: QuantumCryptographyEngine = Depends(get_quantum_engine)
):
    """Generate quantum-resistant keypair."""
    try:
        # Map algorithm string to enum
        algorithm_map = {
            "lattice_based": QuantumAlgorithm.LATTICE_BASED,
            "hash_based": QuantumAlgorithm.HASH_BASED,
            "code_based": QuantumAlgorithm.CODE_BASED,
            "multivariate": QuantumAlgorithm.MULTIVARIATE,
            "isogeny_based": QuantumAlgorithm.ISOGENY_BASED,
            "symmetric": QuantumAlgorithm.SYMMETRIC
        }
        
        algorithm = algorithm_map.get(request.algorithm.lower())
        if not algorithm:
            raise HTTPException(status_code=400, detail="Invalid algorithm")
        
        # Map security level
        security_level_map = {
            1: SecurityLevel.LEVEL_1,
            3: SecurityLevel.LEVEL_3,
            5: SecurityLevel.LEVEL_5
        }
        
        security_level = security_level_map.get(request.security_level)
        if not security_level:
            raise HTTPException(status_code=400, detail="Invalid security level")
        
        # Generate keypair
        public_key_id, private_key_id = await engine.generate_keypair(
            algorithm=algorithm,
            security_level=security_level
        )
        
        return JSONResponse(content={
            "public_key_id": public_key_id,
            "private_key_id": private_key_id,
            "algorithm": request.algorithm,
            "security_level": request.security_level,
            "key_purpose": request.key_purpose,
            "generated_at": datetime.now().isoformat(),
            "expiry_days": request.expiry_days
        })
    except Exception as e:
        logger.error(f"Error generating quantum keypair: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Encryption endpoint
@app.post("/encrypt")
async def encrypt_message(
    request: EncryptionRequest,
    background_tasks: BackgroundTasks,
    engine: QuantumCryptographyEngine = Depends(get_quantum_engine)
):
    """Encrypt message using quantum-resistant algorithms."""
    try:
        # Decode base64 message
        message_bytes = base64.b64decode(request.message)
        
        # Encrypt message
        encrypted_id = await engine.encrypt_message(
            message=message_bytes,
            public_key_id=request.public_key_id
        )
        
        return JSONResponse(content={
            "encrypted_data_id": encrypted_id,
            "public_key_id": request.public_key_id,
            "algorithm": request.algorithm,
            "encrypted_at": datetime.now().isoformat(),
            "message_size": len(message_bytes)
        })
    except Exception as e:
        logger.error(f"Error encrypting message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Decryption endpoint
@app.post("/decrypt")
async def decrypt_message(
    request: DecryptionRequest,
    background_tasks: BackgroundTasks,
    engine: QuantumCryptographyEngine = Depends(get_quantum_engine)
):
    """Decrypt message using quantum-resistant algorithms."""
    try:
        # Decrypt message
        decrypted_bytes = await engine.decrypt_message(
            encrypted_data_id=request.encrypted_data_id,
            private_key_id=request.private_key_id
        )
        
        # Encode as base64 for response
        decrypted_message = base64.b64encode(decrypted_bytes).decode('utf-8')
        
        return JSONResponse(content={
            "decrypted_message": decrypted_message,
            "encrypted_data_id": request.encrypted_data_id,
            "private_key_id": request.private_key_id,
            "decrypted_at": datetime.now().isoformat(),
            "message_size": len(decrypted_bytes)
        })
    except Exception as e:
        logger.error(f"Error decrypting message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Signing endpoint
@app.post("/sign")
async def sign_message(
    request: SigningRequest,
    background_tasks: BackgroundTasks,
    engine: QuantumCryptographyEngine = Depends(get_quantum_engine)
):
    """Sign message using quantum-resistant digital signatures."""
    try:
        # Decode base64 message
        message_bytes = base64.b64decode(request.message)
        
        # Sign message
        signature_id = await engine.sign_message(
            message=message_bytes,
            private_key_id=request.private_key_id
        )
        
        return JSONResponse(content={
            "signature_id": signature_id,
            "private_key_id": request.private_key_id,
            "algorithm": request.algorithm,
            "signed_at": datetime.now().isoformat(),
            "message_size": len(message_bytes)
        })
    except Exception as e:
        logger.error(f"Error signing message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Verification endpoint
@app.post("/verify")
async def verify_signature(
    request: VerificationRequest,
    background_tasks: BackgroundTasks,
    engine: QuantumCryptographyEngine = Depends(get_quantum_engine)
):
    """Verify quantum-resistant digital signature."""
    try:
        # Decode base64 message
        message_bytes = base64.b64decode(request.message)
        
        # Verify signature
        is_valid = await engine.verify_signature(
            message=message_bytes,
            signature_id=request.signature_id,
            public_key_id=request.public_key_id
        )
        
        return JSONResponse(content={
            "is_valid": is_valid,
            "signature_id": request.signature_id,
            "public_key_id": request.public_key_id,
            "verified_at": datetime.now().isoformat(),
            "message_size": len(message_bytes)
        })
    except Exception as e:
        logger.error(f"Error verifying signature: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Quantum channel establishment endpoint
@app.post("/quantum-channel/establish")
async def establish_quantum_channel(
    request: QuantumChannelRequest,
    background_tasks: BackgroundTasks,
    engine: QuantumCryptographyEngine = Depends(get_quantum_engine)
):
    """Establish quantum-secure communication channel."""
    try:
        # Establish quantum channel
        channel_info = await engine.establish_quantum_secure_channel(
            peer_id=request.peer_id
        )
        
        return JSONResponse(content={
            "channel_id": channel_info.get("channel_id"),
            "peer_id": request.peer_id,
            "channel_type": request.channel_type,
            "security_params": channel_info.get("security_params", {}),
            "established_at": datetime.now().isoformat(),
            "channel_status": "active"
        })
    except Exception as e:
        logger.error(f"Error establishing quantum channel: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Security audit endpoint
@app.post("/security/audit")
async def quantum_security_audit(
    request: SecurityAuditRequest,
    background_tasks: BackgroundTasks,
    engine: QuantumCryptographyEngine = Depends(get_quantum_engine)
):
    """Perform quantum security audit."""
    try:
        # Perform security audit
        audit_result = await engine.quantum_security_audit()
        
        return JSONResponse(content={
            "audit_scope": request.scope,
            "audit_timestamp": datetime.now().isoformat(),
            "security_status": audit_result.get("security_status", "unknown"),
            "vulnerabilities": audit_result.get("vulnerabilities", []),
            "recommendations": audit_result.get("recommendations", []) if request.include_recommendations else [],
            "compliance_status": audit_result.get("compliance_status", {}),
            "quantum_readiness": audit_result.get("quantum_readiness", 0.0)
        })
    except Exception as e:
        logger.error(f"Error performing security audit: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Key management endpoints
@app.get("/keys")
async def list_keys(
    algorithm: Optional[str] = Query(None, description="Filter by algorithm"),
    security_level: Optional[int] = Query(None, description="Filter by security level"),
    key_type: Optional[str] = Query(None, description="Filter by key type (public/private)"),
    engine: QuantumCryptographyEngine = Depends(get_quantum_engine)
):
    """List quantum cryptographic keys."""
    try:
        keys = []
        
        # Get all keys from engine
        for key_id, key_info in engine.keys.items():
            key_data = {
                "key_id": key_id,
                "algorithm": key_info.algorithm.value,
                "security_level": key_info.security_level.value,
                "key_type": "private" if key_info.private_key else "public",
                "created_at": key_info.creation_time.isoformat(),
                "usage_count": key_info.usage_count,
                "max_usage": key_info.max_usage,
                "expiry_time": key_info.expiry_time.isoformat() if key_info.expiry_time else None
            }
            
            # Apply filters
            if algorithm and key_info.algorithm.value != algorithm:
                continue
            if security_level and key_info.security_level.value != security_level:
                continue
            if key_type and ((key_type == "private" and not key_info.private_key) or 
                           (key_type == "public" and key_info.private_key)):
                continue
            
            keys.append(key_data)
        
        return JSONResponse(content={
            "total_keys": len(keys),
            "keys": keys,
            "filters_applied": {
                "algorithm": algorithm,
                "security_level": security_level,
                "key_type": key_type
            }
        })
    except Exception as e:
        logger.error(f"Error listing keys: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/keys/{key_id}")
async def get_key_info(
    key_id: str,
    engine: QuantumCryptographyEngine = Depends(get_quantum_engine)
):
    """Get detailed information about a specific key."""
    try:
        if key_id not in engine.keys:
            raise HTTPException(status_code=404, detail="Key not found")
        
        key_info = engine.keys[key_id]
        
        return JSONResponse(content={
            "key_id": key_id,
            "algorithm": key_info.algorithm.value,
            "security_level": key_info.security_level.value,
            "key_type": "private" if key_info.private_key else "public",
            "created_at": key_info.creation_time.isoformat(),
            "usage_count": key_info.usage_count,
            "max_usage": key_info.max_usage,
            "expiry_time": key_info.expiry_time.isoformat() if key_info.expiry_time else None,
            "parameters": key_info.parameters,
            "key_size": len(key_info.public_key)
        })
    except Exception as e:
        logger.error(f"Error getting key info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/keys/{key_id}")
async def delete_key(
    key_id: str,
    engine: QuantumCryptographyEngine = Depends(get_quantum_engine)
):
    """Delete a quantum cryptographic key."""
    try:
        if key_id not in engine.keys:
            raise HTTPException(status_code=404, detail="Key not found")
        
        # Remove key from engine
        del engine.keys[key_id]
        
        return JSONResponse(content={
            "message": f"Key {key_id} deleted successfully",
            "key_id": key_id,
            "deleted_at": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error deleting key: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Algorithm capabilities endpoint
@app.get("/algorithms")
async def get_algorithm_capabilities():
    """Get information about supported quantum-resistant algorithms."""
    try:
        algorithms = {
            "lattice_based": {
                "name": "Lattice-Based Cryptography",
                "description": "Based on problems in lattices, resistant to quantum attacks",
                "security_levels": [1, 3, 5],
                "operations": ["encrypt", "decrypt", "sign", "verify"],
                "key_sizes": {"level_1": 1024, "level_3": 1536, "level_5": 2048}
            },
            "hash_based": {
                "name": "Hash-Based Signatures",
                "description": "Based on hash functions, provides quantum-resistant signatures",
                "security_levels": [1, 3, 5],
                "operations": ["sign", "verify"],
                "key_sizes": {"level_1": 512, "level_3": 768, "level_5": 1024}
            },
            "code_based": {
                "name": "Code-Based Cryptography",
                "description": "Based on error-correcting codes",
                "security_levels": [1, 3, 5],
                "operations": ["encrypt", "decrypt"],
                "key_sizes": {"level_1": 2048, "level_3": 3072, "level_5": 4096}
            },
            "multivariate": {
                "name": "Multivariate Cryptography",
                "description": "Based on solving multivariate polynomial equations",
                "security_levels": [1, 3, 5],
                "operations": ["sign", "verify"],
                "key_sizes": {"level_1": 1024, "level_3": 1536, "level_5": 2048}
            },
            "isogeny_based": {
                "name": "Isogeny-Based Cryptography",
                "description": "Based on elliptic curve isogenies",
                "security_levels": [1, 3, 5],
                "operations": ["encrypt", "decrypt", "key_exchange"],
                "key_sizes": {"level_1": 512, "level_3": 768, "level_5": 1024}
            },
            "symmetric": {
                "name": "Symmetric Cryptography",
                "description": "Quantum-resistant symmetric encryption",
                "security_levels": [1, 3, 5],
                "operations": ["encrypt", "decrypt", "mac"],
                "key_sizes": {"level_1": 128, "level_3": 192, "level_5": 256}
            }
        }
        
        return JSONResponse(content={
            "supported_algorithms": algorithms,
            "default_security_level": 3,
            "quantum_threat_level": "high",
            "last_updated": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting algorithm capabilities: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8010,
        reload=True,
        log_level="info"
    ) 