// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="App-header">
      <h1>The Perfect Reunion</h1>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li> {/* Enlace a la página de inicio */}
          <li><Link to="/room">Room</Link></li> {/* Enlace a la página de la sala */}
          <li><Link to="/results">Results</Link></li> {/* Enlace a la página de resultados */}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
