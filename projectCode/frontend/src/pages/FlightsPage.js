import React, { useState, useEffect } from 'react';
import flightService from '../services/flightService';
import ticketService from '../services/ticketService';
import './FlightsPage.css';

const FlightsPage = () => {
  const [flights, setFlights] = useState([]);
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ticketCounts, setTicketCounts] = useState({});

  useEffect(() => {
    setIsAuthenticated(checkAuthCookie());
    fetchFlights();
  }, [page]);

  const checkAuthCookie = () => {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    return authCookie ? true : false;
  };

  const fetchFlights = async () => {
    setError('');
    try {
      const filters = {};
      if (destination) filters.destination = destination;
      if (departureTime) filters.departureTime = departureTime;
      if (availableSeats) filters.availableSeats = availableSeats;
      const response = await flightService.getFlights(filters, page);
      setFlights(response.flights);
      setTotalPages(response.totalPages);
    } catch (error) {
      setError('Non ci sono voli che rispettano i filtri di ricerca! Riprovare.');
      setFlights([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFlights();
  };

  const handlePurchase = async (flightNumber, availableSeats) => {
    try {
      const token = getAuthTokenFromCookies();
      const ticketCount = ticketCounts[flightNumber] || 1;
      if (ticketCount > availableSeats) {
        setError('Il numero di biglietti da acquistare supera il numero di posti disponibili.');
        return;
      }
      for (let i = 0; i < ticketCount; i++) {
        await ticketService.purchaseTicket(flightNumber, token);
      }
      alert('Acquisto completato con successo! Puoi trovare i tuoi biglietti nella sezione "Gestione biglietti acquistati".');
      fetchFlights();
    } catch (error) {
      setError('Errore durante l\'acquisto del biglietto. Riprova più tardi.');
    }
  };

  const getAuthTokenFromCookies = () => {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    if (authCookie) {
      const token = authCookie.split('=')[1];
      return token;
    }
    return null;
  };

  const handleTicketCountChange = (flightNumber, count) => {
    setTicketCounts({
      ...ticketCounts,
      [flightNumber]: count,
    });
  };

  return (
    <div className="flights-page">
      <h1>Voli Disponibili</h1>
      <form className="filters" onSubmit={handleSearch}>
        <div>
          <label htmlFor="destination">Destinazione:</label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="departureTime">Data di partenza:</label>
          <input
            id="departureTime"
            type="datetime-local"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="availableSeats">Numero minimo di posti richiesti:</label>
          <input
            id="availableSeats"
            type="number"
            value={availableSeats}
            onChange={(e) => setAvailableSeats(e.target.value)}
          />
        </div>
        <button type="submit">Cerca</button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <table className="flights-table">
        <thead>
          <tr>
            <th>Numero Volo</th>
            <th>Destinazione</th>
            <th>Data di Partenza</th>
            <th>Data di Arrivo</th>
            {isAuthenticated && <th>Posti Disponibili</th>}
            {isAuthenticated && <th>Numero di Biglietti da Acquistare</th>}
            <th>Acquisto Biglietto</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight) => (
            <tr key={flight.id}>
              <td>{flight.flightNumber}</td>
              <td>{flight.destination}</td>
              <td>{new Date(flight.departureTime).toLocaleString()}</td>
              <td>{new Date(flight.arrivalTime).toLocaleString()}</td>
              {isAuthenticated && <td>{flight.availableSeats}</td>}
              {isAuthenticated && (
                <td>
                  <input
                    type="number"
                    min="1"
                    value={ticketCounts[flight.flightNumber] || 1}
                    onChange={(e) => handleTicketCountChange(flight.flightNumber, e.target.value)}
                  />
                </td>
              )}
              <td>
                {isAuthenticated ? (
                  <button className="purchase-button" onClick={() => handlePurchase(flight.flightNumber, flight.availableSeats)}>
                    Acquista
                  </button>
                ) : (
                  <button className="login-button" onClick={() => window.location.href = '/login'}>
                    Loggarsi per acquistare il biglietto
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Precedente
        </button>
        <span>Pagina {page} di {totalPages}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          Successivo
        </button>
      </div>
    </div>
  );
};

export default FlightsPage;