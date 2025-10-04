"""
Cow Weight Prediction Module using Side Images
Uses computer vision to analyze cow body measurements and predict weight
Supports both manual calculation and AI-powered prediction
"""

import cv2
import numpy as np
from PIL import Image, ImageEnhance
import io
import base64
import math
import google.generativeai as genai
import os
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

# Configure Gemini AI
GEMINI_API_KEY = "AIzaSyDkHhujvXjQW243snouTtpCISdM97zH4mU"
genai.configure(api_key=GEMINI_API_KEY)

class CowWeightPredictor:
    """
    Advanced cow weight prediction using side view images
    Analyzes body measurements and applies regression models
    """
    
    def __init__(self):
        """Initialize the weight predictor with calibration parameters"""
        # Calibration factors for different breeds (can be expanded)
        self.breed_factors = {
            'holstein': {'base_factor': 1.05, 'body_multiplier': 0.85},
            'jersey': {'base_factor': 0.90, 'body_multiplier': 0.80},
            'gir': {'base_factor': 0.95, 'body_multiplier': 0.82},
            'sahiwal': {'base_factor': 0.98, 'body_multiplier': 0.83},
            'red_sindhi': {'base_factor': 0.93, 'body_multiplier': 0.81},
            'crossbred': {'base_factor': 1.00, 'body_multiplier': 0.84},
            'default': {'base_factor': 1.00, 'body_multiplier': 0.84}
        }
        
        # Reference measurements for calibration
        self.reference_measurements = {
            'min_body_length': 100,  # cm
            'max_body_length': 200,  # cm
            'min_height': 100,       # cm
            'max_height': 150,       # cm
            'min_girth': 150,        # cm
            'max_girth': 250         # cm
        }
    
    def enhance_image_quality(self, image: np.ndarray) -> np.ndarray:
        """
        Enhance image quality for better measurement detection
        """
        try:
            # Convert to PIL for enhancement
            pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            
            # Enhance contrast
            enhancer = ImageEnhance.Contrast(pil_image)
            enhanced = enhancer.enhance(1.3)
            
            # Enhance sharpness
            enhancer = ImageEnhance.Sharpness(enhanced)
            enhanced = enhancer.enhance(1.2)
            
            # Convert back to OpenCV format
            return cv2.cvtColor(np.array(enhanced), cv2.COLOR_RGB2BGR)
            
        except Exception as e:
            logger.error(f"Error enhancing image: {e}")
            return image
    
    def detect_cow_contour(self, image: np.ndarray) -> Optional[np.ndarray]:
        """
        Detect the main cow contour from side view
        """
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Edge detection
            edges = cv2.Canny(blurred, 50, 150)
            
            # Morphological operations to connect edges
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if not contours:
                return None
            
            # Find the largest contour (assumed to be the cow)
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Filter out small contours
            if cv2.contourArea(largest_contour) < 10000:
                return None
                
            return largest_contour
            
        except Exception as e:
            logger.error(f"Error detecting cow contour: {e}")
            return None
    
    def extract_body_measurements(self, image: np.ndarray, contour: np.ndarray) -> Dict[str, float]:
        """
        Extract key body measurements from the cow contour
        """
        try:
            measurements = {}
            
            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(contour)
            
            # Basic measurements from bounding box
            measurements['body_length_pixels'] = w
            measurements['body_height_pixels'] = h
            
            # Calculate more detailed measurements
            hull = cv2.convexHull(contour)
            
            # Find extreme points
            leftmost = tuple(hull[hull[:, :, 0].argmin()][0])
            rightmost = tuple(hull[hull[:, :, 0].argmax()][0])
            topmost = tuple(hull[hull[:, :, 1].argmin()][0])
            bottommost = tuple(hull[hull[:, :, 1].argmax()][0])
            
            # Calculate distances
            measurements['horizontal_span'] = rightmost[0] - leftmost[0]
            measurements['vertical_span'] = bottommost[1] - topmost[1]
            
            # Estimate body girth using contour area and perimeter
            area = cv2.contourArea(contour)
            perimeter = cv2.arcLength(contour, True)
            
            if perimeter > 0:
                # Approximation of girth from area and length
                estimated_girth = math.sqrt(area / measurements['body_length_pixels']) * 2 * math.pi
                measurements['estimated_girth_pixels'] = estimated_girth
            
            # Body depth estimation (approximate from contour analysis)
            moments = cv2.moments(contour)
            if moments['m00'] != 0:
                cx = int(moments['m10'] / moments['m00'])
                cy = int(moments['m01'] / moments['m00'])
                measurements['centroid_x'] = cx
                measurements['centroid_y'] = cy
                
                # Estimate body depth based on contour width at different heights
                body_depths = []
                for i in range(5):
                    y_level = y + (h * (i + 1) / 6)  # Sample at different height levels
                    intersections = []
                    for point in contour:
                        if abs(point[0][1] - y_level) < 5:  # Points near this y-level
                            intersections.append(point[0][0])
                    
                    if len(intersections) >= 2:
                        width_at_level = max(intersections) - min(intersections)
                        body_depths.append(width_at_level)
                
                if body_depths:
                    measurements['average_body_depth'] = np.mean(body_depths)
            
            return measurements
            
        except Exception as e:
            logger.error(f"Error extracting measurements: {e}")
            return {}
    
    def convert_pixels_to_real_measurements(self, pixel_measurements: Dict[str, float], 
                                          reference_length_cm: float = None) -> Dict[str, float]:
        """
        Convert pixel measurements to real-world measurements
        Uses either provided reference or estimation
        """
        try:
            real_measurements = {}
            
            # If no reference provided, estimate based on typical cow proportions
            if reference_length_cm is None:
                # Assume average cow body length is 150cm for calibration
                reference_length_cm = 150.0
            
            # Calculate pixels per cm ratio
            if 'body_length_pixels' in pixel_measurements and pixel_measurements['body_length_pixels'] > 0:
                pixels_per_cm = pixel_measurements['body_length_pixels'] / reference_length_cm
                
                # Convert all measurements
                for key, pixel_value in pixel_measurements.items():
                    if 'pixels' in key:
                        real_key = key.replace('_pixels', '_cm')
                        real_measurements[real_key] = pixel_value / pixels_per_cm
                    else:
                        real_measurements[key] = pixel_value
                
                # Add the calibration factor
                real_measurements['pixels_per_cm'] = pixels_per_cm
                real_measurements['reference_length_cm'] = reference_length_cm
            
            return real_measurements
            
        except Exception as e:
            logger.error(f"Error converting measurements: {e}")
            return pixel_measurements
    
    def predict_weight_manual_mode(self, heart_girth_cm: float, body_length_cm: float, 
                                 breed: str = 'default') -> Dict[str, float]:
        """
        Manual weight prediction using heart girth formula:
        Weight = (Heart Girth * Heart Girth * Body Length) / 300
        """
        try:
            results = {}
            
            # Apply the manual formula (corrected for realistic weights)
            manual_weight = (heart_girth_cm * heart_girth_cm * body_length_cm) / 30000
            
            # Apply breed correction factor
            breed_key = breed.lower().replace(' ', '_') if breed else 'default'
            breed_params = self.breed_factors.get(breed_key, self.breed_factors['default'])
            manual_weight *= breed_params['base_factor']
            
            results.update({
                'manual_weight_kg': manual_weight,
                'formula_used': 'Heart Girth² × Body Length ÷ 30000',
                'heart_girth_cm': heart_girth_cm,
                'body_length_cm': body_length_cm,
                'breed_factor': breed_params['base_factor'],
                'confidence_score': 0.8,  # High confidence for manual calculation
                'method': 'manual'
            })
            
            return results
            
        except Exception as e:
            logger.error(f"Error in manual weight prediction: {e}")
            return {}
    
    def predict_weight_ai_mode(self, measurements: Dict, images_b64: List[str], 
                             breed: str = 'default', age_years: float = 3.0) -> Dict[str, float]:
        """
        AI-powered weight prediction using Gemini API
        """
        try:
            results = {}
            
            # Prepare data for AI analysis
            measurement_text = self._format_measurements_for_ai(measurements)
            breed_info = f"Breed: {breed}, Age: {age_years} years"
            
            # Create prompt for Gemini
            prompt = f"""
            You are a veterinary expert specializing in livestock weight estimation. 
            Analyze the following cow measurements and provide an accurate weight prediction.

            {breed_info}

            Measurements:
            {measurement_text}

            Instructions:
            1. Consider the breed characteristics and age factors
            2. Use your knowledge of cattle anatomy and weight distribution
            3. Provide weight in kilograms with reasoning
            4. Give a confidence percentage based on measurement quality
            5. Suggest any additional measurements that would improve accuracy

            Format your response as:
            PREDICTED_WEIGHT: [weight in kg]
            CONFIDENCE: [percentage]
            REASONING: [your analysis]
            WEIGHT_RANGE: [min_weight - max_weight]
            RECOMMENDATIONS: [suggestions for better accuracy]
            """
            
            # Use Gemini AI for prediction
            try:
                model = genai.GenerativeModel('gemini-2.5-flash')  # Use available model
                response = model.generate_content(prompt)
                
                if response and response.text:
                    ai_analysis = self._parse_ai_response(response.text)
                    
                    results.update({
                        'ai_weight_kg': ai_analysis.get('predicted_weight', 0),
                        'ai_confidence': ai_analysis.get('confidence', 0),
                        'ai_reasoning': ai_analysis.get('reasoning', ''),
                        'ai_weight_range_min': ai_analysis.get('weight_range_min', 0),
                        'ai_weight_range_max': ai_analysis.get('weight_range_max', 0),
                        'ai_recommendations': ai_analysis.get('recommendations', ''),
                        'method': 'ai',
                        'ai_model': 'gemini-2.5-flash'
                    })
                else:
                    results['ai_error'] = 'No response from AI model'
                    
            except Exception as ai_error:
                logger.error(f"Gemini AI error: {ai_error}")
                results['ai_error'] = f"AI prediction failed: {str(ai_error)}"
                
                # Fallback to traditional prediction if AI fails
                fallback_results = self.predict_weight_from_measurements_legacy(measurements, breed, age_years)
                results.update({
                    'fallback_weight_kg': fallback_results.get('predicted_weight_kg'),
                    'fallback_method': 'traditional_algorithms'
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Error in AI weight prediction: {e}")
            return {'ai_error': str(e)}
    
    def _format_measurements_for_ai(self, measurements: Dict) -> str:
        """
        Format measurements for AI analysis
        """
        formatted = []
        
        for key, value in measurements.items():
            if '_cm' in key and isinstance(value, (int, float)):
                readable_key = key.replace('_cm', '').replace('_', ' ').title()
                formatted.append(f"- {readable_key}: {value:.1f} cm")
        
        return '\n'.join(formatted) if formatted else "No measurements available"
    
    def _parse_ai_response(self, response_text: str) -> Dict:
        """
        Parse AI response and extract weight prediction data
        """
        try:
            result = {}
            lines = response_text.split('\n')
            
            for line in lines:
                line = line.strip()
                if line.startswith('PREDICTED_WEIGHT:'):
                    weight_str = line.split(':')[1].strip()
                    # Extract number from weight string
                    weight_match = ''.join(filter(str.isdigit, weight_str.split()[0]))
                    if weight_match:
                        result['predicted_weight'] = float(weight_match)
                
                elif line.startswith('CONFIDENCE:'):
                    conf_str = line.split(':')[1].strip()
                    conf_match = ''.join(filter(str.isdigit, conf_str.split('%')[0]))
                    if conf_match:
                        result['confidence'] = float(conf_match) / 100
                
                elif line.startswith('REASONING:'):
                    result['reasoning'] = line.split(':', 1)[1].strip()
                
                elif line.startswith('WEIGHT_RANGE:'):
                    range_str = line.split(':')[1].strip()
                    if '-' in range_str:
                        try:
                            min_w, max_w = range_str.split('-')
                            result['weight_range_min'] = float(''.join(filter(str.isdigit, min_w.strip())))
                            result['weight_range_max'] = float(''.join(filter(str.isdigit, max_w.strip())))
                        except:
                            pass
                
                elif line.startswith('RECOMMENDATIONS:'):
                    result['recommendations'] = line.split(':', 1)[1].strip()
            
            # Set defaults if not found
            if 'predicted_weight' not in result:
                result['predicted_weight'] = 0
            if 'confidence' not in result:
                result['confidence'] = 0.5
            if 'reasoning' not in result:
                result['reasoning'] = 'AI analysis completed'
                
            return result
            
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
            return {
                'predicted_weight': 0,
                'confidence': 0,
                'reasoning': f'Error parsing AI response: {str(e)}'
            }
        """
        Predict cow weight using various estimation formulas
        """
        try:
            results = {}
            breed_key = breed.lower().replace(' ', '_') if breed else 'default'
            breed_params = self.breed_factors.get(breed_key, self.breed_factors['default'])
            
            # Method 1: Schaeffer's Formula (Heart Girth based)
            if 'estimated_girth_cm' in measurements:
                girth = measurements['estimated_girth_cm']
                # Schaeffer's formula: Weight = (Heart Girth^2 * Body Length) / 300
                if 'body_length_cm' in measurements:
                    body_length = measurements['body_length_cm']
                    schaeffer_weight = (girth * girth * body_length) / 300
                    schaeffer_weight *= breed_params['base_factor']
                    results['schaeffer_weight_kg'] = schaeffer_weight
            
            # Method 2: Dalton's Formula
            if 'estimated_girth_cm' in measurements:
                girth = measurements['estimated_girth_cm']
                # Dalton's formula: Weight = (Heart Girth^2 * 0.87) - 50
                dalton_weight = (girth * girth * 0.87) - 50
                dalton_weight *= breed_params['base_factor']
                results['dalton_weight_kg'] = dalton_weight
            
            # Method 3: Body Condition Scoring approach
            if all(key in measurements for key in ['body_length_cm', 'body_height_cm', 'estimated_girth_cm']):
                length = measurements['body_length_cm']
                height = measurements['body_height_cm']
                girth = measurements['estimated_girth_cm']
                
                # Combined formula considering body dimensions
                volume_estimate = length * height * (girth / math.pi) * 0.8  # 0.8 is body density factor
                bcs_weight = volume_estimate * 0.85  # Convert volume to weight estimate
                bcs_weight *= breed_params['body_multiplier']
                
                # Age adjustment
                if age_years < 2:
                    bcs_weight *= 0.7
                elif age_years > 6:
                    bcs_weight *= 1.1
                
                results['bcs_weight_kg'] = bcs_weight
            
            # Method 4: Regression-based approach (trained on typical values)
            if 'body_length_cm' in measurements and 'body_height_cm' in measurements:
                length = measurements['body_length_cm']
                height = measurements['body_height_cm']
                
                # Simplified regression model (would be trained on real data in production)
                regression_weight = (length * 2.1) + (height * 1.8) + (age_years * 15) - 180
                regression_weight *= breed_params['base_factor']
                regression_weight = max(regression_weight, 200)  # Minimum reasonable weight
                results['regression_weight_kg'] = regression_weight
            
            # Calculate confidence-weighted average
            if results:
                weights = []
                confidences = []
                
                for method, weight in results.items():
                    if weight > 0:
                        weights.append(weight)
                        # Assign confidence based on method reliability
                        if 'schaeffer' in method:
                            confidences.append(0.4)  # High confidence for girth-based
                        elif 'bcs' in method:
                            confidences.append(0.3)  # Medium-high for multi-dimensional
                        elif 'dalton' in method:
                            confidences.append(0.2)  # Medium for girth-only
                        else:
                            confidences.append(0.1)  # Lower for simple regression
                
                if weights and confidences:
                    weighted_average = np.average(weights, weights=confidences)
                    results['predicted_weight_kg'] = weighted_average
                    results['confidence_score'] = np.mean(confidences)
                    results['weight_range_min'] = weighted_average * 0.85
                    results['weight_range_max'] = weighted_average * 1.15
            
            return results
            
        except Exception as e:
            logger.error(f"Error predicting weight: {e}")
            return {}
    
    def process_side_images(self, left_image_b64: str, right_image_b64: str, 
                          breed: str = 'default', age_years: float = 3.0,
                          reference_length_cm: float = None, 
                          prediction_mode: str = 'both') -> Dict:
        """
        Process both side images and predict weight
        prediction_mode: 'manual', 'ai', or 'both'
        """
        try:
            results = {
                'success': False,
                'measurements': {},
                'weight_predictions': {},
                'processing_details': {},
                'error': None,
                'mode': prediction_mode
            }
            
            # Process left side image
            left_results = self.process_single_side_image(
                left_image_b64, 'left', breed, age_years, reference_length_cm
            )
            
            # Process right side image
            right_results = self.process_single_side_image(
                right_image_b64, 'right', breed, age_years, reference_length_cm
            )
            
            # Combine results from both sides
            if left_results['success'] or right_results['success']:
                combined_measurements = {}
                
                # Average measurements from both sides if both are successful
                if left_results['success'] and right_results['success']:
                    left_meas = left_results['measurements']
                    right_meas = right_results['measurements']
                    
                    for key in left_meas:
                        if key in right_meas and 'cm' in key:
                            combined_measurements[key] = (left_meas[key] + right_meas[key]) / 2
                        else:
                            combined_measurements[key] = left_meas[key]
                    
                    results['processing_details']['method'] = 'bilateral_average'
                    results['processing_details']['confidence'] = 'high'
                    
                elif left_results['success']:
                    combined_measurements = left_results['measurements']
                    results['processing_details']['method'] = 'left_side_only'
                    results['processing_details']['confidence'] = 'medium'
                    
                elif right_results['success']:
                    combined_measurements = right_results['measurements']
                    results['processing_details']['method'] = 'right_side_only'
                    results['processing_details']['confidence'] = 'medium'
                
                # Weight prediction based on mode
                weight_predictions = {}
                
                if prediction_mode in ['manual', 'both']:
                    # Manual calculation mode
                    heart_girth = combined_measurements.get('estimated_girth_cm', 0)
                    body_length = combined_measurements.get('body_length_cm', 0)
                    
                    if heart_girth > 0 and body_length > 0:
                        manual_results = self.predict_weight_manual_mode(
                            heart_girth, body_length, breed
                        )
                        weight_predictions.update(manual_results)
                
                if prediction_mode in ['ai', 'both']:
                    # AI prediction mode
                    ai_results = self.predict_weight_ai_mode(
                        combined_measurements, 
                        [left_image_b64, right_image_b64],
                        breed, 
                        age_years
                    )
                    weight_predictions.update(ai_results)
                
                # If both modes, create combined prediction
                if prediction_mode == 'both' and 'manual_weight_kg' in weight_predictions and 'ai_weight_kg' in weight_predictions:
                    manual_weight = weight_predictions['manual_weight_kg']
                    ai_weight = weight_predictions['ai_weight_kg']
                    ai_confidence = weight_predictions.get('ai_confidence', 0.5)
                    
                    # Weighted average based on AI confidence
                    combined_weight = (manual_weight * (1 - ai_confidence) + ai_weight * ai_confidence)
                    
                    weight_predictions.update({
                        'combined_weight_kg': combined_weight,
                        'combined_method': f'Manual({1-ai_confidence:.1%}) + AI({ai_confidence:.1%})',
                        'weight_difference': abs(manual_weight - ai_weight),
                        'agreement_score': max(0, 1 - abs(manual_weight - ai_weight) / max(manual_weight, ai_weight))
                    })
                
                results.update({
                    'success': True,
                    'measurements': combined_measurements,
                    'weight_predictions': weight_predictions,
                    'left_side_results': left_results,
                    'right_side_results': right_results
                })
                
            else:
                results['error'] = 'Failed to process both side images'
                results['left_side_error'] = left_results.get('error')
                results['right_side_error'] = right_results.get('error')
            
            return results
            
        except Exception as e:
            logger.error(f"Error processing side images: {e}")
            return {
                'success': False,
                'error': str(e),
                'measurements': {},
                'weight_predictions': {},
                'mode': prediction_mode
            }
    
    def process_single_side_image(self, image_b64: str, side: str, 
                                breed: str = 'default', age_years: float = 3.0,
                                reference_length_cm: float = None) -> Dict:
        """
        Process a single side image for weight prediction
        """
        try:
            # Decode base64 image
            image_data = base64.b64decode(image_b64.split(',')[1] if ',' in image_b64 else image_b64)
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to OpenCV format
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Enhance image quality
            enhanced_image = self.enhance_image_quality(cv_image)
            
            # Detect cow contour
            contour = self.detect_cow_contour(enhanced_image)
            
            if contour is None:
                return {
                    'success': False,
                    'error': f'Could not detect cow contour in {side} side image',
                    'measurements': {}
                }
            
            # Extract measurements
            pixel_measurements = self.extract_body_measurements(enhanced_image, contour)
            
            if not pixel_measurements:
                return {
                    'success': False,
                    'error': f'Could not extract measurements from {side} side image',
                    'measurements': {}
                }
            
            # Convert to real measurements
            real_measurements = self.convert_pixels_to_real_measurements(
                pixel_measurements, reference_length_cm
            )
            
            # Add processing metadata
            real_measurements['processed_side'] = side
            real_measurements['contour_area'] = cv2.contourArea(contour)
            real_measurements['image_dimensions'] = {
                'width': enhanced_image.shape[1],
                'height': enhanced_image.shape[0]
            }
            
            return {
                'success': True,
                'measurements': real_measurements,
                'contour_points': contour.tolist(),
                'side': side
            }
            
        except Exception as e:
            logger.error(f"Error processing {side} side image: {e}")
            return {
                'success': False,
                'error': str(e),
                'measurements': {}
            }
    
    def generate_measurement_visualization(self, image_b64: str, measurements: Dict) -> str:
        """
        Generate a visualization of the measurements on the image
        """
        try:
            # Decode image
            image_data = base64.b64decode(image_b64.split(',')[1] if ',' in image_b64 else image_b64)
            image = Image.open(io.BytesIO(image_data))
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Draw measurements if contour points available
            if 'contour_points' in measurements:
                contour = np.array(measurements['contour_points'])
                cv2.drawContours(cv_image, [contour], -1, (0, 255, 0), 2)
                
                # Draw bounding box
                x, y, w, h = cv2.boundingRect(contour)
                cv2.rectangle(cv_image, (x, y), (x + w, y + h), (255, 0, 0), 2)
                
                # Add measurement text
                font = cv2.FONT_HERSHEY_SIMPLEX
                if 'body_length_cm' in measurements:
                    cv2.putText(cv_image, f"Length: {measurements['body_length_cm']:.1f}cm", 
                              (x, y - 10), font, 0.7, (255, 255, 255), 2)
                if 'body_height_cm' in measurements:
                    cv2.putText(cv_image, f"Height: {measurements['body_height_cm']:.1f}cm", 
                              (x, y + h + 25), font, 0.7, (255, 255, 255), 2)
            
            # Convert back to base64
            _, buffer = cv2.imencode('.jpg', cv_image)
            visualization_b64 = base64.b64encode(buffer).decode('utf-8')
            
            return f"data:image/jpeg;base64,{visualization_b64}"
            
        except Exception as e:
            logger.error(f"Error generating visualization: {e}")
            return image_b64  # Return original image if visualization fails
    
    def predict_weight_from_measurements_legacy(self, measurements: Dict[str, float], 
                                               breed: str = 'default', age_years: float = 3.0) -> Dict[str, float]:
        """
        Legacy weight prediction using traditional methods
        """
        try:
            results = {}
            breed_key = breed.lower().replace(' ', '_') if breed else 'default'
            breed_params = self.breed_factors.get(breed_key, self.breed_factors['default'])
            
            # Method 1: Schaeffer's Formula (Heart Girth based)
            if 'estimated_girth_cm' in measurements:
                girth = measurements['estimated_girth_cm']
                # Schaeffer's formula: Weight = (Heart Girth^2 * Body Length) / 300
                if 'body_length_cm' in measurements:
                    body_length = measurements['body_length_cm']
                    schaeffer_weight = (girth * girth * body_length) / 300
                    schaeffer_weight *= breed_params['base_factor']
                    results['schaeffer_weight_kg'] = schaeffer_weight
            
            # Method 2: Dalton's Formula
            if 'estimated_girth_cm' in measurements:
                girth = measurements['estimated_girth_cm']
                # Dalton's formula: Weight = (Heart Girth^2 * 0.87) - 50
                dalton_weight = (girth * girth * 0.87) - 50
                dalton_weight *= breed_params['base_factor']
                results['dalton_weight_kg'] = dalton_weight
            
            # Calculate average
            if results:
                weights = [v for v in results.values() if v > 0]
                if weights:
                    results['predicted_weight_kg'] = sum(weights) / len(weights)
                    results['confidence_score'] = 0.7
            
            return results
            
        except Exception as e:
            logger.error(f"Error in legacy weight prediction: {e}")
            return {}