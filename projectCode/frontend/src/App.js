import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FlightsPage from './pages/FlightsPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/Layout';
import authService from './services/authService';
import AddFlightPage from './pages/AddFlightPage';
import ManagementFlightPage from './pages/ManagementFlightPage';
import UserManagementPage from './pages/UserManagementPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const token = getCookie('auth_token');
    if (token) {
      setIsAuthenticated(true);
      fetchUserRole();
    }
  }, []);

  const fetchUserRole = async () => {
    try {
      const profile = await authService.getProfile();
      if (profile.user.role === 'admin') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Errore durante il recupero del profilo:', error);
    }
  };

  const handleLogin = async (token) => {
    document.cookie = `auth_token=${token}; path=/; secure; samesite=strict`;
    setIsAuthenticated(true);
    await fetchUserRole();
  };

  const handleLogout = () => {
    document.cookie = 'auth_token=; Max-Age=0; path=/; secure; samesite=strict';
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <Router>
      <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/flights" element={<FlightsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/addFlight" element={<AddFlightPage />} />
          <Route path="/managementFlight" element={<ManagementFlightPage />} />
          <Route path="/managementUser" element={<UserManagementPage />} />
          <Route path="*" element={<h2>Pagina non trovata</h2>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;