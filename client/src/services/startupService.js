import api from './api';

export const getStartups = async () => {
  const response = await api.get('/startups');
  return response.data;
};

export const getStartupById = async (startupId) => {
  const response = await api.get(`/startups/${startupId}`);
  return response.data;
};

