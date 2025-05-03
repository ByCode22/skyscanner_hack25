// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login'; // Asume que Login.js está en la carpeta components

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true); // Cambiar entre Login y Register
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="button-container">
        <button 
          className={`login-header ${isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button 
          className={`register-header ${!isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(false)}
        >
          Register
        </button>
      </div>
      
      <Login isLogin={isLogin} navigate={navigate} /> {/* Pasamos la prop para saber si es login o registro */}
    </div>
  );
};

export default LoginPage;
