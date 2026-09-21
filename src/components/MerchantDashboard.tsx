import React, { useEffect, useRef, useState } from 'react';
import { useLoyalty } from '../context/useLoyalty';
import { useApp } from '../context/useApp';
import { PlusCircle, QrCode, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { QrScannerModal } from './QrScannerModal';
import { StatsCards } from './merchant/StatsCards';
import { CustomerForm } from './merchant/CustomerForm';
import { BusinessSettings } from './BusinessSettings';

export const MerchantDashboard: React.FC = () => {
  const { customers, campaigns, addPoints, addNewCustomer, redeemReward, loading, error, reload } = useLoyalty();
  const { t } = useApp();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [query, setQuery] = useState('');
  const toastTimer = useRef<number | undefined>(undefined);

  const triggerToast = (msg: string, type: 'success' | 'error') => setToast({ msg, type });

  useEffect(() => {
    if (!toast) return;
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(toastTimer.current);
  }, [toast]);

  const handleAddPoints = async (customerId: string) => {
    const value = window.prompt(t('addPointsPrompt'));
    if (value == null || value.trim() === '') return;
    const points = Number(value);
    if (!Number.isSafeInteger(points) || points <= 0) {
      triggerToast('Enter a positive whole number of points.', 'error');
      return;
    }
    try {
      await addPoints(customerId, points);
      triggerToast(t('toastPointsSuccess'), 'success');
    } catch (actionError) {
      triggerToast(actionError instanceof Error ? actionError.message : 'POINTS_ISSUANCE_FAILED', 'error');
    }
  };

  const handleScanSuccess = async (qrPayload: string) => {
    if (!qrPayload.startsWith('LHY2:')) {
      triggerToast(t('toastCustomerNotFound'), 'error');
      return;
    }
    if (campaigns.length === 0) {
      triggerToast('No active rewards are configured.', 'error');
      return;
    }
    const options = campaigns.map((reward, index) => `${index + 1}. ${reward.titleEn} — ${reward.pointsRequired} PTS`).join('\n');
    const choice = window.prompt(`Choose the reward to redeem:\n${options}\n\nEnter reward number:`);
    if (choice == null) return;
    const index = Number(choice) - 1;
    const reward = Number.isSafeInteger(index) ? campaigns[index] : undefined;
    if (!reward) {
      triggerToast('Invalid reward selection.', 'error');
      return;
    }
    try {
      const result = await redeemReward(qrPayload, reward.id);
      triggerToast(`Reward redeemed. ${result.pointsCost} points deducted.`, 'success');
    } catch (actionError) {
      triggerToast(actionError instanceof Error ? actionError.message : 'REDEMPTION_FAILED', 'error');
    }
  };

  const filteredCustomers = customers.filter(customer => { const q = query.trim().toLowerCase(); return !q || [customer.name, customer.email, customer.phone, customer.id].some(value => value.toLowerCase().includes(q)); });
  const totalCustomers = customers.length;
  const totalPoints = customers.reduce((sum, customer) => sum + customer.points, 0);
  const averagePoints = totalCustomers > 0 ? Math.round(totalPoints / totalCustomers) : 0;
  const chartData = customers.map(customer => ({ name: customer.name.split(' ')[0], [t('points')]: customer.points }));

  return (
    <div className="space-y-8 animate-fade-in">
      {loading && <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/30 px-4 py-3 text-sm text-indigo-700 dark:text-indigo-300">Loading persistent loyalty data…</div>}
      {error && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4">
          <span className="flex items-center gap-2"><AlertCircle size={16}/>{error}</span>
          <button onClick={() => void reload()} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 font-bold hover:bg-white/60 dark:hover:bg-gray-800"><RefreshCw size={14}/>Retry</button>
        </div>
      )}

      <StatsCards totalCustomers={totalCustomers} totalPoints={totalPoints} averagePoints={averagePoints} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('customerPointsAnalytics')}</h3>
          <div className="h-64 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey={t('points')} radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => <Cell key={'cell-' + index} fill={index % 2 === 0 ? '#4f46e5' : '#06b6d4'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <CustomerForm onSubmitCustomer={async (name, email, phone) => {
          try {
            await addNewCustomer(name, email, phone);
            triggerToast(t('addAccount'), 'success');
          } catch (actionError) {
            triggerToast(actionError instanceof Error ? actionError.message : 'CUSTOMER_CREATE_FAILED', 'error');
            throw actionError;
          }
        }} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('activeAccounts')}</h3>
            <p className="text-xs text-gray-400 mt-1">Customers and balances are now loaded from the merchant's persistent tenant data.</p>
          </div>
          <button onClick={() => setIsScannerOpen(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition cursor-pointer">
            <QrCode size={18} />
            {t('scanQRCode')}
          </button>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"><label className="relative flex-1 max-w-xl"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search customers by name, email, phone or ID" className="w-full rounded-xl border px-9 py-2.5 bg-transparent dark:border-gray-600" /></label><span className="text-xs text-gray-500">{filteredCustomers.length} of {customers.length} customers</span></div>\n        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-750 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">{t('tableClient')}</th>
                <th className="px-6 py-3">{t('tablePhone')}</th>
                <th className="px-6 py-3">{t('points')}</th>
                <th className="px-6 py-3 text-center">{t('tableActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition">
                  <td className="px-6 py-4 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">{customer.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{customer.email || '---'}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">{customer.phone || '---'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      {customer.points} PTS
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => void handleAddPoints(customer.id)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition cursor-pointer"
                        title="Issue points"
                      >
                        <PlusCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredCustomers.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">{query ? 'No customers match your search.' : 'No active customers yet.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BusinessSettings />

      <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleScanSuccess} />

      {toast && (
        <div className={'fixed bottom-5 right-5 z-50 px-6 py-3 rounded-xl shadow-xl text-white font-bold text-sm transition-all duration-500 animate-bounce ' + (toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600')}>
          {toast.msg}
        </div>
      )}

      <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
        Point issuance and redemption are server-authoritative. Each redemption consumes a short-lived single-use QR token and creates an immutable transaction.
      </div>
    </div>
  );
};
