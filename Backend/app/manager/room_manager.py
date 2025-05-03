# manager/room_manager.py

import string, random
from fastapi import WebSocket
from app.models.room_state import rooms

def generate_room_code(length: int = 6) -> str:
    """Generate a unique alphanumeric room code."""
    chars = string.ascii_letters + string.digits
    while True:
        code = ''.join(random.choices(chars, k=length))
        if code not in rooms:
            return code


def create_room(websocket: WebSocket, name: str, iata: str, price: int) -> str:
    """Register a new room with the host websocket and return the room code."""
    room_code = generate_room_code()
    rooms[room_code] = {
        "host": [websocket, name, iata, price],
        "guests": []
    }
    return room_code


def add_guest_to_room(room_code: str, websocket: WebSocket, name: str, iata: str, price: int) -> bool:
    """Add a guest websocket to an existing room. Returns False if room doesn't exist."""
    if room_code not in rooms:
        return False
    rooms[room_code]["guests"].append([websocket, name, iata, price])
    return True



def remove_guest(websocket: WebSocket):
    """Remove guest by websocket from any room."""
    for room in rooms.values():
        room["guests"] = [g for g in room["guests"] if g["websocket"] != websocket]



def delete_room(room_code: str):
    """Delete the room and clean up associated state."""
    if room_code in rooms:
        del rooms[room_code]



def get_all_users(room_code: str):
    room = rooms.get(room_code)
    if not room:
        return []
    return [room["host"]] + room["guests"]
