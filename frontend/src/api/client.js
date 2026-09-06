import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (typeof window !== 'undefined' && window.location.port === '3000' ? 'http://localhost:5000/api' : '/api'),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
