import React, { useState } from 'react';
import authService from '../services/authService';
import './LoginPage.css';
import eyeOpenIcon from '../assets/eye-open.png';
import eyeClosedIcon from '../assets/eye-closed.png';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validateEmail(email)) {
      setMessage('Inserisci un indirizzo email valido.');
      return;
    }

    if (!password.trim()) {
      setMessage('La password non può essere vuota.');
      return;
    }

    try {
      const response = await authService.login(email, password);
      onLogin(response.token);
      window.location.href = '/';
    } catch (error) {
      const errorMsg =
        error.response?.status === 400
          ? 'Email o password non corretti.'
          : 'Errore durante il login. Riprova più tardi.';
      setMessage(errorMsg);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>Login</h1>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="password-container">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            <img
              src={showPassword ? eyeOpenIcon : eyeClosedIcon}
              alt={showPassword ? 'Nascondi password' : 'Mostra password'}
            />
          </button>
        </div>
        <button type="submit">Login</button>
        {message && <p className="error-message">{message}</p>}
      </form>
    </div>
  );
};

export default LoginPage;