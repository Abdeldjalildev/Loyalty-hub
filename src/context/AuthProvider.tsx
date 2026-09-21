import React, { useCallback, useEffect, useState } from 'react';
import {
  clearSession, loadSession, refreshSession, signIn as firebaseSignIn,
  signUp as firebaseSignUp, type AuthSession,
} from '../firebase/auth';
import { assertFirebaseConfiguration } from '../firebase/config';
import { callFunction } from '../firebase/callable';
import { AuthContext, type MerchantContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [merchant, setMerchant] = useState<MerchantContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMerchant = useCallback(async (nextSession: AuthSession) => {
    const context = await callFunction<MerchantContext>('getMerchantContext', nextSession);
    setMerchant(context);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      try {
        assertFirebaseConfiguration();
        const saved = loadSession();
        if (!saved) return;
        const next = saved.expiresAt - Date.now() < 60_000 ? await refreshSession(saved) : saved;
        if (cancelled) return;
        setSession(next);
        await loadMerchant(next);
      } catch (cause) {
        if (!cancelled) {
          clearSession(); setSession(null); setMerchant(null);
          setError(cause instanceof Error ? cause.message : 'AUTH_RESTORE_FAILED');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void restore();
    return () => { cancelled = true; };
  }, [loadMerchant]);

  useEffect(() => {
    if (!session) return;
    const delay = Math.max(session.expiresAt - Date.now() - 60_000, 30_000);
    const timer = window.setTimeout(async () => {
      try { setSession(await refreshSession(session)); }
      catch { clearSession(); setSession(null); setMerchant(null); }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [session]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null); setLoading(true);
    try {
      const next = await firebaseSignIn(email.trim(), password);
      await loadMerchant(next); setSession(next);
    } catch (cause) {
      clearSession(); setSession(null); setMerchant(null);
      setError(cause instanceof Error ? cause.message : 'SIGN_IN_FAILED');
      throw cause;
    } finally { setLoading(false); }
  }, [loadMerchant]);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    setError(null); setLoading(true);
    try {
      const next = await firebaseSignUp(email.trim(), password, displayName.trim());
      const provisioned = await callFunction<MerchantContext>('provisionMerchant', next, { displayName: displayName.trim() });
      setMerchant(provisioned); setSession(next);
    } catch (cause) {
      clearSession(); setSession(null); setMerchant(null);
      setError(cause instanceof Error ? cause.message : 'SIGN_UP_FAILED');
      throw cause;
    } finally { setLoading(false); }
  }, []);

  const signOut = useCallback(() => {
    clearSession(); setSession(null); setMerchant(null); setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, merchant, loading, error, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
