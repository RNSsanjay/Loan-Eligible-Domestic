import cv2
import numpy as np
import base64
from PIL import Image, ImageEnhance, ImageFilter
from io import BytesIO
import os
import hashlib
from typing import Tuple, Optional, Dict, List
import json

class CowNosePatternProcessor:
    def __init__(self):
        self.pattern_threshold = 0.85  # Similarity threshold for pattern matching
        
    def process_cow_face_with_manual_zoom(self, base64_image: str, zoom_coordinates: Dict) -> Dict:
        """
        Process cow face image with manual nose zoom coordinates
        """
        try:
            # Decode base64 image
            image_data = base64.b64decode(base64_image.split(',')[1] if ',' in base64_image else base64_image)
            
            # Convert to PIL Image
            pil_image = Image.open(BytesIO(image_data))
            
            # Convert to RGB if needed
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            # Convert to OpenCV format
            cv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            
            # Extract nose area based on manual coordinates
            nose_area = self._extract_nose_area(cv_image, zoom_coordinates)
            
            if nose_area is None:
                return {
                    "success": False,
                    "error": "Invalid zoom coordinates provided"
                }
            
            # Enhance nose image quality
            enhanced_nose = self._enhance_nose_quality(nose_area)
            
            # Extract nose pattern features
            pattern_features = self._extract_nose_pattern(enhanced_nose)
            
            # Generate unique pattern hash
            pattern_hash = self._generate_pattern_hash(pattern_features)
            
            # Convert images to base64
            enhanced_face = self._enhance_image_quality(pil_image)
            face_base64 = self._cv_to_base64(cv_image)
            nose_base64 = self._cv_to_base64(enhanced_nose)
            enhanced_face_base64 = self._pil_to_base64(enhanced_face)
            
            return {
                "success": True,
                "original_face_base64": base64_image,
                "enhanced_face_base64": enhanced_face_base64,
                "nose_area_base64": nose_base64,
                "zoom_coordinates": zoom_coordinates,
                "pattern_features": pattern_features.tolist() if isinstance(pattern_features, np.ndarray) else pattern_features,
                "pattern_hash": pattern_hash,
                "pattern_confidence": self._calculate_pattern_confidence(enhanced_nose),
                "processing_notes": "Nose pattern extracted and analyzed successfully"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "original_face_base64": base64_image
            }
    
    def _extract_nose_area(self, cv_image: np.ndarray, zoom_coords: Dict) -> Optional[np.ndarray]:
        """
        Extract nose area from cow face based on manual zoom coordinates
        """
        try:
            x = int(zoom_coords.get('x', 0))
            y = int(zoom_coords.get('y', 0))
            width = int(zoom_coords.get('width', 100))
            height = int(zoom_coords.get('height', 100))
            
            # Validate coordinates
            img_height, img_width = cv_image.shape[:2]
            if x < 0 or y < 0 or x + width > img_width or y + height > img_height:
                return None
            
            # Extract nose area
            nose_area = cv_image[y:y+height, x:x+width]
            
            # Resize to standard size for consistent pattern analysis
            nose_area = cv2.resize(nose_area, (300, 300), interpolation=cv2.INTER_CUBIC)
            
            return nose_area
            
        except Exception:
            return None
    
    def _enhance_nose_quality(self, nose_area: np.ndarray) -> np.ndarray:
        """
        Enhance nose image quality for better pattern recognition
        """
        # Convert to PIL for better enhancement
        nose_pil = Image.fromarray(cv2.cvtColor(nose_area, cv2.COLOR_BGR2RGB))
        
        # High-resolution resize
        nose_pil = nose_pil.resize((600, 600), Image.Resampling.LANCZOS)
        
        # Enhance sharpness significantly
        enhancer = ImageEnhance.Sharpness(nose_pil)
        nose_pil = enhancer.enhance(2.5)
        
        # Enhance contrast for pattern definition
        enhancer = ImageEnhance.Contrast(nose_pil)
        nose_pil = enhancer.enhance(1.8)
        
        # Fine-tune brightness
        enhancer = ImageEnhance.Brightness(nose_pil)
        nose_pil = enhancer.enhance(1.2)
        
        # Apply aggressive unsharp mask
        nose_pil = nose_pil.filter(ImageFilter.UnsharpMask(radius=4, percent=300, threshold=1))
        
        # Apply detail enhancement
        nose_pil = nose_pil.filter(ImageFilter.DETAIL)
        nose_pil = nose_pil.filter(ImageFilter.EDGE_ENHANCE_MORE)
        
        # Convert back to OpenCV
        enhanced_nose = cv2.cvtColor(np.array(nose_pil), cv2.COLOR_RGB2BGR)
        
        return enhanced_nose
    
    def _extract_nose_pattern(self, enhanced_nose: np.ndarray) -> np.ndarray:
        """
        Extract unique pattern features from cow nose
        """
        # Convert to grayscale
        gray = cv2.cvtColor(enhanced_nose, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)
        
        # Edge detection with multiple methods for comprehensive pattern capture
        edges_canny = cv2.Canny(blurred, 30, 100)
        
        # Morphological operations to enhance pattern lines
        kernel = np.ones((2, 2), np.uint8)
        edges_morph = cv2.morphologyEx(edges_canny, cv2.MORPH_CLOSE, kernel)
        
        # Find contours for pattern analysis
        contours, _ = cv2.findContours(edges_morph, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Create pattern feature vector
        pattern_features = []
        
        # 1. Contour-based features
        if contours:
            # Number of contours
            pattern_features.append(len(contours))
            
            # Area statistics
            areas = [cv2.contourArea(c) for c in contours if cv2.contourArea(c) > 50]
            if areas:
                pattern_features.extend([
                    np.mean(areas),
                    np.std(areas),
                    max(areas),
                    min(areas)
                ])
            else:
                pattern_features.extend([0, 0, 0, 0])
            
            # Perimeter statistics
            perimeters = [cv2.arcLength(c, True) for c in contours if cv2.contourArea(c) > 50]
            if perimeters:
                pattern_features.extend([
                    np.mean(perimeters),
                    np.std(perimeters)
                ])
            else:
                pattern_features.extend([0, 0])
        else:
            pattern_features.extend([0, 0, 0, 0, 0, 0, 0])
        
        # 2. Texture features using Local Binary Patterns simulation
        texture_features = self._extract_texture_features(gray)
        pattern_features.extend(texture_features)
        
        # 3. Gradient features
        gradient_features = self._extract_gradient_features(gray)
        pattern_features.extend(gradient_features)
        
        # 4. Line pattern features
        line_features = self._extract_line_features(edges_morph)
        pattern_features.extend(line_features)
        
        return np.array(pattern_features)
    
    def _extract_texture_features(self, gray_image: np.ndarray) -> List[float]:
        """
        Extract texture features from nose image
        """
        # Calculate image moments
        moments = cv2.moments(gray_image)
        
        features = []
        
        # Hu moments (scale, rotation, translation invariant)
        hu_moments = cv2.HuMoments(moments)
        features.extend(hu_moments.flatten())
        
        # Statistical features
        features.append(np.mean(gray_image))
        features.append(np.std(gray_image))
        features.append(np.var(gray_image))
        features.append(float(np.median(gray_image)))
        
        return features
    
    def _extract_gradient_features(self, gray_image: np.ndarray) -> List[float]:
        """
        Extract gradient-based features
        """
        # Sobel gradients
        grad_x = cv2.Sobel(gray_image, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray_image, cv2.CV_64F, 0, 1, ksize=3)
        
        # Gradient magnitude and direction
        magnitude = np.sqrt(grad_x**2 + grad_y**2)
        direction = np.arctan2(grad_y, grad_x)
        
        features = [
            np.mean(magnitude),
            np.std(magnitude),
            np.mean(direction),
            np.std(direction)
        ]
        
        return features
    
    def _extract_line_features(self, edge_image: np.ndarray) -> List[float]:
        """
        Extract line pattern features using Hough transform
        """
        # Hough line detection
        lines = cv2.HoughLines(edge_image, 1, np.pi/180, threshold=50)
        
        features = []
        
        if lines is not None:
            # Number of lines
            features.append(len(lines))
            
            # Line angle statistics
            angles = [line[0][1] for line in lines]
            features.append(np.mean(angles))
            features.append(np.std(angles))
            
            # Line distance statistics
            distances = [line[0][0] for line in lines]
            features.append(np.mean(distances))
            features.append(np.std(distances))
        else:
            features.extend([0, 0, 0, 0, 0])
        
        return features
    
    def _generate_pattern_hash(self, pattern_features: np.ndarray) -> str:
        """
        Generate unique hash for nose pattern
        """
        # Normalize features for consistent hashing
        normalized_features = (pattern_features - np.mean(pattern_features)) / (np.std(pattern_features) + 1e-8)
        
        # Round to reduce minor variations
        rounded_features = np.round(normalized_features, 4)
        
        # Create hash
        pattern_string = ','.join(map(str, rounded_features))
        pattern_hash = hashlib.sha256(pattern_string.encode()).hexdigest()
        
        return pattern_hash
    
    def _calculate_pattern_confidence(self, nose_image: np.ndarray) -> float:
        """
        Calculate confidence score for pattern quality
        """
        # Convert to grayscale
        gray = cv2.cvtColor(nose_image, cv2.COLOR_BGR2GRAY)
        
        # Calculate image sharpness (Laplacian variance)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Calculate contrast
        contrast = gray.std()
        
        # Calculate edge density
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        # Combine metrics into confidence score (0-1)
        confidence = min(1.0, (laplacian_var / 1000 + contrast / 100 + edge_density * 10) / 3)
        
        return float(confidence)
    
    def compare_patterns(self, pattern1_features: List, pattern2_features: List) -> float:
        """
        Compare two nose patterns and return similarity score (0-1)
        """
        try:
            p1 = np.array(pattern1_features)
            p2 = np.array(pattern2_features)
            
            # Ensure same dimensions
            if len(p1) != len(p2):
                return 0.0
            
            # Calculate cosine similarity
            dot_product = np.dot(p1, p2)
            norms = np.linalg.norm(p1) * np.linalg.norm(p2)
            
            if norms == 0:
                return 0.0
            
            similarity = dot_product / norms
            return float(abs(similarity))
            
        except Exception:
            return 0.0
    
    def _enhance_image_quality(self, pil_image: Image.Image) -> Image.Image:
        """
        General image enhancement for better quality
        """
        # Resize if too small
        width, height = pil_image.size
        if width < 1200 or height < 900:
            scale_factor = max(1200/width, 900/height)
            new_width = int(width * scale_factor)
            new_height = int(height * scale_factor)
            pil_image = pil_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(pil_image)
        pil_image = enhancer.enhance(1.5)
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(pil_image)
        pil_image = enhancer.enhance(1.3)
        
        # Enhance brightness slightly
        enhancer = ImageEnhance.Brightness(pil_image)
        pil_image = enhancer.enhance(1.1)
        
        # Apply unsharp mask
        pil_image = pil_image.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
        
        return pil_image
    
    def _pil_to_base64(self, pil_image: Image.Image) -> str:
        """
        Convert PIL image to base64 string
        """
        buffer = BytesIO()
        pil_image.save(buffer, format='JPEG', quality=95, optimize=True)
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/jpeg;base64,{img_str}"
    
    def _cv_to_base64(self, cv_image: np.ndarray) -> str:
        """
        Convert OpenCV image to base64 string
        """
        _, buffer = cv2.imencode('.jpg', cv_image, [cv2.IMWRITE_JPEG_QUALITY, 95])
        img_str = base64.b64encode(buffer).decode()
        return f"data:image/jpeg;base64,{img_str}"

# Global instance
cow_nose_processor = CowNosePatternProcessor()