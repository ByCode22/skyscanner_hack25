// src/components/Questionnaire.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './questionnaire.css';

const Questionnaire = () => {
  const [periods, setPeriods] = useState([{ startDate: '', endDate: '' }]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(""); // Estado para el rango de precios
  const [currentQuestion, setCurrentQuestion] = useState(0); // Control de la pregunta actual
  const [errorMessage, setErrorMessage] = useState(""); 
  const navigate = useNavigate(); 

  // Función para ir atrás con confirmación
  const goBack = () => {
    const confirmation = window.confirm(
      "Are you sure you want to go back? You will return to the room and lose all your progress."
    );
    if (confirmation) {
      navigate(-1); // Regresa a la página anterior si el usuario confirma
    } else {
      console.log("User canceled the navigation.");
    }
  };

  const handleDateChange = (index, field, value) => {
    const updatedPeriods = [...periods];
    updatedPeriods[index][field] = value;
    setPeriods(updatedPeriods);
    setErrorMessage(""); 
  };

  const addPeriod = () => setPeriods([...periods, { startDate: '', endDate: '' }]);
  const removePeriod = (index) => setPeriods(periods.filter((_, i) => i !== index));

  const mergePeriods = () => {
    const sortedPeriods = periods.map(p => ({
      ...p,
      startDate: new Date(p.startDate),
      endDate: new Date(p.endDate),
    })).sort((a, b) => a.startDate - b.startDate);

    let mergedPeriods = [];
    for (let i = 0; i < sortedPeriods.length; i++) {
      if (mergedPeriods.length === 0) {
        mergedPeriods.push(sortedPeriods[i]);
      } else {
        const lastMergedPeriod = mergedPeriods[mergedPeriods.length - 1];
        const currentPeriod = sortedPeriods[i];
        if (lastMergedPeriod.endDate >= currentPeriod.startDate) {
          lastMergedPeriod.endDate = new Date(Math.max(lastMergedPeriod.endDate, currentPeriod.endDate));
        } else {
          mergedPeriods.push(currentPeriod);
        }
      }
    }
    return mergedPeriods;
  };

  const submitAvailability = () => {
    if (!validateDates()) {
      setErrorMessage("The departure date must be earlier than the return date.");
      return;
    }

    const mergedPeriods = mergePeriods();
    const availability = [];
    mergedPeriods.forEach((period) => {
      availability.push(period.startDate.toISOString().split('T')[0]);
      availability.push(period.endDate.toISOString().split('T')[0]);
    });
    console.log('Availability:', availability);
  };

  const validateDates = () => {
    for (let period of periods) {
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      if (startDate >= endDate) {
        return false;
      }
    }
    return true;
  };

  const nextQuestion = () => {
    if (currentQuestion === 0 && periods.length > 0) {
      setCurrentQuestion(1);
    } else if (currentQuestion === 1 && selectedPriceRange) {
      setCurrentQuestion(2);
    }
  };

  const finishQuestionnaire = () => {
    navigate('/results'); // Redirige a la página de resultados
  };

  return (
    <div className="questionnaire-container">
      {/* Flecha para regresar dentro del contenedor blanco */}
      <div className="back-button" onClick={goBack}>
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
            {[
              { label: "$0 – $100", range: "$0 – $100", notes: "Ultra budget - Deals, low-cost carriers" },
              { label: "$100 – $250", range: "$100 – $250", notes: "Budget - Common short-haul fares" },
              { label: "$250 – $500", range: "$250 – $500", notes: "Mid-range - Standard regional/international" },
              { label: "$500 – $1000", range: "$500 – $1000", notes: "Higher-end - Long-haul or business fares" },
              { label: "$1000 – $3000", range: "$1000 – $3000", notes: "Premium - Long-haul business/luxury" }
            ].map((priceOption, index) => (
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

      {currentQuestion === 2 && (
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
