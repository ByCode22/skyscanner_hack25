// src/components/WaitingRoom.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
import './waitingRoom.css';

const WaitingRoom = ({ creator, roomId }) => {
  const [participants, setParticipants] = useState([creator]);
  const [canStart, setCanStart] = useState(false);
  const navigate = useNavigate(); // Hook para navegación

  // Simulación de que alguien se une a la sala (esto es solo para demostración)
  useEffect(() => {
    setTimeout(() => {
      setParticipants(prev => [...prev, 'Carlos Sánchez']);
    }, 2000);
  }, []);

  useEffect(() => {
    if (participants[0] === creator) {
      setCanStart(true);
    } else {
      setCanStart(false);
    }
  }, [participants, creator]);

  const startQuiz = () => {
    if (creator === participants[0]) {
      console.log("Iniciando el quiz...");
      navigate(`/quiz/${roomId}`);
    } else {
      alert("Solo el creador puede iniciar el quiz.");
    }
  };

  // Función para ir atrás
  const goBack = () => {
    navigate(-1); // Navega hacia la página anterior
  };

  return (
    <div className="waiting-room-container">
      {/* Botón de flecha para ir atrás */}
      <div className="back-button" onClick={goBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18l-6-6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="room-header">
        <h2>Welcome to the room:{roomId}</h2>
        <p><strong>Participants:</strong> {participants.length}</p>
      </div>

      <div className="participants-list">
        {participants.map((participant, index) => (
          <div key={index} className="participant-item">
            <span>{participant}</span>
          </div>
        ))}
      </div>

      <div className="start-button-container">
        <button 
          onClick={startQuiz} 
          className="start-btn" 
          disabled={!canStart}
        >
          {canStart ? 'Iniciar Quiz' : 'Esperando más participantes...'}
        </button>
      </div>
    </div>
  );
};

export default WaitingRoom;
