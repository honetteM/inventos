import axios from 'axios';
import { getToken, clearAuth } from '@/src/storage/secure';

const raw = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.64:8080/api';
const API_BASE_URL = raw.endsWith('/') ? raw : raw + '/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearAuth();
    }
    return Promise.reject(error);
  },
);

export default api;
