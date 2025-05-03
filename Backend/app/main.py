# Servidor FastAPI y rutas
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import geminiAI

# Inicializar FastAPI
app = FastAPI()

# Modelo de entrada para las respuestas del frontend
class DatosEntrada(BaseModel):
    fechas: str
    paisaje: str
    presupuesto: str
    actividades: List[str]

@app.post("/generar_preguntas")
def generar_preguntas(datos: DatosEntrada):
    # Aquí pasamos las respuestas al modelo de Gemini
    preguntas = geminiAI.obtener_preguntas(datos.fechas, datos.paisaje, datos.presupuesto, datos.actividades)
    
    # Devolver las preguntas generadas al frontend
    return {"preguntas": preguntas}
#source ../venv/bin/activate  