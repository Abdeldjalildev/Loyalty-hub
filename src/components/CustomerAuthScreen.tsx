import React, { useState } from 'react';
import { UserRound } from 'lucide-react';
import { useCustomerAuth } from '../context/useCustomerAuth';

export const CustomerAuthScreen: React.FC = () => {
  const { signIn, signUp, loading, error } = useCustomerAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [merchantId, setMerchantId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setFormError(null);
    try {
      if (mode === 'signup') {
        if (merchantId.trim().length < 1) throw new Error('Merchant ID is required.');
        if (name.trim().length < 2) throw new Error('Name must contain at least 2 characters.');
        await signUp(email, password, name, merchantId);
      } else await signIn(email, password);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Customer authentication failed.');
    }
  };

  return <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
    <form onSubmit={submit} className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-6">
      <div className="text-center space-y-2"><div className="mx-auto w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center"><UserRound size={24} /></div><h1 className="text-2xl font-bold">LoyaltyHub Customer</h1><p className="text-sm text-gray-500">{mode === 'signin' ? 'Customer sign in' : 'Activate your customer portal'}</p></div>
      {mode === 'signup' && <label className="block space-y-1"><span className="text-sm font-medium">Merchant ID</span><input required value={merchantId} onChange={e => setMerchantId(e.target.value)} className="w-full rounded-lg border px-3 py-2 bg-transparent" /></label>}
      {mode === 'signup' && <label className="block space-y-1"><span className="text-sm font-medium">Your name</span><input required minLength={2} value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border px-3 py-2 bg-transparent" /></label>}
      <label className="block space-y-1"><span className="text-sm font-medium">Email</span><input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border px-3 py-2 bg-transparent" /></label>
      <label className="block space-y-1"><span className="text-sm font-medium">Password</span><input required minLength={6} type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border px-3 py-2 bg-transparent" /></label>
      {(formError || error) && <p className="rounded-lg bg-rose-50 text-rose-700 px-3 py-2 text-sm">{formError || error}</p>}
      <button disabled={loading} className="w-full rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2.5">{loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Activate portal'}</button>
      <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="w-full text-sm text-purple-600">{mode === 'signin' ? 'I need to activate my portal' : 'Already activated? Sign in'}</button>
      <a href="/" className="block text-center text-xs text-gray-400">Merchant portal</a>
    </form>
  </main>;
};