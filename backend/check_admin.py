#!/usr/bin/env python3
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from app.common.models import UserRole

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

async def check_admin():
    # Database connection
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://ihub:ihub@harlee.6sokd.mongodb.net/")
    DB_NAME = os.getenv("DB_NAME", "Daily")
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    try:
        # Find admin user
        admin_user = await db.users.find_one({"email": "admin@gmail.com"})
        if admin_user:
            print(f"Found admin user: {admin_user['name']}")
            print(f"Email: {admin_user['email']}")
            print(f"Role: {admin_user['role']}")
            print(f"First login: {admin_user.get('first_login', 'Not set')}")
            print(f"Is active: {admin_user.get('is_active', 'Not set')}")
            print(f"Has password hash: {'Yes' if admin_user.get('password_hash') else 'No'}")
            
            # Test password verification
            if admin_user.get('password_hash'):
                test_password = "RNS@123"
                is_valid = verify_password(test_password, admin_user['password_hash'])
                print(f"Password 'RNS@123' is valid: {is_valid}")
            
        else:
            print("No admin user found with email admin@gmail.com")
            
        # Check all users in database
        print("\nAll users in database:")
        async for user in db.users.find({}):
            print(f"- {user.get('name', 'No name')} ({user.get('email', 'No email')}) - {user.get('role', 'No role')}")
        
    except Exception as e:
        print(f"Error checking admin: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check_admin())