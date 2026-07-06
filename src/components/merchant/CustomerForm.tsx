import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CustomerFormProps {
  onSubmitCustomer: (name: string, email: string, phone: string) => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmitCustomer }) => {
  const { t } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    onSubmitCustomer(name, email, phone);
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <UserPlus size={18} className="text-indigo-600" />
        {t('registerNewCustomer')}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{t('fullName')}</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{t('phoneNumber')}</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{t('emailOptional')}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition shadow-md shadow-indigo-200 dark:shadow-none text-sm">
          {t('addAccount')}
        </button>
      </form>
    </div>
  );
};