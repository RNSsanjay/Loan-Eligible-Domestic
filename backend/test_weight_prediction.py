#!/usr/bin/env python3

from app.common.cow_weight_predictor import CowWeightPredictor

def test_weight_prediction():
    try:
        # Test initialization
        predictor = CowWeightPredictor()
        print('✓ CowWeightPredictor initialized successfully')
        
        # Test manual mode
        manual_result = predictor.predict_weight_manual_mode(180.0, 150.0, 'crossbred')
        print(f'✓ Manual prediction: {manual_result.get("manual_weight_kg", 0):.1f} kg')
        print(f'  Formula: {manual_result.get("formula_used", "N/A")}')
        
        # Test with different measurements
        measurements = {
            'estimated_girth_cm': 190.0,
            'body_length_cm': 160.0,
            'body_height_cm': 130.0,
        }
        
        # Test AI mode (will fallback if API fails)
        ai_result = predictor.predict_weight_ai_mode(measurements, [], 'holstein', 4.0)
        if 'ai_weight_kg' in ai_result:
            print(f'✓ AI prediction: {ai_result.get("ai_weight_kg", 0):.1f} kg')
        else:
            print(f'⚠ AI prediction failed: {ai_result.get("ai_error", "Unknown error")}')
        
        print('Weight prediction test completed!')
        
    except Exception as e:
        print(f'❌ Test failed: {e}')

if __name__ == '__main__':
    test_weight_prediction()