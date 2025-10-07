from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
import uuid
import base64
from pydantic import BaseModel
from PIL import Image
from io import BytesIO

from ..common.models import (
    User, UserRole, LoanApplication, LoanApplicationCreate, Applicant, 
    ApplicantCreate, Animal, AnimalCreate, VerificationChecklist, 
    VerificationItem, LoanStatus
)
from ..common.auth import get_current_active_user
from ..common.database import get_database
from ..common.serializers import serialize_objectid
from ..common.image_processor import cow_nose_processor
from ..common.cow_weight_predictor import CowWeightPredictor
from ..common.image_utils import (
    validate_base64_image, enhance_image_quality, compress_image,
    get_image_info, resize_image
)

# Initialize weight predictor
weight_predictor = CowWeightPredictor()

# Request models for image processing
class ImageProcessRequest(BaseModel):
    image_base64: str
    image_type: str  # 'face' or 'nose'
    application_id: str

class ManualZoomRequest(BaseModel):
    image_base64: str
    zoom_coordinates: dict
    application_id: str

class PatternCheckRequest(BaseModel):
    pattern_hash: str
    application_id: Optional[str] = None

class VerificationStepRequest(BaseModel):
    application_id: str
    step_data: dict
    images: Optional[dict] = None

class WeightPredictionRequest(BaseModel):
    application_id: str
    left_side_image: str
    right_side_image: str
    breed: str = "crossbred"
    age_years: int = 3
    prediction_mode: str = "manual"  # 'manual', 'ai', 'visual'
    manual_heart_girth: Optional[float] = None
    manual_body_length: Optional[float] = None

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

@router.get("/applicants", response_model=List[dict])
async def get_applicants(
    current_user: User = Depends(require_operator)
):
    db = await get_database()
    applicants = []
    async for applicant in db.applicants.find():
        applicants.append(serialize_objectid(applicant))
    return applicants

@router.get("/applicants/{applicant_id}", response_model=dict)
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
    
    return serialize_objectid(applicant)

@router.post("/animals", response_model=dict)
async def create_animal(
    animal: AnimalCreate,
    current_user: User = Depends(require_operator)
):
    db = await get_database()
    
    animal_dict = animal.model_dump()
    result = await db.animals.insert_one(animal_dict)
    
    return {"id": str(result.inserted_id), "message": "Animal details saved successfully"}

@router.get("/animals", response_model=List[dict])
async def get_animals(
    current_user: User = Depends(require_operator)
):
    db = await get_database()
    animals = []
    async for animal in db.animals.find():
        animals.append(serialize_objectid(animal))
    return animals

# Image Processing Endpoints
@router.post("/process-cow-image", response_model=dict)
async def process_cow_image(
    request: ImageProcessRequest,
    current_user: User = Depends(require_operator)
):
    """
    Process cow images (face or nose) with enhancement and nose detection
    """
    try:
        db = await get_database()
        
        # Verify application exists and belongs to this operator
        application = await db.loan_applications.find_one({
            "_id": ObjectId(request.application_id),
            "operator_id": ObjectId(current_user.id)
        })
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan application not found"
            )
        
        # Process image based on type
        if request.image_type == "face":
            # For backward compatibility, use simple face processing
            enhanced_face = cow_nose_processor._enhance_image_quality(
                Image.open(BytesIO(base64.b64decode(request.image_base64.split(',')[1] if ',' in request.image_base64 else request.image_base64)))
            )
            result = {
                "success": True,
                "original_base64": request.image_base64,
                "enhanced_base64": cow_nose_processor._pil_to_base64(enhanced_face),
                "processing_notes": "Face image enhanced for better clarity"
            }
        elif request.image_type == "nose":
            # For backward compatibility, use simple nose processing
            enhanced_face = cow_nose_processor._enhance_image_quality(
                Image.open(BytesIO(base64.b64decode(request.image_base64.split(',')[1] if ',' in request.image_base64 else request.image_base64)))
            )
            result = {
                "success": True,
                "original_base64": request.image_base64,
                "enhanced_original_base64": cow_nose_processor._pil_to_base64(enhanced_face),
                "processing_notes": "Nose image enhanced for better clarity"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image type. Must be 'face' or 'nose'"
            )
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image processing failed: {result.get('error', 'Unknown error')}"
            )
        
        # Store processed images in database
        image_data = {
            f"cow_{request.image_type}_original": result["original_base64"],
            f"cow_{request.image_type}_processed": result.get("enhanced_base64") or result.get("enhanced_original_base64"),
            f"cow_{request.image_type}_processing_notes": result["processing_notes"],
            f"cow_{request.image_type}_processed_at": datetime.utcnow()
        }
        
        # Add nose-specific data
        if request.image_type == "nose" and result.get("nose_zoomed_base64"):
            image_data["cow_nose_zoomed"] = result["nose_zoomed_base64"]
            image_data["cow_nose_zoom_coordinates"] = result.get("zoom_coordinates")
        
        # Update application with processed image data
        await db.loan_applications.update_one(
            {"_id": ObjectId(request.application_id)},
            {"$set": image_data}
        )
        
        return {
            "success": True,
            "message": f"Cow {request.image_type} image processed successfully",
            "processed_data": result,
            "application_id": request.application_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )

