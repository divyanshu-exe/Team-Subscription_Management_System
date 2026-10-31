// OWNER: FE-1
// PURPOSE: Forgot password page (always returns 200 to prevent user enumeration)

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPasswordSchema } from '../../../lib/validators';
import { forgotPassword } from '../../../services/auth.service';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

type ForgotFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setLoading(true);
    try {
      await forgotPassword(data.email);
    } catch (_) {
      // Intentionally do not reveal if email exists or fails
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
          <p className="text-sm text-slate-500">
            {submitted
              ? 'Check your inbox for a reset link'
              : 'Enter your email to receive a password reset link'}
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 space-y-3">
            <p>
              If an account with that email exists, we have sent instructions to reset your password.
              The link is valid for 30 minutes.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="secondary" className="w-full text-xs">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Account Email"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
              Send Reset Link
            </Button>

            <div className="text-center text-xs text-slate-500 pt-2">
              Remember your password?{' '}
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
                Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
