# app/utils/broadcast.py

from app.models.room_state import rooms

def get_all_participants(room_code: str):
    return [rooms[room_code]["host"]] + rooms[room_code]["guests"]

async def broadcast_to_room(room_code: str, message: dict):
    for ws in get_all_participants(room_code):
        await ws[0].send_json(message)
