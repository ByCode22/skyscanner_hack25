import google.generativeai as genai
from Backend.app.prompts.prompts import generar_prompt
from Backend.app.gemini.config import API_KEY

# Configurar la clave de API de Gemini
genai.configure(api_key=API_KEY)

def obtener_preguntas(fechas, paisaje, presupuesto, actividades):
    """
    Obtiene las preguntas generadas por la API de Gemini basándose en las preferencias del usuario.
    
    Args:
    - fechas (str): El rango de fechas disponibles (ej. "2025-06-01 to 2025-06-10").
    - paisaje (str): El tipo de paisaje preferido (ej. "playa").
    - presupuesto (str): El presupuesto disponible (ej. "3000 EUR").
    - actividades (list): Lista de actividades preferidas (ej. ["senderismo", "buceo", "museos"]).
    
    Returns:
    - list: Lista de preguntas generadas por Gemini.
    """
    
    # Generar el prompt usando los datos proporcionados
    prompt = generar_prompt(fechas, paisaje, presupuesto, actividades)
    
    # Llamada a la API de Gemini
    respuesta = genai.generate_text(prompt=prompt, model='gemini-2.0-flash-lite')
    
    # Verificar si la respuesta contiene preguntas
    if respuesta:
        # Aquí asumimos que las preguntas están en la respuesta de Gemini, y las dividimos por línea
        preguntas = respuesta.text.strip().split("\n")
        return preguntas
    else:
        return ["Lo siento, no pude generar preguntas en este momento."]