import axios from 'axios';

const API_URL = 'https://localhost:3000/api/user';

const getUsers = async (filters = {}, page = 1, limit = 10) => {
  const params = { ...filters, page, limit };
  const response = await axios.get(`${API_URL}/users`, { params });
  return response.data;
};

const updateUserRole = async (userId, newRole) => {
  await axios.put(`${API_URL}/users/${userId}/role`, { role: newRole });
};

export default {
  getUsers,
  updateUserRole,
};