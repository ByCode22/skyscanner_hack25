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

def generar_prompt_pregunta(history):
    if len(history) > 0:
        history_text = json.dumps(history)
    else:
        history_text = "There are no responses yet"

    prompt = f"""
You are helping a group of people decide on a travel destination in Western Europe.

History of previously asked questions with their most frequent answers:
{history_text}

Now, generate ONE new question to further refine the choice.

Rules:
- It must have 4 distinct and clear options.
- Do not repeat previous questions.
- The question must be more specific than the previous ones.
- DO NOT suggest destinations.
- The options must be no more than three words each.

⚠️ Return ONLY a JSON object without any Markdown formatting (no extra text):

{{
    "question": "Text of the new question",
    "options": ["None", "Option 1", "Option 2", "Option 3", "Option 4"]
}}
"""
    return prompt


def generar_prompt_sugerencia(history):
    if len(history) > 0:
        history_text = json.dumps(history)
    else:
        history_text = "There are no responses yet"

    prompt = f"""
You are helping a group of people choose an airport anywhere in the world in 'en-GB' for their trip.

Based on their collective answers, suggest 3 airports that could match their preferences well. The fourth option must be: "Keep answering questions to refine further".

History of most voted answers:
{history_text}

⚠️ Return ONLY a JSON object without any Markdown formatting (no extra text):

{{
    "options": [City 1, City 2, City 3, "Keep answering questions to refine further"]
}}
"""
    return prompt


def obtener_respuesta(history: list, pregunta: bool):
    if pregunta:
        prompt = generar_prompt_pregunta(history)
    else:
        prompt = generar_prompt_sugerencia(history)

    try:
        model = genai.GenerativeModel("gemini-2.0-flash-lite")
        respuesta = model.generate_content(prompt)
        if respuesta:
            return extract_json_from_string(respuesta.text)
        else:
            return "Sorry, I couldn't generate a question at this moment."
    except Exception as e:
        print(f"Error generating question: {e}")
        return "Sorry, there was an error generating the questions."
    
def get_city_description_response(cityName):
    # Generate the prompt for the city description
    prompt = generate_city_description_prompt(cityName)
    
    try:
        # Use the Gemini model to generate content based on the prompt
        model = genai.GenerativeModel("gemini-2.0-flash-lite")
        response = model.generate_content(prompt)
        
        if response:
            return response.text
        else:
            return "Sorry, I couldn't generate a description at this moment."
    except Exception as e:
        return f"Error generating description: {e}"
    
    
def extract_json_from_string(text: str):
    match = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
    content = match.group(1) if match else text.strip()
    return json.loads(content)