# manager/recommendation.py

from fastapi import WebSocket
from collections import Counter
from app.models.room_state import rooms, questions, recommendations
from app.manager.question_generator import generate_question

async def trigger_recommendation(room_code: str):
    """Generate and send a recommendation list to all participants."""
    if room_code not in questions:
        return

    history = questions[room_code]["history"]
    items = generate_recommendations(history)
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

async def handle_recommendation_response(websocket: WebSocket, room_code: str, selection):
    """Handle participant's selection from the recommendation list."""
    if room_code not in recommendations:
        return

    rec = recommendations[room_code]
    rec["responses"][websocket] = selection  # str or None

    if len(rec["responses"]) == rec["total_participants"]:
        count = Counter(filter(None, rec["responses"].values()))
        for item, votes in count.items():
            if votes > rec["total_participants"] / 2:
                # Majority found
                all_ws = [rooms[room_code]["host"]] + rooms[room_code]["guests"]
                for ws in all_ws:
                    await ws.send_json({
                        "type": "final_decision",
                        "selected": item
                    })
                return

        # No majority → auto-generate a follow-up question
        entry = questions.get(room_code)
        if entry:
            next_question = generate_question()
            entry["current_question"] = next_question
            entry["responses"] = []

            all_ws = [rooms[room_code]["host"]] + rooms[room_code]["guests"]
            for ws in all_ws:
                await ws.send_json({
                    "type": "question",
                    "question": next_question
                })

def generate_recommendations(history: list) -> list[str]:
    """Generate a list of recommendation strings from history. Stub implementation."""
    return ["Walking", "Meditation", "Exercise"]
