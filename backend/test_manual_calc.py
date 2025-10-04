#!/usr/bin/env python3

def test_manual_calculation():
    """Test manual weight calculation"""
    
    # Heart Girth = 180 cm, Body Length = 150 cm
    heart_girth = 180.0
    body_length = 150.0
    
    # Formula: (Heart Girth^2 * Body Length) / 300
    weight = (heart_girth * heart_girth * body_length) / 300
    
    print(f"Heart Girth: {heart_girth} cm")
    print(f"Body Length: {body_length} cm")
    print(f"Calculation: ({heart_girth}² × {body_length}) ÷ 300")
    print(f"Calculation: ({heart_girth * heart_girth} × {body_length}) ÷ 300")
    print(f"Calculation: {heart_girth * heart_girth * body_length} ÷ 300")
    print(f"Result: {weight} kg")
    
    # This should give approximately 162 kg for a typical cow
    # But 16200 is way too high, indicating a possible unit conversion issue
    
    # Let's try different interpretations
    print("\nAlternative calculations:")
    
    # Maybe the formula needs different units or scaling
    weight_alt1 = (heart_girth * heart_girth * body_length) / 30000  # Divide by 30,000 instead
    print(f"Alternative 1 (÷30000): {weight_alt1} kg")
    
    # Or maybe the heart girth should be in meters?
    heart_girth_m = heart_girth / 100  # Convert to meters
    weight_alt2 = (heart_girth_m * heart_girth_m * body_length) / 300
    print(f"Alternative 2 (girth in meters): {weight_alt2} kg")
    
    # Standard livestock formula adjustment
    weight_alt3 = (heart_girth * heart_girth * body_length) / 10000  # Common scaling factor
    print(f"Alternative 3 (÷10000): {weight_alt3} kg")

if __name__ == '__main__':
    test_manual_calculation()