# manager/recommendation.py

from fastapi import WebSocket
from collections import Counter
from app.models.room_state import rooms, questions, recommendations
from app.manager.question_generator import generate_question
from app.gemini.geminiAI import obtener_respuesta

async def trigger_recommendation(room_code: str):
    """Generate and send a recommendation list to all participants."""
    if room_code not in questions:
        return

    history = questions[room_code]["history"]
    items = obtener_respuesta(history, False)
    #check si existe la ciudad en la base de datos.
    #en caso de que exista extraer la entityId de la ciudad correspondiente.
    #escoger las tres primeras validas.
    total = 1 + len(rooms[room_code]["guests"])

    recommendations[room_code] = {
        "items": items,
        "responses": {},
        "total_participants": total
    }

    all_ws = [rooms[room_code]["host"]] + rooms[room_code]["guests"]
    for ws in all_ws:
        await ws.send_json({
            "type": "recommendation",
            "items": items
        })

async def handle_recommendation_response(websocket: WebSocket, room_code: str, answer):
    if room_code not in recommendations:
        return

    rec = recommendations[room_code]
    rec["responses"][websocket] = answer["index"]  # int or None

    if len(rec["responses"]) == rec["total_participants"]:
        count = Counter(filter(None, rec["responses"].values()))
        total = rec["total_participants"]
        for item, votes in count.items():
            if votes > total / 2:
                if item == 3:
                    break
                all_ws = [rooms[room_code]["host"]] + rooms[room_code]["guests"]
                for ws in all_ws:
                    await ws.send_json({
                        "type": "final_decision",
                        "selected": recommendations[room_code]["items"]["options"][item]
                    })
                return
        entry = questions.get(room_code)
        if entry:
            next_question = obtener_respuesta(entry["history"], True)
            entry["current_question"] = next_question["question"]
            entry["current_options"] = next_question["options"]
            entry["responses"] = []

            all_ws = [rooms[room_code]["host"]] + rooms[room_code]["guests"]
            for ws in all_ws:
                await ws.send_json({
                    "type": "question",
                    "question": next_question
                })

