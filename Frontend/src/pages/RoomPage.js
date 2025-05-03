// src/pages/RoomPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchQuestions } from '../services/api';  // Importar la función de API
import './room.css';  // Importa los estilos de la sala

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();  // Hook de navegación
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const getQuestions = async () => {
      const questions = await fetchQuestions();  // Traer preguntas de la API
      setQuestions(questions);
    };

    getQuestions();
  }, []);

  const handleAnswer = (answer) => {
    setAnswers([...answers, answer]);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleComplete = () => {
    console.log('Respuestas:', answers);
    navigate('/results');  // Redirigir a la página de resultados
  };

  return (
    <div className="room-container">
      <div className="question-card">
        <h2>{questions[currentQuestionIndex]?.question}</h2>
        {currentQuestionIndex < questions.length ? (
          <div className="button-group">
            {questions[currentQuestionIndex].options.map((option, index) => (
              <button key={index} onClick={() => handleAnswer(option)}>
                {option}
              </button>
            ))}
          </div>
        ) : (
          <button className="next-button" onClick={handleComplete}>
            Finish
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomPage;
