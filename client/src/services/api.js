import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const session = localStorage.getItem('collabnation_auth');

  if (!session) {
    return config;
  }

  try {
    const parsedSession = JSON.parse(session);

    if (parsedSession.token) {
      config.headers.Authorization = `Bearer ${parsedSession.token}`;
    }
  } catch (_error) {
    localStorage.removeItem('collabnation_auth');
  }

  return config;
});

export default api;

