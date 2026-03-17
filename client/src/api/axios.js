import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Store token in memory only
let accessToken = null;
export const setToken   = (t) => { accessToken = t; };
export const clearToken = ()  => { accessToken = null; };

// Attach token to every request
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On 401 — try refresh ONCE, then give up
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Only retry once, and never retry the refresh call itself
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh')
    ) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        setToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        clearToken();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
