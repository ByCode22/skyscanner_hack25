# app/main.py

import os
from dotenv import load_dotenv
from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Tuple

from fastapi.responses import JSONResponse
from app.gemini.geminiAI import get_city_description_response
from app.skyscannerAPI.search import get_flights
from app.skyscannerAPI.AirportDatabase import AirportDatabase 
from app.manager.room_manager import create_room, add_guest_to_room, remove_guest, delete_room, get_all_users
from app.manager.question_manager import initialize_questions, handle_answer
from app.manager.recommendation import handle_recommendation_response
from app.manager.transport import calculate_final_transport
from app.models.room_state import rooms, questions, recommendations
from app.models.flight import FlightRequest
from app.utils.broadcast import broadcast_to_room

load_dotenv()

app = FastAPI()
airport_db = AirportDatabase()

SKYSCANNER_API_KEY = os.getenv("SKYSCANNER_API_KEY")

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, etc.
    allow_headers=["*"],
)

@app.websocket("/ws/create")
async def host_endpoint(websocket: WebSocket):
    try:
        await websocket.accept()

        data = await websocket.receive_json()
        msg_type = data.get("type")

        if msg_type != "create":
            await websocket.close()
            return
        
        name = data.get("name")
        iata = data.get("iata")

        if not name or not iata:
            await websocket.close()
            return

        room_code = create_room(websocket, name, iata)

        await websocket.send_json({"type": "room_created", "room_code": room_code, "host_name": name})

        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "ready":
                await broadcast_to_room(room_code, {"type": "ready"})

            elif msg_type == "start":
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
    try:
        await websocket.accept()

        if room_code not in rooms:
            await websocket.send_json({
                "type": "error",
                "message": "Invalid room code"
            })
            await websocket.close()
            return

        guest_data = await websocket.receive_json()
        
        msg_type = guest_data.get("type")
        if msg_type != "join":
            await websocket.close()
            return
        
        name = guest_data.get("name")
        iata = guest_data.get("iata")

        if not name or not iata:
            await websocket.send_json({
                "type": "error",
                "message": "Missing guest information"
            })
            await websocket.close()
            return

        if not add_guest_to_room(room_code, websocket, name, iata):
            await websocket.send_json({
                "type": "error",
                "message": "Could not join room"
            })
            await websocket.close()
            return
        
        message = {
            "type": "guest_joined",
            "room_code": room_code,
            "client_name": name,
            "users": get_all_users(room_code)
        }

        await rooms[room_code]["host"][0].send_json(message)
        message["type"] = "joined"
        await broadcast_to_room(room_code, message)

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

@app.post("/search-flights")
async def search_flights(data: FlightRequest):
    """
    Given origin, destination, and start date, return a list of flights (<= price).
    """
    try:
        year, month, day = map(int, data.period.start_date.split("-"))
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD"}

    flights = get_flights(SKYSCANNER_API_KEY, data.origin_iata, data.destination_iata, year, month, day)

    if data.price is not None:
        flights = [f for f in flights if f["price"] <= data.price]

    return {"flights": flights}

@app.get("/city-description")
async def get_city_description(city_name: str = Query(..., description="Name of the city")):
    """
    Generate a description for the given city using Gemini AI.
    """
    description = get_city_description_response(city_name)
    return JSONResponse(content={"description": description})
