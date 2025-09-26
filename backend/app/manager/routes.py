from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..common.models import (
    User, UserCreate, UserRole, LoanApplication, LoanStatus, UserUpdate
)
from ..common.auth import get_current_active_user
from ..common.database import get_database
from ..common.file_utils import save_profile_image, delete_profile_image

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
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    profile_image: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_manager)
):
    db = await get_database()
    
    # Check if email already exists
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create operator data
    user_dict = {
        "name": name,
        "email": email,
        "phone": phone,
        "role": UserRole.OPERATOR,
        "is_active": True,
        "created_by": ObjectId(current_user.id),
        "first_login": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert user first to get ID
    result = await db.users.insert_one(user_dict)
    user_id = str(result.inserted_id)
    
    # Handle profile image upload
    if profile_image and profile_image.filename:
        try:
            image_path = save_profile_image(profile_image, user_id)
            await db.users.update_one(
                {"_id": result.inserted_id},
                {"$set": {"profile_image": image_path}}
            )
        except HTTPException:
            # If image upload fails, delete the user and re-raise
            await db.users.delete_one({"_id": result.inserted_id})
            raise
    
    return {
        "id": user_id,
        "email": email,
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