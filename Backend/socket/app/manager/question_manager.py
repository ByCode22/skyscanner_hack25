# app/manager/question_manager.py

from collections import Counter
from fastapi import WebSocket
from app.models.room_state import rooms, questions
from app.manager.question_generator import generate_question, generate_start_questions
from app.utils.broadcast import broadcast_to_room
from app.manager.recommendation import trigger_recommendation

async def initialize_questions(room_code: str):
    """Start the main question session with the first start question."""
    generator = generate_start_questions()
    first_question = next(generator)

    questions[room_code] = {
        "current_question": first_question["question"],
        "current_options": first_question["options"],
        "responses": [],
        "full_history": [],
        "history": [],
        "question_generator": generator
    }

    return first_question

async def handle_answer(websocket: WebSocket, room_code: str, data: dict):
    """
    Handle answer depending on question_id.
    - Question 0: expects {'start_date': str, 'end_date': str}
    - Others: expects {'index': int}
    """
    if room_code not in questions:
        return

    entry = questions[room_code]
    q_index = len(entry["history"])
    total_participants = 1 + len(rooms[room_code]["guests"])

    # Ensure valid input
    if q_index == 0:
        if not ("start_date" in data and "end_date" in data):
            await websocket.send_json({"type": "error", "message": "Invalid period format"})
            return
    else:
        if not isinstance(data.get("index"), int):
            await websocket.send_json({"type": "error", "message": "Invalid option index"})
            return

    # Initialize responses if not present
    if "responses" not in entry:
        entry["responses"] = []

    entry["responses"].append(data)
    await websocket.send_json({"type": "answer_received", "message": "Answer recorded"})

    if len(entry["responses"]) == total_participants:
        question_text = entry["current_question"]
        options = entry.get("current_options", [])

        if q_index == 0:
            first = entry["responses"][0]
            period_str = f"{first['start_date']} to {first['end_date']}"
            entry["full_history"].append({
                "question": question_text,
                "answers": {
                    "period": period_str
                }
            })
            entry["history"].append({
                "question": question_text,
                "answer": period_str
            })

        else:
            indices = [r["index"] for r in entry["responses"]]
            selected_index = Counter(indices).most_common(1)[0][0]
            selected_option = options[selected_index] if 0 <= selected_index < len(options) else "Unknown"

            entry["full_history"].append({
                "question": question_text,
                "answers": {
                    "option": selected_option,
                    "choices": ", ".join(options)
                }
            })
            entry["history"].append({
                "question": question_text,
                "answer": selected_option
            })

        # Reset responses and send next question
        entry["responses"] = []
        history_len = len(entry["history"])

        if history_len == 5 or (history_len > 5 and (history_len - 5) % 3 == 0):
            await trigger_recommendation(room_code)
            return

        if history_len < 2:
            next_question = next(questions[room_code]["question_generator"])
        else:
            next_question = generate_question(entry["history"])
        entry["current_question"] = next_question["question"]
        entry["current_options"] = next_question["options"]
        await broadcast_to_room(room_code, {
            "type": "question",
            "question_id": history_len,
            **next_question
        })
