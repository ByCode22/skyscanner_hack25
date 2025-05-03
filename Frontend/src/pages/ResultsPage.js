// src/pages/ResultsPage.js
import React from 'react';
import './results.css';  // Importa los estilos de resultados

const ResultsPage = ({ destinations }) => {
  // Comprobamos si destinations está definido y es un array
  if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
    return (
      <div className="results-container">
        <div className="results-box">
          <h2>No Recommended Destinations</h2>
          <p>We couldn't find any destinations based on your preferences.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="results-box">
        <h2>Recommended Destinations</h2>
        <ul>
          {destinations.map((destination, index) => (
            <li key={index}>{destination}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResultsPage;
