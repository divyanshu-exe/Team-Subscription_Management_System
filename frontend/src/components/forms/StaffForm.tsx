// OWNER: FE-1
// PURPOSE: Staff creation form with 4-rule live password checklist (ADMIN only)

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { passwordSchema } from '../../lib/validators';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const staffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: passwordSchema,
});

type StaffFormData = z.infer<typeof staffSchema>;

export interface StaffFormProps {
  onSubmit: (data: StaffFormData) => Promise<void>;
  isLoading?: boolean;
}

export const StaffForm: React.FC<StaffFormProps> = ({ onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password') || '';

  const ruleLength = passwordValue.length >= 9;
  const ruleUpper = /[A-Z]/.test(passwordValue);
  const ruleLower = /[a-z]/.test(passwordValue);
  const ruleSpecial = /[^A-Za-z0-9]/.test(passwordValue);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
      <div className="space-y-4">
        <Input
          label="Staff Full Name"
          placeholder="e.g. Alex Morgan"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Work Email Address"
          type="email"
          placeholder="alex@brightloop.test"
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <Input
            label="Temporary Password"
            type="password"
            placeholder="•••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Live checklist */}
          <div className="mt-2.5 rounded-lg bg-slate-50 p-3 border border-slate-200/80 text-xs space-y-1.5">
            <p className="font-semibold text-slate-700 mb-1">Password Requirements:</p>
            <div className="flex items-center gap-2">
              <span className={ruleLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                {ruleLength ? '✓' : '○'}
              </span>
              <span className={ruleLength ? 'text-emerald-700' : 'text-slate-500'}>
                At least 9 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={ruleUpper ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                {ruleUpper ? '✓' : '○'}
              </span>
              <span className={ruleUpper ? 'text-emerald-700' : 'text-slate-500'}>
                At least 1 uppercase letter (A-Z)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={ruleLower ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                {ruleLower ? '✓' : '○'}
              </span>
              <span className={ruleLower ? 'text-emerald-700' : 'text-slate-500'}>
                At least 1 lowercase letter (a-z)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={ruleSpecial ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                {ruleSpecial ? '✓' : '○'}
              </span>
              <span className={ruleSpecial ? 'text-emerald-700' : 'text-slate-500'}>
                At least 1 special character (!@#$%^&*...)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Create Staff Member
        </Button>
      </div>
    </form>
  );
};
