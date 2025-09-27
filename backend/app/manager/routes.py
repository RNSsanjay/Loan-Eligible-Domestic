from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..common.models import (
    User, UserCreate, UserRole, LoanApplication, LoanStatus, UserUpdate
)
from ..common.auth import get_current_active_user, get_password_hash
from ..common.database import get_database
from ..common.file_utils import save_profile_image, delete_profile_image
from ..common.serializers import serialize_user_document, serialize_document_list, serialize_objectid

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
    password: str = Form(...),
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
        "password_hash": get_password_hash(password),
        "first_login": False,
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
        "message": "Operator created successfully with password set."
    }

@router.get("/operators", response_model=List[dict])
async def get_operators(
    current_user: User = Depends(require_manager)
):
    db = await get_database()
    operators = []
    
    async for user in db.users.find({
        "role": UserRole.OPERATOR,
        "created_by": ObjectId(current_user.id)
    }):
        operators.append(serialize_user_document(user))
    
    return operators

@router.get("/operators/{operator_id}", response_model=dict)
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
    
    return serialize_user_document(operator)

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
        applications.append(serialize_objectid(app))
    
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

@router.get("/reports/operator-performance", response_model=List[dict])
async def get_operator_performance_report(
    current_user: User = Depends(require_manager)
):
    db = await get_database()
    
    # Get all operators created by this manager
    operators = []
    async for operator in db.users.find({
        "role": UserRole.OPERATOR,
        "created_by": ObjectId(current_user.id)
    }):
        operator_dict = serialize_user_document(operator)
        
        # Get application statistics for this operator
        total_apps = await db.loan_applications.count_documents({"operator_id": ObjectId(operator["_id"])})
        approved_apps = await db.loan_applications.count_documents({
            "operator_id": ObjectId(operator["_id"]),
            "status": LoanStatus.APPROVED
        })
        rejected_apps = await db.loan_applications.count_documents({
            "operator_id": ObjectId(operator["_id"]),
            "status": LoanStatus.REJECTED
        })
        pending_apps = await db.loan_applications.count_documents({
            "operator_id": ObjectId(operator["_id"]),
            "status": {"$in": [LoanStatus.PENDING, LoanStatus.VERIFIED]}
        })
        
        approval_rate = round((approved_apps / total_apps) * 100) if total_apps > 0 else 0
        
        operator_performance = {
            "operator_name": operator["name"],
            "operator_email": operator["email"],
            "total_applications": total_apps,
            "approved_applications": approved_apps,
            "rejected_applications": rejected_apps,
            "pending_applications": pending_apps,
            "approval_rate": approval_rate
        }
        operators.append(operator_performance)
    
    return operators

@router.get("/reports/monthly-analytics", response_model=List[dict])
async def get_monthly_analytics(
    months: int = 6,
    current_user: User = Depends(require_manager)
):
    db = await get_database()
    
    # Get all operator IDs for this manager
    operator_ids = []
    async for operator in db.users.find({
        "role": UserRole.OPERATOR,
        "created_by": ObjectId(current_user.id)
    }):
        operator_ids.append(operator["_id"])
    
    if not operator_ids:
        return []
    
    # Build aggregation pipeline for monthly data
    from datetime import datetime, timedelta
    
    # Get data for last N months
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=months * 30)
    
    pipeline = [
        {
            "$match": {
                "operator_id": {"$in": operator_ids},
                "created_at": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"}
                },
                "total_amount": {"$sum": "$loan_amount"},
                "applications_count": {"$sum": 1},
                "approved_amount": {
                    "$sum": {
                        "$cond": [
                            {"$eq": ["$status", "approved"]},
                            "$loan_amount",
                            0
                        ]
                    }
                },
                "approved_count": {
                    "$sum": {
                        "$cond": [
                            {"$eq": ["$status", "approved"]},
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            "$sort": {"_id.year": 1, "_id.month": 1}
        }
    ]
    
    monthly_data = []
    async for doc in db.loan_applications.aggregate(pipeline):
        month_name = datetime(doc["_id"]["year"], doc["_id"]["month"], 1).strftime("%b %Y")
        monthly_data.append({
            "month": month_name,
            "total_amount": doc["total_amount"],
            "applications_count": doc["applications_count"],
            "approved_amount": doc["approved_amount"],
            "approved_count": doc["approved_count"]
        })
    
    return monthly_data