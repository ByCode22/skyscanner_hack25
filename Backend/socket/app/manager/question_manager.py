# app/manager/question_manager.py

from fastapi import WebSocket
from app.models.room_state import rooms, questions, initial_responses
from app.manager.question_generator import generate_question
from app.utils.broadcast import broadcast_to_room
from app.manager.recommendation import trigger_recommendation

async def initialize_questions(room_code: str):
    """Start the main question session with the first auto-generated question."""
    first_question = generate_question([])
    questions[room_code] = {
        "current_question": first_question,
        "responses": [],
        "history": [],
    }

async def handle_initial_answers(websocket: WebSocket, room_code: str, answers: list):
    """Store initial client-defined answers and trigger main session once all have responded."""
    if room_code not in initial_responses:
        initial_responses[room_code] = {}
    initial_responses[room_code][websocket] = answers

    await websocket.send_json({
        "type": "initial_answers_received",
        "message": "Initial answers saved"
    })

    total_participants = 1 + len(rooms[room_code]["guests"])
    if len(initial_responses[room_code]) == total_participants:
        await initialize_questions(room_code)
        current_question = questions[room_code]["current_question"]
        await broadcast_to_room(room_code, {
            "type": "question",
            "question": current_question
        })

async def handle_answer(websocket: WebSocket, room_code: str, value: int):
    """Handle a participant's answer, compute average, and send next question or trigger recommendation."""
    if room_code not in questions:
        return

    if not isinstance(value, int) or not (-2 <= value <= 2):
        await websocket.send_json({"type": "error", "message": "Invalid answer value"})
        return

    entry = questions[room_code]
    total_participants = 1 + len(rooms[room_code]["guests"])

    if len(entry["responses"]) >= total_participants:
        await websocket.send_json({"type": "error", "message": "All responses already received"})
        return

    entry["responses"].append(value)
    await websocket.send_json({"type": "answer_received", "message": "Answer recorded"})

    if len(entry["responses"]) == total_participants:
        avg = round(sum(entry["responses"]) / total_participants, 2)
        entry["history"].append({
            "question": entry["current_question"],
            "average": avg
        })

        history_len = len(entry["history"])
        if history_len == 5 or (history_len > 5 and (history_len - 5) % 3 == 0):
            await trigger_recommendation(room_code)
            return  # Pause further question flow until recommendation resolves

        next_question = generate_question(entry["history"])
        entry["current_question"] = next_question
        entry["responses"] = []

        await broadcast_to_room(room_code, {
            "type": "question",
            "question": next_question
        })
