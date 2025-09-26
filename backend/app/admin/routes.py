from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..common.models import (
    User, UserCreate, UserRole, UserUpdate, LoanApplication, LoanStatus
)
from ..common.auth import get_current_active_user, get_password_hash
from ..common.database import get_database

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_active_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

@router.post("/managers", response_model=dict)
async def create_manager(
    manager_data: UserCreate,
    current_user: User = Depends(require_admin)
):
    db = await get_database()
    
    # Ensure we're creating a manager
    manager_data.role = UserRole.MANAGER
    manager_data.created_by = ObjectId(current_user.id)
    
    # Check if email already exists
    existing = await db.users.find_one({"email": manager_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    user_dict = manager_data.model_dump()
    user_dict["first_login"] = True
    
    result = await db.users.insert_one(user_dict)
    
    return {
        "id": str(result.inserted_id),
        "email": manager_data.email,
        "message": "Manager created successfully. They need to set their password on first login."
    }

@router.get("/managers", response_model=List[User])
async def get_managers(
    current_user: User = Depends(require_admin)
):
    db = await get_database()
    managers = []
    
    async for user in db.users.find({
        "role": UserRole.MANAGER,
        "created_by": ObjectId(current_user.id)
    }):
        managers.append(User(**user))
    
    return managers

@router.get("/managers/{manager_id}", response_model=User)
async def get_manager(
    manager_id: str,
    current_user: User = Depends(require_admin)
):
    db = await get_database()
    
    manager = await db.users.find_one({
        "_id": ObjectId(manager_id),
        "role": UserRole.MANAGER,
        "created_by": ObjectId(current_user.id)
    })
    
    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manager not found"
        )
    
    return User(**manager)

@router.put("/managers/{manager_id}", response_model=dict)
async def update_manager(
    manager_id: str,
    manager_update: UserUpdate,
    current_user: User = Depends(require_admin)
):
    db = await get_database()
    
    # Verify the manager exists and belongs to this admin
    existing = await db.users.find_one({
        "_id": ObjectId(manager_id),
        "role": UserRole.MANAGER,
        "created_by": ObjectId(current_user.id)
    })
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manager not found"
        )
    
    update_data = {k: v for k, v in manager_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.users.update_one(
        {"_id": ObjectId(manager_id)},
        {"$set": update_data}
    )
    
    return {"message": "Manager updated successfully"}

@router.delete("/managers/{manager_id}", response_model=dict)
async def delete_manager(
    manager_id: str,
    current_user: User = Depends(require_admin)
):
    db = await get_database()
    
    # Verify the manager exists and belongs to this admin
    existing = await db.users.find_one({
        "_id": ObjectId(manager_id),
        "role": UserRole.MANAGER,
        "created_by": ObjectId(current_user.id)
    })
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manager not found"
        )
    
    await db.users.delete_one({"_id": ObjectId(manager_id)})
    
    return {"message": "Manager deleted successfully"}

@router.get("/managers/{manager_id}/operators", response_model=List[User])
async def get_manager_operators(
    manager_id: str,
    current_user: User = Depends(require_admin)
):
    db = await get_database()
    
    # Verify the manager exists and belongs to this admin
    manager = await db.users.find_one({
        "_id": ObjectId(manager_id),
        "role": UserRole.MANAGER,
        "created_by": ObjectId(current_user.id)
    })
    
    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manager not found"
        )
    
    operators = []
    async for user in db.users.find({
        "role": UserRole.OPERATOR,
        "created_by": ObjectId(manager_id)
    }):
        operators.append(User(**user))
    
    return operators

