// src/pages/HomePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';  // Importa los estilos de la página

const HomePage = () => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);  // Determina si el usuario quiere unirse o crear
  const navigate = useNavigate();

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
      navigate(`/waiting-room/${roomId}`, { state: { username } });
    } else {
      const newRoomId = generateRoomId();
      navigate(`/waiting-room/${newRoomId}`, { state: { username } });
    }
  };

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8);  // Genera un ID aleatorio corto
  };

  return (
    <div className="home-container">
      <div className="welcome-box">
        <h1 className="main-title">Welcome to The Perfect Reunion</h1>
        <p className="subtitle">Plan the best trip with your friends. Let’s find the perfect destination together!</p>

        <div className="form-container">
          <div className="username-switch-container">
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="username-input"
            />

            {/* Switch para elegir entre crear o unirse a una sala */}
            <div className="switch-container">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isJoiningRoom}
                  onChange={() => setIsJoiningRoom(!isJoiningRoom)}
                />
                <span className="slider"></span>
              </label>
              <span>{isJoiningRoom ? 'Join Room' : 'Create Room'}</span>
            </div>
          </div>

          {/* Campo para Room ID solo si el usuario quiere unirse */}
          {isJoiningRoom && (
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="room-id-input"
            />
          )}

          {/* Botón único que cambia de texto según la acción */}
          <button onClick={handleAction} className="home-button">
            {isJoiningRoom ? 'Join Room' : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
