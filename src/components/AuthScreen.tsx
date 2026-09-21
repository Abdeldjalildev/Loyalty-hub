import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, loading, error } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setFormError(null);
    try {
      if (mode === 'signup') {
        if (name.trim().length < 2) throw new Error('Merchant name must contain at least 2 characters.');
        await signUp(email, password, name);
      } else await signIn(email, password);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Authentication failed.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center"><ShieldCheck size={24} /></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LoyaltyHub</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{mode === 'signin' ? 'Merchant sign in' : 'Create your merchant account'}</p>
        </div>
        {mode === 'signup' && (
          <label className="block space-y-1"><span className="text-sm font-medium">Business name</span>
            <input required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2" />
          </label>
        )}
        <label className="block space-y-1"><span className="text-sm font-medium">Email</span>
          <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2" />
        </label>
        <label className="block space-y-1"><span className="text-sm font-medium">Password</span>
          <input required minLength={6} type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2" />
        </label>
        {(formError || error) && <p className="rounded-lg bg-rose-50 text-rose-700 px-3 py-2 text-sm">{formError || error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5">
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create merchant account'}
        </button>
        <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="w-full text-sm text-indigo-600 hover:text-indigo-700">
          {mode === 'signin' ? 'Create a merchant account' : 'Already have an account? Sign in'}
        </button>
      </form>
    </main>
  );
};