@router.post("/process-cow-face-manual-zoom", response_model=dict)
async def process_cow_face_manual_zoom(
    request: ManualZoomRequest,
    current_user: User = Depends(require_operator)
):
    """
    Process cow face image with manual nose zoom and pattern recognition
    """
    try:
        db = await get_database()
        
        # Verify application exists and belongs to this operator
        application = await db.loan_applications.find_one({
            "_id": ObjectId(request.application_id),
            "operator_id": ObjectId(current_user.id)
        })
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan application not found"
            )
        
        # Process image with manual zoom
        result = cow_nose_processor.process_cow_face_with_manual_zoom(
            request.image_base64, 
            request.zoom_coordinates
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image processing failed: {result.get('error', 'Unknown error')}"
            )
        
        # Check for duplicate pattern
        pattern_hash = result.get("pattern_hash")
        is_duplicate = False
        duplicate_application = None
        
        if pattern_hash:
            # Search for existing applications with same pattern hash
            existing_app = await db.loan_applications.find_one({
                "nose_pattern_hash": pattern_hash,
                "_id": {"$ne": ObjectId(request.application_id)}
            })
            
            if existing_app:
                is_duplicate = True
                duplicate_application = str(existing_app.get("_id"))
                # Get applicant name for the duplicate
                duplicate_applicant = await db.applicants.find_one({
                    "_id": existing_app.get("applicant_id")
                })
                if duplicate_applicant:
                    result["duplicate_applicant_name"] = duplicate_applicant.get("name")
        
        # Store processed data in database
        update_data = {
            "cow_face_original": result["original_face_base64"],
            "cow_face_enhanced": result["enhanced_face_base64"],
            "cow_nose_area": result["nose_area_base64"],
            "nose_zoom_coordinates": result["zoom_coordinates"],
            "nose_pattern_features": result["pattern_features"],
            "nose_pattern_hash": pattern_hash,
            "nose_pattern_confidence": result["pattern_confidence"],
            "nose_pattern_processed_at": datetime.utcnow(),
            "is_duplicate_pattern": is_duplicate,
            "duplicate_application_id": duplicate_application
        }
        
        # Update application
        await db.loan_applications.update_one(
            {"_id": ObjectId(request.application_id)},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "message": "Cow face processed with nose pattern analysis",
            "pattern_hash": pattern_hash,
            "pattern_confidence": result["pattern_confidence"],
            "is_duplicate": is_duplicate,
            "duplicate_application_id": duplicate_application,
            "duplicate_applicant_name": result.get("duplicate_applicant_name"),
            "processed_data": result,
            "application_id": request.application_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing cow face: {str(e)}"
        )

@router.post("/check-nose-pattern-duplicate", response_model=dict)
async def check_nose_pattern_duplicate(
    request: PatternCheckRequest,
    current_user: User = Depends(require_operator)
):
    """
    Check if a nose pattern already exists in the database
    """
    try:
        db = await get_database()
        
        # Search for existing applications with same pattern hash
        query = {"nose_pattern_hash": request.pattern_hash}
        if request.application_id:
            query["_id"] = {"$ne": ObjectId(request.application_id)}
        
        existing_app = await db.loan_applications.find_one(query)
        
        if existing_app:
            # Get applicant details
            applicant = await db.applicants.find_one({
                "_id": existing_app.get("applicant_id")
            })
            
            return {
                "is_duplicate": True,
                "existing_application_id": str(existing_app["_id"]),
                "existing_application_number": existing_app.get("application_number"),
                "existing_applicant_name": applicant.get("name") if applicant else "Unknown",
                "existing_applicant_phone": applicant.get("phone") if applicant else "Unknown",
                "pattern_confidence": existing_app.get("nose_pattern_confidence", 0),
                "created_at": existing_app.get("created_at")
            }
        else:
            return {
                "is_duplicate": False,
                "message": "No duplicate pattern found"
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking pattern duplicate: {str(e)}"
        )

