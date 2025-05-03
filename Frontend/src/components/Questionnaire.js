// src/components/Questionnaire.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Importar useNavigate

const Questionnaire = ({ roomId, participantId, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();  // Inicializar useNavigate

  const questions = ['Do you like nature?', 'Are you interested in art?'];

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
    setCurrentQuestion(currentQuestion + 1);
    if (currentQuestion + 1 === questions.length) {
      onComplete(answers);
      // Navegar a la página de resultados después de completar el cuestionario
      navigate('/results');  // Redirige a la página de resultados
    }
  };

  return (
    <div>
      <h2>{questions[currentQuestion]}</h2>
      <button onClick={() => handleAnswer('Yes')}>Yes</button>
      <button onClick={() => handleAnswer('No')}>No</button>
    </div>
  );
};

export default Questionnaire;
