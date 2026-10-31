// OWNER: FE-1
// PURPOSE: Axios instance, request authorization injection, and 401 interception

import axios, { AxiosError } from 'axios';
import { getToken, clearToken } from './auth';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add Bearer token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap response.data.data & handle 401
api.interceptors.response.use(
  (response) => {
    // If backend returns { success, data, message }, unwrap data
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    const resData = error.response?.data;
    const normalizedError = {
      message: resData?.message || error.message || 'An unexpected error occurred',
      errors: resData?.errors || [],
      status: error.response?.status,
    };

    return Promise.reject(normalizedError);
  }
);

export default api;
