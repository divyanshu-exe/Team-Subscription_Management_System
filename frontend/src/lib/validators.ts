// OWNER: FE-1
// PURPOSE: Shared Zod validation schemas (password rule: 9+ chars, upper, lower, special)

import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(9, 'Password must be at least 9 characters')
  .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
  .regex(/[a-z]/, 'Must contain at least 1 lowercase letter')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least 1 special character');

export const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
