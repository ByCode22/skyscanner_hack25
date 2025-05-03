import React, { useState, useEffect } from 'react';
import './waitingRoom.css';

const WaitingRoom = ({ creator, roomId }) => {
  const [participants, setParticipants] = useState([creator]);  // Comienza con el creador
  const [canStart, setCanStart] = useState(false);

  // Simulación de que alguien se une a la sala (esto es solo para demostración)
  useEffect(() => {
    // Este efecto simula que un participante se une después de 2 segundos
    setTimeout(() => {
      setParticipants(prev => [...prev, 'Carlos Sánchez']); // Simula que un participante se unió
    }, 2000);
  }, []);

  useEffect(() => {
    // Solo el creador puede iniciar el quiz, y solo si está en la lista de participantes
    if (participants[0] === creator) {
      setCanStart(true);
    } else {
      setCanStart(false);
    }
  }, [participants, creator]); // Recalcula si se puede iniciar cuando la lista cambia

  const startQuiz = () => {
    if (creator === participants[0]) {
      console.log("Iniciando el quiz...");
      // Aquí iría la lógica para redirigir al quiz
    } else {
      alert("Solo el creador puede iniciar la partida.");
    }
  };

  return (
    <div className="waiting-room-container">
      <div className="room-header">
        <h2>Bienvenido a la sala: {roomId}</h2>
        <p><strong>Participantes:</strong> {participants.length}</p>
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
          disabled={!canStart} // El botón solo se habilita si el creador es el primero
        >
          {canStart ? 'Iniciar Quiz' : 'Esperando más participantes...'}
        </button>
      </div>
    </div>
  );
};

export default WaitingRoom;
