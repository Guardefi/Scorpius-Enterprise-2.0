"""
MongoDB Client for Honeypot Detection Service
"""
import logging
import os
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure

logger = logging.getLogger(__name__)


class MongoDBClient:
    """MongoDB async client for honeypot detection service"""
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.database = None
        self.connection_string = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        self.database_name = os.getenv("MONGODB_DATABASE", "honeypot_db")
        
    async def connect(self):
        """Connect to MongoDB"""
        try:
            logger.info("Connecting to MongoDB...")
            self.client = AsyncIOMotorClient(self.connection_string)
            self.database = self.client[self.database_name]
            
            # Test connection
            await self.client.admin.command('ping')
            logger.info("MongoDB connection established successfully")
            
        except ConnectionFailure as e:
            logger.warning(f"MongoDB connection failed: {e}")
            # In development, continue without MongoDB
            self.client = None
            self.database = None
            
    async def initialize(self):
        """Initialize MongoDB connection (alias for connect)"""
        await self.connect()
        
    async def close(self):
        """Close MongoDB connection"""
        if self.client:
            logger.info("Closing MongoDB connection...")
            self.client.close()
            
    async def get_collection(self, collection_name: str):
        """Get a collection from the database"""
        if self.database:
            return self.database[collection_name]
        else:
            # Return mock collection for development
            return MockCollection()
        
    async def is_connected(self) -> bool:
        """Check if MongoDB is connected"""
        if not self.client:
            return False
        try:
            await self.client.admin.command('ping')
            return True
        except:
            return False


class MockCollection:
    """Mock collection for development without MongoDB"""
    
    async def insert_one(self, document):
        """Mock insert operation"""
        logger.debug("Mock insert_one called")
        return type('MockResult', (), {'inserted_id': 'mock_id'})()
        
    async def find_one(self, filter_dict):
        """Mock find_one operation"""
        logger.debug("Mock find_one called")
        return None
        
    async def find(self, filter_dict):
        """Mock find operation"""
        logger.debug("Mock find called")
        return []
        
    async def update_one(self, filter_dict, update_dict):
        """Mock update_one operation"""
        logger.debug("Mock update_one called")
        return type('MockResult', (), {'modified_count': 1})()
        
    async def delete_one(self, filter_dict):
        """Mock delete_one operation"""
        logger.debug("Mock delete_one called")
        return type('MockResult', (), {'deleted_count': 1})()
        
    async def count_documents(self, filter_dict):
        """Mock count_documents operation"""
        logger.debug("Mock count_documents called")
        return 0 