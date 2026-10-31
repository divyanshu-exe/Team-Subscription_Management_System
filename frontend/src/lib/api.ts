// OWNER: FE-1
// PURPOSE: Axios instance, attach token, handle 401 redirect, unwrap API responses

import axios, { AxiosError } from 'axios';
import { getToken, clearToken } from './auth';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // If response is a blob or stream, return raw response or response.data
    if (response.config.responseType === 'blob') {
      return response.data;
    }
    // Unwrap { success, message, data } from standard apiResponse
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error: AxiosError<{ message?: string; errors?: any }>) => {
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    const customError: any = new Error(
      error.response?.data?.message || error.message || 'An unexpected error occurred'
    );
    customError.status = error.response?.status;
    customError.errors = error.response?.data?.errors;

    return Promise.reject(customError);
  }
);

export default api;
