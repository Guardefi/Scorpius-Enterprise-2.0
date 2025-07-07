"""
Security API endpoints for authentication and authorization.
"""

from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from ..enterprise.security_manager import EnterpriseSecurityManager, User
from ..enterprise.audit_logger import SecurityEventLogger
from ..utils.config import EnterpriseConfig


class LoginRequest(BaseModel):
    """Login request model."""
    username: str
    password: str
    mfa_code: Optional[str] = None


class LoginResponse(BaseModel):
    """Login response model."""
    access_token: str
    token_type: str
    expires_in: int
    user_info: Dict[str, Any]


class PermissionRequest(BaseModel):
    """Permission validation request."""
    user_id: str
    resource: str
    operation: str


class SecurityAPI:
    """
    Security-focused API endpoints for authentication and authorization.
    
    Features:
    - User authentication with MFA
    - JWT token management
    - Permission validation
    - Session management
    - Security audit logging
    """
    
    def __init__(self, config: EnterpriseConfig):
        self.config = config
        self.router = APIRouter(prefix="/api/v1/security", tags=["security"])
        self.security_manager = EnterpriseSecurityManager(config)
        self.audit_logger = SecurityEventLogger(config.audit_config.__dict__)
        
        self._setup_routes()
    
    def _setup_routes(self):
        """Setup security API routes."""
        
        @self.router.post("/login", response_model=LoginResponse)
        async def login(request: LoginRequest):
            """Authenticate user and return access token."""
            try:
                # Validate credentials
                user = await self._authenticate_user(request.username, request.password)
                if not user:
                    await self.audit_logger.log_security_event({
                        'event_type': 'LOGIN_FAILED',
                        'username': request.username,
                        'reason': 'INVALID_CREDENTIALS',
                        'timestamp': datetime.utcnow(),
                        'status': 'FAILURE'
                    })
                    raise HTTPException(status_code=401, detail="Invalid credentials")
                
                # Validate MFA if required
                if self.config.rbac_config.multi_factor_auth and not request.mfa_code:
                    raise HTTPException(status_code=401, detail="MFA code required")
                
                if request.mfa_code and not await self._validate_mfa(user, request.mfa_code):
                    await self.audit_logger.log_security_event({
                        'event_type': 'MFA_VALIDATION_FAILED',
                        'user_id': user.id,
                        'username': request.username,
                        'timestamp': datetime.utcnow(),
                        'status': 'FAILURE'
                    })
                    raise HTTPException(status_code=401, detail="Invalid MFA code")
                
                # Generate access token
                access_token = await self._generate_access_token(user)
                
                # Create session
                session_id = await self._create_session(user)
                
                # Log successful login
                await self.audit_logger.log_security_event({
                    'event_type': 'LOGIN_SUCCESS',
                    'user_id': user.id,
                    'username': request.username,
                    'session_id': session_id,
                    'timestamp': datetime.utcnow(),
                    'status': 'SUCCESS'
                })
                
                return LoginResponse(
                    access_token=access_token,
                    token_type="Bearer",
                    expires_in=3600,
                    user_info={
                        "user_id": user.id,
                        "username": user.username,
                        "roles": user.roles,
                        "permissions": user.permissions
                    }
                )
                
            except HTTPException:
                raise
            except Exception as e:
                await self.audit_logger.log_security_event({
                    'event_type': 'LOGIN_ERROR',
                    'username': request.username,
                    'error': str(e),
                    'timestamp': datetime.utcnow(),
                    'status': 'ERROR'
                })
                raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
        
        @self.router.post("/logout")
        async def logout(session_id: str = Depends(self._get_session_id)):
            """Logout user and invalidate session."""
            try:
                # Invalidate session
                await self._invalidate_session(session_id)
                
                # Log logout
                await self.audit_logger.log_security_event({
                    'event_type': 'LOGOUT_SUCCESS',
                    'session_id': session_id,
                    'timestamp': datetime.utcnow(),
                    'status': 'SUCCESS'
                })
                
                return {"status": "success", "message": "Logged out successfully"}
                
            except Exception as e:
                await self.audit_logger.log_security_event({
                    'event_type': 'LOGOUT_ERROR',
                    'session_id': session_id,
                    'error': str(e),
                    'timestamp': datetime.utcnow(),
                    'status': 'ERROR'
                })
                raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")
        
        @self.router.post("/validate-permission")
        async def validate_permission(
            request: PermissionRequest,
            session_id: str = Depends(self._get_session_id)
        ):
            """Validate user permission for specific operation."""
            try:
                # Validate session
                session = await self._get_session(session_id)
                if not session or session['user_id'] != request.user_id:
                    raise HTTPException(status_code=401, detail="Invalid session")
                
                # Check permission
                has_permission = await self._check_permission(
                    request.user_id, 
                    request.resource, 
                    request.operation
                )
                
                # Log permission check
                await self.audit_logger.log_security_event({
                    'event_type': 'PERMISSION_CHECK',
                    'user_id': request.user_id,
                    'resource': request.resource,
                    'operation': request.operation,
                    'result': has_permission,
                    'timestamp': datetime.utcnow(),
                    'status': 'SUCCESS'
                })
                
                return {
                    "has_permission": has_permission,
                    "user_id": request.user_id,
                    "resource": request.resource,
                    "operation": request.operation
                }
                
            except HTTPException:
                raise
            except Exception as e:
                await self.audit_logger.log_security_event({
                    'event_type': 'PERMISSION_CHECK_ERROR',
                    'user_id': request.user_id,
                    'error': str(e),
                    'timestamp': datetime.utcnow(),
                    'status': 'ERROR'
                })
                raise HTTPException(status_code=500, detail=f"Permission validation failed: {str(e)}")
    
    async def _authenticate_user(self, username: str, password: str) -> Optional[User]:
        """Authenticate user credentials."""
        # Mock implementation - would check against user database
        if username == "admin" and password == "enterprise_password":
            return User(
                id="user_001",
                username=username,
                roles=["ADMINISTRATOR", "SECURITY_OFFICER"],
                permissions=["READ_ALERTS", "WRITE_ALERTS", "EMERGENCY_PAUSE", "READ_METRICS"]
            )
        return None
    
    async def _validate_mfa(self, user: User, mfa_code: str) -> bool:
        """Validate MFA code."""
        # Mock implementation - would validate against MFA service
        return mfa_code == "123456"
    
    async def _generate_access_token(self, user: User) -> str:
        """Generate JWT access token."""
        # Mock implementation - would generate real JWT token
        return f"jwt_token_for_{user.id}_{datetime.utcnow().timestamp()}"
    
    async def _create_session(self, user: User) -> str:
        """Create user session."""
        # Mock implementation - would create session in database
        session_id = f"session_{user.id}_{datetime.utcnow().timestamp()}"
        return session_id
    
    async def _get_session_id(self) -> str:
        """Extract session ID from request."""
        # Mock implementation - would extract from headers/cookies
        return "mock_session_id"
    
    async def _invalidate_session(self, session_id: str):
        """Invalidate user session."""
        # Mock implementation - would remove from database
        pass
    
    async def _get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session information."""
        # Mock implementation - would query session database
        return {"user_id": "user_001", "created_at": datetime.utcnow()}
    
    async def _check_permission(self, user_id: str, resource: str, operation: str) -> bool:
        """Check user permission for resource/operation."""
        # Mock implementation - would check RBAC system
        return True
