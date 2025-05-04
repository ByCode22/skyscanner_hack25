import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './results.css';

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { decision, flights, description } = location.state;
  const [flightList, setFlightList] = useState(flights || []);

  const goBack = () => {
    navigate('/');
  };

  useEffect(() => {
    // Fetch flights if not already in state
    const fetchFlights = async () => {
      if (!flights && decision?.origin_iata && decision?.destination_iata && decision?.period) {
        try {
          const res = await axios.post('http://localhost:8000/search-flights', {
            origin_iata: decision.origin_iata,
            destination_iata: decision.destination_iata,
            period: decision.period,
            price: decision.price,
          });

          if (res.data?.flights) {
            setFlightList(res.data.flights);
          }
        } catch (err) {
          console.error("Flight fetch error:", err);
        }
      }
    };

    fetchFlights();
  }, [decision, flights]);

  return (
    <div className="results-container">
      <div className="back-button" onClick={goBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="results-box">
        <h2>Select Your Flight</h2>

        <div className="destination-content">
          {/* Left: city description */}
          <div className="destination-left">
            <div className="destination-image">
              <img src="https://via.placeholder.com/150" alt={decision?.destination_iata} />
            </div>
            <div className="destination-text">
              <h3>{decision?.selected || 'Destination'}</h3>
              <p className="description">{description}</p>
            </div>
          </div>

          {/* Right: flights */}
          <div className="destination-right">
            <h3>Available Flights</h3>
            <div className="flights-container">
              {flightList.map((flight, index) => (
                <div 
                  className="flight-card" 
                  key={index} 
                  onClick={() => window.open(flight.link, "_blank")}
                >
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
              {flightList.length === 0 && (
                <p>No flights found for your criteria.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
