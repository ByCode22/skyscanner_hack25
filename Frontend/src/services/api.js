// src/services/api.js
export const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/questions');
      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  };
  
  export const joinRoom = async (roomId, username) => {
    const response = await fetch(`http://localhost:5000/join-room`, {
      method: 'POST',
      body: JSON.stringify({ roomId, username }),
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  };
  