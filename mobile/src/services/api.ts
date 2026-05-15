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
  timeout: 20000,
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
    if (!error.response) {
      return retryRequest(error.config, 2);
    }
    return Promise.reject(error);
  },
);

async function retryRequest(config: any, maxRetries: number, retryCount = 0): Promise<any> {
  if (retryCount >= maxRetries) {
    return Promise.reject(new Error('Network error. Please check your connection.'));
  }
  await new Promise((r) => setTimeout(r, 1000 * (retryCount + 1)));
  try {
    return await api.request(config);
  } catch {
    return retryRequest(config, maxRetries, retryCount + 1);
  }
}

export default api;
