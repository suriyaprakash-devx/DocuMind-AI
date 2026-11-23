from typing import Optional
from pydantic import BaseModel

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    organization_name: Optional[str] = "Acme Corp"
    role: Optional[str] = "standard"  # admin, manager, reviewer, standard

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    role: str
    organization_id: str
    organization_name: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    organization_id: str
    organization_name: str
    is_active: bool

    class Config:
        from_attributes = True
