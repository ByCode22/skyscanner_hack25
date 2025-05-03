# Modelos Pydantic para validar datos
from pydantic import BaseModel
from typing import List

# Modelo para la entrada de datos desde el frontend
class DatosEntrada(BaseModel):
    fechas: str
    paisaje: str
    presupuesto: str
    actividades: List[str]
