// OWNER: BE-1
// PURPOSE: Zod validation schemas for staff user management

const { z } = require('zod');
const { isValidPassword } = require('../../utils/password');

const passwordRule = z.string().refine(isValidPassword, {
  message:
    'Password must be at least 9 characters long, include at least one uppercase letter, one lowercase letter, and one special character.',
});

const createStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: passwordRule,
});

const updateStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  isActive: z.boolean().optional(),
});

module.exports = {
  createStaffSchema,
  updateStaffSchema,
};
