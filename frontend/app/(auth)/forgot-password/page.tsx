'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { authApi } from '@/app/lib/api';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.forgotPassword(identifier.trim());
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-purple-900 to-black px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">ScaleOn</h1>
          <p className="text-purple-300 text-sm mt-1">Internship Study Portal</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">Check your inbox</h2>
              <p className="text-purple-200 text-sm">
                If an account exists for <strong className="text-white">{identifier}</strong>, we&apos;ve sent password reset instructions.
              </p>
              <Link href="/login" className="block text-sm text-purple-300 hover:text-white transition mt-4">
                ← Back to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">Reset password</h2>
              <p className="text-purple-200 text-sm mb-6">Enter your username or email and we&apos;ll send reset instructions.</p>

              {error && (
                <div role="alert" className="bg-red-500/20 border border-red-500/40 text-red-200 rounded-lg px-4 py-3 mb-5 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="identifier" className="block text-sm text-purple-200 mb-1.5">Username or Email</label>
                  <input
                    id="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="SO-AI-0001 or name@email.com"
                    className="w-full bg-white/5 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <Link href="/login" className="block text-center text-sm text-purple-300 hover:text-white transition mt-5">
                ← Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
