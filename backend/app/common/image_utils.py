"""
Image utilities for base64 handling and processing
"""
import base64
import io
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from typing import Optional, Tuple, Dict
import hashlib
import re

def validate_base64_image(base64_string: str) -> bool:
    """
    Validate if the base64 string is a valid image
    """
    try:
        if not base64_string:
            return False
            
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
            
        # Decode and validate
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        image.verify()
        return True
    except Exception:
        return False

def base64_to_pil(base64_string: str) -> Optional[Image.Image]:
    """
    Convert base64 string to PIL Image
    """
    try:
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        return image
    except Exception:
        return None

def pil_to_base64(image: Image.Image, format: str = 'JPEG', quality: int = 85) -> str:
    """
    Convert PIL Image to base64 string
    """
    buffer = io.BytesIO()
    
    # Convert to RGB if needed for JPEG
    if format.upper() == 'JPEG' and image.mode != 'RGB':
        image = image.convert('RGB')
    
    image.save(buffer, format=format, quality=quality)
    
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/{format.lower()};base64,{img_str}"

def base64_to_cv2(base64_string: str) -> Optional[np.ndarray]:
    """
    Convert base64 string to OpenCV image array
    """
    pil_image = base64_to_pil(base64_string)
    if pil_image is None:
        return None
    
    return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

def cv2_to_base64(cv_image: np.ndarray, format: str = 'JPEG', quality: int = 85) -> str:
    """
    Convert OpenCV image array to base64 string
    """
    # Convert BGR to RGB
    rgb_image = cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(rgb_image)
    return pil_to_base64(pil_image, format, quality)

def enhance_image_quality(base64_string: str) -> str:
    """
    Enhance image quality (contrast, sharpness, brightness)
    """
    pil_image = base64_to_pil(base64_string)
    if pil_image is None:
        return base64_string
    
    # Enhance contrast
    enhancer = ImageEnhance.Contrast(pil_image)
    enhanced = enhancer.enhance(1.2)
    
    # Enhance sharpness
    enhancer = ImageEnhance.Sharpness(enhanced)
    enhanced = enhancer.enhance(1.1)
    
    # Enhance brightness slightly
    enhancer = ImageEnhance.Brightness(enhanced)
    enhanced = enhancer.enhance(1.05)
    
    return pil_to_base64(enhanced)

def resize_image(base64_string: str, max_width: int = 1024, max_height: int = 1024) -> str:
    """
    Resize image while maintaining aspect ratio
    """
    pil_image = base64_to_pil(base64_string)
    if pil_image is None:
        return base64_string
    
    # Calculate new size maintaining aspect ratio
    width, height = pil_image.size
    aspect_ratio = width / height
    
    if width > max_width or height > max_height:
        if aspect_ratio > 1:  # Landscape
            new_width = min(width, max_width)
            new_height = int(new_width / aspect_ratio)
        else:  # Portrait
            new_height = min(height, max_height)
            new_width = int(new_height * aspect_ratio)
        
        pil_image = pil_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    return pil_to_base64(pil_image)

def crop_image_region(base64_string: str, x: int, y: int, width: int, height: int) -> str:
    """
    Crop a specific region from the image
    """
    pil_image = base64_to_pil(base64_string)
    if pil_image is None:
        return base64_string
    
    # Validate crop coordinates
    img_width, img_height = pil_image.size
    x = max(0, min(x, img_width))
    y = max(0, min(y, img_height))
    width = min(width, img_width - x)
    height = min(height, img_height - y)
    
    if width <= 0 or height <= 0:
        return base64_string
    
    cropped = pil_image.crop((x, y, x + width, y + height))
    return pil_to_base64(cropped)

def generate_image_hash(base64_string: str) -> str:
    """
    Generate a hash for image deduplication
    """
    try:
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Create hash from base64 content
        return hashlib.md5(base64_string.encode()).hexdigest()
    except Exception:
        return ""

def compress_image(base64_string: str, target_size_kb: int = 500) -> str:
    """
    Compress image to target size in KB
    """
    pil_image = base64_to_pil(base64_string)
    if pil_image is None:
        return base64_string
    
    # Start with quality 85 and reduce if needed
    for quality in range(85, 20, -5):
        compressed = pil_to_base64(pil_image, quality=quality)
        
        # Calculate size in KB
        size_kb = len(compressed) * 3 / 4 / 1024  # Base64 to bytes conversion
        
        if size_kb <= target_size_kb:
            return compressed
    
    # If still too large, resize the image
    max_size = 800
    while max_size > 200:
        resized_image = pil_image.resize(
            (min(pil_image.width, max_size), min(pil_image.height, max_size)), 
            Image.Resampling.LANCZOS
        )
        compressed = pil_to_base64(resized_image, quality=70)
        size_kb = len(compressed) * 3 / 4 / 1024
        
        if size_kb <= target_size_kb:
            return compressed
        
        max_size -= 100
    
    return pil_to_base64(pil_image, quality=50)

def get_image_info(base64_string: str) -> Dict:
    """
    Get image metadata (size, format, etc.)
    """
    pil_image = base64_to_pil(base64_string)
    if pil_image is None:
        return {}
    
    # Calculate file size in KB
    size_kb = len(base64_string) * 3 / 4 / 1024
    
    return {
        "width": pil_image.width,
        "height": pil_image.height,
        "mode": pil_image.mode,
        "format": pil_image.format or "Unknown",
        "size_kb": round(size_kb, 2),
        "aspect_ratio": round(pil_image.width / pil_image.height, 2)
    }

def apply_image_filters(base64_string: str, filters: list = None) -> str:
    """
    Apply various filters to enhance image for analysis
    """
    if not filters:
        filters = ['enhance_contrast', 'sharpen']
    
    pil_image = base64_to_pil(base64_string)
    if pil_image is None:
        return base64_string
    
    for filter_name in filters:
        if filter_name == 'enhance_contrast':
            enhancer = ImageEnhance.Contrast(pil_image)
            pil_image = enhancer.enhance(1.3)
        elif filter_name == 'sharpen':
            pil_image = pil_image.filter(ImageFilter.SHARPEN)
        elif filter_name == 'smooth':
            pil_image = pil_image.filter(ImageFilter.SMOOTH)
        elif filter_name == 'edge_enhance':
            pil_image = pil_image.filter(ImageFilter.EDGE_ENHANCE)
    
    return pil_to_base64(pil_image)