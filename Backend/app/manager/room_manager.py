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


def create_room(websocket: WebSocket, name: str, origen: str, precio: int) -> str:
    """Register a new room with the host and return the room code."""
    room_code = generate_room_code()
    rooms[room_code] = {
        "host": {
            "websocket": websocket,
            "name": name,
            "origen": origen,
            "precio": precio
        },
        "guests": []
    }
    return room_code



def add_guest_to_room(room_code: str, websocket: WebSocket, name: str, origen: str, precio: int) -> bool:
    """Add a guest to a room with metadata."""
    if room_code not in rooms:
        return False
    rooms[room_code]["guests"].append({
        "websocket": websocket,
        "name": name,
        "origen": origen,
        "precio": precio
    })
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
