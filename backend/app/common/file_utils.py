import os
import uuid
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from PIL import Image
import shutil
from pathlib import Path

# Configuration
UPLOAD_DIR = Path("uploads")
PROFILE_DIR = UPLOAD_DIR / "profiles"
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_IMAGE_SIZE = (800, 800)  # Max dimensions

# Ensure upload directories exist
UPLOAD_DIR.mkdir(exist_ok=True)
PROFILE_DIR.mkdir(exist_ok=True)

def validate_image_file(file: UploadFile) -> None:
    """Validate uploaded image file"""
    # Check file size
    if hasattr(file, 'size') and file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE // 1024 // 1024}MB"
        )
    
    # Check file extension
    if file.filename:
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided"
        )

def save_profile_image(file: UploadFile, user_id: str) -> str:
    """Save and process profile image"""
    try:
        validate_image_file(file)
        
        # Generate unique filename
        file_ext = Path(file.filename).suffix.lower()
        unique_filename = f"{user_id}_{uuid.uuid4().hex}{file_ext}"
        file_path = PROFILE_DIR / unique_filename
        
        # Save the file temporarily
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process image with PIL
        try:
            with Image.open(file_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if necessary
                img.thumbnail(MAX_IMAGE_SIZE, Image.Resampling.LANCZOS)
                
                # Save optimized image
                optimized_path = PROFILE_DIR / f"opt_{unique_filename}"
                img.save(optimized_path, optimize=True, quality=85)
                
                # Remove original and rename optimized
                os.remove(file_path)
                os.rename(optimized_path, file_path)
        
        except Exception as e:
            # Clean up on error
            if file_path.exists():
                os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error processing image: {str(e)}"
            )
        
        # Return relative path for storage in database
        return f"profiles/{unique_filename}"
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}"
        )

def delete_profile_image(image_path: Optional[str]) -> None:
    """Delete profile image file"""
    if not image_path:
        return
        
    try:
        full_path = UPLOAD_DIR / image_path
        if full_path.exists():
            os.remove(full_path)
    except Exception:
        # Ignore errors when deleting files
        pass

def get_image_url(image_path: Optional[str], base_url: str = "") -> Optional[str]:
    """Get full URL for image"""
    if not image_path:
        return None
    return f"{base_url}/uploads/{image_path}"