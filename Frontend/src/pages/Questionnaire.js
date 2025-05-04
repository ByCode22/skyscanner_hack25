import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './questionnaire.css';
import hostSocketService from '../services/HostSocketService';
import guestSocketService from '../services/GuestSocketService';

const Questionnaire = () => {
  const [periods, setPeriods] = useState([{ startDate: '', endDate: '' }]);
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [errorMessage, setErrorMessage] = useState(""); 
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [waitingForResponses, setWaitingForResponses] = useState(false);
  const [recommendationItems, setRecommendationItems] = useState(null);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const navigate = useNavigate(); 
  const location = useLocation();
  const isHost = location.state?.isHost;

  const socket = isHost ? hostSocketService : guestSocketService;

  useEffect(() => {
    console.log("🧠 currentQuestionData updated:", currentQuestionData);
  }, [currentQuestionData]);

  useEffect(() => {
    const handler = (data) => {
      setCurrentQuestionData({
        question: data.question,
        options: data.options
      });
      setWaitingForResponses(false);
      setShowRecommendation(false);
      setCurrentQuestion(data.question_id);
    };
  
    socket.onQuestion(handler);

    socket.onRecommendation((items) => {
      setCurrentQuestionData(null);
      setRecommendationItems(items);
      setShowRecommendation(true);
      setWaitingForResponses(false);
    });
  
    socket.onFinalDecision(async (data) => {
      try {
        const descRes = await axios.get("http://localhost:8000/city-description", {
          params: { city_name: data.selected }
        });
    
        const description = typeof descRes.data === 'string'
          ? descRes.data
          : descRes.data.description || '';
    
        const flightRes = await axios.post("http://localhost:8000/search-flights", data);
    
        navigate("/results", {
          state: {
            decision: data,
            flights: flightRes.data.flights,
            description
          }
        });
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    });
  
    if (isHost) {
      const timer = setTimeout(() => {
        hostSocketService.socket?.send(JSON.stringify({ type: "start" }));
        console.log("📨 Sent 'start' message to server (host)");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isHost, socket]);
  

  const goBack = () => {
    if (window.confirm("Are you sure you want to go back? You will return to the room and lose all your progress.")) {
      navigate(-1);
    }
  };

  const handleAnswer = (answer) => {
    socket.socket?.send(JSON.stringify({ type: "answer", answer }));
    setWaitingForResponses(true);
  };

  const handleRecommendation = (answer) => {
    socket.socket?.send(JSON.stringify({ type: "select_recommendation", answer }));
    setWaitingForResponses(true);
  };

  const handleDateChange = (index, field, value) => {
    const updated = [...periods];
    updated[index][field] = value;
    setPeriods(updated);
    setErrorMessage(""); 
  };

  const addPeriod = () => setPeriods([...periods, { startDate: '', endDate: '' }]);
  const removePeriod = (index) => setPeriods(periods.filter((_, i) => i !== index));

  const validateDates = () => !periods.some(p => new Date(p.startDate) > new Date(p.endDate));

  const nextQuestion = () => {
    if (currentQuestion === 0) {
      const formatted = periods.map(p => ({ start_date: p.startDate, end_date: p.endDate }));
      handleAnswer(formatted); 
    } else if (currentQuestion === 1) {
      const maxPrice = Math.max(...selectedPriceRange.replace(/\$/g, '').split('–').map(p => parseInt(p.trim())));
      handleAnswer({ price: maxPrice });
    }
  };

  const finishQuestionnaire = () => navigate('/results');

  return (
    <div className="questionnaire-container">
      <div className="back-button" onClick={goBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {currentQuestion === 0 && (
        <div>
          <h2>Select your availability for the trip.</h2>
          <div className="periods-container">
            {periods.map((p, i) => (
              <div className="period" key={i}>
                <input type="date" value={p.startDate} onChange={(e) => handleDateChange(i, 'startDate', e.target.value)} className="date-input" />
                <input type="date" value={p.endDate} onChange={(e) => handleDateChange(i, 'endDate', e.target.value)} className="date-input" />
                <button className="remove-btn" onClick={() => removePeriod(i)} disabled={periods.length <= 1}>✖</button>
              </div>
            ))}
          </div>
          <button className="add-period-btn" onClick={addPeriod}>+</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {waitingForResponses && <p className="waiting-message">Waiting for your teammates to answer...</p>}
          <div className="next-question-container">
            <button className="next-question-btn" onClick={nextQuestion} disabled={!validateDates() || periods.some(p => !p.startDate || !p.endDate)}>
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
              { label: "more than $1000", range: "$1000 – $3000", notes: "Premium - Long-haul business/luxury" }
            ].map((p, i) => (
              <div key={i} className={`price-option ${selectedPriceRange === p.range ? 'selected' : ''}`} onClick={() => setSelectedPriceRange(p.range)}>
                <div className="price-label">{p.label}</div>
                <div className="price-notes">{p.notes}</div>
              </div>
            ))}
          </div>
          {waitingForResponses && <p className="waiting-message">Waiting for your teammates to answer...</p>}
          <div className="next-question-container">
            <button className="next-question-btn" onClick={nextQuestion} disabled={!selectedPriceRange}>
              Next Question
            </button>
          </div>
        </div>
      )}

      {currentQuestionData && currentQuestionData.options && (
        <div className="ai-question-container">
          <h2 className="question-title">{currentQuestionData.question}</h2>
          <div className="option-grid">
            {currentQuestionData.options.map((opt, i) => (
              <div key={i} className="option-box" onClick={() => handleAnswer({ index: i })}>
                {opt}
              </div>
            ))}
          </div>
          {waitingForResponses && <p className="waiting-message">Waiting for your teammates to answer...</p>}
        </div>
      )}

      {showRecommendation && recommendationItems && (
        <div className="recommendation-container">
          <h2 className="question-title">{"Do any of these cities catch your eye?"}</h2>
          <div className="option-grid">
            {recommendationItems.options.map((opt, i) => (
              <div key={i} className="option-box" onClick={() => handleRecommendation({ index: i })}>
                {opt}
              </div>
            ))}
          </div>
          {waitingForResponses && <p className="waiting-message">Waiting for your teammates to vote...</p>}
        </div>
      )}

      {currentQuestion === -1 && (
        <div>
          <h2>Thank you for completing the questionnaire!</h2>
          <button className="next-question-btn" onClick={finishQuestionnaire}>Finish Questionnaire</button>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
