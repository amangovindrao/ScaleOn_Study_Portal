'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/app/lib/api';
import DisplayCards from '@/app/components/ui/display-cards';

export default function InternLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.internLogin({ identifier: email.trim(), password, remember });
      if (!res.success) { setError(res.error?.message ?? 'Invalid credentials.'); return; }
      const data = res.data as { isFirstLogin: boolean; mustChangePassword: boolean };
      if (data?.isFirstLogin || data?.mustChangePassword) { router.push('/onboarding'); }
      else { router.push('/intern/dashboard'); }
    } catch { setError('Something went wrong.'); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Left — cards */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center">
        <DisplayCards />
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/20">
              <span className="text-white text-xl font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to your ScaleOn account</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-7 shadow-xl shadow-slate-100/50">
            {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-red-700 text-sm font-medium">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-800 mb-2">Intern ID or Email</label>
                <input id="email" type="text" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="SOINT260001 or you@email.com" suppressHydrationWarning
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-800 mb-2">Password</label>
                <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" suppressHydrationWarning
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all" />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} suppressHydrationWarning className="w-4 h-4 rounded border-slate-300 accent-blue-600" />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading} suppressHydrationWarning
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="text-center text-slate-400 text-xs mt-6">ScaleOn Internship Study Portal</p>
        </div>
      </div>
    </main>
  );
}
