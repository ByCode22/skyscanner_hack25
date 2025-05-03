// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WaitingRoom from './pages/WaitingRoom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/waiting-room/:roomId" element={<WaitingRoom />} />
      </Routes>
    </Router>
  );
};

export default App;
