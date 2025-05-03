import google.generativeai as genai
from gemini.config import API_KEY

# Configurar la clave de API de Gemini
genai.configure(api_key=API_KEY)

def generar_prompt_pregunta(history):
    history_text = "\n".join([f"- {pregunta}: {respuesta}" for pregunta, respuesta in history.items()])

    prompt = f"""
Estás ayudando a un grupo de personas a decidir un destino de viaje en Europa occidental.

Historial de preguntas ya hechas con sus respuestas más frecuentes:
{history_text}

Ahora, genera UNA nueva pregunta para seguir afinando la elección. 

Reglas:
- Debe tener 4 opciones distintas y claras.
- No repitas preguntas anteriores.
- La pregunta debe ser más específica que las anteriores.
- NO sugieras destinos.

⚠️ Devuelve solo un JSON con el siguiente formato (sin texto adicional):

{{
    "question": "Texto de la nueva pregunta",
    "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"]
}}
"""
    return prompt


def generar_prompt_sugerencia(history):
    history_text = "\n".join([f"- {pregunta}: {respuesta}" for pregunta, respuesta in history.items()])

    prompt = f"""
Estás ayudando a un grupo de personas a elegir un país de Europa occidental para su viaje.

Basado en sus respuestas colectivas, sugiere 3 países que podrían encajar bien con sus preferencias. La cuarta opción debe ser: "Seguir respondiendo preguntas para afinar más la elección".

Historial de respuestas más votadas:
{history_text}

⚠️ Devuelve solo un JSON con el siguiente formato (sin texto adicional):

{{
    "options": ["País 1", "País 2", "País 3", "Seguir respondiendo preguntas para afinar más la elección"]
}}
"""
    return prompt


def obtener_respuesta(history, contador_preguntas):
    if contador_preguntas % 5 == 0:
        prompt = generar_prompt_sugerencia(history)
    else:
        prompt = generar_prompt_pregunta(history)

    print(f"Prompt enviado a la API:\n{prompt}\n")

    try:
        model = genai.GenerativeModel("gemini-2.0-flash-lite")
        respuesta = model.generate_content(prompt)
        if respuesta and respuesta.text.strip():
            return [respuesta.text.strip()]
        else:
            return ["Lo siento, no pude generar una pregunta en este momento."]
    except Exception as e:
        print(f"Error al generar preguntas: {e}")
        return ["Lo siento, hubo un error al generar las preguntas."]
