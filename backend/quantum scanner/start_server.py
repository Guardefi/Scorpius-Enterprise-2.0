#!/usr/bin/env python3
"""
Simple startup script for the Quantum Security Platform API server.
"""

import sys
import asyncio
from pathlib import Path

# Add src to path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

try:
    import uvicorn
    from quantum_scanner.app import app
    
    if __name__ == "__main__":
        print("🚀 Starting Quantum Security Platform API server...")
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8001,
            log_level="info"
        )
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure all dependencies are installed")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error starting server: {e}")
    sys.exit(1)
