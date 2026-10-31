// OWNER: FE-1
// PURPOSE: Typed API client for staff user administration (ADMIN only)

import api from '../lib/api';
import { User, Paginated } from '../types';

export interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdateStaffInput {
  name?: string;
  isActive?: boolean;
}

export async function listStaff(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<Paginated<User>> {
  return await api.get('/users/staff', { params });
}

export async function createStaff(data: CreateStaffInput): Promise<User> {
  return await api.post('/users/staff', data);
}

export async function updateStaff(id: number | string, data: UpdateStaffInput): Promise<User> {
  return await api.patch(`/users/staff/${id}`, data);
}
