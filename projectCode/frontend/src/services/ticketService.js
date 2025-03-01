import axios from 'axios';

const API_URL = 'https://localhost:3000/api/ticket/';

const purchaseTicket = async (flightNumber, token) => {
  const response = await axios.post(
    API_URL + 'purchase',
    { flightNumber },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }
  );
  return response.data;
};

const cancelTicket = async (ticketId, token) => {
  const response = await axios.post(
    API_URL + `cancel/${ticketId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }
  );
  return response.data;
};

const checkInTicket = async (ticketId, token) => {
  const response = await axios.post(
    API_URL + `checkin/${ticketId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }
  );
  return response.data;
};

const ticketService = {
  purchaseTicket,
  cancelTicket,
  checkInTicket,
};

export default ticketService;