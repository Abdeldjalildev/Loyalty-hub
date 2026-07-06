import React from 'react';
import { useApp } from '../../context/AppContext';

interface CustomerSimulatorProps {
  customers: Array<{ id: string; name: string }>;
  selectedId: string;
  onSelectChange: (id: string) => void;
}

export const CustomerSimulator: React.FC<CustomerSimulatorProps> = ({ customers, selectedId, onSelectChange }) => {
  const { t } = useApp();

  return (
    <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        ⚙️ {t('customerSimulator')}
      </div>
      <select 
        value={selectedId} 
        onChange={(e) => onSelectChange(e.target.value)}
        className="bg-white dark:bg-gray-800 text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none cursor-pointer text-gray-900 dark:text-white"
      >
        {customers.map(c => (
          <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
        ))}
      </select>
    </div>
  );
};