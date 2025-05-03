import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './questionnaire.css';
import hostSocketService from '../services/HostSocketService';

const Questionnaire = () => {
  const [periods, setPeriods] = useState([{ startDate: '', endDate: '' }]);
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [errorMessage, setErrorMessage] = useState(""); 
  const [questions, setQuestions] = useState([]);
  const [currentQuestionData, setCurrentQuestionData] = useState(null); // Para almacenar la pregunta actual
  const [waitingForResponses, setWaitingForResponses] = useState(false); // Indica si estamos esperando respuestas

  const navigate = useNavigate(); 
  const location = useLocation();
  const isHost = location.state?.isHost;

  // Dummy data para las preguntas (simulando la respuesta de la API)
  const fetchQuestions = () => {
    const dummyQuestions = [
      {
        question: 'Which best describes your ideal travel pace?',
        options: ['Relaxed', 'Moderate', 'Busy', 'Fast-paced']
      },
      {
        question: 'What type of accommodation do you prefer?',
        options: ['Hotel', 'Hostel', 'Airbnb', 'Camping']
      },
      {
        question: 'What activities do you prefer on vacation?',
        options: ['Relaxing', 'Adventure', 'Sightseeing', 'Shopping']
      }
    ];

    setQuestions(dummyQuestions);
    setCurrentQuestionData(dummyQuestions[0]); // Comienza con la primera pregunta
  };

  useEffect(() => {
    if (isHost) {
      const timer = setTimeout(() => {
        hostSocketService.socket?.send(JSON.stringify({ type: "start" }));
        console.log("📨 Sent 'start' message to server (host)");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isHost]);

  useEffect(() => {
    if (currentQuestion === 2) {
      fetchQuestions(); // Cargar las preguntas cuando se llega a la pregunta 2
    }
  }, [currentQuestion]);

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentQuestionData(questions[currentQuestion + 1]);
    } else {
      finishQuestionnaire();
    }
  };

  const finishQuestionnaire = () => {
    navigate('/results'); // Redirige a la página de resultados
  };

  const handleAnswer = (answer) => {
    console.log("Answer selected:", answer);
    setWaitingForResponses(true); // Activamos el estado de espera
    // Enviar respuesta al servidor y esperar la próxima pregunta o destino
  };

  // Funciones que faltaban para manejar los cambios de fecha, agregar/quitar períodos y validar fechas
  const handleDateChange = (index, field, value) => {
    const updatedPeriods = [...periods];
    updatedPeriods[index][field] = value;
    setPeriods(updatedPeriods);
    setErrorMessage(""); 
  };

  const removePeriod = (index) => {
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const addPeriod = () => setPeriods([...periods, { startDate: '', endDate: '' }]);

  const validateDates = () => {
    for (let period of periods) {
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      if (startDate > endDate) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="questionnaire-container">
      <div className="back-button" onClick={() => navigate(-1)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18l-6-6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {currentQuestion === 0 && (
        <div>
          <h2>Select your availability for the trip.</h2>
          <div className="periods-container">
            {periods.map((period, index) => (
              <div className="period" key={index}>
                <input
                  type="date"
                  value={period.startDate}
                  onChange={(e) => handleDateChange(index, 'startDate', e.target.value)}
                  className="date-input"
                />
                <input
                  type="date"
                  value={period.endDate}
                  onChange={(e) => handleDateChange(index, 'endDate', e.target.value)}
                  className="date-input"
                />
                <button 
                  className="remove-btn" 
                  onClick={() => removePeriod(index)} 
                  disabled={periods.length <= 1}
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
          <button className="add-period-btn" onClick={addPeriod}>+</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="next-question-container">
            <button 
              className="next-question-btn" 
              onClick={nextQuestion} 
              disabled={periods.length < 1 || periods.some(p => !p.startDate || !p.endDate || !validateDates())}
            >
              Next Question
            </button>
          </div>
        </div>
      )}

      {currentQuestion === 1 && (
        <div>
          <h2>How much are you willing to spend on your flight?</h2>
          <div className="price-range-options">
            {[{ label: "$0 – $100", range: "$0 – $100", notes: "Ultra budget - Deals, low-cost carriers" },
              { label: "$100 – $250", range: "$100 – $250", notes: "Budget - Common short-haul fares" },
              { label: "$250 – $500", range: "$250 – $500", notes: "Mid-range - Standard regional/international" },
              { label: "$500 – $1000", range: "$500 – $1000", notes: "Higher-end - Long-haul or business fares" },
              { label: "$1000 – $3000", range: "$1000 – $3000", notes: "Premium - Long-haul business/luxury" }].map((priceOption, index) => (
                <div 
                  key={index} 
                  className={`price-option ${selectedPriceRange === priceOption.range ? 'selected' : ''}`}
                  onClick={() => setSelectedPriceRange(priceOption.range)}
                >
                  <div className="price-label">{priceOption.label}</div>
                  <div className="price-notes">{priceOption.notes}</div>
                </div>
            ))}
          </div>
          <div className="next-question-container">
            <button 
              className="next-question-btn" 
              onClick={nextQuestion} 
              disabled={!selectedPriceRange}
            >
              Next Question
            </button>
          </div>
        </div>
      )}

      {currentQuestion === 2 && currentQuestionData && (
        <div>
          <h2>{currentQuestionData.question}</h2>
          <div className="question-options">
            {currentQuestionData.options.map((option, index) => (
              <button 
                key={index} 
                className="option-btn" 
                onClick={() => handleAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>

          {waitingForResponses && <p>Waiting for your teammates to answer...</p>}

          <div className="next-question-container">
            <button 
              className="next-question-btn" 
              onClick={nextQuestion}
              disabled={waitingForResponses}
            >
              Next Question
            </button>
          </div>
        </div>
      )}

      {currentQuestion === 3 && (
        <div>
          <h2>Thank you for completing the questionnaire!</h2>
          <button className="next-question-btn" onClick={finishQuestionnaire}>
            Finish Questionnaire
          </button>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
