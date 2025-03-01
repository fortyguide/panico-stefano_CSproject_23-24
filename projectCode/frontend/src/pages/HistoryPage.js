import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchHistory, cancelTicket, checkInTicket } from '../services/historyService';
import './HistoryPage.css';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({ operation: '', arrivalTime: '', destination: '' });
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthCookie = () => {
      const authCookie = document.cookie.split('; ').find(row => row.startsWith('auth_token='));
      return authCookie ? authCookie.split('=')[1] : null;
    };

    const token = checkAuthCookie();
    if (!token) {
      navigate('/login');
    } else {
      fetchHistoryData(token);
    }
  }, [navigate, page, filters]);

  const fetchHistoryData = async (token) => {
    try {
      const data = await fetchHistory(token, page, filters);
      setHistory(data.history);
      setFilteredHistory(data.history);
      setTotalPages(data.totalPages);
      if (data.history.length === 0) {
        setErrorMessage('Non ci sono biglietti che rispettano i filtri di ricerca! Riprovare.');
      } else {
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Errore durante il recupero dello storico:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    applyFilters();
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    let filtered = history;

    if (filters.operation) {
      filtered = filtered.filter(item => item.operation === filters.operation);
    }
    if (filters.arrivalTime) {
      filtered = filtered.filter(item => new Date(item.timestamp) >= new Date(filters.arrivalTime));
    }
    if (filters.destination) {
      filtered = filtered.filter(item => item.destination.toLowerCase().includes(filters.destination.toLowerCase()));
    }

    setFilteredHistory(filtered);
    if (filtered.length === 0) {
      setErrorMessage('Non ci sono biglietti che rispettano i filtri di ricerca! Riprovare.');
    } else {
      setErrorMessage('');
    }
  };

  const handleSort = () => {
    const sortedHistory = [...filteredHistory].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setFilteredHistory(sortedHistory);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleCancel = async (ticketId) => {
    try {
      await cancelTicket(ticketId);
      const token = document.cookie.split('; ').find(row => row.startsWith('auth_token=')).split('=')[1];
      fetchHistoryData(token);
    } catch (error) {
      console.error('Errore durante la cancellazione del biglietto:', error);
    }
  };

  const handleCheckIn = async (ticketId) => {
    try {
      await checkInTicket(ticketId);
      const token = document.cookie.split('; ').find(row => row.startsWith('auth_token=')).split('=')[1];
      fetchHistoryData(token);
    } catch (error) {
      console.error('Errore durante il check-in del biglietto:', error);
    }
  };

  return (
    <div className="history-page">
      <h1>Storico Operazioni</h1>
      <form className="filters" onSubmit={handleSearch}>
        <label>
          Tipo di Operazione:
          <select name="operation" value={filters.operation} onChange={handleFilterChange}>
            <option value="">Tutti</option>
            <option value="acquisto">Acquisto</option>
            <option value="cancellazione">Cancellazione</option>
            <option value="check-in">Check-in</option>
          </select>
        </label>
        <label>
          Data della transazione:
          <input type="datetime-local" name="arrivalTime" value={filters.arrivalTime} onChange={handleFilterChange} />
        </label>
        <label>
          Destinazione:
          <input type="text" name="destination" value={filters.destination} onChange={handleFilterChange} />
        </label>
        <button type="submit">Cerca</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <table className="history-table">
        <thead>
          <tr>
            <th onClick={handleSort}>Ora Transazione</th>
            <th>Operazione</th>
            <th>Numero Volo</th>
            <th>Destinazione</th>
            <th>Orario di Partenza</th>
            <th>Numero di Posto</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.map((item, index) => (
            <tr key={`${item.ticketId}-${index}`}>
              <td>{new Date(item.timestamp).toLocaleString()}</td>
              <td>{item.operation}</td>
              <td>{item.flightNumber}</td>
              <td>{item.destination}</td>
              <td>{new Date(item.departureTime).toLocaleString()}</td>
              <td>{item.seatNumber}</td>
              <td>
                {item.flightStatus === 'attivo' && item.operation === 'acquisto' && (
                  <>
                    <button onClick={() => handleCancel(item.ticketId)}>Cancella biglietto</button>
                    <button onClick={() => handleCheckIn(item.ticketId)}>Effettua il check-in</button>
                  </>
                )}
                {(item.flightStatus === 'cancellato' && (item.operation === 'acquisto' || item.operation === 'check-in')) && (
                  <p>Volo cancellato dall'admin, il biglietto verrà rimborsato al più presto, ci scusiamo per il disagio!</p>
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

export default HistoryPage;