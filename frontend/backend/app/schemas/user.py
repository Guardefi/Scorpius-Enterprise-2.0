"""
Pydantic schemas for user and subscription data
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, validator


class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class UserInDB(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    is_superuser: bool
    subscription_tier: str
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class User(UserInDB):
    pass


class UserProfile(User):
    subscription_details: Optional["SubscriptionDetails"] = None


# Token schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# Auth schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(UserCreate):
    pass


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class EmailVerifyRequest(BaseModel):
    token: str


# Subscription schemas
class SubscriptionTier(BaseModel):
    name: str
    price: int
    features: List[str]
    limits: dict


class SubscriptionDetails(BaseModel):
    id: int
    tier: str
    status: str
    current_period_start: Optional[datetime]
    current_period_end: Optional[datetime]
    cancel_at_period_end: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SubscriptionCreate(BaseModel):
    tier: str
    payment_method_id: str


class SubscriptionUpdate(BaseModel):
    tier: Optional[str] = None
    cancel_at_period_end: Optional[bool] = None


# Update forward references
UserProfile.model_rebuild()
