from collections import Counter
from fastapi import WebSocket
from datetime import datetime
from typing import List, Optional, Tuple
from app.models.room_state import rooms, questions
from app.manager.question_generator import generate_question, generate_start_questions
from app.utils.broadcast import broadcast_to_room
from app.manager.recommendation import trigger_recommendation
from app.gemini.geminiAI import obtener_respuesta

async def initialize_questions(room_code: str):
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

    try:
        periods = [
            (
                stringdate_to_datetime(period["start_date"]),
                stringdate_to_datetime(period["end_date"])
            )
            for (_, period_list) in raw_period_data
            for period in period_list
        ]
    except Exception as e:
        print("❌ Failed to parse periods:", e)
        return None

    max_start = max(period[0] for period in periods)
    min_end = min(period[1] for period in periods)

    if max_start <= min_end:
        return (max_start, min_end)
    return None

def stringdate_to_datetime(date_string: str) -> datetime:
    return datetime.strptime(date_string, "%Y-%m-%d")

async def handle_answer(websocket: WebSocket, room_code: str, data: dict):
    if room_code not in questions:
        return
    entry = questions[room_code]
    q_index = len(entry["history"])
    total_participants = 1 + len(rooms[room_code]["guests"])

    # Validation
    if q_index == 0:
        if not isinstance(data, list):
            await websocket.send_json({"type": "error", "message": "Answer must be a list of periods"})
            return
        try:
            for period in data:
                if "start_date" not in period or "end_date" not in period:
                    raise ValueError
        except Exception:
            await websocket.send_json({"type": "error", "message": "Invalid period format"})
            return
    elif q_index == 1:
        if not isinstance(data.get("price"), int):
            await websocket.send_json({"type": "error", "message": "Invalid option price"})
            return
    else:
        if not isinstance(data.get("index"), int):
            await websocket.send_json({"type": "error", "message": "Invalid option index"})
            return

    if "responses" not in entry:
        entry["responses"] = []

    entry["responses"].append((websocket, data))
    await websocket.send_json({"type": "answer_received", "message": "Answer recorded"})

    if len(entry["responses"]) == total_participants:
        question_text = entry["current_question"]
        options = entry.get("current_options", [])

        if q_index == 0:
            selected_period = intersect_periods(entry["responses"])

            if selected_period is None:
                await broadcast_to_room(room_code, {
                    "type": "error",
                    "message": "no coinciden ninguna fecha"
                })
                entry["responses"] = []
                return

            period_str = {
                "start_date": selected_period[0].strftime("%Y-%m-%d"),
                "end_date": selected_period[1].strftime("%Y-%m-%d")
            }

            entry["full_history"].append({
                "question": question_text,
                "answers": {
                    "period": entry["responses"]
                }
            })
            entry["history"].append({
                "question": question_text,
                "answer": period_str
            })

        elif q_index == 1:
            prices = [r[1]["price"] for r in entry["responses"]]
            avg_price = round(sum(prices) / len(prices))

            entry["full_history"].append({
                "question": question_text,
                "answers": {
                    "price": entry["responses"]
                }
            })
            entry["history"].append({
                "question": question_text,
                "answer": avg_price
            })

            # Update room participant prices
            for socket, d in entry["responses"]:
                if rooms[room_code]["host"][0] == socket:
                    rooms[room_code]["host"][3] = d["price"]
                else:
                    for guest in rooms[room_code]["guests"]:
                        if guest[0] == socket:
                            guest[3] = d["price"]

        else:
            indices = [r[1]["index"] for r in entry["responses"]]
            selected_index = Counter(indices).most_common(1)[0][0]
            selected_option = options[selected_index] if 0 <= selected_index < len(options) else "Unknown"

            entry["full_history"].append({
                "question": question_text,
                "answers": entry["responses"],
                "options": ", ".join(options)
            })
            entry["history"].append({
                "question": question_text,
                "answer": selected_option
            })

        entry["responses"] = []
        history_len = len(entry["history"])

        if history_len == 5 or (history_len > 5 and (history_len - 5) % 3 == 0):
            await trigger_recommendation(room_code)
            return

        if history_len < 3:
            next_question = next(questions[room_code]["question_generator"])
        else:
            next_question = obtener_respuesta(entry["history"], True)

        entry["current_question"] = next_question["question"]
        entry["current_options"] = next_question["options"]

        await broadcast_to_room(room_code, {
            "type": "question",
            "question_id": history_len,
            **next_question
        })
