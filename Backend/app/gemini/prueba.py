import google.generativeai as genai
import json
import re
from dotenv import load_dotenv
import os

load_dotenv()

# Configure Gemini API key
GEMINI_API_KEY = os.getenv("GEMINIAI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def generate_city_description_prompt(cityName):
    """
    This function generates a prompt to describe a city based on the provided name.
    
    Parameter:
    cityName (str): The name of the city for which a description is to be generated.
    
    Rules: 
    - The description should be in the context of a flight booking application.
    - Keep the description brief with ONE PARAGRAPH about the city and another one with 5 tourist spots.

    Returns:
    str: The prompt to obtain the city description.
    """
    
    # Customize the prompt to gather details about the city
    prompt = f"Describe the city of {cityName}. Include a description brief with ONLY ONE SHORT PARAGRAPH (maximum 3 sentences) about the city and another one with 5 tourist spots (only the names)"
    
    return prompt

def get_city_description_response(cityName):
    # Generate the prompt for the city description
    prompt = generate_city_description_prompt(cityName)
    
    try:
        # Use the Gemini model to generate content based on the prompt
        model = genai.GenerativeModel("gemini-2.0-flash-lite")
        response = model.generate_content(prompt)
        
        if response:
            print("Generated description for city:", cityName)
            print(response.text)
        else:
            print("Sorry, I couldn't generate a description at this moment.")
    except Exception as e:
        print(f"Error generating description: {e}")

# Test with the city "Barcelona"
get_city_description_response("Alemania")
