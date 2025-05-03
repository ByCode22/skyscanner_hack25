// src/components/Results.js
import React from 'react';

const Results = ({ destinations }) => {
  return (
    <div>
      <h2>Recommended Destinations</h2>
      <ul>
        {destinations.map((destination, index) => (
          <li key={index}>{destination}</li>
        ))}
      </ul>
    </div>
  );
};

export default Results;
