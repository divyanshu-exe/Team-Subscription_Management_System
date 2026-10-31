// OWNER: BE-1
// PURPOSE: Zod validation schemas for authentication routes

const { z } = require('zod');
const { isValidPassword } = require('../../utils/password');

const passwordRule = z.string().refine(isValidPassword, {
  message:
    'Password must be at least 9 characters long, include at least one uppercase letter, one lowercase letter, and one special character.',
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: passwordRule,
});

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordRule,
});

module.exports = {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
