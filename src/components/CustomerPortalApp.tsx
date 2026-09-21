import React, { useCallback, useEffect, useState } from 'react';
import { Gift, LogOut, RefreshCw, History } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { callFunction } from '../firebase/callable';
import { useCustomerAuth } from '../context/useCustomerAuth';

interface PortalTransaction { id: string; type: 'earn' | 'redeem'; points: number; balanceAfter: number; rewardId?: string }
interface PortalData { customer: { id: string; name: string; email: string; phone: string; points: number }; program: { id: string; name: string; pointsPerUnit: number }; rewards: Array<{ id: string; titleEn: string; titleAr: string; titleFr: string; pointsRequired: number }>; transactions: PortalTransaction[] }

export const CustomerPortalApp: React.FC = () => {
  const { session, customer: identity, loading: authLoading, signOut } = useCustomerAuth();
  const [data, setData] = useState<PortalData | null>(null);
  const [qrPayload, setQrPayload] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true); setError(null);
    try {
      const next = await callFunction<PortalData>('getCustomerPortalData', session);
      const qr = await callFunction<{ qrPayload: string }>('createCustomerQrToken', session);
      setData(next); setQrPayload(qr.qrPayload);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'CUSTOMER_PORTAL_LOAD_FAILED'); }
    finally { setLoading(false); }
  }, [session]);
  // Initial portal hydration is intentionally driven by the authenticated session.
  // The loader owns all async state transitions; this effect only subscribes to session changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);
  if (authLoading && !session) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!session || !identity) return null;
  return <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8"><div className="max-w-5xl mx-auto space-y-6">
    <header className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-wider text-purple-500 font-bold">LoyaltyHub Customer</p><h1 className="text-2xl font-bold">{identity.customer.name}</h1><p className="text-sm text-gray-500">{identity.customer.email}</p></div><div className="flex gap-2"><button onClick={() => void load()} className="p-2 rounded-lg border"><RefreshCw size={18} /></button><button onClick={signOut} className="p-2 rounded-lg border text-rose-600"><LogOut size={18} /></button></div></header>
    {error && <div className="rounded-xl bg-rose-50 text-rose-700 p-4 text-sm">{error}</div>}{loading && <div className="rounded-xl bg-white p-4 shadow-sm">Loading your loyalty account…</div>}
    {data && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border dark:border-gray-700 text-center"><p className="text-sm text-gray-500">Current balance</p><p className="text-5xl font-black text-purple-600 mt-2">{data.customer.points}</p><p className="text-xs text-gray-400 mt-1">POINTS</p><div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 min-h-[190px] flex items-center justify-center">{qrPayload ? <QRCodeSVG value={qrPayload} size={160} level="H" /> : <span className="text-xs text-gray-400">Generating secure QR…</span>}</div><p className="text-xs text-gray-400 mt-3">Show this QR to the merchant when redeeming a reward. It is short-lived and single-use.</p></section>
      <section className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border dark:border-gray-700"><h2 className="font-bold flex items-center gap-2 mb-4"><Gift size={18} /> Available rewards</h2><div className="space-y-3">{data.rewards.map(reward => <div key={reward.id} className="p-4 rounded-xl border dark:border-gray-700 flex items-center justify-between gap-4"><div><p className="font-bold">{reward.titleEn}</p><p className="text-xs text-gray-500">{reward.pointsRequired} points</p></div><span className={data.customer.points >= reward.pointsRequired ? 'text-emerald-600 font-bold text-sm' : 'text-gray-400 text-sm'}>{data.customer.points >= reward.pointsRequired ? 'Eligible' : 'Keep earning'}</span></div>)}</div></section>
      <section className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border dark:border-gray-700"><h2 className="font-bold flex items-center gap-2 mb-4"><History size={18} /> Recent activity</h2><div>{data.transactions.length === 0 ? <p className="text-sm text-gray-400">No transactions yet.</p> : data.transactions.map(tx => <div key={tx.id} className="flex justify-between text-sm py-2 border-b last:border-0 dark:border-gray-700"><span className="capitalize">{tx.type}</span><span className={tx.points > 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{tx.points > 0 ? '+' : ''}{tx.points} pts</span><span className="text-gray-400">Balance {tx.balanceAfter}</span></div>)}</div></section>
    </div>}
  </div></main>;
};