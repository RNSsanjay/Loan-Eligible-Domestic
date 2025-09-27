from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..common.models import (
    User, UserCreate, UserRole, UserUpdate, LoanApplication, LoanStatus
)
from ..common.auth import get_current_active_user, get_password_hash
from ..common.database import get_database
from ..common.file_utils import save_profile_image, delete_profile_image
from ..common.serializers import serialize_user_document, serialize_document_list, serialize_objectid

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
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    profile_image: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_admin)
):
    db = await get_database()
    
    # Check if email already exists
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create manager data
    user_dict = {
        "name": name,
        "email": email,
        "phone": phone,
        "role": UserRole.MANAGER,
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
        "message": "Manager created successfully with password set."
    }

@router.get("/managers", response_model=List[dict])
async def get_managers(
    current_user: User = Depends(require_admin)
):
    db = await get_database()
    managers = []
    
    async for user in db.users.find({
        "role": UserRole.MANAGER,
        "created_by": ObjectId(current_user.id)
    }):
        managers.append(serialize_user_document(user))
    
    return managers

@router.get("/managers/{manager_id}", response_model=dict)
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
    
    return serialize_user_document(manager)

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

@router.get("/managers/{manager_id}/operators", response_model=List[dict])
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
        operators.append(serialize_user_document(user))
    
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

@router.get("/analytics/stats", response_model=dict)
async def get_system_stats(
    current_user: User = Depends(require_admin)
):
    """Get comprehensive system statistics"""
    db = await get_database()
    
    # Get all managers created by this admin
    managers = []
    async for manager in db.users.find({
        "role": UserRole.MANAGER,
        "created_by": ObjectId(current_user.id)
    }):
        managers.append(manager)
    
    # Get all operators created by managers under this admin
    all_operator_ids = []
    for manager in managers:
        async for operator in db.users.find({
            "role": UserRole.OPERATOR,
            "created_by": ObjectId(manager["_id"])
        }):
            all_operator_ids.append(ObjectId(operator["_id"]))
    
    # Count statistics
    total_managers = len(managers)
    total_operators = len(all_operator_ids)
    
    total_applications = await db.loan_applications.count_documents({
        "operator_id": {"$in": all_operator_ids}
    })
    
    pending_applications = await db.loan_applications.count_documents({
        "operator_id": {"$in": all_operator_ids},
        "status": LoanStatus.VERIFIED
    })
    
    verification_pending = await db.loan_applications.count_documents({
        "operator_id": {"$in": all_operator_ids},
        "status": LoanStatus.PENDING
    })
    
    approved_applications = await db.loan_applications.count_documents({
        "operator_id": {"$in": all_operator_ids},
        "status": LoanStatus.APPROVED
    })
    
    rejected_applications = await db.loan_applications.count_documents({
        "operator_id": {"$in": all_operator_ids},
        "status": LoanStatus.REJECTED
    })
    
    # Calculate total loan value
    total_loan_value = 0
    async for app in db.loan_applications.find({
        "operator_id": {"$in": all_operator_ids},
        "status": LoanStatus.APPROVED
    }):
        total_loan_value += app.get("loan_amount", 0)
    
    return {
        "total_managers": total_managers,
        "total_operators": total_operators,
        "total_applications": total_applications,
        "total_loan_value": total_loan_value,
        "pending_applications": pending_applications,
        "approved_applications": approved_applications,
        "rejected_applications": rejected_applications,
        "verification_pending": verification_pending
    }

@router.get("/analytics/activity", response_model=List[dict])
async def get_recent_activity(
    current_user: User = Depends(require_admin),
    limit: int = 20
):
    """Get recent system activity"""
    db = await get_database()
    
    # Get all managers and operators under this admin
    managers = []
    async for manager in db.users.find({
        "role": UserRole.MANAGER,
        "created_by": ObjectId(current_user.id)
    }):
        managers.append(manager)
    
    all_user_ids = [ObjectId(current_user.id)]
    for manager in managers:
        all_user_ids.append(ObjectId(manager["_id"]))
        async for operator in db.users.find({
            "role": UserRole.OPERATOR,
            "created_by": ObjectId(manager["_id"])
        }):
            all_user_ids.append(ObjectId(operator["_id"]))
    
    # Get recent loan applications
    recent_activities = []
    async for app in db.loan_applications.find({
        "operator_id": {"$in": all_user_ids}
    }).sort("created_at", -1).limit(limit):
        operator = await db.users.find_one({"_id": app["operator_id"]})
        activity = {
            "id": str(app["_id"]),
            "type": "loan_application",
            "description": f"New loan application submitted for {app.get('animal_type', 'livestock')}",
            "timestamp": app.get("created_at", datetime.now()).isoformat(),
            "user_name": operator.get("name", "Unknown") if operator else "Unknown"
        }
        recent_activities.append(activity)
    
    # Get recent user creations
    async for user in db.users.find({
        "created_by": {"$in": all_user_ids}
    }).sort("created_at", -1).limit(10):
        creator = await db.users.find_one({"_id": user["created_by"]})
        activity = {
            "id": str(user["_id"]),
            "type": "user_creation",
            "description": f"New {user['role'].lower()} created: {user['name']}",
            "timestamp": user.get("created_at", datetime.now()).isoformat(),
            "user_name": creator.get("name", "System") if creator else "System"
        }
        recent_activities.append(activity)
    
    # Sort all activities by timestamp
    recent_activities.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return recent_activities[:limit]