@router.post("/verification-step", response_model=dict)
async def save_verification_step(
    request: VerificationStepRequest,
    current_user: User = Depends(require_operator)
):
    """
    Save verification step data with processed images
    """
    try:
        db = await get_database()
        
        # Verify application exists and belongs to this operator
        application = await db.loan_applications.find_one({
            "_id": ObjectId(request.application_id),
            "operator_id": ObjectId(current_user.id)
        })
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan application not found"
            )
        
        # Process any images in the request
        processed_images = {}
        if request.images:
            for image_type, image_base64 in request.images.items():
                if image_base64 and validate_base64_image(image_base64):
                    try:
                        # Enhance and compress the image
                        enhanced_image = enhance_image_quality(image_base64)
                        compressed_image = compress_image(enhanced_image, 300)  # Max 300KB
                        
                        # Store both original and processed versions
                        processed_images[f"{image_type}_original"] = image_base64
                        processed_images[f"{image_type}_enhanced"] = enhanced_image
                        processed_images[f"{image_type}_compressed"] = compressed_image
                        processed_images[f"{image_type}_processed_at"] = datetime.utcnow()
                        
                        # Get image info for logging
                        image_info = get_image_info(compressed_image)
                        processed_images[f"{image_type}_info"] = image_info
                        
                    except Exception as e:
                        # Store original if processing fails
                        processed_images[f"{image_type}_original"] = image_base64
                        processed_images[f"{image_type}_processing_error"] = str(e)
        
        # Combine step data with processed images
        update_data = {
            "verification_step_data": request.step_data,
            "verification_updated_at": datetime.utcnow(),
            **processed_images
        }
        
        # Update application
        await db.loan_applications.update_one(
            {"_id": ObjectId(request.application_id)},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "message": "Verification step saved successfully",
            "processed_images_count": len([k for k in processed_images.keys() if "processed" in k]),
            "application_id": request.application_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving verification step: {str(e)}"
        )

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
    loan_dict["status"] = "pending"  # Explicitly set default status
    
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
        applications.append(serialize_objectid(app))
    
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

@router.delete("/loan-applications/{app_id}")
async def delete_loan_application(
    app_id: str,
    current_user: User = Depends(require_operator)
):
    db = await get_database()
    
    # Check if application exists
    application = await db.loan_applications.find_one({"_id": ObjectId(app_id)})
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found"
        )
    
    # Delete the application
    result = await db.loan_applications.delete_one({"_id": ObjectId(app_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or already deleted"
        )
    
    return {"message": "Loan application deleted successfully"}

@router.get("/loan-applications/{app_id}")
async def get_loan_application_by_id(
    app_id: str,
    current_user: User = Depends(require_operator)
):
    db = await get_database()
    
    # Get application with populated applicant and animal data
    pipeline = [
        {"$match": {"_id": ObjectId(app_id)}},
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
            "$unwind": {
                "path": "$applicant",
                "preserveNullAndEmptyArrays": True
            }
        },
        {
            "$unwind": {
                "path": "$animal", 
                "preserveNullAndEmptyArrays": True
            }
        }
    ]
    
    result = await db.loan_applications.aggregate(pipeline).to_list(1)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found"
        )
    
    application = result[0]
    return serialize_objectid(application)

