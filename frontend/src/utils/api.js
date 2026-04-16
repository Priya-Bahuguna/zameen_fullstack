import axios from 'axios';

const api = axios.create({
  // REACT_APP_API_URL is set in Vercel environment variables
  // Falls back to /api for local dev (proxy in package.json handles it)
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000, // 30s timeout — Render free tier has cold start delay
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zameen_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('zameen_token');
      delete api.defaults.headers.common['Authorization'];
    }
    return Promise.reject(err);
  }
);

export default api;
