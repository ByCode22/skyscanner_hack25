class HostSocketService {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.roomCode = null;
    this.onRoomCreatedCallback = null;
    this.onGuestJoinedCallback = null;
    this.onOpenCallback = null;
    this.onQuestionCallback = null;
    this.onRecommendationCallback = null;
    this.onFinalDecisionCallback = null;
  }

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("WebSocket connected (host)");
      if (this.onOpenCallback) this.onOpenCallback();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "room_created") {
          this.roomCode = data.room_code;
          console.log("Room created:", this.roomCode);

          if (this.onRoomCreatedCallback) {
            this.onRoomCreatedCallback(this.roomCode, data.host_name);
          }
        }
        else if (data.type === "guest_joined") {
          console.log("Guest joined:", data.client_name, "with", data.users);

          if (this.onGuestJoinedCallback) {
            this.onGuestJoinedCallback(data.room_code, data.client_name, data.users);
          }
        }
        else if (data.type === "question") {
          console.log("📩 Received AI question:", data);
          if (this.onQuestionCallback) {
            this.onQuestionCallback(data);
          }
        }
        else if (data.type === "recommendation") {
          console.log("📦 Received recommendation:", data.items);
          if (this.onRecommendationCallback) {
            this.onRecommendationCallback(data.items);
          }
        }
        else if (data.type === "final_decision") {
          console.log("✅ Final decision received:", data);
          if (this.onFinalDecisionCallback) {
            this.onFinalDecisionCallback(data);
          }
        }

        else {
          console.log("Unhandled message:", data);
        }

      } catch (err) {
        console.error("Invalid JSON received:", event.data);
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected");
    };
  }

  /**
   * 호스트 정보 전송
   * @param {{name: string, iata: string, price: number}} hostData
   */
  sendHostInfo(hostData) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected.");
      return;
    }

    const message = {
      type: "create",
      name: hostData.name,
      iata: hostData.iata,
      price: hostData.price,
    };

    this.socket.send(JSON.stringify(message));
  }

  sendReady() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected.");
      return;
    }

    this.socket.send(JSON.stringify({ type: "ready" }));
  }

  onRoomCreated(callback) {
    this.onRoomCreatedCallback = callback;
  }

  onGuestJoined(callback) {
    this.onGuestJoinedCallback = callback;
  }

  onOpen(callback) {
    this.onOpenCallback = callback;
  }

  onQuestion(callback) {
    this.onQuestionCallback = callback;
  }

  onRecommendation(callback) {
    this.onRecommendationCallback = callback;
  }
  
  onFinalDecision(callback) {
    this.onFinalDecisionCallback = callback;
  }

  getRoomCode() {
    return this.roomCode;
  }

  close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

const hostSocketService = new HostSocketService("ws://localhost:8000/ws/create");
export default hostSocketService;