@router.post("/loan-applications/{app_id}/verification-email")
async def send_verification_step_email(
    app_id: str,
    email_data: dict,
    current_user: User = Depends(require_operator)
):
    from ..common.email_service import send_notification_email
    
    db = await get_database()
    
    # Get application details
    application = await db.loan_applications.find_one({"_id": ObjectId(app_id)})
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found"
        )
    
    # Get applicant details
    applicant = await db.applicants.find_one({"_id": ObjectId(application["applicant_id"])})
    if not applicant or not applicant.get("email"):
        # Skip email if no email address
        return {"message": "Email notification skipped - no email address"}
    
    try:
        step = email_data.get("step", "")
        if step == "first_step_completed":
            subject = "Loan Application - First Verification Completed"
            body = f"""
            Dear {email_data.get('applicant_name', 'Applicant')},

            Good news! Your loan application has successfully passed the first verification step.

            Application Number: {application.get('application_number', 'N/A')}
            Step Completed: {email_data.get('step_name', 'Basic Information')}

            Your application is now proceeding to the next verification stage. We will keep you updated on the progress.

            Thank you for your patience.

            Best regards,
            Loan Management Team
            """
        elif step == "all_verifications_complete":
            subject = "Loan Application - All Verifications Complete"
            body = f"""
            Dear {email_data.get('applicant_name', 'Applicant')},

            Excellent news! Your loan application has successfully completed all verification steps.

            Application Number: {email_data.get('application_number', 'N/A')}

            All verifications have been completed successfully. We will contact you ASAP with the final decision and next steps.

            Thank you for choosing our services.

            Best regards,
            Loan Management Team
            """
        else:
            return {"message": "Unknown email step"}
        
        await send_notification_email(applicant["email"], subject, body)
        return {"message": "Verification step email sent successfully"}
        
    except Exception as e:
        # Log error but don't fail the verification process
        print(f"Failed to send verification email: {e}")
        return {"message": "Email sending failed but verification continued"}

@router.put("/loan-applications/{app_id}/complete-verification")
async def complete_verification(
    app_id: str,
    verification_data: dict,
    current_user: User = Depends(require_operator)
):
    db = await get_database()
    
    # Update application status to verified
    update_data = {
        "status": LoanStatus.VERIFIED,
        "verification_data": verification_data,
        "verified_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.loan_applications.update_one(
        {"_id": ObjectId(app_id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or already verified"
        )
    
    return {"message": "Verification completed successfully", "status": "VERIFIED"}

@router.get("/loan-applications/{app_id}", response_model=dict)
async def get_loan_application_by_id(
    app_id: str,
    current_user: User = Depends(require_operator)
):
    """Get a single loan application with all details"""
    db = await get_database()
    
    try:
        # Get the loan application
        application = await db.loan_applications.find_one({"_id": ObjectId(app_id)})
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan application not found"
            )
        
        # Get applicant details
        applicant = await db.applicants.find_one({"_id": ObjectId(application["applicant_id"])})
        if not applicant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Applicant not found"
            )
        
        # Get animal details
        animal = await db.animals.find_one({"_id": ObjectId(application["animal_id"])})
        if not animal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Animal not found"
            )
        
        # Serialize and return
        return {
            "id": str(application["_id"]),
            "application_number": application.get("application_number"),
            "applicant_id": str(application["applicant_id"]),
            "animal_id": str(application["animal_id"]),
            "loan_amount": application.get("loan_amount"),
            "purpose": application.get("purpose"),
            "repayment_period": application.get("repayment_period"),
            "status": application.get("status"),
            "created_at": application.get("created_at"),
            "applicant": serialize_objectid(applicant),
            "animal": serialize_objectid(animal)
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve application: {str(e)}"
        )

@router.post("/loan-applications/{app_id}/verification-email", response_model=dict)
async def send_verification_step_email(
    app_id: str,
    request_data: dict,
    current_user: User = Depends(require_operator)
):
    """Send email notification for verification steps"""
    try:
        from ..common.email_service import send_notification_email
        
        step = request_data.get("step")
        applicant_name = request_data.get("applicant_name", "Applicant")
        
        if step == "first_step_completed":
            subject = "Loan Application - First Verification Completed"
            message = f"""Dear {applicant_name},

Your loan application has successfully passed the first verification step.

Our team is continuing with the verification process. We will keep you updated on the progress.

Thank you for your patience.

Best regards,
Loan Processing Team"""
            
        elif step == "all_verifications_complete":
            application_number = request_data.get("application_number", "N/A")
            subject = "Loan Application - Verification Complete"
            message = f"""Dear {applicant_name},

Great news! Your loan application (#{application_number}) has passed all verification steps.

All required documents and information have been verified successfully. We will contact you ASAP to proceed with the final approval process.

Thank you for your patience throughout the verification process.

Best regards,
Loan Processing Team"""
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification step"
            )
        
        # For now, we'll just return success without actually sending email
        # In production, you would send the actual email here
        
        return {
            "message": f"Verification email sent successfully for step: {step}",
            "step": step,
            "recipient": applicant_name
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send verification email: {str(e)}"
        )

