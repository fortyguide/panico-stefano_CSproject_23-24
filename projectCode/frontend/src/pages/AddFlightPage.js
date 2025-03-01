import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import flightService from '../services/flightAdminService';
import './AddFlightPage.css';

const AddFlightPage = () => {
  const [flightNumber, setFlightNumber] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [destination, setDestination] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(departureTime) >= new Date(arrivalTime)) {
      setMessage('Errore: L\'orario di partenza deve essere precedente all\'orario di arrivo.');
      return;
    }

    try {
      const response = await flightService.addFlight({
        flightNumber,
        departureTime,
        arrivalTime,
        destination,
        availableSeats,
      });
      setMessage(response.message);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      if (error.response.status === 500) {
        setMessage('Il volo esiste già.');
      } else {
        setMessage('Errore durante la creazione del volo. Riprova più tardi.');
      }
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="add-flight-page">
      <h1>Aggiungi un nuovo volo</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="flightNumber">Numero Volo:</label>
          <input
            id="flightNumber"
            type="text"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="departureTime">Orario di Partenza:</label>
          <input
            id="departureTime"
            type="datetime-local"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            min={getCurrentDateTime()}
            required
          />
        </div>
        <div>
          <label htmlFor="arrivalTime">Orario di Arrivo:</label>
          <input
            id="arrivalTime"
            type="datetime-local"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            min={getCurrentDateTime()}
            required
          />
        </div>
        <div>
          <label htmlFor="destination">Destinazione:</label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="availableSeats">Posti Disponibili:</label>
          <input
            id="availableSeats"
            type="number"
            value={availableSeats}
            onChange={(e) => setAvailableSeats(e.target.value)}
            required
          />
        </div>
        <button type="submit">Aggiungi Volo</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddFlightPage;