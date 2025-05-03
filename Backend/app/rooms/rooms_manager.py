class RoomManager:
    def __init__(self):
        self.rooms = {}

    def create_room(self, creator_name):
        room = Room(creator_name)
        self.rooms[room.code] = room
        return room.code

    def join_room(self, code, user_name):
        if code in self.rooms:
            self.rooms[code].add_user(user_name)
            return True
        return False

    def get_room(self, code):
        return self.rooms.get(code)

    def get_group_responses(self, room_code):
        room = self.get_room(room_code)
        if room:
            return room.get_all_responses()
        return {}

    def get_most_voted_responses(self, room_code):
        room = self.get_room(room_code)
        if room:
            # Se calcula la respuesta más votada para cada pregunta
            questions = ['fecha', 'paisaje', 'presupuesto', 'actividades']
            group_responses = {}
            for question in questions:
                group_responses[question] = room.calculate_average_or_most_voted(question)
            return group_responses
        return {}