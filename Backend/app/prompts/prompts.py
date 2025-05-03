# Definir los prompts para la API de Gemini
def generar_prompt(fechas, paisaje, presupuesto, actividades):
    """
    Genera un prompt para la API de Gemini basado en las preferencias del usuario.
    
    Args:
    - fechas (str): El rango de fechas disponibles (ej. "2025-06-01 to 2025-06-10").
    - paisaje (str): El tipo de paisaje preferido (ej. "playa", "montaña").
    - presupuesto (str): El presupuesto disponible en € (ej. "3000").
    - actividades (list): Lista de actividades preferidas (ej. ["senderismo", "buceo", "museos"]).
    
    Returns:
    - str: El prompt generado para la API de Gemini.
    """
    
    # Construir el prompt a partir de las preferencias del usuario
    prompt = f"""
    Teniendo en cuenta los siguientes datos, por favor genera una serie de preguntas para que los usuarios de un grupo puedan elegir sus preferencias:
    
    Fechas disponibles: {fechas}
    Paisaje preferido: {paisaje}
    Presupuesto disponible: {presupuesto}
    Actividades preferidas: {', '.join(actividades)}
    
    Las preguntas deben ser de la siguiente forma:
    - Las respuestas deben ser en una escala de -2 a 2, donde:
        - -2 significa "muy poco"
        - 2 significa "mucho"
    
    Las preguntas deben ayudar a determinar el destino ideal para el grupo, basándose en las fechas, el tipo de paisaje, el presupuesto y las actividades preferidas.
    """
    
    return prompt
