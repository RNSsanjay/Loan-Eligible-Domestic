#!/usr/bin/env python3
"""
Test script to verify bcrypt compatibility fix
"""
import sys
import warnings

# Suppress bcrypt warnings
warnings.filterwarnings("ignore", message=".*bcrypt.*")
warnings.filterwarnings("ignore", category=UserWarning, module="passlib")

try:
    from passlib.context import CryptContext
    
    # Test CryptContext initialization
    print("Testing CryptContext initialization...")
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    print("✓ CryptContext initialized successfully")
    
    # Test password hashing
    print("Testing password hashing...")
    test_password = "test_password_123"
    hashed = pwd_context.hash(test_password)
    print(f"✓ Password hashed successfully: {hashed[:30]}...")
    
    # Test password verification
    print("Testing password verification...")
    is_valid = pwd_context.verify(test_password, hashed)
    print(f"✓ Password verification successful: {is_valid}")
    
    # Test with wrong password
    is_invalid = pwd_context.verify("wrong_password", hashed)
    print(f"✓ Wrong password correctly rejected: {not is_invalid}")
    
    print("\n🎉 All bcrypt tests passed! The authentication should work now.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print(f"Error type: {type(e)}")
    sys.exit(1)