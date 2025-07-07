"""
Analysis Repository for Honeypot Detection Service
"""
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from ..mongodb_client import MongoDBClient

logger = logging.getLogger(__name__)


class AnalysisRepository:
    """Repository for managing honeypot analysis data"""
    
    def __init__(self, mongodb_client: Optional[MongoDBClient] = None):
        self.mongodb_client = mongodb_client
        self.collection_name = "analyses"
        
    async def save_analysis(self, analysis_data: Dict[str, Any]) -> str:
        """Save analysis to database"""
        try:
            # Add metadata
            analysis_id = str(uuid.uuid4())
            analysis_data.update({
                "id": analysis_id,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            
            if self.mongodb_client:
                collection = await self.mongodb_client.get_collection(self.collection_name)
                await collection.insert_one(analysis_data)
                
            logger.info(f"Analysis saved with ID: {analysis_id}")
            return analysis_id
            
        except Exception as e:
            logger.error(f"Failed to save analysis: {e}")
            raise
            
    async def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Get analysis by ID"""
        try:
            if self.mongodb_client:
                collection = await self.mongodb_client.get_collection(self.collection_name)
                result = await collection.find_one({"id": analysis_id})
                return result
            return None
            
        except Exception as e:
            logger.error(f"Failed to get analysis {analysis_id}: {e}")
            return None
            
    async def get_analyses_by_address(self, address: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get analyses by contract address"""
        try:
            if self.mongodb_client:
                collection = await self.mongodb_client.get_collection(self.collection_name)
                cursor = collection.find({"address": address}).sort("created_at", -1).limit(limit)
                return await cursor.to_list(length=limit)
            return []
            
        except Exception as e:
            logger.error(f"Failed to get analyses for address {address}: {e}")
            return []
            
    async def get_recent_analyses(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent analyses"""
        try:
            if self.mongodb_client:
                collection = await self.mongodb_client.get_collection(self.collection_name)
                cursor = collection.find().sort("created_at", -1).limit(limit)
                return await cursor.to_list(length=limit)
            return []
            
        except Exception as e:
            logger.error(f"Failed to get recent analyses: {e}")
            return []
            
    async def update_analysis(self, analysis_id: str, update_data: Dict[str, Any]) -> bool:
        """Update analysis"""
        try:
            update_data["updated_at"] = datetime.utcnow()
            
            if self.mongodb_client:
                collection = await self.mongodb_client.get_collection(self.collection_name)
                result = await collection.update_one(
                    {"id": analysis_id},
                    {"$set": update_data}
                )
                return result.modified_count > 0
            return False
            
        except Exception as e:
            logger.error(f"Failed to update analysis {analysis_id}: {e}")
            return False
            
    async def delete_analysis(self, analysis_id: str) -> bool:
        """Delete analysis"""
        try:
            if self.mongodb_client:
                collection = await self.mongodb_client.get_collection(self.collection_name)
                result = await collection.delete_one({"id": analysis_id})
                return result.deleted_count > 0
            return False
            
        except Exception as e:
            logger.error(f"Failed to delete analysis {analysis_id}: {e}")
            return False
            
    async def get_analysis_stats(self) -> Dict[str, Any]:
        """Get analysis statistics"""
        try:
            if self.mongodb_client:
                collection = await self.mongodb_client.get_collection(self.collection_name)
                
                # Count total analyses
                total_count = await collection.count_documents({})
                
                # Count by result type
                honeypot_count = await collection.count_documents({"is_honeypot": True})
                safe_count = await collection.count_documents({"is_honeypot": False})
                
                return {
                    "total_analyses": total_count,
                    "honeypot_count": honeypot_count,
                    "safe_count": safe_count,
                    "timestamp": datetime.utcnow()
                }
            
            return {
                "total_analyses": 0,
                "honeypot_count": 0,
                "safe_count": 0,
                "timestamp": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Failed to get analysis stats: {e}")
            return {
                "total_analyses": 0,
                "honeypot_count": 0,
                "safe_count": 0,
                "timestamp": datetime.utcnow()
            } 