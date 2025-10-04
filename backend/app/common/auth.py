from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import warnings
from dotenv import load_dotenv

from .models import User, TokenData
from .database import get_database

# Suppress bcrypt warnings and specific version-related warnings
warnings.filterwarnings("ignore", message=".*bcrypt.*")
warnings.filterwarnings("ignore", category=UserWarning, module="passlib")

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# Initialize CryptContext with better error handling
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
except Exception as e:
    # Fallback to basic bcrypt if there are version issues
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    # Bcrypt has a 72-byte limit for passwords
    if len(plain_password.encode('utf-8')) > 72:
        # For very long passwords, we truncate to 72 bytes
        plain_password = plain_password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except (ValueError, AttributeError, Exception) as e:
        if "password cannot be longer than 72 bytes" in str(e):
            # Handle edge case where truncation didn't work
            return False
        # Log the error but don't crash the authentication
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password):
    # Bcrypt has a 72-byte limit for passwords
    if len(password.encode('utf-8')) > 72:
        # For very long passwords, we truncate to 72 bytes
        password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    try:
        return pwd_context.hash(password)
    except Exception as e:
        print(f"Password hashing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password hashing failed"
        )

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_token(token: str):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Optimized JWT decode with better error handling
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    try:
        # Use motor directly for faster query with minimal fields
        db = await get_database()
        user = await db.users.find_one(
            {"email": email},
            {"_id": 1, "email": 1, "name": 1, "role": 1, "is_active": 1, "phone": 1, "profile_image": 1}
        )
        if user is None:
            raise credentials_exception
        return User(**user)
    except Exception as e:
        print(f"Database error in verify_token: {e}")
        raise credentials_exception

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return await verify_token(credentials.credentials)

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user