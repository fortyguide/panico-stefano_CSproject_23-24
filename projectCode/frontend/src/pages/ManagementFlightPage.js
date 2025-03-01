import React, { useState, useEffect } from 'react';
import flightAdminService from '../services/flightAdminService';
import './ManagementFlightPage.css';

const ManagementFlightPage = () => {
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [popupError, setPopupError] = useState('');
  const [filters, setFilters] = useState({
    destination: '',
    departureTime: '',
    availableSeats: ''
  });
  const [currentFlight, setCurrentFlight] = useState({
    id: '',
    flightNumber: '',
    departureTime: '',
    arrivalTime: '',
    destination: '',
    availableSeats: ''
  });

  useEffect(() => {
    fetchFlights();
  }, [page]);

  const fetchFlights = async () => {
    try {
      const response = await flightAdminService.getFlights(filters, page);
      setFlights(response.flights);
      setTotalPages(response.totalPages);
    } catch (error) {
      setError('Non ci sono voli che rispettano i filtri di ricerca! Riprovare.');
      setFlights([]);
    }
  };

  const handleEdit = (flight) => {
    setCurrentFlight({
      ...flight,
      departureTime: flight.departureTime.slice(0, 16),
      arrivalTime: flight.arrivalTime.slice(0, 16)
    });
    setPopupError('');
    setShowPopup(true);
  };

  const handleDelete = async (flightId) => {
    try {
      await flightAdminService.deleteFlight(flightId);
      alert('Volo cancellato con successo!');
      fetchFlights();
    } catch (error) {
      setError('Errore durante la cancellazione del volo. Riprova più tardi.');
    }
  };

  const handleChange = (e) => {
    setCurrentFlight({ ...currentFlight, [e.target.name]: e.target.value });
  };

  const handleIncreaseSeats = () => {
    setCurrentFlight({ ...currentFlight, availableSeats: parseInt(currentFlight.availableSeats) + 1 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFields = {};

    if (new Date(currentFlight.departureTime) >= new Date(currentFlight.arrivalTime)) {
      setPopupError('Errore: L\'orario di arrivo deve essere successivo all\'orario di partenza.');
      return;
    }

    Object.keys(currentFlight).forEach(key => {
      if (currentFlight[key]) {
        updatedFields[key] = currentFlight[key];
      }
    });

    try {
      await flightAdminService.updateFlight(currentFlight.id, updatedFields);
      alert('Volo aggiornato con successo!');
      setShowPopup(false);
      fetchFlights();
    } catch (error) {
      setPopupError('Errore durante l\'aggiornamento del volo. Riprova più tardi.');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFlights();
  };

  return (
    <div className="flights-page">
      <h1>Gestione Voli</h1>
      <form className="filters" onSubmit={handleSearch}>
        <div>
          <label htmlFor="destination">Destinazione:</label>
          <input
            id="destination"
            type="text"
            name="destination"
            value={filters.destination}
            onChange={handleFilterChange}
          />
        </div>
        <div>
          <label htmlFor="departureTime">Data di partenza:</label>
          <input
            id="departureTime"
            type="datetime-local"
            name="departureTime"
            value={filters.departureTime}
            onChange={handleFilterChange}
          />
        </div>
        <div>
          <label htmlFor="availableSeats">Numero minimo di posti richiesti:</label>
          <input
            id="availableSeats"
            type="number"
            name="availableSeats"
            value={filters.availableSeats}
            onChange={handleFilterChange}
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
            <th>Posti Disponibili</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight) => (
            <tr key={flight.id}>
              <td>{flight.flightNumber}</td>
              <td>{flight.destination}</td>
              <td>{new Date(flight.departureTime).toLocaleString()}</td>
              <td>{new Date(flight.arrivalTime).toLocaleString()}</td>
              <td>{flight.availableSeats}</td>
              <td className="action-buttons">
                <button className="edit-btn" onClick={() => handleEdit(flight)}>Modifica</button>
                <button className="delete-btn" onClick={() => handleDelete(flight.id)}>Cancella</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>Precedente</button>
        <span>Pagina {page} di {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Successivo</button>
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Modifica Volo</h2>
            {popupError && <p className="error-message">{popupError}</p>}
            <form onSubmit={handleSubmit}>
              <label>
                Numero Volo:
                <input type="text" name="flightNumber" value={currentFlight.flightNumber} readOnly className="readonly-input" />
              </label>
              <label>
                Orario di Partenza:
                <input type="datetime-local" name="departureTime" value={currentFlight.departureTime} onChange={handleChange} />
              </label>
              <label>
                Orario di Arrivo:
                <input type="datetime-local" name="arrivalTime" value={currentFlight.arrivalTime} onChange={handleChange} />
              </label>
              <label>
                Destinazione:
                <input type="text" name="destination" value={currentFlight.destination} onChange={handleChange} />
              </label>
              <label>
                Posti Disponibili:
                <div className="seats-container">
                  <input type="number" name="availableSeats" value={currentFlight.availableSeats} readOnly className="readonly-input" />
                  <button type="button" onClick={handleIncreaseSeats} className="increase-btn">+</button>
                </div>
              </label>
              <button type="submit">Salva</button>
              <button type="button" onClick={() => setShowPopup(false)} className="cancel-btn">Annulla</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementFlightPage;