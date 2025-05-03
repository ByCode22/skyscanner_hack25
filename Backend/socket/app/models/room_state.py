# models/room_state.py

# Stores all active rooms
# Format: { room_code: { "host": WebSocket, "guests": [WebSocket, ...] } }
rooms = {}

# Stores question state for each room
# Format:
# {
#   room_code: {
#       "current_question": str,
#       "responses": [int],
#       "history": [{"question": str, "average": float}]
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

# Stores initial client-defined questions and answers
# Format:
# {
#   room_code: [
#       {"question": str, "answer": Any},
#       ...
#   ]
# }
initial_responses = {}
