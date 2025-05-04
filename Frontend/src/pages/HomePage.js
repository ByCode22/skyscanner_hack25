import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import hostSocketService from '../services/HostSocketService';
import guestSocketService from '../services/GuestSocketService';

const HomePage = () => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const navigate = useNavigate();

  const handleHostSocketConnection = () => {
    hostSocketService.onRoomCreated((roomCode) => {
      navigate(`/waiting-room/${roomCode}`, {
        state: { username, roomCode },
      });
    });
  
    hostSocketService.onOpen(() => {
      hostSocketService.sendHostInfo({
        name: username,
        iata: 'BCN',
        price: 300,
      });
    });
  
    hostSocketService.connect();
  };
  
  const handleGuestSocketConnection = () => {
    guestSocketService.onJoined((roomCode, clientName, users) => {
      navigate(`/waiting-room/${roomCode}`, {
        state: {
          username: clientName,
          roomCode,
          users,
        },
      });
    });
  
    guestSocketService.onError((message) => {
      alert("Failed to join room: " + message);
    });
  
    guestSocketService.onOpen(() => {
      guestSocketService.sendJoinInfo();
    });
  
    guestSocketService.connect(roomId, {
      name: username,
      iata: 'ICN',
      price: 450,
    });
  };  

  const handleAction = () => {
    if (!username) {
      alert('Please enter your username');
      return;
    }

    if (isJoiningRoom && !roomId) {
      alert('Please enter a room ID');
      return;
    }

    if (isJoiningRoom) {
      handleGuestSocketConnection();
    } else {
      handleHostSocketConnection();
    }
  };

  return (
    <div className="home-container">
      <div className="welcome-box">
        <h1 className="main-title">Welcome to The Perfect Reunion</h1>
        <p className="subtitle">
          Plan the best trip with your friends. Let’s find the perfect destination together!
        </p>

        <div className="form-container">
          <div className="username-switch-container">
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="username-input"
            />

            <div className="switch-container">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isJoiningRoom}
                  onChange={() => setIsJoiningRoom(!isJoiningRoom)}
                />
                <span className="slider"></span>
              </label>
              <span>{isJoiningRoom ? 'Create Room' : 'Join Room'}</span>
            </div>
          </div>

          {isJoiningRoom && (
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="room-id-input"
            />
          )}

          <button onClick={handleAction} className="home-button">
            {isJoiningRoom ? 'Join Room' : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
