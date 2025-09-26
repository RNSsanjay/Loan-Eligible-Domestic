from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..common.models import (
    User, UserCreate, UserRole, LoanApplication, LoanStatus, UserUpdate
)
from ..common.auth import get_current_active_user
from ..common.database import get_database

router = APIRouter()

def require_manager(current_user: User = Depends(get_current_active_user)):
    if current_user.role != UserRole.MANAGER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

@router.post("/operators", response_model=dict)
async def create_operator(
    operator_data: UserCreate,
    current_user: User = Depends(require_manager)
):
    db = await get_database()
    
    # Ensure we're creating an operator
    operator_data.role = UserRole.OPERATOR
    operator_data.created_by = ObjectId(current_user.id)
    
    # Check if email already exists
    existing = await db.users.find_one({"email": operator_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    user_dict = operator_data.model_dump()
    user_dict["first_login"] = True
    
    result = await db.users.insert_one(user_dict)
    
    return {
        "id": str(result.inserted_id),
        "email": operator_data.email,
        "message": "Operator created successfully. They need to set their password on first login."
    }

@router.get("/operators", response_model=List[User])
async def get_operators(
    current_user: User = Depends(require_manager)
):
    db = await get_database()
    operators = []
    
    async for user in db.users.find({
        "role": UserRole.OPERATOR,
        "created_by": ObjectId(current_user.id)
    }):
        operators.append(User(**user))
    
    return operators

@router.get("/operators/{operator_id}", response_model=User)
async def get_operator(
    operator_id: str,
    current_user: User = Depends(require_manager)
):
    db = await get_database()
    
    operator = await db.users.find_one({
        "_id": ObjectId(operator_id),
        "role": UserRole.OPERATOR,
        "created_by": ObjectId(current_user.id)
    })
    
    if not operator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operator not found"
        )
    
    return User(**operator)

@router.put("/operators/{operator_id}", response_model=dict)
async def update_operator(
    operator_id: str,
    operator_update: UserUpdate,
    current_user: User = Depends(require_manager)
):
    db = await get_database()
    
    # Verify the operator exists and belongs to this manager
    existing = await db.users.find_one({
        "_id": ObjectId(operator_id),
        "role": UserRole.OPERATOR,
        "created_by": ObjectId(current_user.id)
    })
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operator not found"
        )
    
    update_data = {k: v for k, v in operator_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.users.update_one(
        {"_id": ObjectId(operator_id)},
        {"$set": update_data}
    )
    
    return {"message": "Operator updated successfully"}

@router.delete("/operators/{operator_id}", response_model=dict)
async def delete_operator(
    operator_id: str,
    current_user: User = Depends(require_manager)
):
    db = await get_database()
    
    # Verify the operator exists and belongs to this manager
    existing = await db.users.find_one({
        "_id": ObjectId(operator_id),
        "role": UserRole.OPERATOR,
        "created_by": ObjectId(current_user.id)
    })
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operator not found"
        )
    
    await db.users.delete_one({"_id": ObjectId(operator_id)})
    
    return {"message": "Operator deleted successfully"}

@router.get("/loan-applications", response_model=List[dict])
async def get_loan_applications(
    current_user: User = Depends(require_manager)
):
    db = await get_database()
    
    # Get all operators created by this manager
    operator_ids = []
    async for operator in db.users.find({
        "role": UserRole.OPERATOR,
        "created_by": ObjectId(current_user.id)
    }):
        operator_ids.append(operator["_id"])
    
    if not operator_ids:
        return []
    
    applications = []
    pipeline = [
        {"$match": {"operator_id": {"$in": operator_ids}}},
        {
            "$lookup": {
                "from": "applicants",
                "localField": "applicant_id",
                "foreignField": "_id",
                "as": "applicant"
            }
        },
        {
            "$lookup": {
                "from": "animals",
                "localField": "animal_id",
                "foreignField": "_id", 
                "as": "animal"
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "operator_id",
                "foreignField": "_id",
                "as": "operator"
            }
        }
    ]
    
    async for app in db.loan_applications.aggregate(pipeline):
        app["_id"] = str(app["_id"])
        app["applicant_id"] = str(app["applicant_id"])
        app["animal_id"] = str(app["animal_id"])
        app["operator_id"] = str(app["operator_id"])
        if app.get("manager_id"):
            app["manager_id"] = str(app["manager_id"])
        applications.append(app)
    
    return applications

@router.put("/loan-applications/{app_id}/approve", response_model=dict)
async def approve_loan_application(
    app_id: str,
    current_user: User = Depends(require_manager)
):
    db = await get_database()
    
    # Get the application and verify it's from one of this manager's operators
    app = await db.loan_applications.find_one({"_id": ObjectId(app_id)})
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found"
        )
    
    # Verify the operator belongs to this manager
    operator = await db.users.find_one({
        "_id": app["operator_id"],
        "created_by": ObjectId(current_user.id)
    })
    
    if not operator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only approve applications from your operators"
        )
    
    # Check if application is verified
    if app["status"] != LoanStatus.VERIFIED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application must be verified before approval"
        )
    
    # Approve the application
    await db.loan_applications.update_one(
        {"_id": ObjectId(app_id)},
        {
            "$set": {
                "status": LoanStatus.APPROVED,
                "manager_id": ObjectId(current_user.id),
                "approved_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Loan application approved successfully"}

@router.put("/loan-applications/{app_id}/reject", response_model=dict)
async def reject_loan_application(
    app_id: str,
    reason: str,
    current_user: User = Depends(require_manager)
):
    db = await get_database()
    
    # Get the application and verify it's from one of this manager's operators
    app = await db.loan_applications.find_one({"_id": ObjectId(app_id)})
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found"
        )
    
    # Verify the operator belongs to this manager
    operator = await db.users.find_one({
        "_id": app["operator_id"],
        "created_by": ObjectId(current_user.id)
    })
    
    if not operator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only reject applications from your operators"
        )
    
    # Reject the application
    await db.loan_applications.update_one(
        {"_id": ObjectId(app_id)},
        {
            "$set": {
                "status": LoanStatus.REJECTED,
                "manager_id": ObjectId(current_user.id),
                "rejection_reason": reason,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Loan application rejected successfully"}

@router.get("/dashboard/stats", response_model=dict)
async def get_dashboard_stats(
    current_user: User = Depends(require_manager)
):
    db = await get_database()
    
    # Get operator count
    operator_count = await db.users.count_documents({
        "role": UserRole.OPERATOR,
        "created_by": ObjectId(current_user.id)
    })
    
    # Get all operator IDs for this manager
    operator_ids = []
    async for operator in db.users.find({
        "role": UserRole.OPERATOR,
        "created_by": ObjectId(current_user.id)
    }):
        operator_ids.append(operator["_id"])
    
    if not operator_ids:
        return {
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
        "operators_count": operator_count,
        "total_applications": total_apps,
        "pending_applications": pending_apps,
        "verified_applications": verified_apps,
        "approved_applications": approved_apps,
        "rejected_applications": rejected_apps
    }