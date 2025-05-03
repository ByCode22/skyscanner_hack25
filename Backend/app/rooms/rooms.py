import random
from collections import Counter

class Room:
    def __init__(self, creator_name):
        self.creator_name = creator_name
        self.users = {creator_name}  # Los usuarios se almacenan en un set (sin duplicados)
        self.responses = {}  # Diccionario para guardar las respuestas
        self.code = self.generate_room_code()  # Código único para la sala

    def generate_room_code(self):
        return str(random.randint(100000, 999999))  # Generar un código de sala aleatorio

    def add_user(self, user_name):
        """Añadir un nuevo usuario a la sala."""
        self.users.add(user_name)

    def add_response(self, user_name, question, answer):
        """Guardar las respuestas de un usuario."""
        if user_name not in self.responses:
            self.responses[user_name] = {}
        self.responses[user_name][question] = answer

    def get_all_responses(self):
        """Obtener todas las respuestas del grupo."""
        return self.responses

    def calculate_average_or_most_voted(self, question):
        """Calcula la media de las respuestas o selecciona la más votada."""
        # Obtener las respuestas de todos los usuarios para esta pregunta
        answers = [user_responses.get(question) for user_responses in self.responses.values()]

        # Contar las respuestas más comunes
        answer_counts = Counter(answers)
        
        # Si hay empate, volver a votar con las respuestas empatadas
        if len(answer_counts) > 1 and answer_counts.most_common(1)[0][1] == answer_counts.most_common(2)[1][1]:
            return self.resolve_tie(question, answer_counts)
        
        # De lo contrario, seleccionar la respuesta más votada
        return answer_counts.most_common(1)[0][0]

    def resolve_tie(self, question, answer_counts):
        """Resuelve el empate votando entre las opciones empatadas."""
        tied_answers = [answer for answer, count in answer_counts.items() if count == answer_counts.most_common(1)[0][1]]
        
        # Se simula una nueva votación entre las respuestas empatadas
        print(f"Hubo un empate en la pregunta '{question}'. Las opciones empatadas son: {', '.join(tied_answers)}.")
        new_vote = input("Por favor, vota por una de las opciones: ")
        
        # Validamos que la respuesta esté dentro de las opciones empatadas
        while new_vote not in tied_answers:
            new_vote = input(f"Respuesta inválida. Vota por una de las opciones: {', '.join(tied_answers)}")
        
        return new_vote
