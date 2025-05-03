import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';  // Asegúrate de tener los estilos definidos en login.css

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmitLog = async (event) => {
    event.preventDefault();
    const payload = { email, password };

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError('Invalid login credentials');
        return;
      }

      // Redirigir a la página de preguntas después de un login exitoso
      navigate('/questions');
    } catch (error) {
      setError('Failed to login. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmitLog}>
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-btn">Login</button>
        </form>
        <div className="switch-action">
          <p>Don't have an account? <span onClick={() => navigate('/register')}>Register</span></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
