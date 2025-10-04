#!/usr/bin/env python3

import google.generativeai as genai

# Configure Gemini AI
GEMINI_API_KEY = "AIzaSyDkHhujvXjQW243snouTtpCISdM97zH4mU"
genai.configure(api_key=GEMINI_API_KEY)

def list_available_models():
    """List all available Gemini models"""
    try:
        print("Available Gemini models:")
        for model in genai.list_models():
            if 'generateContent' in model.supported_generation_methods:
                print(f"✓ {model.name}")
        
        # Try a simple generation test
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content("Calculate 180 * 180 * 150 / 300")
            print(f"\nTest calculation with gemini-pro: {response.text}")
        except Exception as e:
            print(f"\ngemini-pro test failed: {e}")
            
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content("Calculate 180 * 180 * 150 / 300")
            print(f"\nTest calculation with gemini-1.5-flash: {response.text}")
        except Exception as e:
            print(f"\ngemini-1.5-flash test failed: {e}")
            
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == '__main__':
    list_available_models()