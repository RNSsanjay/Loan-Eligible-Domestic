from pydantic import BaseModel, Field, EmailStr, ConfigDict, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler):
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                str, return_schema=core_schema.str_schema(), when_used='json'
            ),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler) -> JsonSchemaValue:
        return {"type": "string"}

class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    OPERATOR = "operator"

class LoanStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    APPROVED = "approved"
    REJECTED = "rejected"

class AnimalType(str, Enum):
    COW = "cow"
    GOAT = "goat"
    HEN = "hen"

# User Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: str
    role: UserRole
    is_active: bool = True
    profile_image: Optional[str] = None  # File path (legacy)
    profile_image_base64: Optional[str] = None  # Base64 encoded image

class UserCreate(UserBase):
    password: Optional[str] = None
    created_by: Optional[PyObjectId] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None  # File path (legacy)
    profile_image_base64: Optional[str] = None  # Base64 encoded image
    is_active: Optional[bool] = None

class User(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    password_hash: Optional[str] = None
    created_by: Optional[PyObjectId] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    first_login: bool = True

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

# Family Member Model
class FamilyMember(BaseModel):
    name: str
    relationship: str
    age: int
    occupation: str

# Applicant Models
class ApplicantBase(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    address: str
    aadhar_number: str
    pan_number: Optional[str] = None
    bank_account_number: str
    bank_name: str
    ifsc_code: str
    annual_income: float
    family_members: List[FamilyMember] = []

class ApplicantCreate(ApplicantBase):
    pass

class Applicant(ApplicantBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

# Animal Models
class AnimalBase(BaseModel):
    type: AnimalType
    breed: str
    age: int
    weight: float
    health_status: str
    vaccination_status: str
    market_value: float
    # Image fields for base64 storage
    front_image_base64: Optional[str] = None
    side_image_base64: Optional[str] = None
    back_image_base64: Optional[str] = None
    
class AnimalCreate(AnimalBase):
    pass

class Animal(AnimalBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # Weight prediction data
    predicted_weight: Optional[float] = None
    weight_prediction_confidence: Optional[float] = None
    weight_prediction_method: Optional[str] = None  # 'manual', 'ai', 'visual'
    heart_girth_measurement: Optional[float] = None
    body_length_measurement: Optional[float] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

# Verification Checklist
class VerificationItem(BaseModel):
    item: str
    status: bool
    notes: Optional[str] = None

class VerificationChecklist(BaseModel):
    items: List[VerificationItem] = []
    overall_status: bool = False

# Loan Application Models
class LoanApplicationBase(BaseModel):
    applicant_id: PyObjectId
    animal_id: PyObjectId
    loan_amount: float
    purpose: str
    repayment_period: int  # in months

class LoanApplicationCreate(LoanApplicationBase):
    pass

class LoanApplication(LoanApplicationBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    application_number: str
    status: LoanStatus = LoanStatus.PENDING
    verification_checklist: Optional[VerificationChecklist] = None
    operator_id: PyObjectId
    manager_id: Optional[PyObjectId] = None
    verified_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Cow face and nose images (base64)
    cow_face_original: Optional[str] = None
    cow_face_enhanced: Optional[str] = None
    cow_nose_area: Optional[str] = None
    cow_nose_zoomed: Optional[str] = None
    nose_zoom_coordinates: Optional[dict] = None
    nose_pattern_features: Optional[List[float]] = None
    nose_pattern_hash: Optional[str] = None
    nose_pattern_confidence: Optional[float] = None
    nose_pattern_processed_at: Optional[datetime] = None
    is_duplicate_pattern: Optional[bool] = None
    duplicate_application_id: Optional[str] = None
    
    # Weight prediction data
    weight_prediction_images: Optional[dict] = None  # {'left_side': base64, 'right_side': base64}
    predicted_weight: Optional[float] = None
    weight_prediction_confidence: Optional[float] = None
    weight_prediction_method: Optional[str] = None
    manual_measurements: Optional[dict] = None  # {'heart_girth': float, 'body_length': float}
    weight_prediction_processed_at: Optional[datetime] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None