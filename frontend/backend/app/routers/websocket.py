"""
WebSocket router for real-time data streaming
"""
import json
import asyncio
from typing import Dict, Set, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
import redis.asyncio as redis
from datetime import datetime

from ..db.database import get_db
from ..models.user import User
from ..core.security import verify_token
from ..core.config import settings

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.user_connections: Dict[int, Set[WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket, user_id: int, channel: str = "general"):
        await websocket.accept()
        
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)
        
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(websocket)
        
    def disconnect(self, websocket: WebSocket, user_id: int, channel: str = "general"):
        if channel in self.active_connections:
            self.active_connections[channel].discard(websocket)
            if not self.active_connections[channel]:
                del self.active_connections[channel]
                
        if user_id in self.user_connections:
            self.user_connections[user_id].discard(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
    
    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.user_connections:
            message_str = json.dumps({
                **message,
                "timestamp": datetime.utcnow().isoformat()
            })
            for connection in self.user_connections[user_id].copy():
                try:
                    await connection.send_text(message_str)
                except:
                    self.user_connections[user_id].discard(connection)
    
    async def broadcast_to_channel(self, message: dict, channel: str = "general"):
        if channel in self.active_connections:
            message_str = json.dumps({
                **message,
                "timestamp": datetime.utcnow().isoformat()
            })
            for connection in self.active_connections[channel].copy():
                try:
                    await connection.send_text(message_str)
                except:
                    self.active_connections[channel].discard(connection)

manager = ConnectionManager()

async def get_current_user_ws(token: str, db: Session = Depends(get_db)) -> User:
    """Get current user from WebSocket token"""
    try:
        payload = verify_token(token, "access")
        user_id = payload.get("sub")
        if user_id is None:
            raise Exception("Invalid token")
        
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise Exception("User not found")
            
        return user
    except Exception:
        raise Exception("Authentication failed")

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    channel: str = Query(default="general"),
    db: Session = Depends(get_db)
):
    try:
        # Authenticate user
        user = await get_current_user_ws(token, db)
        
        # Connect to WebSocket
        await manager.connect(websocket, user.id, channel)
        
        # Send welcome message
        await websocket.send_text(json.dumps({
            "type": "connection",
            "payload": {
                "status": "connected",
                "user_id": user.id,
                "channel": channel
            },
            "timestamp": datetime.utcnow().isoformat()
        }))
        
        # Start background tasks for this user
        asyncio.create_task(stream_system_metrics(user.id))
        asyncio.create_task(stream_security_alerts(user.id))
        
        while True:
            try:
                # Receive message from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                await handle_websocket_message(message, user.id, websocket)
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "payload": {"message": str(e)},
                    "timestamp": datetime.utcnow().isoformat()
                }))
                
    except Exception as e:
        await websocket.close(code=4001, reason=str(e))
        return
    
    finally:
        manager.disconnect(websocket, user.id, channel)

async def handle_websocket_message(message: dict, user_id: int, websocket: WebSocket):
    """Handle incoming WebSocket messages"""
    message_type = message.get("type")
    payload = message.get("payload", {})
    
    if message_type == "start_scan":
        # Start security scan
        await start_security_scan(payload, user_id)
    elif message_type == "update_settings":
        # Update system settings
        await update_system_settings(payload, user_id)
    elif message_type == "subscribe":
        # Subscribe to specific data streams
        channel = payload.get("channel")
        await manager.connect(websocket, user_id, channel)
    elif message_type == "ping":
        # Respond to ping
        await websocket.send_text(json.dumps({
            "type": "pong",
            "payload": {"timestamp": datetime.utcnow().isoformat()},
            "timestamp": datetime.utcnow().isoformat()
        }))

async def stream_system_metrics(user_id: int):
    """Stream system metrics to user"""
    while user_id in manager.user_connections:
        try:
            # Simulate system metrics (replace with actual monitoring)
            metrics = {
                "cpu": 45.2,
                "memory": 62.8,
                "disk": 34.1,
                "network": 12.5,
                "activeScans": 3,
                "threatsDetected": 127
            }
            
            await manager.send_personal_message({
                "type": "system_metrics",
                "payload": metrics
            }, user_id)
            
            await asyncio.sleep(5)  # Update every 5 seconds
        except Exception as e:
            print(f"Error streaming metrics to user {user_id}: {e}")
            break

async def stream_security_alerts(user_id: int):
    """Stream security alerts to user"""
    while user_id in manager.user_connections:
        try:
            # Check for new security alerts (replace with actual logic)
            # This would typically read from Redis or database
            
            await asyncio.sleep(10)  # Check every 10 seconds
        except Exception as e:
            print(f"Error streaming alerts to user {user_id}: {e}")
            break

async def start_security_scan(payload: dict, user_id: int):
    """Start a security scan and stream results"""
    scan_type = payload.get("tool")  # slither, manticore, mythril
    target = payload.get("target")
    
    # Send scan started message
    await manager.send_personal_message({
        "type": "scan_started",
        "payload": {
            "id": f"scan_{datetime.utcnow().isoformat()}",
            "tool": scan_type,
            "target": target,
            "status": "running",
            "progress": 0
        }
    }, user_id)
    
    # Start async scan process
    asyncio.create_task(run_security_scan(scan_type, target, user_id))

async def run_security_scan(tool: str, target: str, user_id: int):
    """Run security scan asynchronously"""
    scan_id = f"scan_{datetime.utcnow().isoformat()}"
    
    try:
        # Simulate scan progress
        for progress in range(0, 101, 10):
            await manager.send_personal_message({
                "type": "scan_progress",
                "payload": {
                    "id": scan_id,
                    "tool": tool,
                    "progress": progress,
                    "status": "running"
                }
            }, user_id)
            await asyncio.sleep(1)
        
        # Send completion
        await manager.send_personal_message({
            "type": "scan_completed",
            "payload": {
                "id": scan_id,
                "tool": tool,
                "status": "completed",
                "results": {
                    "vulnerabilities": 3,
                    "warnings": 7,
                    "info": 12
                }
            }
        }, user_id)
        
    except Exception as e:
        await manager.send_personal_message({
            "type": "scan_failed",
            "payload": {
                "id": scan_id,
                "tool": tool,
                "status": "failed",
                "error": str(e)
            }
        }, user_id)

async def update_system_settings(payload: dict, user_id: int):
    """Update system settings"""
    try:
        # Update settings in database
        # This would update various module configurations
        
        await manager.send_personal_message({
            "type": "settings_updated",
            "payload": {
                "success": True,
                "message": "Settings updated successfully"
            }
        }, user_id)
        
    except Exception as e:
        await manager.send_personal_message({
            "type": "settings_error",
            "payload": {
                "success": False,
                "message": str(e)
            }
        }, user_id)

# Redis pub/sub for cross-process communication
async def redis_subscriber():
    """Subscribe to Redis channels for real-time updates"""
    redis_client = redis.from_url(settings.REDIS_URL)
    pubsub = redis_client.pubsub()
    
    await pubsub.subscribe("security_alerts", "system_metrics", "scan_results")
    
    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                channel = message["channel"].decode()
                
                # Broadcast to all connected clients
                await manager.broadcast_to_channel({
                    "type": channel,
                    "payload": data
                })
    except Exception as e:
        print(f"Redis subscriber error: {e}")
    finally:
        await redis_client.close()

# Start Redis subscriber on startup
@router.on_event("startup")
async def startup_event():
    asyncio.create_task(redis_subscriber())
