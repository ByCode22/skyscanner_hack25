import google.generativeai as genai
from Backend.app.prompts.prompts import generar_prompt
from Backend.app.gemini.config import API_KEY

# Configurar la clave de API de Gemini
genai.configure(api_key=API_KEY)

def obtener_preguntas(fechas, paisaje, presupuesto, actividades):
    # Crear un prompt que explique que las respuestas son el resultado del consenso grupal
    prompt = f"""
    El siguiente es el resultado de las respuestas de un grupo de personas (promedio o la más votada por el grupo):

    Fechas disponibles: {fechas}
    Paisaje preferido: {paisaje}
    Presupuesto disponible: {presupuesto}
    Actividades preferidas: {', '.join(actividades)}

    Por favor, utiliza esta información para generar preguntas que ayuden a elegir un destino para su viaje.
    """
    
    # Llamada a la API de Gemini
    respuesta = genai.generate_text(prompt=prompt)

    # Verificar si la respuesta contiene preguntas
    if respuesta:
        preguntas = respuesta.text.strip().split("\n")
        return preguntas
    else:
        return ["Lo siento, no pude generar preguntas en este momento."]