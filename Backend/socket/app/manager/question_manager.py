# app/manager/question_manager.py

from collections import Counter
from fastapi import WebSocket
from datetime import datetime
from typing import List, Optional, Tuple
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

DatePeriod = Tuple[datetime, datetime]

def intersect_periods(raw_period_data: List) -> Optional[DatePeriod]:
    if not raw_period_data:
        return None

    periods = [
        (
            stringdate_to_datetime(period['start_date']),
            stringdate_to_datetime(period['end_date'])
        )
        for period in raw_period_data
    ]

    max_start = max(period[0] for period in periods)
    min_end = min(period[1] for period in periods)

    if max_start <= min_end:
        return (max_start, min_end)
    return None

def stringdate_to_datetime(date_string: str) -> datetime:
    return datetime.strptime(date_string, "%Y-%m-%d")

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
            selected_period = intersect_periods(entry["responses"])

            if (selected_period == None):
                await broadcast_to_room(room_code, {
                    "type": "error",
                    "message": "no coinciden ninguna fecha"
                })
                entry["responses"] = []
                return

            period_str = {
                "start_date": selected_period[0].strftime("%Y-%m-%d"),
                "end_date": selected_period[1].strftime("%Y-%m-%d")
            } if selected_period else None

            entry["full_history"].append({
                "question": question_text,
                "answers": {
                    "period": [
                        {
                            "start_date": r["start_date"],
                            "end_date": r["end_date"]
                        } for r in entry["responses"]
                    ]
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

            if selected_option == "Ninguna":
                await broadcast_to_room(room_code, {
                    "type": "error",
                    "message": "no queremos nada"
                })
                next_question = generate_question(entry["history"])
                entry["current_question"] = next_question["question"]
                entry["current_options"] = next_question["options"]
                entry["responses"] = []
                await broadcast_to_room(room_code, {
                    "type": "question",
                    "question_id": history_len,
                    **next_question
                })
                return

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

        print(entry)

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
