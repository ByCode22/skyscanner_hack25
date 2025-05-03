// src/pages/ResultsPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './results.css';  // Asegúrate de que esté importado el CSS

const ResultsPage = () => {
  const navigate = useNavigate();

  // Función para ir atrás
  const goBack = () => {
    navigate('/'); // Regresa al Home
  };

  return (
    <div className="results-container">
      {/* Flecha para regresar */}
      <div className="back-button" onClick={goBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18l-6-6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="results-box">
        <h2>Recommended Destinations</h2>

        {/* Ciudad 1 */}
        <div className="destination-card">
          <div className="destination-image">
            <img src="https://via.placeholder.com/100" alt="City 1" />
          </div>
          <div className="destination-text">
            <h3>Barcelona</h3>
            <p className="description">A beautiful Mediterranean city known for its art, culture, and stunning architecture.</p>
          </div>
        </div>

        {/* Ciudad 2 */}
        <div className="destination-card">
          <div className="destination-image">
            <img src="https://via.placeholder.com/100" alt="City 2" />
          </div>
          <div className="destination-text">
            <h3>Paris</h3>
            <p className="description">The city of love, filled with iconic landmarks, art galleries, and romantic atmospheres.</p>
          </div>
        </div>

        {/* Ciudad 3 */}
        <div className="destination-card">
          <div className="destination-image">
            <img src="https://via.placeholder.com/100" alt="City 3" />
          </div>
          <div className="destination-text">
            <h3>New York</h3>
            <p className="description">The city that never sleeps, offering vibrant culture, shopping, and entertainment.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultsPage;
