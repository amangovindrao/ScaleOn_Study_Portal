'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/app/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword(token, password);
      if (!res.success) {
        setError(res.error?.message ?? 'Reset failed. The link may have expired.');
        return;
      }
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <p className="text-red-300 text-sm">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="text-purple-300 hover:text-white text-sm transition">Request a new link</Link>
      </div>
    );
  }

  return done ? (
    <div className="text-center space-y-3">
      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-white">Password reset!</h2>
      <p className="text-purple-200 text-sm">Redirecting you to login…</p>
    </div>
  ) : (
    <>
      <h2 className="text-xl font-semibold text-white mb-2">Set new password</h2>
      <p className="text-purple-200 text-sm mb-6">Must be at least 12 characters with uppercase, lowercase, number, and special character.</p>

      {error && (
        <div role="alert" className="bg-red-500/20 border border-red-500/40 text-red-200 rounded-lg px-4 py-3 mb-5 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-sm text-purple-200 mb-1.5">New Password</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 12 characters"
            className="w-full bg-white/5 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm text-purple-200 mb-1.5">Confirm Password</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            className="w-full bg-white/5 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition"
        >
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-purple-900 to-black px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">ScaleOn</h1>
          <p className="text-purple-300 text-sm mt-1">Internship Study Portal</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8">
          <Suspense fallback={<p className="text-purple-200 text-sm text-center">Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