@router.get("/reports/loan-applications", response_model=List[dict])
async def get_loan_applications_report(
    current_user: User = Depends(require_admin),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    status: Optional[str] = None,
    animal_type: Optional[str] = None
):
    """Generate loan applications report with filtering"""
    db = await get_database()
    
    # Get all operators under this admin
    managers = []
    async for manager in db.users.find({
        "role": UserRole.MANAGER,
        "created_by": ObjectId(current_user.id)
    }):
        managers.append(manager)
    
    all_operator_ids = []
    for manager in managers:
        async for operator in db.users.find({
            "role": UserRole.OPERATOR,
            "created_by": ObjectId(manager["_id"])
        }):
            all_operator_ids.append(ObjectId(operator["_id"]))
    
    # Build query filter
    query_filter = {"operator_id": {"$in": all_operator_ids}}
    
    if start_date:
        start_datetime = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        query_filter["created_at"] = {"$gte": start_datetime}
    
    if end_date:
        end_datetime = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        if "created_at" in query_filter:
            query_filter["created_at"]["$lte"] = end_datetime
        else:
            query_filter["created_at"] = {"$lte": end_datetime}
    
    if status:
        query_filter["status"] = status
        
    if animal_type:
        query_filter["animal_type"] = animal_type
    
    # Fetch loan applications
    applications_report = []
    async for app in db.loan_applications.find(query_filter).sort("created_at", -1):
        # Get applicant details
        applicant = await db.applicants.find_one({"_id": app["applicant_id"]})
        
        # Get animal details
        animal = await db.animals.find_one({"_id": app["animal_id"]})
        
        # Get operator details
        operator = await db.users.find_one({"_id": app["operator_id"]})
        
        report_entry = {
            "id": str(app["_id"]),
            "application_date": app.get("created_at", datetime.now()).isoformat(),
            "applicant_name": applicant.get("name", "Unknown") if applicant else "Unknown",
            "applicant_phone": applicant.get("phone", "N/A") if applicant else "N/A",
            "applicant_email": applicant.get("email", "N/A") if applicant else "N/A",
            "animal_type": animal.get("type", "N/A") if animal else "N/A",
            "animal_breed": animal.get("breed", "N/A") if animal else "N/A",
            "animal_age": animal.get("age", "N/A") if animal else "N/A",
            "loan_amount": app.get("loan_amount", 0),
            "loan_duration": app.get("loan_duration", 0),
            "status": app.get("status", "PENDING"),
            "operator_name": operator.get("name", "Unknown") if operator else "Unknown",
            "verification_status": app.get("verification_status", "Not Verified"),
            "approved_date": app.get("approved_at", "").isoformat() if app.get("approved_at") else None,
            "rejected_date": app.get("rejected_at", "").isoformat() if app.get("rejected_at") else None,
            "rejection_reason": app.get("rejection_reason", "")
        }
        applications_report.append(report_entry)
    
    return applications_report

@router.get("/reports/managers-performance", response_model=List[dict])
async def get_managers_performance_report(
    current_user: User = Depends(require_admin)
):
    """Generate managers performance report"""
    db = await get_database()
    
    performance_report = []
    
    async for manager in db.users.find({
        "role": UserRole.MANAGER,
        "created_by": ObjectId(current_user.id)
    }):
        # Count operators under this manager
        operators_count = await db.users.count_documents({
            "role": UserRole.OPERATOR,
            "created_by": ObjectId(manager["_id"])
        })
        
        # Get all operator IDs under this manager
        operator_ids = []
        async for operator in db.users.find({
            "role": UserRole.OPERATOR,
            "created_by": ObjectId(manager["_id"])
        }):
            operator_ids.append(ObjectId(operator["_id"]))
        
        # Count loan applications handled
        total_applications = await db.loan_applications.count_documents({
            "operator_id": {"$in": operator_ids}
        })
        
        approved_applications = await db.loan_applications.count_documents({
            "operator_id": {"$in": operator_ids},
            "status": LoanStatus.APPROVED
        })
        
        rejected_applications = await db.loan_applications.count_documents({
            "operator_id": {"$in": operator_ids},
            "status": LoanStatus.REJECTED
        })
        
        pending_applications = await db.loan_applications.count_documents({
            "operator_id": {"$in": operator_ids},
            "status": LoanStatus.PENDING
        })
        
        verified_applications = await db.loan_applications.count_documents({
            "operator_id": {"$in": operator_ids},
            "status": LoanStatus.VERIFIED
        })
        
        # Calculate total approved loan amount
        total_approved_amount = 0
        async for app in db.loan_applications.find({
            "operator_id": {"$in": operator_ids},
            "status": LoanStatus.APPROVED
        }):
            total_approved_amount += app.get("loan_amount", 0)
        
        approval_rate = (approved_applications / total_applications * 100) if total_applications > 0 else 0
        
        performance_entry = {
            "manager_id": str(manager["_id"]),
            "manager_name": manager.get("name", "Unknown"),
            "manager_email": manager.get("email", "Unknown"),
            "operators_count": operators_count,
            "total_applications": total_applications,
            "approved_applications": approved_applications,
            "rejected_applications": rejected_applications,
            "pending_applications": pending_applications,
            "verified_applications": verified_applications,
            "total_approved_amount": total_approved_amount,
            "approval_rate": round(approval_rate, 2),
            "created_date": manager.get("created_at", datetime.now()).isoformat() if manager.get("created_at") else None,
            "last_active": manager.get("last_login", "Never") if manager.get("last_login") else "Never"
        }
        performance_report.append(performance_entry)
    
    return performance_report

