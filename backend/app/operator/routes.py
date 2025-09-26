from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
import uuid

from ..common.models import (
    User, UserRole, LoanApplication, LoanApplicationCreate, Applicant, 
    ApplicantCreate, Animal, AnimalCreate, VerificationChecklist, 
    VerificationItem, LoanStatus
)
from ..common.auth import get_current_active_user
from ..common.database import get_database

router = APIRouter()

def require_operator(current_user: User = Depends(get_current_active_user)):
    if current_user.role != UserRole.OPERATOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

@router.post("/applicants", response_model=dict)
async def create_applicant(
    applicant: ApplicantCreate,
    current_user: User = Depends(require_operator)
):
    db = await get_database()
    
    # Check if applicant with same Aadhar already exists
    existing = await db.applicants.find_one({"aadhar_number": applicant.aadhar_number})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Applicant with this Aadhar number already exists"
        )
    
    applicant_dict = applicant.model_dump()
    result = await db.applicants.insert_one(applicant_dict)
    
    return {"id": str(result.inserted_id), "message": "Applicant created successfully"}

@router.get("/applicants", response_model=List[Applicant])
async def get_applicants(
    current_user: User = Depends(require_operator)
):
    db = await get_database()
    applicants = []
    async for applicant in db.applicants.find():
        applicants.append(Applicant(**applicant))
    return applicants

@router.get("/applicants/{applicant_id}", response_model=Applicant)
async def get_applicant(
    applicant_id: str,
    current_user: User = Depends(require_operator)
):
    db = await get_database()
    
    applicant = await db.applicants.find_one({"_id": ObjectId(applicant_id)})
    if not applicant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Applicant not found"
        )
    
    return Applicant(**applicant)

@router.post("/animals", response_model=dict)
async def create_animal(
    animal: AnimalCreate,
    current_user: User = Depends(require_operator)
):
    db = await get_database()
    
    animal_dict = animal.model_dump()
    result = await db.animals.insert_one(animal_dict)
    
    return {"id": str(result.inserted_id), "message": "Animal details saved successfully"}

@router.get("/animals", response_model=List[Animal])
async def get_animals(
    current_user: User = Depends(require_operator)
):
    db = await get_database()
    animals = []
    async for animal in db.animals.find():
        animals.append(Animal(**animal))
    return animals

@router.post("/loan-applications", response_model=dict)
async def create_loan_application(
    loan_app: LoanApplicationCreate,
    current_user: User = Depends(require_operator)
):
    db = await get_database()
    
    # Verify applicant exists
    applicant = await db.applicants.find_one({"_id": ObjectId(loan_app.applicant_id)})
    if not applicant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Applicant not found"
        )
    
    # Verify animal exists
    animal = await db.animals.find_one({"_id": ObjectId(loan_app.animal_id)})
    if not animal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Animal not found"
        )
    
    # Generate application number
    app_number = f"LA{datetime.now().year}{uuid.uuid4().hex[:8].upper()}"
    
    loan_dict = loan_app.model_dump()
    loan_dict["application_number"] = app_number
    loan_dict["operator_id"] = ObjectId(current_user.id)
    
    result = await db.loan_applications.insert_one(loan_dict)
    
    return {
        "id": str(result.inserted_id), 
        "application_number": app_number,
        "message": "Loan application created successfully"
    }

@router.get("/loan-applications", response_model=List[dict])
async def get_loan_applications(
    current_user: User = Depends(require_operator)
):
    db = await get_database()
    applications = []
    
    pipeline = [
        {"$match": {"operator_id": ObjectId(current_user.id)}},
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
        }
    ]
    
    async for app in db.loan_applications.aggregate(pipeline):
        app["_id"] = str(app["_id"])
        app["applicant_id"] = str(app["applicant_id"])
        app["animal_id"] = str(app["animal_id"])
        app["operator_id"] = str(app["operator_id"])
        if app["manager_id"]:
            app["manager_id"] = str(app["manager_id"])
        applications.append(app)
    
    return applications

@router.put("/loan-applications/{app_id}/verify", response_model=dict)
async def verify_loan_application(
    app_id: str,
    checklist_data: dict,
    current_user: User = Depends(require_operator)
):
    db = await get_database()
    
    # Verify the application exists and belongs to this operator
    app = await db.loan_applications.find_one({
        "_id": ObjectId(app_id),
        "operator_id": ObjectId(current_user.id)
    })
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found"
        )
    
    # Create verification checklist with 8 standard items
    verification_items = [
        VerificationItem(
            item="Animal health certificate verified",
            status=checklist_data.get("health_certificate", False),
            notes=checklist_data.get("health_certificate_notes", "")
        ),
        VerificationItem(
            item="Vaccination records verified",
            status=checklist_data.get("vaccination_records", False),
            notes=checklist_data.get("vaccination_records_notes", "")
        ),
        VerificationItem(
            item="Animal ownership proof verified",
            status=checklist_data.get("ownership_proof", False),
            notes=checklist_data.get("ownership_proof_notes", "")
        ),
        VerificationItem(
            item="Applicant identity verified",
            status=checklist_data.get("identity_verified", False),
            notes=checklist_data.get("identity_notes", "")
        ),
        VerificationItem(
            item="Bank account details verified",
            status=checklist_data.get("bank_details", False),
            notes=checklist_data.get("bank_details_notes", "")
        ),
        VerificationItem(
            item="Income proof verified",
            status=checklist_data.get("income_proof", False),
            notes=checklist_data.get("income_proof_notes", "")
        ),
        VerificationItem(
            item="Animal market value assessed",
            status=checklist_data.get("market_value", False),
            notes=checklist_data.get("market_value_notes", "")
        ),
        VerificationItem(
            item="Loan repayment capacity verified",
            status=checklist_data.get("repayment_capacity", False),
            notes=checklist_data.get("repayment_capacity_notes", "")
        )
    ]
    
    # Check if all items are verified
    overall_status = all(item.status for item in verification_items)
    
    checklist = VerificationChecklist(
        items=verification_items,
        overall_status=overall_status
    )
    
    # Update application
    update_data = {
        "verification_checklist": checklist.model_dump(),
        "status": LoanStatus.VERIFIED if overall_status else LoanStatus.PENDING,
        "verified_at": datetime.utcnow() if overall_status else None,
        "updated_at": datetime.utcnow()
    }
    
    await db.loan_applications.update_one(
        {"_id": ObjectId(app_id)},
        {"$set": update_data}
    )
    
    return {
        "message": "Verification completed successfully",
        "verified": overall_status,
        "status": "VERIFIED" if overall_status else "PENDING"
    }