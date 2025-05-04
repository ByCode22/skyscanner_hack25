import React from 'react';
import { useNavigate } from 'react-router-dom';
import './results.css';  // Asegúrate de que esté importado el CSS

const ResultsPage = () => {
  const navigate = useNavigate();

  // Función para ir atrás
  const goBack = () => {
    navigate('/'); // Regresa al Home
  };

  // Datos simulados de vuelos (estos vendrán de la API)
  const flights = [
    {
      price: 68.97,
      airline: "Vueling Airlines",
      origin: "Barcelona",
      destination: "Porto",
      departure_time: "2025-05-11 15:20",
      arrival_time: "2025-05-11 16:15",
      duration_minutes: 115,
      link: "https://www.google.com" // Enlace temporal
    },
    {
      price: 120.50,
      airline: "Iberia",
      origin: "Barcelona",
      destination: "Madrid",
      departure_time: "2025-05-12 09:30",
      arrival_time: "2025-05-12 10:40",
      duration_minutes: 70,
      link: "https://www.google.com"
    },
    {
      price: 200.00,
      airline: "Air France",
      origin: "Barcelona",
      destination: "Paris",
      departure_time: "2025-05-13 12:00",
      arrival_time: "2025-05-13 13:30",
      duration_minutes: 90,
      link: "https://www.google.com"
    }
  ];

  return (
    <div className="results-container">
      {/* Flecha para regresar */}
      <div className="back-button" onClick={goBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18l-6-6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="results-box">
        <h2>Select Your Flight</h2>

        <div className="destination-content">
          {/* Parte izquierda: imagen y descripción de la ciudad */}
          <div className="destination-left">
            <div className="destination-image">
              <img src="https://via.placeholder.com/150" alt="Barcelona" />
            </div>
            <div className="destination-text">
              <h3>Barcelona</h3>
              <p className="description">A beautiful Mediterranean city known for its art, culture, and stunning architecture.</p>
              <p className="places">Places to visit: Sagrada Familia, Park Güell, La Rambla</p>
            </div>
          </div>

          {/* Parte derecha: vuelos con scroll */}
          <div className="destination-right">
            <h3>Available Flights</h3>
            <div className="flights-container">
              {flights.map((flight, index) => (
                <div 
                  className="flight-card" 
                  key={index} 
                  onClick={() => window.open(flight.link, "_blank")}
                >
                  {/* Estructura de los vuelos */}
                  <div className="flight-info">
                    <span><strong>From:</strong> {flight.origin}</span>
                    <div className="arrow">&rarr;</div>
                    <span><strong>To:</strong> {flight.destination}</span>
                  </div>
                  <div className="time-info">
                    <span><strong>Departure:</strong> {flight.departure_time}</span>
                    <div className="arrow">&rarr;</div>
                    <span><strong>Arrival:</strong> {flight.arrival_time}</span>
                  </div>
                  <div className="company-info">
                    <span><strong>Duration:</strong> {flight.duration_minutes} minutes</span>
                    <span><strong>Airline:</strong> {flight.airline}</span>
                  </div>
                  <p className="price"><strong>Price:</strong> ${flight.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
