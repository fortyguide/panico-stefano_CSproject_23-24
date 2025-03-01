import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './RegisterPage.css';
import eyeOpenIcon from '../assets/eye-open.png';
import eyeClosedIcon from '../assets/eye-closed.png';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    if (countdown === 0) {
      navigate('/login');
    }
    if (countdown > 0 && message.includes('Registrazione avvenuta con successo')) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        setMessage(`Registrazione avvenuta con successo. Reindirizzamento alla pagina di login in ${countdown - 1} secondi...`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, message, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validateEmail(email)) {
      setMessage('Inserisci un indirizzo email valido.');
      return;
    }

    if (password.length < 6) {
      setMessage('La password deve contenere almeno 6 caratteri.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Le password non corrispondono.');
      return;
    }

    if (!name.trim()) {
      setMessage('Il nome è obbligatorio.');
      return;
    }

    if (!surname.trim()) {
      setMessage('Il cognome è obbligatorio.');
      return;
    }

    try {
      await authService.register(email, password, name, surname);
      setMessage(`Registrazione avvenuta con successo. Reindirizzamento alla pagina di login in ${countdown} secondi...`);
      setCountdown(5);
    } catch (error) {
      const errorMsg = error.response?.data?.errors?.[0]?.msg || 'Errore durante la registrazione. Riprova più tardi.';
      setMessage(errorMsg);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleRegister}>
        <h1>Registrazione</h1>
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
        <div className="password-container">
          <label htmlFor="confirmPassword">Conferma Password:</label>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <img
              src={showConfirmPassword ? eyeOpenIcon : eyeClosedIcon}
              alt={showConfirmPassword ? 'Nascondi password' : 'Mostra password'}
            />
          </button>
        </div>
        <div>
          <label htmlFor="name">Nome:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="surname">Cognome:</label>
          <input
            id="surname"
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
        </div>
        <button type="submit">Registrati</button>
        {message && <p className="error-message">{message}</p>}
      </form>
    </div>
  );
};

export default RegisterPage;