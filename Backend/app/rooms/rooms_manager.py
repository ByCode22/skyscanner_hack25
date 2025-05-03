import json
import os
from random import randint

ANSWERS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "answers.json")
ROOMS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "rooms.json")

class Room:
    def __init__(self, creator_name):
        self.code = self.generate_code()
        self.creator_name = creator_name
        self.users = {creator_name}
        self.responses = {}

    def add_user(self, user_name):
        self.users.add(user_name)

    def generate_code(self):
        return str(randint(100000, 999999))  # Genera un código aleatorio de 6 dígitos.

    def add_response(self, user_name, response_data):
        self.responses[user_name] = response_data


class RoomManager:
    def __init__(self):
        self.rooms = self.load_rooms()

    def create_room(self, creator_name):
        room = Room(creator_name)
        self.rooms[room.code] = room
        self.save_rooms()
        return room.code

    def join_room(self, code, user_name):
        if code in self.rooms:
            self.rooms[code].add_user(user_name)
            self.save_rooms()
            return True
        return False

    def get_room(self, code):
        return self.rooms.get(code)

    def save_rooms(self):
        with open(ROOMS_FILE, "w") as file:
            json.dump(self.rooms, file, default=str, indent=4)

    def load_rooms(self):
        if not os.path.exists(ROOMS_FILE):
            return {}
        with open(ROOMS_FILE, "r") as file:
            return json.load(file)

    def save_responses(self, room_code, user_name, response_data):
        room = self.get_room(room_code)
        if room:
            room.add_response(user_name, response_data)
            self.save_rooms()  # Guarda las respuestas en el archivo de salas
            self.save_responses_to_file()

    def save_responses_to_file(self):
        responses_data = {room_code: room.responses for room_code, room in self.rooms.items()}
        with open(ANSWERS_FILE, "w") as file:
            json.dump(responses_data, file, indent=4)

    def load_responses(self):
        if not os.path.exists(ANSWERS_FILE):
            return {}
        with open(ANSWERS_FILE, "r") as file:
            return json.load(file)