@router.get("/managers/{manager_id}/stats", response_model=dict)
async def get_manager_stats(
    manager_id: str,
    current_user: User = Depends(require_admin)
):
    db = await get_database()
    
    # Verify the manager exists and belongs to this admin
    manager = await db.users.find_one({
        "_id": ObjectId(manager_id),
        "role": UserRole.MANAGER,
        "created_by": ObjectId(current_user.id)
    })
    
    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manager not found"
        )
    
    # Get operator count for this manager
    operator_count = await db.users.count_documents({
        "role": UserRole.OPERATOR,
        "created_by": ObjectId(manager_id)
    })
    
    # Get all operator IDs for this manager
    operator_ids = []
    async for operator in db.users.find({
        "role": UserRole.OPERATOR,
        "created_by": ObjectId(manager_id)
    }):
        operator_ids.append(operator["_id"])
    
    if not operator_ids:
        return {
            "manager_name": manager["name"],
            "operators_count": 0,
            "total_applications": 0,
            "pending_applications": 0,
            "verified_applications": 0,
            "approved_applications": 0,
            "rejected_applications": 0
        }
    
    # Get application statistics
    total_apps = await db.loan_applications.count_documents({"operator_id": {"$in": operator_ids}})
    pending_apps = await db.loan_applications.count_documents({
        "operator_id": {"$in": operator_ids},
        "status": LoanStatus.PENDING
    })
    verified_apps = await db.loan_applications.count_documents({
        "operator_id": {"$in": operator_ids},
        "status": LoanStatus.VERIFIED
    })
    approved_apps = await db.loan_applications.count_documents({
        "operator_id": {"$in": operator_ids},
        "status": LoanStatus.APPROVED
    })
    rejected_apps = await db.loan_applications.count_documents({
        "operator_id": {"$in": operator_ids},
        "status": LoanStatus.REJECTED
    })
    
    return {
        "manager_name": manager["name"],
        "operators_count": operator_count,
        "total_applications": total_apps,
        "pending_applications": pending_apps,
        "verified_applications": verified_apps,
        "approved_applications": approved_apps,
        "rejected_applications": rejected_apps
    }

@router.get("/dashboard/overview", response_model=dict)
async def get_admin_dashboard(
    current_user: User = Depends(require_admin)
):
    db = await get_database()
    
    # Get manager count
    manager_count = await db.users.count_documents({
        "role": UserRole.MANAGER,
        "created_by": ObjectId(current_user.id)
    })
    
    # Get all managers for this admin
    manager_ids = []
    async for manager in db.users.find({
        "role": UserRole.MANAGER,
        "created_by": ObjectId(current_user.id)
    }):
        manager_ids.append(manager["_id"])
    
    # Get total operators under all managers
    total_operators = 0
    all_operator_ids = []
    if manager_ids:
        async for operator in db.users.find({
            "role": UserRole.OPERATOR,
            "created_by": {"$in": manager_ids}
        }):
            all_operator_ids.append(operator["_id"])
        total_operators = len(all_operator_ids)
    
    # Get application statistics across all operators
    if not all_operator_ids:
        return {
            "managers_count": manager_count,
            "total_operators": 0,
            "total_applications": 0,
            "pending_applications": 0,
            "verified_applications": 0,
            "approved_applications": 0,
            "rejected_applications": 0,
            "total_loan_amount": 0
        }
    
    total_apps = await db.loan_applications.count_documents({"operator_id": {"$in": all_operator_ids}})
    pending_apps = await db.loan_applications.count_documents({
        "operator_id": {"$in": all_operator_ids},
        "status": LoanStatus.PENDING
    })
    verified_apps = await db.loan_applications.count_documents({
        "operator_id": {"$in": all_operator_ids},
        "status": LoanStatus.VERIFIED
    })
    approved_apps = await db.loan_applications.count_documents({
        "operator_id": {"$in": all_operator_ids},
        "status": LoanStatus.APPROVED
    })
    rejected_apps = await db.loan_applications.count_documents({
        "operator_id": {"$in": all_operator_ids},
        "status": LoanStatus.REJECTED
    })
    
    # Calculate total loan amount for approved applications
    total_loan_amount = 0
    async for app in db.loan_applications.find({
        "operator_id": {"$in": all_operator_ids},
        "status": LoanStatus.APPROVED
    }):
        total_loan_amount += app.get("loan_amount", 0)
    
    return {
        "managers_count": manager_count,
        "total_operators": total_operators,
        "total_applications": total_apps,
        "pending_applications": pending_apps,
        "verified_applications": verified_apps,
        "approved_applications": approved_apps,
        "rejected_applications": rejected_apps,
        "total_loan_amount": total_loan_amount
    }

@router.post("/create-initial-admin", response_model=dict)
async def create_initial_admin(admin_data: UserCreate):
    """Create the first admin user - this endpoint should be secured in production"""
    db = await get_database()
    
    # Check if any admin exists
    existing_admin = await db.users.find_one({"role": UserRole.ADMIN})
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user already exists"
        )
    
    admin_data.role = UserRole.ADMIN
    admin_data.first_login = False  # Admin sets password during creation
    
    if not admin_data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required for admin creation"
        )
    
    user_dict = admin_data.model_dump()
    user_dict["password_hash"] = get_password_hash(admin_data.password)
    del user_dict["password"]  # Remove plain password
    
    result = await db.users.insert_one(user_dict)
    
    return {
        "id": str(result.inserted_id),
        "message": "Admin created successfully"
    }