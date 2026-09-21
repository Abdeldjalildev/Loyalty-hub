import React, { useCallback, useEffect, useState } from 'react';
import {
  clearCustomerSession, loadCustomerSession, refreshCustomerSession,
  signInCustomer as firebaseSignInCustomer, signUpCustomer as firebaseSignUpCustomer, type AuthSession,
} from '../firebase/auth';
import { assertFirebaseConfiguration } from '../firebase/config';
import { callFunction } from '../firebase/callable';
import { CustomerAuthContext, type CustomerContext } from './CustomerAuthContext';

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [customer, setCustomer] = useState<CustomerContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomer = useCallback(async (next: AuthSession) => {
    const context = await callFunction<CustomerContext>('getCustomerContext', next);
    setCustomer(context);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      try {
        assertFirebaseConfiguration();
        const saved = loadCustomerSession();
        if (!saved) return;
        const next = saved.expiresAt - Date.now() < 60_000 ? await refreshCustomerSession(saved) : saved;
        if (cancelled) return;
        await loadCustomer(next);
        setSession(next);
      } catch (cause) {
        if (!cancelled) {
          clearCustomerSession(); setSession(null); setCustomer(null);
          setError(cause instanceof Error ? cause.message : 'CUSTOMER_AUTH_RESTORE_FAILED');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void restore();
    return () => { cancelled = true; };
  }, [loadCustomer]);

  useEffect(() => {
    if (!session) return;
    const delay = Math.max(session.expiresAt - Date.now() - 60_000, 30_000);
    const timer = window.setTimeout(async () => {
      try { setSession(await refreshCustomerSession(session)); }
      catch { clearCustomerSession(); setSession(null); setCustomer(null); }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [session]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null); setLoading(true);
    try {
      const next = await firebaseSignInCustomer(email.trim(), password);
      await loadCustomer(next); setSession(next);
    } catch (cause) {
      clearCustomerSession(); setSession(null); setCustomer(null);
      setError(cause instanceof Error ? cause.message : 'CUSTOMER_SIGN_IN_FAILED');
      throw cause;
    } finally { setLoading(false); }
  }, [loadCustomer]);

  const signUp = useCallback(async (email: string, password: string, displayName: string, merchantId: string) => {
    setError(null); setLoading(true);
    try {
      const next = await firebaseSignUpCustomer(email.trim(), password, displayName.trim());
      const provisioned = await callFunction<CustomerContext>('provisionCustomer', next, { merchantId: merchantId.trim() });
      setCustomer(provisioned); setSession(next);
    } catch (cause) {
      clearCustomerSession(); setSession(null); setCustomer(null);
      setError(cause instanceof Error ? cause.message : 'CUSTOMER_SIGN_UP_FAILED');
      throw cause;
    } finally { setLoading(false); }
  }, []);

  const signOut = useCallback(() => {
    clearCustomerSession(); setSession(null); setCustomer(null); setError(null);
  }, []);

  return <CustomerAuthContext.Provider value={{ session, customer, loading, error, signIn, signUp, signOut }}>{children}</CustomerAuthContext.Provider>;
};