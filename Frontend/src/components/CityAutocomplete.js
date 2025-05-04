import React, { useState } from 'react';
import axios from 'axios';

const CityAutocomplete = ({ city, setCity }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchAirports = async (text) => {
    try {
      const res = await axios.get(`http://localhost:8000/search-airports?name=${encodeURIComponent(text)}`);
      setSuggestions(res.data); // data: [ [name, iata], ... ]
    } catch (err) {
      console.error("Failed to fetch airports:", err);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length >= 2) {
      fetchAirports(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (name, iata) => {
    setCity(iata);
    setQuery(`${name} (${iata})`);
    setSuggestions([]);
  };

  return (
    <div className="autocomplete-container" style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Enter your city or airport"
        value={query}
        onChange={handleInputChange}
        className="city-input"
        style={{
          width: '90%',
          padding: '10px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
      {suggestions.length > 0 && (
        <ul
          className="autocomplete-list"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #ccc',
            borderTop: 'none',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {suggestions.map(([name, iata], index) => (
            <li
              key={index}
              onClick={() => handleSelect(name, iata)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'white')}
            >
              {name} ({iata})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CityAutocomplete;
