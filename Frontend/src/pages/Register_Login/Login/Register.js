// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Importa useNavigate
import './Register.css';  // Usaremos el mismo archivo de estilos

function Register() {
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();  // Usamos useNavigate

  const handleDateChange = (e) => {
    const rawDate = e.target.value;
    const formattedDate = new Date(rawDate).toLocaleDateString("en-CA");
    setAge(formattedDate);
  };

  // Lógica de registro
  const handleSubmitReg = async (event) => {
    event.preventDefault();

    // Verificación de contraseñas
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validación de email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Validación de la contraseña
    if (password.length < 8) {
      setError('Password is too short!');
      return;
    }

    // Preparar los datos para el backend
    const payload = { firstname, lastname, email, password, age };

    try {
      // Llamada al backend para registrar el usuario
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError('Error during registration');
        return;
      }

      // Redirigir al login después de un registro exitoso
      navigate('/login');
    } catch (error) {
      setError('Error during registration');
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Register</h2>
        <form onSubmit={handleSubmitReg}>
          {/* Campo para el primer nombre */}
          <input
            type="text"
            className="input-field"
            placeholder="First Name"
            value={firstname}
            onChange={(e) => setFirstName(e.target.value)}
          />

          {/* Campo para el apellido */}
          <input
            type="text"
            className="input-field"
            placeholder="Last Name"
            value={lastname}
            onChange={(e) => setLastName(e.target.value)}
          />

          {/* Campo para el email */}
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Campo para la contraseña */}
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Campo para confirmar la contraseña */}
          <input
            type="password"
            className="input-field"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* Campo para la fecha de nacimiento */}
          <input
            type="date"
            className="input-field"
            placeholder="Date of Birth"
            value={age}
            onChange={handleDateChange}
          />

          {/* Mostrar mensaje de error */}
          {error && <p className="error-message">{error}</p>}

          {/* Botón para registrar */}
          <button type="submit" className="submit-btn">Register</button>
        </form>

        {/* Enlace para redirigir a Login */}
        <div className="switch-action">
          <p>Already have an account? <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: '#007bff' }}>Login</span></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
