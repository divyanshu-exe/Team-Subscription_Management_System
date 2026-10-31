// OWNER: FE-1
// PURPOSE: Reset password page reading ?token= query parameter

'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPasswordSchema } from '../../../lib/validators';
import { resetPassword } from '../../../services/auth.service';
import { useToast } from '../../../components/ui/Toast';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

type ResetFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const passwordValue = watch('password') || '';
  const ruleLength = passwordValue.length >= 9;
  const ruleUpper = /[A-Z]/.test(passwordValue);
  const ruleLower = /[a-z]/.test(passwordValue);
  const ruleSpecial = /[^A-Za-z0-9]/.test(passwordValue);

  const onSubmit = async (data: ResetFormData) => {
    setLoading(true);
    try {
      await resetPassword(data.token, data.password);
      addToast('Password has been reset successfully! Please sign in.', 'success');
      router.push('/login');
    } catch (err: any) {
      addToast(err.message || 'Invalid or expired password reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('token')} value={token} />

      {!token && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          No valid reset token found in link. Please request a new password reset.
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">New Password</label>
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

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mt-2 space-y-1">
          <p className="text-xs font-semibold text-slate-700 mb-1">Requirements:</p>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <div className={`flex items-center gap-1.5 ${ruleLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <span>{ruleLength ? '✓' : '○'}</span> 9+ characters
            </div>
            <div className={`flex items-center gap-1.5 ${ruleUpper ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <span>{ruleUpper ? '✓' : '○'}</span> 1 uppercase
            </div>
            <div className={`flex items-center gap-1.5 ${ruleLower ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <span>{ruleLower ? '✓' : '○'}</span> 1 lowercase
            </div>
            <div className={`flex items-center gap-1.5 ${ruleSpecial ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <span>{ruleSpecial ? '✓' : '○'}</span> 1 special char
            </div>
          </div>
        </div>
      </div>

      <Input
        label="Confirm New Password"
        type="password"
        placeholder="•••••••••"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        disabled={!token}
        isLoading={loading}
      >
        Reset Password
      </Button>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
          <p className="text-sm text-slate-500">Choose a secure password for your account</p>
        </div>

        <Suspense fallback={<div className="text-center text-sm text-slate-400">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
