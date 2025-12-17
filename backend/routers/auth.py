from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Simple authentication endpoint"""
    # In production, implement proper authentication with password hashing
    if credentials.username == "admin" and credentials.password == "admin":
        return {
            "token": "dummy-jwt-token",
            "user": {
                "id": "1",
                "username": "admin",
                "name": "Administrator",
                "role": "admin"
            }
        }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/logout")
async def logout():
    """Logout endpoint"""
    return {"message": "Logged out successfully"}
