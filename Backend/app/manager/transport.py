# app/manager/transport.py

from app.models.room_state import rooms
from app.utils.broadcast import broadcast_to_room

async def calculate_final_transport(room_code: str):
    """
    Send a dummy list of transport options to the selected destination.
    The destination is already selected via select_recommendation.
    """
    dummy_transports = ["Train", "Flight", "Bus"]

    await broadcast_to_room(room_code, {
        "type": "final_transport",
        "options": dummy_transports
    })
