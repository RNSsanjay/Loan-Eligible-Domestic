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

async def create_admin():
    # Database connection
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://ihub:ihub@harlee.6sokd.mongodb.net/")
    DB_NAME = os.getenv("DB_NAME", "Daily")
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    try:
        # Check if admin already exists
        existing_admin = await db.users.find_one({"role": UserRole.ADMIN})
        if existing_admin:
            print("Admin user already exists!")
            return
        
        # Create admin user
        admin_data = {
            "email": "admin@gmail.com",
            "name": "System Administrator",
            "phone": "1234567890",
            "password_hash": get_password_hash("RNS@123"),
            "role": UserRole.ADMIN,
            "first_login": False
        }
        
        result = await db.users.insert_one(admin_data)
        print(f"Admin user created successfully with ID: {result.inserted_id}")
        
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_admin())