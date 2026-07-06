import React from 'react';
import { Users, Award, BarChart3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface StatsCardsProps {
  totalCustomers: number;
  totalPoints: number;
  averagePoints: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ totalCustomers, totalPoints, averagePoints }) => {
  const { t } = useApp();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('totalCustomers')}</p>
          <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{totalCustomers}</h3>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-xl text-blue-600 dark:text-blue-400">
          <Users size={24} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('pointsInCirculation')}</p>
          <h3 className="text-3xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">{totalPoints}</h3>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-950/50 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
          <Award size={24} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('averagePointsClient')}</p>
          <h3 className="text-3xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{averagePoints}</h3>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-xl text-emerald-600 dark:text-emerald-400">
          <BarChart3 size={24} />
        </div>
      </div>
    </div>
  );
};