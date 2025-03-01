import axios from 'axios';

const API_URL = 'https://localhost:3000/api/flight/search';

const getFlights = async (filters = {}, page = 1, limit = 10) => {
  const params = { ...filters, page, limit };
  const response = await axios.get(API_URL, { params });
  return response.data;
};

const flightService = {
  getFlights,
};

export default flightService;