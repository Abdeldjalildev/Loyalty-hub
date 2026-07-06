import React, { useState } from 'react';
import { useLoyalty } from '../context/LoyaltyContext';
import { useApp } from '../context/AppContext';
import { Gift, CheckCircle, XCircle } from 'lucide-react';
import { CustomerSimulator } from './customer/CustomerSimulator';
import { LoyaltyCard } from './customer/LoyaltyCard';

/**
 * Customer Portal Component.
 * Simulates the client-facing ecosystem, loyalty point balances, and visual tracker progress benchmarks.
 */
export const CustomerPortal: React.FC = () => {
  const { customers, campaigns } = useLoyalty();
  const { t, lang } = useApp();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const currentCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. CUSTOMER PORTAL INTERACTIVE SIMULATOR WRAPPER */}
      {customers.length > 0 && (
        <CustomerSimulator 
          customers={customers} 
          selectedId={selectedCustomerId} 
          onSelectChange={setSelectedCustomerId} 
        />
      )}

      {currentCustomer ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* 2. DIGITAL PASS AND QR CODE COMPONENT */}
          <LoyaltyCard 
            customerId={currentCustomer.id} 
            customerName={currentCustomer.name} 
            points={currentCustomer.points} 
          />
          
          {/* 3. REWARDS CATALOG & ELIGIBILITY SYSTEM */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Gift size={20} className="text-purple-500" />
              {t('rewardsCatalog')}
            </h3>

            <div className="space-y-4">
              {campaigns.map(camp => {
                const isEligible = currentCustomer.points >= camp.pointsRequired;
                const progressPercentage = Math.min((currentCustomer.points / camp.pointsRequired) * 100, 100);

                return (
                  <div 
                    key={camp.id} 
                    className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isEligible 
                        ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10' 
                        : 'border-gray-150 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-750/10'
                    }`}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {isEligible ? (
                          <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle size={18} className="text-gray-400 shrink-0" />
                        )}
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {lang === 'ar' ? camp.titleAr : lang === 'fr' ? camp.titleFr : camp.titleEn}
                        </h4>
                      </div>

                      {/* Progress bar towards reward target */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isEligible ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${progressPercentage}% ` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-400 font-mono">
                        <span>{Math.round(progressPercentage)}%</span>
                        <span>{currentCustomer.points} / {camp.pointsRequired} PTS</span>
                      </div>
                    </div>

                    <div className="sm:text-center shrink-0">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${
                        isEligible ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        {camp.pointsRequired} PTS
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700">
          {t('noCustomers')}
        </div>
      )}
    </div>
  );
};