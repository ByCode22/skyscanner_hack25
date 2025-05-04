import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './waitingRoom.css';

import hostSocketService from '../services/HostSocketService';
import guestSocketService from '../services/GuestSocketService';

const WaitingRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const { username: creator, roomCode, users: initialUsers } = location.state || {};
  const [participants, setParticipants] = useState(initialUsers || [creator]);
  const [canStart, setCanStart] = useState(false);
  const navigate = useNavigate();

  // Función para copiar el código al portapapeles
  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      alert("Room code copied to clipboard!");
    }).catch(err => {
      alert("Failed to copy room code");
    });
  };

  useEffect(() => {
    console.log("🧠 WaitingRoom mounted. roomId =", roomId);

    hostSocketService.onGuestJoined((roomCode, guestName, users) => {
      console.log("✅ host received guest_joined:", roomCode, guestName, users);
      if (roomCode === roomId) {
        setParticipants(users);
      }
    });

    guestSocketService.onJoined((roomCode, clientName, users) => {
      console.log("✅ guest received joined:", roomCode, clientName, users);
      if (roomCode === roomId) {
        setParticipants(users);
      }
    });

    guestSocketService.onReady(() => {
      navigate(`/quiz/${roomId}`, {
        state: {
          isHost: false,
          username: creator,
          roomCode
        }
      });
    });

    return () => {
      console.log("👋 WaitingRoom unmounted");
    };
  }, [roomId]);

  useEffect(() => {
    console.log("👥 Participants updated:", participants);
    setCanStart(participants[0] === creator);
  }, [participants, creator]);

  const startQuiz = () => {
    if (canStart) {
      hostSocketService.sendReady();
      navigate(`/quiz/${roomId}`, {
        state: {
          isHost: true,
          roomCode: roomId,
          username: creator,
        },
      });
    } else {
      alert("Only the host can start the quiz.");
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  if (!roomId || !creator) {
    return <p>❌ Missing room information. Please return to home.</p>;
  }

  return (
    <div className="waiting-room-container">
      <div className="back-button" onClick={goBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="room-header">
        <h2>Welcome to the room</h2>
        <div className="room-id-container">
          <p className="room-id"><strong>Room code:</strong> {roomId}</p>
          <button className="copy-button" onClick={copyToClipboard}>Copy code</button>
        </div>
        <p className="numParticipants"><strong>Participants:</strong> {participants.length}</p>
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
          {canStart ? 'Start Quiz' : 'Waiting for more participants...'}
        </button>
      </div>
    </div>
  );
};

export default WaitingRoom;