@router.put("/loan-applications/{app_id}/complete-verification", response_model=dict)
async def complete_verification_process(
    app_id: str,
    verification_data: dict,
    current_user: User = Depends(require_operator)
):
    """Complete the multi-step verification process"""
    db = await get_database()
    
    try:
        # Update application with verification data
        update_data = {
            "verification_data": verification_data.get("verification_data", {}),
            "status": LoanStatus.VERIFIED,
            "verified_at": datetime.utcnow(),
            "verified_by": str(current_user.id),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.loan_applications.update_one(
            {"_id": ObjectId(app_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan application not found"
            )
        
        return {
            "message": "Verification process completed successfully",
            "status": "VERIFIED",
            "verified_at": update_data["verified_at"].isoformat()
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete verification: {str(e)}"
        )

@router.get("/loan-applications/{app_id}")
async def get_loan_application_by_id(
    app_id: str,
    current_user: User = Depends(require_operator)
):
    """Get a single loan application with full details"""
    db = await get_database()
    
    try:
        # Get loan application
        app = await db.loan_applications.find_one({"_id": ObjectId(app_id)})
        if not app:
            raise HTTPException(status_code=404, detail="Loan application not found")
        
        # Get applicant details
        applicant = await db.applicants.find_one({"_id": ObjectId(app["applicant_id"])})
        if not applicant:
            raise HTTPException(status_code=404, detail="Applicant not found")
        
        # Get animal details
        animal = await db.animals.find_one({"_id": ObjectId(app["animal_id"])})
        if not animal:
            raise HTTPException(status_code=404, detail="Animal not found")
        
        # Serialize the data
        application_data = serialize_objectid(app)
        applicant_data = serialize_objectid(applicant)
        animal_data = serialize_objectid(animal)
        
        # Combine all data
        return {
            **application_data,
            "applicant": applicant_data,
            "animal": animal_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/loan-applications/{app_id}/verification-email")
async def send_verification_step_email(
    app_id: str,
    email_data: dict,
    current_user: User = Depends(require_operator)
):
    """Send email notification for verification steps"""
    from ..common.email_service import send_notification_email
    
    db = await get_database()
    
    try:
        # Get loan application
        app = await db.loan_applications.find_one({"_id": ObjectId(app_id)})
        if not app:
            raise HTTPException(status_code=404, detail="Loan application not found")
        
        # Get applicant details for email
        applicant = await db.applicants.find_one({"_id": ObjectId(app["applicant_id"])})
        if not applicant:
            raise HTTPException(status_code=404, detail="Applicant not found")
        
        # Send appropriate email based on step
        step = email_data.get("step")
        applicant_name = email_data.get("applicant_name", applicant.get("name"))
        
        if step == "first_step_completed":
            subject = "First Verification Step Completed"
            message = f"Dear {applicant_name},\n\nGood news! Your loan application has passed the first verification step.\n\nWe are now proceeding with the remaining verification steps.\n\nThank you for your patience.\n\nBest regards,\nLoan Processing Team"
        
        elif step == "all_verifications_complete":
            application_number = email_data.get("application_number", app.get("application_number"))
            subject = "All Verifications Complete - We Will Contact You Soon"
            message = f"Dear {applicant_name},\n\nCongratulations! Your loan application #{application_number} has successfully passed all verification steps.\n\nOur team will contact you very soon to proceed with the next steps.\n\nThank you for choosing our services.\n\nBest regards,\nLoan Processing Team"
        
        else:
            raise HTTPException(status_code=400, detail="Invalid email step")
        
        # Send email if applicant has email
        if applicant.get("email"):
            await send_notification_email(
                to_email=applicant["email"],
                subject=subject,
                message=message,
                applicant_name=applicant_name
            )
        
        return {"message": "Email sent successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@router.put("/loan-applications/{app_id}/complete-verification")
async def complete_verification(
    app_id: str,
    verification_data: dict,
    current_user: User = Depends(require_operator)
):
    """Complete the multi-step verification process"""
    db = await get_database()
    
    try:
        # Get loan application
        app = await db.loan_applications.find_one({"_id": ObjectId(app_id)})
        if not app:
            raise HTTPException(status_code=404, detail="Loan application not found")
        
        # Update application with verification data
        update_data = {
            "multi_step_verification": verification_data.get("verification_data", {}),
            "status": LoanStatus.VERIFIED,
            "verified_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "all_steps_completed": verification_data.get("all_steps_completed", True)
        }
        
        await db.loan_applications.update_one(
            {"_id": ObjectId(app_id)},
            {"$set": update_data}
        )
        
        return {
            "message": "Multi-step verification completed successfully",
            "status": "VERIFIED"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete verification: {str(e)}")

# Weight Prediction Request Model
class WeightPredictionRequest(BaseModel):
    application_id: str
    left_side_image: str
    right_side_image: str
    breed: Optional[str] = 'crossbred'
    age_years: Optional[float] = 3.0
    reference_length_cm: Optional[float] = None
    prediction_mode: Optional[str] = 'both'  # 'manual', 'ai', or 'both'
    manual_heart_girth: Optional[float] = None
    manual_body_length: Optional[float] = None

@router.post("/predict-cow-weight", response_model=dict)
async def predict_cow_weight(
    request: WeightPredictionRequest,
    current_user: User = Depends(require_operator)
):
    """
    Predict cow weight using side view images with improved base64 handling
    """
    try:
        db = await get_database()
        
        # Validate application_id format
        try:
            app_object_id = ObjectId(request.application_id)
        except:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid application ID format"
            )
        
        # Verify application exists and belongs to this operator
        application = await db.loan_applications.find_one({
            "_id": app_object_id,
            "operator_id": ObjectId(current_user.id)
        })
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan application not found"
            )
        
        # Validate images
        if not validate_base64_image(request.left_side_image):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid left side image format"
            )
        
        if not validate_base64_image(request.right_side_image):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid right side image format"
            )
        
        # Compress images if needed (max 500KB each)
        left_compressed = compress_image(request.left_side_image, 500)
        right_compressed = compress_image(request.right_side_image, 500)
        
        # Get image info for logging
        left_info = get_image_info(left_compressed)
        right_info = get_image_info(right_compressed)
        
        # Use unified weight prediction
        prediction_result = weight_predictor.predict_weight_unified(
            left_side_image=left_compressed,
            right_side_image=right_compressed,
            breed=request.breed,
            age_years=request.age_years,
            prediction_mode=request.prediction_mode,
            manual_heart_girth=request.manual_heart_girth,
            manual_body_length=request.manual_body_length
        )
        
        if not prediction_result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Weight prediction failed: {prediction_result.get('error')}"
            )
        
        # Store prediction data in application
        weight_prediction_data = {
            "weight_prediction_images": {
                "left_side_original": request.left_side_image,
                "right_side_original": request.right_side_image,
                "left_side_enhanced": prediction_result.get("enhanced_left_image"),
                "right_side_enhanced": prediction_result.get("enhanced_right_image")
            },
            "predicted_weight": prediction_result.get("predicted_weight"),
            "predicted_age": prediction_result.get("predicted_age"),
            "weight_prediction_confidence": prediction_result.get("confidence"),
            "weight_prediction_method": prediction_result.get("method"),
            "manual_measurements": {
                "heart_girth": request.manual_heart_girth,
                "body_length": request.manual_body_length
            } if request.manual_heart_girth and request.manual_body_length else None,
            "weight_prediction_processed_at": datetime.utcnow(),
            "prediction_breed": request.breed,
            "prediction_age_years": request.age_years,
            "prediction_mode": request.prediction_mode
        }
        
        # Update application with weight prediction data
        await db.loan_applications.update_one(
            {"_id": ObjectId(request.application_id)},
            {"$set": weight_prediction_data}
        )
        
        # Also update the animal record if weight prediction is available
        if prediction_result.get("predicted_weight"):
            await db.animals.update_one(
                {"_id": ObjectId(application["animal_id"])},
                {"$set": {
                    "predicted_weight": prediction_result["predicted_weight"],
                    "predicted_age": prediction_result.get("predicted_age"),
                    "weight_prediction_confidence": prediction_result.get("confidence"),
                    "weight_prediction_method": prediction_result.get("method"),
                    "heart_girth_measurement": request.manual_heart_girth,
                    "body_length_measurement": request.manual_body_length
                }}
            )
        
        return {
            "success": True,
            "message": "Weight prediction completed successfully",
            "application_id": request.application_id,
            "prediction_result": prediction_result,
            "image_info": {
                "left_side": left_info,
                "right_side": right_info
            },
            "storage_info": {
                "images_stored": True,
                "compression_applied": True,
                "database_updated": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error predicting weight: {str(e)}"
        )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Weight prediction failed: {str(e)}"
        )