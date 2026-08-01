'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/app/lib/api';

type Step = 'password' | 'profile' | 'agreement';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('password');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profile, setProfile] = useState({ phone: '', college: '', branch: '', semester: '', linkedin: '', github: '' });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handlePasswordNext(e: FormEvent) {
    e.preventDefault(); setError(null);
    if (!newPassword) { setError('Please enter a password.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setStep('profile');
  }

  async function handleComplete(e: FormEvent) {
    e.preventDefault();
    if (!agreed) { setError('You must accept the agreement.'); return; }
    setError(null); setLoading(true);
    try {
      const profileData = Object.fromEntries(Object.entries(profile).filter(([, v]) => v.trim())) as Record<string, string>;
      const res = await authApi.completeFirstLogin({
        newPassword, acceptTerms: true,
        profile: Object.keys(profileData).length > 0 ? profileData : undefined,
      });
      if (!res.success) { setError(res.error?.message ?? 'Setup failed.'); setLoading(false); return; }
      router.push('/intern/dashboard');
    } catch { setError('Something went wrong.'); }
    finally { setLoading(false); }
  }

  const steps: { key: Step; label: string }[] = [{ key: 'password', label: 'Password' }, { key: 'profile', label: 'Profile' }, { key: 'agreement', label: 'Agreement' }];
  const currentIdx = steps.findIndex(s => s.key === step);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Set Up Your Account</h1>
          <p className="text-slate-500 text-sm mt-1">Complete these steps to get started</p>
        </div>

        <div className="flex gap-1.5 mb-6">
          {steps.map((s, i) => (
            <div key={s.key} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= currentIdx ? 'bg-blue-600' : 'bg-slate-200'}`} />
              <p className={`text-[10px] mt-1 text-center font-medium ${i <= currentIdx ? 'text-blue-600' : 'text-slate-400'}`}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-4 text-red-700 text-sm">{error}</div>}

          {step === 'password' && (
            <form onSubmit={handlePasswordNext} className="space-y-4">
              <p className="text-slate-600 text-sm">Create a new password for your account.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 text-sm transition">Next →</button>
            </form>
          )}

          {step === 'profile' && (
            <form onSubmit={(e) => { e.preventDefault(); setStep('agreement'); }} className="space-y-4">
              <p className="text-slate-600 text-sm">Fill in your details (optional, can update later).</p>
              <div className="grid grid-cols-2 gap-3">
                {([['phone', 'Phone'], ['college', 'College'], ['branch', 'Branch'], ['semester', 'Semester'], ['linkedin', 'LinkedIn URL'], ['github', 'GitHub URL']] as [keyof typeof profile, string][]).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                    <input value={profile[key]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('password')} className="flex-1 border border-slate-300 text-slate-600 rounded-lg py-2.5 text-sm hover:bg-slate-50 transition">← Back</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 text-sm transition">Next →</button>
              </div>
            </form>
          )}

          {step === 'agreement' && (
            <form onSubmit={handleComplete} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-40 overflow-y-auto text-slate-600 text-xs space-y-2 leading-relaxed">
                <p className="font-semibold text-slate-900 text-sm">Internship Agreement & Privacy Policy</p>
                <ul className="list-disc list-inside space-y-1.5">
                  <li>All work produced is the intellectual property of ScaleOn.</li>
                  <li>I will maintain strict confidentiality regarding company data.</li>
                  <li>I will not share my login credentials with anyone.</li>
                  <li>I will complete assigned tasks within deadlines.</li>
                  <li>My progress and activity are tracked for quality assurance.</li>
                  <li>ScaleOn may terminate my internship for policy violations.</li>
                  <li>I consent to ScaleOn storing my personal data for management purposes.</li>
                  <li>Certificates are issued only upon successful completion.</li>
                </ul>
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 mt-0.5 rounded accent-blue-600" />
                <span className="text-sm text-slate-700">I accept the Internship Agreement & Privacy Policy</span>
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('profile')} className="flex-1 border border-slate-300 text-slate-600 rounded-lg py-2.5 text-sm hover:bg-slate-50 transition">← Back</button>
                <button type="submit" disabled={loading || !agreed} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium rounded-lg py-2.5 text-sm transition">{loading ? 'Setting up…' : 'Complete'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
