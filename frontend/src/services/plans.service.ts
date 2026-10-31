// OWNER: FE-1
// PURPOSE: Typed API client for subscription plans

import api from '../lib/api';
import { Plan, PlanPeriod } from '../types';

export interface CreatePlanInput {
  name: string;
  price: number;
  period: PlanPeriod;
  minQuantity: number;
  availableFrom: string;
  availableTo: string;
  autoCloseAtEnd?: boolean;
  closableEarly?: boolean;
  pausable?: boolean;
  renewable?: boolean;
  isActive?: boolean;
}

export interface UpdatePlanInput extends Partial<CreatePlanInput> {}

export async function listPlans(params?: { active?: boolean | string }): Promise<Plan[]> {
  return await api.get('/plans', { params });
}

export async function getPlan(id: number | string): Promise<Plan> {
  return await api.get(`/plans/${id}`);
}

export async function createPlan(data: CreatePlanInput): Promise<Plan> {
  return await api.post('/plans', data);
}

export async function updatePlan(id: number | string, data: UpdatePlanInput): Promise<Plan> {
  return await api.put(`/plans/${id}`, data);
}

export async function deletePlan(id: number | string): Promise<{ success: boolean; message: string }> {
  return await api.delete(`/plans/${id}`);
}
