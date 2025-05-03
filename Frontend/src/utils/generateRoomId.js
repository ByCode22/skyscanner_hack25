// src/utils/generateRoomId.js

export const generateRoomId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let roomId = '';
    
    // Generar una cadena aleatoria de 5 caracteres
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      roomId += characters[randomIndex];
    }
    
    return roomId;
  };
  