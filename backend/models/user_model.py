from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime


class UserSettings(BaseModel):
    currency: str = "BRL"
    timezone: str = "America/Sao_Paulo"
    notifications: Dict[str, Any] = {
        "emailNotifications": True,
        "pushNotifications": False,
        "dailyReport": True,
        "transactionAlerts": True,
        "lowCashAlert": True
    }
    preferences: Dict[str, Any] = {
        "theme": "light",
        "autoExport": False,
        "backupFrequency": "weekly",
        "decimalPlaces": 2
    }


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str
    role: str = "user"
    companyName: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "user"
    companyName: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    settings: UserSettings = Field(default_factory=UserSettings)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {datetime: str}


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    companyName: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    settings: UserSettings


class UserUpdate(BaseModel):
    name: Optional[str] = None
    companyName: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    settings: Optional[UserSettings] = None