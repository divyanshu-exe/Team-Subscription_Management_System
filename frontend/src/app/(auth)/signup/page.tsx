// OWNER: FE-1
// PURPOSE: Customer registration with live 4-rule password checklist

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signupSchema } from '../../../lib/validators';
import { signup } from '../../../services/auth.service';
import { setToken } from '../../../lib/auth';
import { useToast } from '../../../components/ui/Toast';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password') || '';
  const ruleLength = passwordValue.length >= 9;
  const ruleUpper = /[A-Z]/.test(passwordValue);
  const ruleLower = /[a-z]/.test(passwordValue);
  const ruleSpecial = /[^A-Za-z0-9]/.test(passwordValue);

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    try {
      const res = await signup({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setToken(res.token);
      addToast('Account created successfully!', 'success');
      router.push('/my-subscriptions');
    } catch (err: any) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Brightloop Software</h1>
          <p className="text-sm text-slate-500">Create your customer account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name / Company Name"
            placeholder="Jane Doe or Acme Corp"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="jane@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              placeholder="•••••••••"
              className={`block w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                errors.password
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
              {...register('password')}
            />
            {errors.password?.message && (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}

            {/* Live 4-rule checklist */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mt-2 space-y-1">
              <p className="text-xs font-semibold text-slate-700 mb-1">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <div className={`flex items-center gap-1.5 ${ruleLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  <span>{ruleLength ? '✓' : '○'}</span> At least 9 characters
                </div>
                <div className={`flex items-center gap-1.5 ${ruleUpper ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  <span>{ruleUpper ? '✓' : '○'}</span> 1 uppercase letter
                </div>
                <div className={`flex items-center gap-1.5 ${ruleLower ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  <span>{ruleLower ? '✓' : '○'}</span> 1 lowercase letter
                </div>
                <div className={`flex items-center gap-1.5 ${ruleSpecial ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  <span>{ruleSpecial ? '✓' : '○'}</span> 1 special character
                </div>
              </div>
            </div>
          </div>

          <Input
            label="Confirm Password"
            type="password"
            placeholder="•••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
