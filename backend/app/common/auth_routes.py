from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from datetime import timedelta, datetime
from typing import Optional
from pydantic import BaseModel

from .models import User, UserCreate, Token, UserRole
from .auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from .database import get_database
from .serializers import serialize_user_document

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    profile_image_base64: Optional[str] = None

class PasswordChangeRequest(BaseModel):
    currentPassword: str
    newPassword: str

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
    
    if not user_obj.password_hash or not verify_password(credentials.password, user_obj.password_hash):
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

@router.get("/me", response_model=dict)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    # Convert the User object to a dictionary with proper serialization
    user_dict = current_user.model_dump()
    user_dict['id'] = str(current_user.id)
    return serialize_user_document(user_dict)

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

@router.post("/activate-user/{user_id}")
async def activate_user(user_id: str, action: str):
    """Activate or reject a user account via email link"""
    db = await get_database()
    
    if action not in ["accept", "reject"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action. Use 'accept' or 'reject'"
        )
    
    try:
        from bson import ObjectId
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if action == "accept":
            # Activate the user
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"is_active": True, "updated_at": datetime.utcnow()}}
            )
            return {"message": "User account activated successfully"}
        else:
            # Delete the user account
            await db.users.delete_one({"_id": ObjectId(user_id)})
            return {"message": "User account rejected and removed"}
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing user activation: {str(e)}"
        )

@router.put("/profile")
async def update_profile(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Update user profile"""
    db = await get_database()
    
    update_data = {}
    if request.name:
        update_data["name"] = request.name
    if request.phone:
        update_data["phone"] = request.phone
    if request.profile_image_base64:
        update_data["profile_image_base64"] = request.profile_image_base64
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_data["updated_at"] = datetime.utcnow()
    
    try:
        from bson import ObjectId
        await db.users.update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": update_data}
        )
        
        # Return updated user
        updated_user = await db.users.find_one({"_id": ObjectId(current_user.id)})
        return serialize_user_document(updated_user)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )

@router.put("/change-password")
async def change_password(
    request: PasswordChangeRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Change user password"""
    db = await get_database()
    
    try:
        from bson import ObjectId
        from .auth import verify_password, get_password_hash
        
        # Verify current password
        user_doc = await db.users.find_one({"_id": ObjectId(current_user.id)})
        if not user_doc or not verify_password(request.currentPassword, user_doc.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Update password
        new_password_hash = get_password_hash(request.newPassword)
        await db.users.update_one(
            {"_id": ObjectId(current_user.id)},
            {
                "$set": {
                    "password_hash": new_password_hash,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {"message": "Password updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating password: {str(e)}"
        )