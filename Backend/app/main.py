# app/main.py

from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect
from typing import List, Tuple
from app.skyscannerAPI.AirportDatabase import AirportDatabase 
from app.manager.room_manager import create_room, add_guest_to_room, remove_guest, delete_room
from app.manager.question_manager import initialize_questions, handle_answer
from app.manager.recommendation import handle_recommendation_response
from app.manager.transport import calculate_final_transport
from app.models.room_state import rooms, questions, recommendations
from app.utils.broadcast import broadcast_to_room

app = FastAPI()
airport_db = AirportDatabase()

@app.websocket("/ws/create")
async def host_endpoint(websocket: WebSocket):
    await websocket.accept()

    data = await websocket.receive_json()
    msg_type = data.get("type")

    if msg_type != "create":
        await websocket.close()
        return
    
    name = data.get("name")
    iata = data.get("iata")
    price = data.get("price")

    if not name or not iata or not price:
        await websocket.close()
        return

    room_code = create_room(websocket, name, iata, price)

    await websocket.send_json({"type": "room_created", "room_code": room_code, "host_name": name})

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "start":
                first_question = await initialize_questions(room_code)

                await broadcast_to_room(room_code, {
                    "type": "question",
                    "question_id": 0,
                    **first_question
                })

            elif msg_type == "answer":
                await handle_answer(websocket, room_code, data.get("answer"))

            elif msg_type == "select_recommendation":
                await handle_recommendation_response(websocket, room_code, data.get("answer"))

            elif msg_type == "calculate_transport":
                await calculate_final_transport(room_code)

    except WebSocketDisconnect:
        delete_room(room_code)
        questions.pop(room_code, None)
        recommendations.pop(room_code, None)

@app.websocket("/ws/join/{room_code}")
async def guest_endpoint(websocket: WebSocket, room_code: str):
    await websocket.accept()

    if room_code not in rooms:
        await websocket.send_json({
            "type": "error",
            "message": "Invalid room code"
        })
        await websocket.close()
        return

    await websocket.send_json({
        "type": "info",
        "message": f"Found a room with room code {room_code}"
    })

    try:
        guest_data = await websocket.receive_json()
        
        msg_type = guest_data.get("type")
        if msg_type != "join":
            await websocket.close()
            return
        
        name = guest_data.get("name")
        iata = guest_data.get("iata")
        price = guest_data.get("price")

        if not name or not iata or not price:
            await websocket.send_json({
                "type": "error",
                "message": "Missing guest information"
            })
            await websocket.close()
            return

        # 4. 게스트 등록
        if not add_guest_to_room(room_code, websocket, name, iata, price):
            await websocket.send_json({
                "type": "error",
                "message": "Could not join room"
            })
            await websocket.close()
            return

        await websocket.send_json({
            "type": "joined",
            "room_code": room_code,
            "client_name": name
        })

        await rooms[room_code]["host"][0].send_json({
            "type": "guest_joined",
            "room_code": room_code,
            "client_name": name
        })

        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "answer":
                await handle_answer(websocket, room_code, data.get("answer"))

            elif msg_type == "select_recommendation":
                await handle_recommendation_response(websocket, room_code, data.get("answer"))

            elif msg_type == "calculate_transport":
                await calculate_final_transport(room_code)

    except WebSocketDisconnect:
        remove_guest(websocket)
        
@app.get("/search-airports", response_model=List[Tuple[str, str]])
def search_airports(name: str = Query(..., description="Full or partial airport name")):
    """
    Search for airports whose name contains the given string.
    Returns a list of (airport_name, iata_code) pairs, max 10 results.
    """
    return airport_db.search_airports_by_keyword(name)

