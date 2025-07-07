"""Test configuration for the Quantum Security Platform."""

import pytest
import asyncio
from pathlib import Path


@pytest.fixture
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def test_data_dir():
    """Get the test data directory."""
    return Path(__file__).parent / "data"


@pytest.fixture
def sample_python_file(test_data_dir, tmp_path):
    """Create a sample Python file with crypto code for testing."""
    test_file = tmp_path / "sample_crypto.py"
    content = '''
import hashlib
from cryptography.fernet import Fernet
from Crypto.Cipher import AES

def encrypt_data(data, key):
    """Encrypt data using AES."""
    cipher = AES.new(key, AES.MODE_EAX)
    ciphertext, tag = cipher.encrypt_and_digest(data)
    return cipher.nonce + tag + ciphertext

def hash_password(password):
    """Hash password using SHA256."""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_key():
    """Generate a Fernet key."""
    return Fernet.generate_key()
'''
    test_file.write_text(content)
    return test_file


@pytest.fixture
def sample_assets(sample_python_file):
    """Create sample assets for testing."""
    from quantum_scanner.services.cbom_engine.models import Asset, AssetType
    
    return [
        Asset(
            name="Sample Python File",
            type=AssetType.SOURCE_CODE,
            location=str(sample_python_file)
        )
    ]
