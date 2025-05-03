# models/room_state.py

# Stores all active rooms
# Format: { room_code: { "host": WebSocket, "guests": [WebSocket, ...] } }
rooms = {}

# Stores question state for each room
# Format:
# {
#   room_code: {
#       "current_question": str,
#		"current_options" : [str],
#       "responses": [int],
#		"full_history": [{"question": str, "answers": {"option": str, "choices": str} | "period": str}]
#       "history": [{"question": str, "answer": string}]
#   }
# }
questions = {}

# Stores recommendation state for each room
# Format:
# {
#   room_code: {
#       "items": [str],
#       "responses": { WebSocket: str or None },
#       "total_participants": int
#   }
# }
recommendations = {}
