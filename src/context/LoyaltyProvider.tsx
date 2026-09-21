import React, { useCallback, useEffect, useState } from 'react';
import { callFunction } from '../firebase/callable';
import { useAuth } from './useAuth';
import { LoyaltyContext, type Campaign, type Customer, type LoyaltyProgram, type LoyaltyTransaction, type Reward } from './LoyaltyContext';

interface LoyaltyData {
  program: LoyaltyProgram;
  customers: Customer[];
  rewards: Reward[];
}

export const LoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, merchant } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);

  const reload = useCallback(async () => {
    if (!session || !merchant) {
      setCustomers([]);
      setCampaigns([]);
      setProgram(null);
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await callFunction<LoyaltyData>('getLoyaltyData', session);
      setCustomers(data.customers);
      setCampaigns(data.rewards);
      setProgram(data.program);
      const transactionData = await callFunction<{ transactions: LoyaltyTransaction[] }>('listTransactions', session);
      setTransactions(transactionData.transactions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'LOYALTY_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, [merchant, session]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  const addPoints = useCallback(async (customerId: string, points: number) => {
    if (!session) throw new Error('Authentication is required.');
    const idempotencyKey = crypto.randomUUID();
    const result = await callFunction<{ balanceAfter: number; transactionId: string }>('issuePoints', session, { customerId, points, idempotencyKey });
    setCustomers(prev => prev.map(customer => customer.id === customerId ? { ...customer, points: result.balanceAfter } : customer));
    await reload();
    return result;
  }, [reload, session]);

  const addNewCustomer = useCallback(async (name: string, email: string, phone: string) => {
    if (!session) throw new Error('Authentication is required.');
    const customer = await callFunction<Customer>('createCustomer', session, { name, email, phone });
    setCustomers(prev => [customer, ...prev]);
    return customer;
  }, [session]);

  const updateCustomer = useCallback(async (customerId: string, name: string, email: string, phone: string) => {
    if (!session) throw new Error('Authentication is required.');
    const customer = await callFunction<Customer>('updateCustomer', session, { customerId, name, email, phone });
    setCustomers(prev => prev.map(item => item.id === customerId ? customer : item));
    return customer;
  }, [session]);

  const archiveCustomer = useCallback(async (customerId: string) => {
    if (!session) throw new Error('Authentication is required.');
    await callFunction('archiveCustomer', session, { customerId });
    setCustomers(prev => prev.filter(customer => customer.id !== customerId));
  }, [session]);

  const createReward = useCallback(async (reward: Omit<Reward, 'id' | 'status'>) => {
    if (!session) throw new Error('Authentication is required.');
    const created = await callFunction<Reward>('createReward', session, reward);
    setCampaigns(prev => [...prev, created]);
    return created;
  }, [session]);

  const updateReward = useCallback(async (rewardId: string, reward: Omit<Reward, 'id' | 'status'>) => {
    if (!session) throw new Error('Authentication is required.');
    const updated = await callFunction<Reward>('updateReward', session, { rewardId, ...reward });
    setCampaigns(prev => prev.map(item => item.id === rewardId ? updated : item));
    return updated;
  }, [session]);

  const createQrToken = useCallback(async (customerId: string) => {
    if (!session) throw new Error('Authentication is required.');
    return callFunction<{ qrPayload: string; expiresAt: number; ttlSeconds: number }>('createQrToken', session, { customerId });
  }, [session]);

  const redeemReward = useCallback(async (qrPayload: string, rewardId: string) => {
    if (!session) throw new Error('Authentication is required.');
    const idempotencyKey = crypto.randomUUID();
    const result = await callFunction<{ redemptionId: string; balanceAfter: number; pointsCost: number }>('redeemReward', session, {
      qrPayload,
      rewardId,
      idempotencyKey,
    });
    await reload();
    return result;
  }, [reload, session]);

  return (
    <LoyaltyContext.Provider value={{
      customers, campaigns, program, loading, error, reload, transactions,
      addPoints, addNewCustomer, updateCustomer, archiveCustomer, createReward, updateReward,
      createQrToken, redeemReward,
    }}>
      {children}
    </LoyaltyContext.Provider>
  );
};

