import sys
from rooms_manager import RoomManager

def mostrar_menu():
    print("\n--- MENÚ DE INTERACCIÓN ---")
    print("1. Crear una sala")
    print("2. Unirse a una sala")
    print("3. Guardar respuestas")
    print("4. Salir")

def interactuar_con_usuario():
    manager = RoomManager()

    while True:
        mostrar_menu()

        # Leer la opción del usuario
        opcion = input("Elige una opción (1-4): ")

        if opcion == "1":
            creator_name = input("Introduce tu nombre: ")
            room_code = manager.create_room(creator_name)
            print(f"¡Sala creada! El código de la sala es: {room_code}")
        
        elif opcion == "2":
            room_code = input("Introduce el código de la sala a la que deseas unirte: ")
            user_name = input("Introduce tu nombre: ")
            if manager.join_room(room_code, user_name):
                print(f"¡{user_name} se ha unido a la sala {room_code}!")
            else:
                print("No se pudo unir a la sala. Verifica el código e intenta nuevamente.")
        
        elif opcion == "3":
            room_code = input("Introduce el código de la sala: ")
            user_name = input("Introduce tu nombre: ")
            fecha = input("¿Cuáles son las fechas disponibles para el viaje? (ej. 2025-06-01 to 2025-06-10): ")
            paisaje = input("¿Qué tipo de paisaje prefieres? (montaña, playa, ciudad, etc.): ")
            presupuesto = input("¿Cuál es tu presupuesto para el viaje? (ej. 1000 EUR, 3000 USD): ")
            actividades = input("¿Qué actividades te gustaría realizar durante el viaje? (separa por comas): ").split(",")
            
            # Guardar las respuestas en el sistema
            manager.save_responses(room_code, user_name, {
                "fecha": fecha,
                "paisaje": paisaje,
                "presupuesto": presupuesto,
                "actividades": actividades
            })
            print(f"Respuestas de {user_name} guardadas correctamente.")
        
        elif opcion == "4":
            print("¡Hasta luego!")
            sys.exit(0)
        
        else:
            print("Opción no válida, por favor elige una opción entre 1 y 4.")

if __name__ == "__main__":
    interactuar_con_usuario()
