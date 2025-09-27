from bson import ObjectId
from typing import Any, Dict, List
from datetime import datetime

def serialize_objectid(obj: Any) -> Any:
    """Convert ObjectId and datetime objects to strings for JSON serialization"""
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        serialized = {key: serialize_objectid(value) for key, value in obj.items()}
        # Rename _id to id for frontend compatibility
        if '_id' in serialized:
            serialized['id'] = serialized['_id']
            del serialized['_id']
        return serialized
    elif isinstance(obj, list):
        return [serialize_objectid(item) for item in obj]
    return obj

def serialize_user_document(user_doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a MongoDB user document to a properly serialized dictionary"""
    if not user_doc:
        return {}
    
    serialized = serialize_objectid(user_doc)
    
    # Ensure id field is properly set from _id
    if '_id' in serialized:
        serialized['id'] = serialized['_id']
    
    return serialized

def serialize_document_list(documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Convert a list of MongoDB documents to properly serialized dictionaries"""
    return [serialize_user_document(doc) for doc in documents]