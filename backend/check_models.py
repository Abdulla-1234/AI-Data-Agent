import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load the environment file to get your API key from .env
load_dotenv()

print("Attempting to connect to Google AI to list available models...")

try:
    # Configure the API key from your .env file
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in the .env file.")
    
    genai.configure(api_key=api_key)

    print("\n--- Your Usable Models ---")
    
    found_models = False
    # List all models and find the ones that support 'generateContent'
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"Model Name: {m.name}")
            found_models = True
    
    print("--------------------------")

    if found_models:
        print("\n✅ Success! Please copy one of the 'Model Name' values from the list above.")
        print("   Then, open the 'backend/main.py' file and paste this name into the `llm` definition line to fix the error.")
    else:
        print("\n⚠️ No usable models were found for your API key.")
        print("   Please ensure your key has the 'Generative Language API' enabled in your Google Cloud project.")

except Exception as e:
    print(f"\n❌ An error occurred: {e}")
    print("\n   Please double-check that your GOOGLE_API_KEY in the 'backend/.env' file is correct and that you have enabled the 'Generative Language API' in your Google Cloud project.")

