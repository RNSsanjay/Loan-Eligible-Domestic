#!/usr/bin/env python3
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from app.common.models import UserRole

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

async def create_or_update_admin():
    # Database connection
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://ihub:ihub@harlee.6sokd.mongodb.net/")
    DB_NAME = os.getenv("DB_NAME", "Daily")
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    try:
        # Check if admin with email exists
        existing_admin = await db.users.find_one({"email": "admin@gmail.com"})
        
        if existing_admin:
            print(f"Found existing admin: {existing_admin['name']}")
            
            # Update admin with correct data
            update_data = {
                "name": "System Administrator",
                "phone": "1234567890",
                "password_hash": get_password_hash("RNS@123"),
                "role": UserRole.ADMIN,
                "first_login": False,
                "is_active": True
            }
            
            result = await db.users.update_one(
                {"email": "admin@gmail.com"},
                {"$set": update_data}
            )
            print(f"Admin user updated successfully. Modified count: {result.modified_count}")
            
            # Verify the password works
            updated_admin = await db.users.find_one({"email": "admin@gmail.com"})
            is_valid = verify_password("RNS@123", updated_admin['password_hash'])
            print(f"Password verification test: {'PASSED' if is_valid else 'FAILED'}")
            
        else:
            # Create new admin user
            admin_data = {
                "email": "admin@gmail.com",
                "name": "System Administrator",
                "phone": "1234567890",
                "password_hash": get_password_hash("RNS@123"),
                "role": UserRole.ADMIN,
                "first_login": False,
                "is_active": True
            }
            
            result = await db.users.insert_one(admin_data)
            print(f"Admin user created successfully with ID: {result.inserted_id}")
            
            # Verify the password works
            is_valid = verify_password("RNS@123", admin_data['password_hash'])
            print(f"Password verification test: {'PASSED' if is_valid else 'FAILED'}")
        
    except Exception as e:
        print(f"Error creating/updating admin: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_or_update_admin())