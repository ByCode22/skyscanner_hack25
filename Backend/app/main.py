import google.generativeai as genai
from gemini.config import API_KEY

# Configurar la clave de API de Gemini
genai.configure(api_key=API_KEY)

def obtener_preguntas(fechas, paisaje, presupuesto, actividades):
    prompt = f"""
    Las fechas disponibles son: {fechas}.
    El tipo de paisaje preferido es: {paisaje}.
    El presupuesto disponible es: {presupuesto}.
    Las actividades preferidas son: {', '.join(actividades)}.

    Por favor, genera una serie de preguntas que puedan ayudar a los usuarios a elegir un destino para su viaje.
    """
    
    # Depuración del prompt generado
    print(f"Prompt enviado a la API: {prompt}")
    
    try:
        # Llamada a la API de Gemini
        model = genai.GenerativeModel("gemini-2.0-flash-lite")  # o "gemini-1.5-flash" si tienes acceso
        respuesta = model.generate_content(prompt)
        
        # Verificar si la respuesta contiene preguntas
        if respuesta and respuesta.text.strip():
            preguntas = respuesta.text.strip().split("\n")
            return preguntas
        else:
            return ["Lo siento, no pude generar preguntas en este momento."]
    except Exception as e:
        print(f"Error al generar preguntas: {e}")
        return ["Lo siento, hubo un error al generar las preguntas."]

# Función para interactuar con el usuario
def interactuar_con_usuario():
    print("¡Bienvenido al generador de preguntas para viajes!")
    
    # Solicitar fechas disponibles
    fechas = input("¿Cuáles son las fechas disponibles para el viaje? (ej. 2025-06-01 to 2025-06-10): ")
    
    # Solicitar tipo de paisaje preferido
    paisaje = input("¿Qué tipo de paisaje prefieres? (montaña, playa, ciudad, etc.): ")
    
    # Solicitar presupuesto
    presupuesto = input("¿Cuál es tu presupuesto para el viaje? (ej. 1000 EUR, 3000 USD): ")
    
    # Solicitar actividades preferidas
    actividades = input("¿Qué actividades te gustaría realizar durante el viaje? (separa por comas): ").split(",")
    
    # Llamar a la función para obtener preguntas de la API de Gemini
    preguntas = obtener_preguntas(fechas, paisaje, presupuesto, actividades)
    
    # Mostrar las preguntas generadas
    print("\nPreguntas generadas:")
    for pregunta in preguntas:
        print(f"- {pregunta}")

# Iniciar la interacción con el usuario
if __name__ == "__main__":
    interactuar_con_usuario()
