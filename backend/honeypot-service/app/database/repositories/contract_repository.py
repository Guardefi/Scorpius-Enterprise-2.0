"""
Contract Repository for Honeypot Detection Service
"""
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from ..mongodb_client import MongoDBClient

logger = logging.getLogger(__name__)


class ContractRepository:
    """Repository for managing smart contract data"""
    
    def __init__(self, mongodb_client: Optional[MongoDBClient] = None):
        self.mongodb_client = mongodb_client
        self.collection_name = "contracts"
        
    async def save_contract(self, contract_data: Dict[str, Any]) -> str:
        """Save contract to database"""
        try:
            # Add metadata
            contract_id = str(uuid.uuid4())
            contract_data.update({
                "id": contract_id,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            
            if self.mongodb_client:
                collection = await self.mongodb_client.get_collection(self.collection_name)
                await collection.insert_one(contract_data)
                
            logger.info(f"Contract saved with ID: {contract_id}")
            return contract_id
            
        except Exception as e:
            logger.error(f"Failed to save contract: {e}")
            raise
            
    async def get_contract(self, contract_id: str) -> Optional[Dict[str, Any]]:
        """Get contract by ID"""
        try:
            if self.mongodb_client:
                collection = await self.mongodb_client.get_collection(self.collection_name)
                result = await collection.find_one({"id": contract_id})
                return result
            return None
            
        except Exception as e:
            logger.error(f"Failed to get contract {contract_id}: {e}")
            return None
            
    async def get_contract_by_address(self, address: str, chain_id: int = 1) -> Optional[Dict[str, Any]]:
        """Get contract by address"""
        try:
            if self.mongodb_client:
                collection = await self.mongodb_client.get_collection(self.collection_name)
                result = await collection.find_one({
                    "address": address.lower(),
                    "chain_id": chain_id
                })
                return result
            return None
            
        except Exception as e:
            logger.error(f"Failed to get contract by address {address}: {e}")
            return None
            
    async def get_contracts(self, limit: int = 10, offset: int = 0) -> List[Dict[str, Any]]:
        """Get contracts with pagination"""
        try:
            if self.mongodb_client:
                collection = await self.mongodb_client.get_collection(self.collection_name)
                cursor = collection.find().sort("created_at", -1).skip(offset).limit(limit)
                return await cursor.to_list(length=limit)
            return []
            
        except Exception as e:
            logger.error(f"Failed to get contracts: {e}")
            return []
            
    async def update_contract(self, contract_id: str, update_data: Dict[str, Any]) -> bool:
        """Update contract"""
        try:
            update_data["updated_at"] = datetime.utcnow()
            
            if self.mongodb_client:
                collection = await self.mongodb_client.get_collection(self.collection_name)
                result = await collection.update_one(
                    {"id": contract_id},
                    {"$set": update_data}
                )
                return result.modified_count > 0
            return False
            
        except Exception as e:
            logger.error(f"Failed to update contract {contract_id}: {e}")
            return False
            
    async def delete_contract(self, contract_id: str) -> bool:
        """Delete contract"""
        try:
            if self.mongodb_client:
                collection = await self.mongodb_client.get_collection(self.collection_name)
                result = await collection.delete_one({"id": contract_id})
                return result.deleted_count > 0
            return False
            
        except Exception as e:
            logger.error(f"Failed to delete contract {contract_id}: {e}")
            return False
            
    async def search_contracts(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search contracts by address or metadata"""
        try:
            if self.mongodb_client:
                collection = await self.mongodb_client.get_collection(self.collection_name)
                cursor = collection.find({
                    "$or": [
                        {"address": {"$regex": query, "$options": "i"}},
                        {"name": {"$regex": query, "$options": "i"}},
                        {"symbol": {"$regex": query, "$options": "i"}}
                    ]
                }).limit(limit)
                return await cursor.to_list(length=limit)
            return []
            
        except Exception as e:
            logger.error(f"Failed to search contracts: {e}")
            return []
            
    async def get_contract_stats(self) -> Dict[str, Any]:
        """Get contract statistics"""
        try:
            if self.mongodb_client:
                collection = await self.mongodb_client.get_collection(self.collection_name)
                
                # Count total contracts
                total_count = await collection.count_documents({})
                
                # Count by chain
                chain_counts = {}
                pipeline = [
                    {"$group": {"_id": "$chain_id", "count": {"$sum": 1}}}
                ]
                async for doc in collection.aggregate(pipeline):
                    chain_counts[doc["_id"]] = doc["count"]
                
                return {
                    "total_contracts": total_count,
                    "chain_distribution": chain_counts,
                    "timestamp": datetime.utcnow()
                }
            
            return {
                "total_contracts": 0,
                "chain_distribution": {},
                "timestamp": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Failed to get contract stats: {e}")
            return {
                "total_contracts": 0,
                "chain_distribution": {},
                "timestamp": datetime.utcnow()
            } 