// // src/components/JoinRoom.js
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './join-room.css';  // Ajustar la ruta si el CSS está en la carpeta styles

// const JoinRoom = () => {
//   const [roomId, setRoomId] = useState('');
//   const [username, setUsername] = useState('');
//   const navigate = useNavigate();

//   const handleJoinRoom = async () => {
//     const response = await fetch(`http://localhost:3000/join-room`, {
//       method: 'POST',
//       body: JSON.stringify({ roomId, username }),
//       headers: { 'Content-Type': 'application/json' },
//     });
    
//     const data = await response.json();

//     if (data.message === 'Joined room successfully') {
//       navigate(`/room/${roomId}`);  // Redirigir a la sala
//     } else {
//       alert('Room not found');
//     }
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         placeholder="Enter Room ID"
//         value={roomId}
//         onChange={(e) => setRoomId(e.target.value)}
//       />
//       <input
//         type="text"
//         placeholder="Enter Username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//       />
//       <button onClick={handleJoinRoom}>Join Room</button>
//     </div>
//   );
// };

// export default JoinRoom;
