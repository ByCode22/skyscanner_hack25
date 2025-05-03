// src/services/socket.js

export default class WebSocketService {
    constructor(roomId) {
      // Aquí guardamos la ID de la sala
      this.roomId = roomId;
      this.socket = null;
    }
  
    // Inicializa la conexión WebSocket
    connect() {
      // Crea la conexión WebSocket
      this.socket = new WebSocket(`ws://localhost:8000/ws/${this.roomId}`);
  
      // Evento que se dispara cuando la conexión se establece
      this.socket.onopen = () => {
        console.log("Conexión WebSocket establecida.");
      };
  
      // Evento que se dispara cuando se recibe un mensaje
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Mensaje recibido:", data);
        // Aquí puedes gestionar el mensaje recibido, por ejemplo, actualizar el estado de la sala o las preguntas.
      };
  
      // Evento que se dispara cuando ocurre un error
      this.socket.onerror = (error) => {
        console.error("Error en la conexión WebSocket:", error);
      };
  
      // Evento que se dispara cuando la conexión se cierra
      this.socket.onclose = () => {
        console.log("Conexión WebSocket cerrada.");
      };
    }
  
    // Función para enviar un mensaje al servidor
    sendMessage(message) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
      } else {
        console.error("La conexión WebSocket no está abierta.");
      }
    }
  
    // Cerrar la conexión WebSocket
    close() {
      if (this.socket) {
        this.socket.close();
      }
    }
  }
  