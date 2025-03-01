import axios from 'axios';

const API_URL = 'https://localhost:3000/api/flight/flights';

const getFlights = async (filters = {}, page = 1, limit = 10) => {
  const params = { ...filters, page, limit };
  const response = await axios.get(API_URL, { params, withCredentials: true });
  return response.data;
};

const addFlight = async (flightData) => {
  const response = await axios.post(API_URL, flightData, { withCredentials: true });
  return response.data;
};

const updateFlight = async (flightId, flightData) => {
  const response = await axios.put(`${API_URL}/${flightId}`, flightData, { withCredentials: true });
  return response.data;
};

const deleteFlight = async (flightId) => {
  const response = await axios.delete(`${API_URL}/${flightId}`, { withCredentials: true });
  return response.data;
};

const flightAdminService = {
  getFlights,
  addFlight,
  updateFlight,
  deleteFlight,
};

export default flightAdminService;