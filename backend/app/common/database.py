from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    client: AsyncIOMotorClient = None
    db = None

database = Database()

async def init_database():
    """Initialize database connection"""
    mongodb_url = os.getenv("MONGODB_URL")
    db_name = os.getenv("DB_NAME")
    
    database.client = AsyncIOMotorClient(
        mongodb_url,
        server_api=ServerApi('1'),
        maxPoolSize=10,
        minPoolSize=10,
    )
    database.db = database.client[db_name]
    
    # Test connection
    try:
        await database.client.admin.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")

async def get_database():
    """Get database instance"""
    return database.db

async def close_database():
    """Close database connection"""
    if database.client:
        database.client.close()