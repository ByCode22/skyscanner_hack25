class GuestSocketService {
	constructor() {
	  this.socket = null;
	  this.roomCode = null;
	  this.guestData = null;
	  this.onJoinedCallback = null;
	  this.onErrorCallback = null;
	  this.onOpenCallback = null;
	}
  
	connect(roomCode, guestData) {
	  if (this.socket && this.socket.readyState === WebSocket.OPEN) return;
  
	  this.roomCode = roomCode;
	  this.guestData = guestData;
	  const url = `ws://localhost:8000/ws/join/${roomCode}`;
	  this.socket = new WebSocket(url);
  
	  this.socket.onopen = () => {
		console.log("WebSocket connected (guest)");
		if (this.onOpenCallback) this.onOpenCallback();
	  };
  
	  this.socket.onmessage = (event) => {
		try {
		  const data = JSON.parse(event.data);
  
		  if (data.type === "joined") {
			console.log(`Joined room ${data.room_code} as ${data.client_name} with ${data.users}`);
			console.log(this.onJoinedCallback)
			if (this.onJoinedCallback) {
			  this.onJoinedCallback(data.room_code, data.client_name, data.users);
			}
		  } else if (data.type === "error") {
			console.warn("Server error:", data.message);
			if (this.onErrorCallback) {
			  this.onErrorCallback(data.message);
			}
		  } else {
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
  
	sendJoinInfo() {
	  if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
		console.warn("WebSocket is not connected.");
		return;
	  }
  
	  const message = {
		type: "join",
		name: this.guestData.name,
		iata: this.guestData.iata,
		price: this.guestData.price,
	  };
  
	  this.socket.send(JSON.stringify(message));
	}
  
	onJoined(callback) {
	  this.onJoinedCallback = callback;
	}
  
	onError(callback) {
	  this.onErrorCallback = callback;
	}
  
	onOpen(callback) {
	  this.onOpenCallback = callback;
	}
  
	close() {
	  if (this.socket) {
		this.socket.close();
		this.socket = null;
	  }
	}
  }
  
  const guestSocketService = new GuestSocketService();
  export default guestSocketService;
  