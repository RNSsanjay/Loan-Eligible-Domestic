from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from datetime import timedelta
from typing import Optional

from .models import User, UserCreate, Token, UserRole
from .auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from .database import get_database

router = APIRouter()
security = HTTPBasic()

@router.post("/login", response_model=Token)
async def login(credentials: HTTPBasicCredentials = Depends(security)):
    db = await get_database()
    
    user = await db.users.find_one({"email": credentials.username})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_obj = User(**user)
    
    # Check if first login (no password set)
    if user_obj.first_login and not user_obj.password_hash:
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail="First login: password setup required",
            headers={"X-First-Login": "true", "X-User-Email": user_obj.email}
        )
    
    if not verify_password(credentials.password, user_obj.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user_obj.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_obj.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/set-password")
async def set_password(email: str, password: str):
    db = await get_database()
    
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_obj = User(**user)
    if not user_obj.first_login:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password already set"
        )
    
    hashed_password = get_password_hash(password)
    await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "password_hash": hashed_password,
                "first_login": False
            }
        }
    )
    
    return {"message": "Password set successfully"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/check-first-login")
async def check_first_login(email: str):
    db = await get_database()
    
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_obj = User(**user)
    return {
        "first_login": user_obj.first_login,
        "role": user_obj.role
    }