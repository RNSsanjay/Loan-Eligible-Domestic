"""
Advanced Cow Nose Pattern Recognition and Processing Module

This module provides sophisticated image processing capabilities for cow nose pattern recognition,
including manual nose area selection, pattern extraction, quality enhancement, and duplicate detection.
"""

import cv2
import numpy as np
import base64
import hashlib
import json
from PIL import Image, ImageEnhance, ImageFilter
from io import BytesIO
from typing import Tuple, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class CowNosePatternProcessor:
    """
    Advanced processor for cow nose pattern recognition and verification.
    
    Features:
    - Manual nose area selection support
    - AI-powered pattern enhancement
    - Unique pattern hash generation
    - Duplicate pattern detection
    - Quality assessment and improvement
    """
    
    def __init__(self):
        self.min_image_size = (800, 600)
        self.target_nose_size = (400, 400)
        self.quality_threshold = 0.7
        
    def process_cow_face_image(self, base64_image: str, zoom_coordinates: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Process cow face image with optional manual nose area selection.
        
        Args:
            base64_image: Base64 encoded cow face image
            zoom_coordinates: Optional manual zoom coordinates {x, y, width, height}
            
        Returns:
            Dictionary containing processed data, pattern hash, and quality metrics
        """
        try:
            # Decode base64 image
            image_data = base64.b64decode(base64_image.split(',')[1] if ',' in base64_image else base64_image)
            image = Image.open(BytesIO(image_data))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to OpenCV format
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Extract nose area
            if zoom_coordinates:
                nose_image = self._extract_manual_nose_area(cv_image, zoom_coordinates)
            else:
                nose_image = self._auto_detect_nose_area(cv_image)
            
            if nose_image is None:
                return {
                    'success': False,
                    'error': 'Could not extract nose area from image',
                    'original_face_base64': base64_image
                }
            
            # Enhance nose image quality
            enhanced_nose = self._enhance_nose_image(nose_image)
            
            # Extract pattern features
            pattern_data = self._extract_nose_pattern(enhanced_nose)
            
            # Generate unique pattern hash
            pattern_hash = self._generate_pattern_hash(pattern_data)
            
            # Assess quality
            quality_score = self._assess_pattern_quality(enhanced_nose, pattern_data)
            
            # Convert processed images to base64
            enhanced_nose_base64 = self._cv_image_to_base64(enhanced_nose)
            
            return {
                'success': True,
                'original_face_base64': base64_image,
                'enhanced_nose_base64': enhanced_nose_base64,
                'pattern_hash': pattern_hash,
                'pattern_data': pattern_data,
                'quality_score': quality_score,
                'nose_coordinates': zoom_coordinates,
                'processing_metadata': {
                    'original_size': image.size,
                    'nose_size': enhanced_nose.shape[:2],
                    'enhancement_applied': True,
                    'pattern_features_count': len(pattern_data.get('keypoints', []))
                }
            }
            
        except Exception as e:
            logger.error(f"Error processing cow face image: {str(e)}")
            return {
                'success': False,
                'error': f'Image processing failed: {str(e)}',
                'original_face_base64': base64_image
            }
    
    def _extract_manual_nose_area(self, cv_image: np.ndarray, coordinates: Dict) -> np.ndarray:
        """Extract nose area using manual coordinates."""
        try:
            x = int(coordinates['x'])
            y = int(coordinates['y'])
            width = int(coordinates['width'])
            height = int(coordinates['height'])
            
            # Ensure coordinates are within image bounds
            h, w = cv_image.shape[:2]
            x = max(0, min(x, w - 1))
            y = max(0, min(y, h - 1))
            width = min(width, w - x)
            height = min(height, h - y)
            
            # Extract nose region
            nose_region = cv_image[y:y+height, x:x+width]
            
            # Resize to target size for consistency
            nose_region = cv2.resize(nose_region, self.target_nose_size, interpolation=cv2.INTER_CUBIC)
            
            return nose_region
            
        except Exception as e:
            logger.error(f"Error extracting manual nose area: {str(e)}")
            return None
    
    def _auto_detect_nose_area(self, cv_image: np.ndarray) -> np.ndarray:
        """Automatically detect and extract nose area using image processing."""
        try:
            # Convert to grayscale for detection
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Use adaptive thresholding to find potential nose features
            thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)
            
            # Find contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if not contours:
                # Fallback: use center region as nose area
                h, w = cv_image.shape[:2]
                center_x, center_y = w // 2, h // 2
                nose_size = min(w, h) // 3
                x1 = max(0, center_x - nose_size // 2)
                y1 = max(0, center_y - nose_size // 2)
                x2 = min(w, x1 + nose_size)
                y2 = min(h, y1 + nose_size)
                nose_region = cv_image[y1:y2, x1:x2]
            else:
                # Find the largest contour (likely to be the main facial feature)
                largest_contour = max(contours, key=cv2.contourArea)
                x, y, w, h = cv2.boundingRect(largest_contour)
                
                # Expand the bounding box slightly for better nose capture
                padding = 20
                x = max(0, x - padding)
                y = max(0, y - padding)
                w = min(cv_image.shape[1] - x, w + 2 * padding)
                h = min(cv_image.shape[0] - y, h + 2 * padding)
                
                nose_region = cv_image[y:y+h, x:x+w]
            
            # Resize to target size
            nose_region = cv2.resize(nose_region, self.target_nose_size, interpolation=cv2.INTER_CUBIC)
            
            return nose_region
            
        except Exception as e:
            logger.error(f"Error in auto nose detection: {str(e)}")
            return None
    
    def _enhance_nose_image(self, nose_image: np.ndarray) -> np.ndarray:
        """Enhance nose image quality using various filters and techniques."""
        try:
            # Convert to PIL for enhancement
            pil_image = Image.fromarray(cv2.cvtColor(nose_image, cv2.COLOR_BGR2RGB))
            
            # Enhance contrast
            enhancer = ImageEnhance.Contrast(pil_image)
            enhanced = enhancer.enhance(1.3)
            
            # Enhance sharpness
            enhancer = ImageEnhance.Sharpness(enhanced)
            enhanced = enhancer.enhance(1.2)
            
            # Apply unsharp mask filter
            enhanced = enhanced.filter(ImageFilter.UnsharpMask(radius=1, percent=150, threshold=3))
            
            # Convert back to OpenCV format
            enhanced_cv = cv2.cvtColor(np.array(enhanced), cv2.COLOR_RGB2BGR)
            
            # Apply bilateral filter to reduce noise while preserving edges
            enhanced_cv = cv2.bilateralFilter(enhanced_cv, 9, 75, 75)
            
            # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
            lab = cv2.cvtColor(enhanced_cv, cv2.COLOR_BGR2LAB)
            l_channel, a_channel, b_channel = cv2.split(lab)
            
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l_channel = clahe.apply(l_channel)
            
            enhanced_cv = cv2.merge([l_channel, a_channel, b_channel])
            enhanced_cv = cv2.cvtColor(enhanced_cv, cv2.COLOR_LAB2BGR)
            
            return enhanced_cv
            
        except Exception as e:
            logger.error(f"Error enhancing nose image: {str(e)}")
            return nose_image
    
    def _extract_nose_pattern(self, nose_image: np.ndarray) -> Dict[str, Any]:
        """Extract unique pattern features from the nose image."""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(nose_image, cv2.COLOR_BGR2GRAY)
            
            # Initialize feature detectors
            orb = cv2.ORB_create(nfeatures=500)
            sift = cv2.SIFT_create()
            
            # Extract ORB features (good for pattern matching)
            orb_keypoints, orb_descriptors = orb.detectAndCompute(gray, None)
            
            # Extract SIFT features (scale-invariant)
            sift_keypoints, sift_descriptors = sift.detectAndCompute(gray, None)
            
            # Extract texture features using Local Binary Patterns
            lbp_histogram = self._compute_lbp_histogram(gray)
            
            # Extract edge patterns
            edges = cv2.Canny(gray, 50, 150)
            edge_histogram = cv2.calcHist([edges], [0], None, [256], [0, 256]).flatten()
            
            # Compute image moments for shape analysis
            moments = cv2.moments(gray)
            
            # Normalize descriptors for consistency
            orb_desc_norm = orb_descriptors.astype(np.float32) if orb_descriptors is not None else np.array([])
            sift_desc_norm = sift_descriptors.astype(np.float32) if sift_descriptors is not None else np.array([])
            
            return {
                'orb_keypoints': [[kp.pt[0], kp.pt[1], kp.angle, kp.response] for kp in orb_keypoints] if orb_keypoints else [],
                'orb_descriptors': orb_desc_norm.tolist() if orb_desc_norm.size > 0 else [],
                'sift_keypoints': [[kp.pt[0], kp.pt[1], kp.angle, kp.response] for kp in sift_keypoints] if sift_keypoints else [],
                'sift_descriptors': sift_desc_norm.tolist() if sift_desc_norm.size > 0 else [],
                'lbp_histogram': lbp_histogram.tolist(),
                'edge_histogram': edge_histogram.tolist(),
                'moments': {k: v for k, v in moments.items() if not np.isnan(v)},
                'image_stats': {
                    'mean': float(np.mean(gray)),
                    'std': float(np.std(gray)),
                    'median': float(np.median(gray))
                }
            }
            
        except Exception as e:
            logger.error(f"Error extracting nose pattern: {str(e)}")
            return {}
    
    def _compute_lbp_histogram(self, gray_image: np.ndarray, radius: int = 3, n_points: int = 24) -> np.ndarray:
        """Compute Local Binary Pattern histogram for texture analysis."""
        try:
            height, width = gray_image.shape
            lbp_image = np.zeros((height, width), dtype=np.uint8)
            
            for i in range(radius, height - radius):
                for j in range(radius, width - radius):
                    center = gray_image[i, j]
                    binary_string = ''
                    
                    for k in range(n_points):
                        angle = 2 * np.pi * k / n_points
                        x = int(i + radius * np.cos(angle))
                        y = int(j + radius * np.sin(angle))
                        
                        if 0 <= x < height and 0 <= y < width:
                            binary_string += '1' if gray_image[x, y] >= center else '0'
                        else:
                            binary_string += '0'
                    
                    lbp_image[i, j] = int(binary_string, 2) if binary_string else 0
            
            # Compute histogram
            histogram, _ = np.histogram(lbp_image.ravel(), bins=256, range=(0, 256))
            
            # Normalize histogram
            histogram = histogram.astype(np.float32)
            histogram /= (histogram.sum() + 1e-7)
            
            return histogram
            
        except Exception as e:
            logger.error(f"Error computing LBP histogram: {str(e)}")
            return np.zeros(256, dtype=np.float32)
    
    def _generate_pattern_hash(self, pattern_data: Dict[str, Any]) -> str:
        """Generate a unique hash from pattern data for duplicate detection."""
        try:
            # Create a simplified fingerprint from key features
            fingerprint_data = {
                'orb_count': len(pattern_data.get('orb_keypoints', [])),
                'sift_count': len(pattern_data.get('sift_keypoints', [])),
                'lbp_top_bins': sorted(enumerate(pattern_data.get('lbp_histogram', [])), key=lambda x: x[1], reverse=True)[:20],
                'edge_top_bins': sorted(enumerate(pattern_data.get('edge_histogram', [])), key=lambda x: x[1], reverse=True)[:10],
                'moments_key': {k: round(v, 3) for k, v in pattern_data.get('moments', {}).items() if k in ['m00', 'm10', 'm01', 'm20', 'm11', 'm02']},
                'stats': {k: round(v, 2) for k, v in pattern_data.get('image_stats', {}).items()}
            }
            
            # Create deterministic string representation
            fingerprint_str = json.dumps(fingerprint_data, sort_keys=True)
            
            # Generate SHA-256 hash
            pattern_hash = hashlib.sha256(fingerprint_str.encode()).hexdigest()
            
            return pattern_hash
            
        except Exception as e:
            logger.error(f"Error generating pattern hash: {str(e)}")
            return hashlib.sha256(str(pattern_data).encode()).hexdigest()
    
    def _assess_pattern_quality(self, nose_image: np.ndarray, pattern_data: Dict[str, Any]) -> float:
        """Assess the quality of extracted nose pattern."""
        try:
            quality_score = 0.0
            
            # Factor 1: Number of detected keypoints (0-0.3)
            orb_count = len(pattern_data.get('orb_keypoints', []))
            sift_count = len(pattern_data.get('sift_keypoints', []))
            keypoint_score = min(0.3, (orb_count + sift_count) / 200)
            
            # Factor 2: Image clarity and contrast (0-0.3)
            gray = cv2.cvtColor(nose_image, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            clarity_score = min(0.3, laplacian_var / 500)
            
            # Factor 3: Edge definition (0-0.2)
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / edges.size
            edge_score = min(0.2, edge_density * 2)
            
            # Factor 4: Pattern uniqueness based on LBP histogram (0-0.2)
            lbp_hist = np.array(pattern_data.get('lbp_histogram', []))
            if len(lbp_hist) > 0:
                lbp_entropy = -np.sum(lbp_hist * np.log(lbp_hist + 1e-7))
                pattern_score = min(0.2, lbp_entropy / 10)
            else:
                pattern_score = 0.0
            
            quality_score = keypoint_score + clarity_score + edge_score + pattern_score
            
            return min(1.0, quality_score)
            
        except Exception as e:
            logger.error(f"Error assessing pattern quality: {str(e)}")
            return 0.5  # Default medium quality
    
    def compare_patterns(self, pattern1: Dict[str, Any], pattern2: Dict[str, Any]) -> float:
        """
        Compare two nose patterns and return similarity score (0-1).
        
        Args:
            pattern1: First pattern data
            pattern2: Second pattern data
            
        Returns:
            Similarity score between 0 (completely different) and 1 (identical)
        """
        try:
            similarity_score = 0.0
            
            # Compare LBP histograms using correlation
            lbp1 = np.array(pattern1.get('lbp_histogram', []))
            lbp2 = np.array(pattern2.get('lbp_histogram', []))
            
            if len(lbp1) > 0 and len(lbp2) > 0:
                lbp_corr = cv2.compareHist(lbp1.astype(np.float32), lbp2.astype(np.float32), cv2.HISTCMP_CORREL)
                similarity_score += 0.4 * max(0, lbp_corr)
            
            # Compare edge histograms
            edge1 = np.array(pattern1.get('edge_histogram', []))
            edge2 = np.array(pattern2.get('edge_histogram', []))
            
            if len(edge1) > 0 and len(edge2) > 0:
                edge_corr = cv2.compareHist(edge1.astype(np.float32), edge2.astype(np.float32), cv2.HISTCMP_CORREL)
                similarity_score += 0.3 * max(0, edge_corr)
            
            # Compare image statistics
            stats1 = pattern1.get('image_stats', {})
            stats2 = pattern2.get('image_stats', {})
            
            if stats1 and stats2:
                stat_similarity = 1.0
                for key in ['mean', 'std', 'median']:
                    if key in stats1 and key in stats2:
                        diff = abs(stats1[key] - stats2[key]) / max(stats1[key], stats2[key], 1)
                        stat_similarity *= (1 - min(1, diff))
                
                similarity_score += 0.2 * stat_similarity
            
            # Compare moments
            moments1 = pattern1.get('moments', {})
            moments2 = pattern2.get('moments', {})
            
            if moments1 and moments2:
                moment_similarity = 1.0
                key_moments = ['m00', 'm10', 'm01', 'm20', 'm11', 'm02']
                
                for key in key_moments:
                    if key in moments1 and key in moments2 and moments1[key] > 0 and moments2[key] > 0:
                        diff = abs(moments1[key] - moments2[key]) / max(moments1[key], moments2[key])
                        moment_similarity *= (1 - min(1, diff))
                
                similarity_score += 0.1 * moment_similarity
            
            return min(1.0, similarity_score)
            
        except Exception as e:
            logger.error(f"Error comparing patterns: {str(e)}")
            return 0.0
    
    def _cv_image_to_base64(self, cv_image: np.ndarray) -> str:
        """Convert OpenCV image to base64 string."""
        try:
            # Convert BGR to RGB
            rgb_image = cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB)
            
            # Convert to PIL Image
            pil_image = Image.fromarray(rgb_image)
            
            # Convert to base64
            buffer = BytesIO()
            pil_image.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            return f"data:image/png;base64,{img_str}"
            
        except Exception as e:
            logger.error(f"Error converting image to base64: {str(e)}")
            return ""

# Global processor instance
processor = CowNosePatternProcessor()

def process_cow_face_with_manual_zoom(base64_image: str, zoom_coordinates: Dict) -> Dict[str, Any]:
    """
    Convenience function for processing cow face with manual zoom.
    
    Args:
        base64_image: Base64 encoded cow face image
        zoom_coordinates: Manual zoom coordinates {x, y, width, height}
        
    Returns:
        Processed data dictionary
    """
    return processor.process_cow_face_image(base64_image, zoom_coordinates)

def compare_nose_patterns(pattern1: Dict[str, Any], pattern2: Dict[str, Any]) -> float:
    """
    Convenience function for comparing nose patterns.
    
    Args:
        pattern1: First pattern data
        pattern2: Second pattern data
        
    Returns:
        Similarity score (0-1)
    """
    return processor.compare_patterns(pattern1, pattern2)