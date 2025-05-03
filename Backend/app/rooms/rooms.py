import uuid

class User:
    def __init__(self, name):
        self.name = name
        self.fechas = ""
        self.paisaje = ""
        self.presupuesto = ""
        self.actividades = []

class Room:
    def __init__(self, creator_name):
        self.code = self._generate_code()
        self.users = {}
        self.add_user(creator_name)

    def _generate_code(self):
        return str(uuid.uuid4())[:6]  # genera un código corto

    def add_user(self, name):
        if name not in self.users:
            self.users[name] = User(name)

    def get_user_data(self):
        return {name: vars(user) for name, user in self.users.items()}
