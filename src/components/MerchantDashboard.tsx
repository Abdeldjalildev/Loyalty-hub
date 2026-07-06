import React, { useState, useEffect } from 'react';
import { useLoyalty } from '../context/LoyaltyContext';
import { useApp } from '../context/AppContext';
import { PlusCircle, QrCode } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { QrScannerModal } from './QrScannerModal';
import { StatsCards } from './merchant/StatsCards';
import { CustomerForm } from './merchant/CustomerForm';

/**
 * Merchant Dashboard component. Acts as a core control hub providing real-time data visual analytics,
 * account registration managers, customer transaction bookkeeping tables, and rapid QR validation capabilities.
 */
export const MerchantDashboard: React.FC = () => {
  const { customers, campaigns, addPoints, redeemReward, addNewCustomer } = useLoyalty();
  const { t, lang } = useApp();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    customerName: string;
    type: 'add' | 'redeem';
    amountOrReward: string;
    date: string;
  }>>([]);

  const triggerToast = (msgKey: string, customPayload?: string, type: 'success' | 'error' = 'success') => {
    const baseMsg = t(msgKey);
    setToast({ msg: customPayload ? `${baseMsg}${customPayload}` : baseMsg, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const addTransaction = (customerName: string, type: 'add' | 'redeem', amountOrReward: string) => {
    const newTx = {
      id:` TX-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      type,
      amountOrReward,
      date: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    setTransactions(prev => [newTx, ...prev].slice(0, 5));
  };

  const handleScanSuccess = (customerId: string) => {
    const found = customers.find(c => c.id === customerId);
    if (found) {
      triggerToast('toastCustomerFound', found.name, 'success');
    } else {
      triggerToast('toastCustomerNotFound', undefined, 'error');
    }
  };

  const totalCustomers = customers.length;
  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
  const averagePoints = totalCustomers > 0 ? Math.round(totalPoints / totalCustomers) : 0;

  const chartData = customers.map(c => ({
    name: c.name.split(' ')[0],
    [t('points')]: c.points
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. RENDER ISOLATED ANALYTICS STATS OVERVIEWS */}
      <StatsCards 
        totalCustomers={totalCustomers} 
        totalPoints={totalPoints} 
        averagePoints={averagePoints} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. RECHARTS POINTS ANALYTICS VISUALIZATION */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {t('customerPointsAnalytics')}
          </h3>
          <div className="h-64 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey={t('points')} radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#06b6d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
[06/07/2026 10:34] Khalfa Abd Eldjalil: {/* 3. ISOLATED SUB-COMPONENT CUSTOMER SIGNUP REGISTRATION FORM */}
        <CustomerForm onSubmitCustomer={addNewCustomer} />
      </div>

      {/* 4. ACTIVE ACCOUNTS DATA MANAGEMENT TABLE ROW */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('activeAccounts')}
          </h3>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition cursor-pointer"
          >
            <QrCode size={18} />
            {t('scanQRCode')}
          </button>
        </div>

        <div className="overflow-x-auto">
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
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition">
                  <td className="px-6 py-4 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">{customer.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{customer.email || '---'}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">{customer.phone}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      {customer.points} PTS
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          const pts = prompt(t('addPointsPrompt'));
                          if (pts && !isNaN(Number(pts))) {
                            addPoints(customer.id, Number(pts));
                            addTransaction(customer.name, 'add', `${pts} PTS`);
                            triggerToast('toastPointsSuccess', undefined, 'success');
                          }
                        }}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition cursor-pointer"
                      >
                        <PlusCircle size={18} />
                      </button>
                      
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            const campaign = campaigns.find(camp => camp.id === e.target.value);
                            redeemReward(customer.id, Number(e.target.value));
                            if (campaign) {
                              const rewardName = lang === 'ar' ? campaign.titleAr : lang === 'fr' ? campaign.titleFr : campaign.titleEn;
                              addTransaction(customer.name, 'redeem', rewardName);
                            }
                            e.target.value = '';
                            triggerToast('toastSuccessRedeem', undefined, 'success');
                          }
                        }}
                        className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-1 text-gray-700 dark:text-gray-200"
                      >
                        <option value="">{t('quickActionsPlaceholder')}</option>
                        {campaigns.map((camp) => (
                          <option 
                            key={camp.id} 
                            value={camp.id} 
                            disabled={customer.points < camp.pointsRequired}
                          >
                            {lang === 'ar' ? camp.titleAr : lang === 'fr' ? camp.titleFr : camp.titleEn} ({camp.pointsRequired} PTS)
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. HISTORIC TRANSACTION LOG ACTIVITY OVERLAY */}
      {transactions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {t('recentActivity')}
          </h3>
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-750/50 border border-gray-100 dark:border-gray-700 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${tx.type === 'add' ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">{tx.customerName}</span>
                    <span className="text-gray-500 dark:text-gray-400 mx-1.5">
                      {tx.type === 'add' ? t('received') : t('redeemed')}
                    </span>
                    <span className={`font-medium ${tx.type === 'add' ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`}>
                      {tx.amountOrReward}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs text-gray-400">
                  <span>{tx.id}</span>
                  <span>{tx.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <QrScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanSuccess={handleScanSuccess} 
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-6 py-3 rounded-xl shadow-xl text-white font-bold text-sm transition-all duration-500 transform translate-y-0 animate-bounce ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};
        