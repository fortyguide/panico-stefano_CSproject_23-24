import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import eyeOpenIcon from '../assets/eye-open.png';
import eyeClosedIcon from '../assets/eye-closed.png';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setProfile(data.user);
      } catch (error) {
        setMessage('Errore durante il recupero del profilo.');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.updateProfile(profile);
      setMessage('Profilo aggiornato con successo.');
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Errore durante l'aggiornamento del profilo.";
      setMessage(errorMsg);
    }
  };

  return (
    <div className="profile-page">
      <h1>Profilo Utente</h1>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" name="email" value={profile.email || ''} onChange={handleChange} required />
        </label>
        <label>
          Nome:
          <input type="text" name="name" value={profile.name || ''} onChange={handleChange} required />
        </label>
        <label>
          Cognome:
          <input type="text" name="surname" value={profile.surname || ''} onChange={handleChange} required />
        </label>
        
        <div className="password-container">
          <label>Password attuale:</label>
          <div className="password-wrapper">
            <input type={showPassword ? 'text' : 'password'} name="password" onChange={handleChange} />
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
        </div>

        <div className="password-container">
          <label>Nuova password:</label>
          <div className="password-wrapper">
            <input type={showNewPassword ? 'text' : 'password'} name="newPassword" onChange={handleChange} />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              <img
                src={showNewPassword ? eyeOpenIcon : eyeClosedIcon}
                alt={showNewPassword ? 'Nascondi password' : 'Mostra password'}
              />
            </button>
          </div>
        </div>

        <button type="submit">Aggiorna Profilo</button>
      </form>
    </div>
  );
};

export default ProfilePage;