@router.get("/reports/financial-summary", response_model=dict)
async def get_financial_summary_report(
    current_user: User = Depends(require_admin),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Generate financial summary report"""
    db = await get_database()
    
    # Get all operators under this admin
    managers = []
    async for manager in db.users.find({
        "role": UserRole.MANAGER,
        "created_by": ObjectId(current_user.id)
    }):
        managers.append(manager)
    
    all_operator_ids = []
    for manager in managers:
        async for operator in db.users.find({
            "role": UserRole.OPERATOR,
            "created_by": ObjectId(manager["_id"])
        }):
            all_operator_ids.append(ObjectId(operator["_id"]))
    
    # Build query filter
    query_filter = {"operator_id": {"$in": all_operator_ids}}
    
    if start_date:
        start_datetime = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        query_filter["created_at"] = {"$gte": start_datetime}
    
    if end_date:
        end_datetime = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        if "created_at" in query_filter:
            query_filter["created_at"]["$lte"] = end_datetime
        else:
            query_filter["created_at"] = {"$lte": end_datetime}
    
    # Calculate financial metrics
    total_loan_requests = await db.loan_applications.count_documents(query_filter)
    
    approved_query = {**query_filter, "status": LoanStatus.APPROVED}
    total_approved_loans = await db.loan_applications.count_documents(approved_query)
    
    # Calculate amounts by animal type
    animal_wise_summary = {}
    for animal_type in ["cow", "goat", "hen"]:
        animal_query = {**approved_query, "animal_type": animal_type}
        animal_count = await db.loan_applications.count_documents(animal_query)
        animal_amount = 0
        async for app in db.loan_applications.find(animal_query):
            animal_amount += app.get("loan_amount", 0)
        
        animal_wise_summary[animal_type] = {
            "count": animal_count,
            "total_amount": animal_amount,
            "average_amount": animal_amount / animal_count if animal_count > 0 else 0
        }
    
    # Calculate total amounts
    total_approved_amount = 0
    total_requested_amount = 0
    
    async for app in db.loan_applications.find(approved_query):
        total_approved_amount += app.get("loan_amount", 0)
    
    async for app in db.loan_applications.find(query_filter):
        total_requested_amount += app.get("loan_amount", 0)
    
    # Calculate monthly breakdown (last 12 months)
    monthly_breakdown = []
    for i in range(11, -1, -1):
        month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_start = month_start.replace(month=month_start.month - i if month_start.month > i else 12 + month_start.month - i)
        month_end = month_start.replace(month=month_start.month + 1) if month_start.month < 12 else month_start.replace(year=month_start.year + 1, month=1)
        
        month_query = {
            **query_filter,
            "created_at": {"$gte": month_start, "$lt": month_end}
        }
        
        month_applications = await db.loan_applications.count_documents(month_query)
        month_approved = await db.loan_applications.count_documents({**month_query, "status": LoanStatus.APPROVED})
        
        month_amount = 0
        async for app in db.loan_applications.find({**month_query, "status": LoanStatus.APPROVED}):
            month_amount += app.get("loan_amount", 0)
        
        monthly_breakdown.append({
            "month": month_start.strftime("%B %Y"),
            "applications": month_applications,
            "approved": month_approved,
            "amount": month_amount
        })
    
    return {
        "total_loan_requests": total_loan_requests,
        "total_approved_loans": total_approved_loans,
        "total_requested_amount": total_requested_amount,
        "total_approved_amount": total_approved_amount,
        "approval_rate": (total_approved_loans / total_loan_requests * 100) if total_loan_requests > 0 else 0,
        "average_loan_amount": total_approved_amount / total_approved_loans if total_approved_loans > 0 else 0,
        "animal_wise_summary": animal_wise_summary,
        "monthly_breakdown": monthly_breakdown,
        "generated_at": datetime.now().isoformat(),
        "period": {
            "start_date": start_date,
            "end_date": end_date
        }
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