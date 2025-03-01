import axios from 'axios';

const fetchHistory = async (token, page, filters) => {
  try {
    const response = await axios.get('https://localhost:3000/api/history/read', {
      params: { 
        page,
        operation: filters.operation,
        arrivalTime: filters.arrivalTime,
        destination: filters.destination
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Errore durante il recupero dello storico:', error);
    throw error;
  }
};

const cancelTicket = async (ticketId) => {
  try {
    await axios.post(`https://localhost:3000/api/ticket/cancel/${ticketId}`, {}, {
      withCredentials: true,
    });
    alert('Biglietto cancellato con successo!');
  } catch (error) {
    console.error('Errore durante la cancellazione del biglietto:', error);
    alert('Errore durante la cancellazione del biglietto');
    throw error;
  }
};

const checkInTicket = async (ticketId) => {
  try {
    await axios.post(`https://localhost:3000/api/ticket/checkin/${ticketId}`, {}, {
      withCredentials: true,
    });
    alert('Check-in effettuato con successo!');
  } catch (error) {
    console.error('Errore durante il check-in del biglietto:', error);
    alert('Errore durante il check-in del biglietto');
    throw error;
  }
};

export { fetchHistory, cancelTicket, checkInTicket };