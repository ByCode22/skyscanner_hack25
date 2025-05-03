class GuestSocketService {
	constructor() {
	  this.socket = null;
	  this.roomCode = null;
	  this.guestData = null;
  
	  this.onJoinedCallback = null;
	  this.onErrorCallback = null;
	  this.onOpenCallback = null;
	  this.onReadyCallback = null;
	}
  
	connect(roomCode, guestData) {
	  if (this.socket && this.socket.readyState === WebSocket.OPEN) return;
  
	  this.roomCode = roomCode;
	  this.guestData = guestData;
  
	  const url = `ws://localhost:8000/ws/join/${roomCode}`;
	  this.socket = new WebSocket(url);
  
	  this._bindSocketEvents();
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

	onReady(callback) {
		this.onReadyCallback = callback;
	  }
  
	close() {
	  if (this.socket) {
		this.socket.close();
		this.socket = null;
	  }
	}
  
	_bindSocketEvents() {
	  this.socket.onopen = () => {
		console.log("WebSocket connected (guest)");
		if (this.onOpenCallback) this.onOpenCallback();
	  };
  
	  this.socket.onmessage = (event) => {
		try {
		  const data = JSON.parse(event.data);
		  this._handleMessage(data);
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
  
	_handleMessage(data) {
	  switch (data.type) {
		case "joined":
			console.log(`Joined room ${data.room_code} as ${data.client_name}`);
			if (this.onJoinedCallback) {
				this.onJoinedCallback(data.room_code, data.client_name, data.users);
			}
			break;
		case "error":
			console.warn("Server error:", data.message);
			if (this.onErrorCallback) {
				this.onErrorCallback(data.message);
			}
			break;
		case "ready":
			console.log("✅ Received 'ready' from server");
			if (this.onReadyCallback) {
				this.onReadyCallback();
			}
			break;
		default:
		  console.log("Unhandled message:", data);
		  break;
	  }
	}
  }
  
  const guestSocketService = new GuestSocketService();
  export default guestSocketService;
  