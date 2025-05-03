// src/pages/WaitingRoom.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './waitingRoom.css';

const WaitingRoom = () => {
  const [ready, setReady] = useState(false);  // Controla si el usuario está listo
  const navigate = useNavigate();
  const { roomId } = useParams();
  const location = useLocation();
  const { username } = location.state;  // Recibe el nombre del usuario

  useEffect(() => {
    // Simula que el usuario puede estar listo después de un tiempo
    // En un proyecto real, podrías hacer una consulta al servidor para ver si todos los jugadores están listos
    const timer = setTimeout(() => setReady(true), 3000);  // Cambia a true después de 3 segundos (simula que el jugador se prepara)
    return () => clearTimeout(timer);
  }, []);

  const handleStartQuiz = () => {
    navigate(`/room/${roomId}/quiz`, { state: { username } });  // Redirige al cuestionario
  };

  return (
    <div className="waiting-room-container">
      <h1>Waiting for others to join...</h1>
      <p>Hello {username}, you are in the waiting room for Room {roomId}.</p>
      {ready ? (
        <button onClick={handleStartQuiz} className="start-quiz-button">Start Quiz</button>
      ) : (
        <p>Waiting for all players to be ready...</p>
      )}
    </div>
  );
};

export default WaitingRoom;
