// OWNER: FE-1
// PURPOSE: Typed API client for Authentication endpoints

import api from '../lib/api';
import { User } from '../types';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function signup(data: SignupInput): Promise<AuthResponse> {
  return await api.post('/auth/signup', data);
}

export async function login(data: LoginInput): Promise<AuthResponse> {
  return await api.post('/auth/login', data);
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return await api.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  return await api.post('/auth/reset-password', { token, password });
}

export async function getMe(): Promise<User> {
  return await api.get('/auth/me');
}

export async function logout(): Promise<void> {
  // Handled client-side by clearing cookies and localStorage
}
