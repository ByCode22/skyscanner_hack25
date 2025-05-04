
from pydantic import BaseModel
from typing import List, Optional

class Period(BaseModel):
    start_date: str  # "2025-05-16"
    end_date: str    # "2025-05-28"

class FlightRequest(BaseModel):
    origin_iata: str
    destination_iata: str
    period: Period
    price: Optional[float] = None