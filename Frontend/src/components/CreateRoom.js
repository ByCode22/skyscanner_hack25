// // src/components/CreateRoom.js
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';  // Hook de navegación
// import { generateRoomId } from '../utils/generateRoomId';  // Función para generar el roomId

// const CreateRoom = () => {
//   const [username, setUsername] = useState('');
//   const navigate = useNavigate();  // Hook de navegación

//   const handleCreateRoom = async () => {
//     const newRoomId = generateRoomId();  // Generamos un ID aleatorio para la sala
//     // Redirigimos a la página de la sala, pasando el roomId
//     navigate(`/room/${newRoomId}`);
//   };

//   return (
//     <div className="container">
//       <h2>Create a New Room</h2>
//       <input
//         type="text"
//         placeholder="Enter your name"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//       />
//       <button onClick={handleCreateRoom}>Create Room</button>
//     </div>
//   );
// };

// export default CreateRoom;
