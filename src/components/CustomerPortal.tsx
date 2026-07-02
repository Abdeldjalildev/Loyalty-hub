import React, { useState } from 'react';
import { useLoyalty } from '../context/LoyaltyContext';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { Search, QrCode, Gift, CheckCircle, XCircle } from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const { customers, campaigns } = useLoyalty();
  const { t, lang } = useApp();
  
  // اختيار حساب زبون معين لمحاكاة واجهته
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');

  const currentCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* محاكي اختيار الزبون (لغرض التجربة والعرض فقط) */}
      <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          ⚙️ {lang === 'ar' ? 'محاكي بوابة الزبون (اختر زبوناً لترى واجهته):' : lang === 'fr' ? 'Simulateur Client (Choisir un client) :' : 'Customer View Simulator (Select a client):'}
        </div>
        <select 
          value={selectedCustomerId} 
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="bg-white dark:bg-gray-800 text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none cursor-pointer"
        >
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
          ))}
        </select>
      </div>

      {currentCustomer ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* 1. بطاقة الولاء الرقمية والـ QR Code */}
          <div className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 flex flex-col items-center text-center">
            <div className="w-full bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-xl text-white text-right rtl:text-left relative overflow-hidden mb-6 shadow-md">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <h4 className="text-lg font-bold tracking-wide">LoyaltyHub Pass</h4>
              <p className="text-xs text-indigo-200 mt-1">ID: {currentCustomer.id}</p>
              
              <div className="mt-8">
                <p className="text-xs text-indigo-100 opacity-80">{lang === 'ar' ? 'حامل البطاقة' : lang === 'fr' ? 'Titulaire' : 'Card Holder'}</p>
                <h3 className="text-xl font-bold truncate mt-0.5">{currentCustomer.name}</h3>
              </div>
            </div>

            {/* توليد الـ QR Code الديناميكي */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-inner inline-block my-2">
              <QRCodeSVG 
                value={currentCustomer.id} 
                size={160}
                level={"H"}
                includeMargin={false}
              />
            </div>
            
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
              <QrCode size={14} />
              {lang === 'ar' ? 'إظهار هذا الكود للكاشير عند الشراء' : lang === 'fr' ? 'Présentez ce code au scanner' : 'Show this code at the counter to scan'}
            </p>

            <div className="w-full border-t border-gray-100 dark:border-gray-750 my-5"></div>

            {/* رصيد النقاط الحالي */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{lang === 'ar' ? 'رصيد نقاطك الحالي' : lang === 'fr' ? 'Votre Solde de Points' : 'Your Current Points Balance'}</p>
              <h2 className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{currentCustomer.points} <span className="text-lg font-bold text-gray-500">PTS</span></h2>
            </div>
          </div>
          {/* 2. قائمة المكافآت المتوفرة وحالة استحقاقها */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Gift size={20} className="text-purple-500" />
              {lang === 'ar' ? 'المكافآت المتاحة والمستهدفة' : lang === 'fr' ? 'Catalogue des Récompenses' : 'Available Rewards Catalog'}
            </h3>

            <div className="space-y-4">
              {campaigns.map(camp => {
                const isEligible = currentCustomer.points >= camp.pointsRequired;
                const progressPercentage = Math.min((currentCustomer.points / camp.pointsRequired) * 100, 100);

                return (
                  <div key={camp.id} className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isEligible ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10' : 'border-gray-150 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-750/10'}`}>
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

                      {/* شريط التقدم للوصول للمكافأة */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isEligible ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${progressPercentage}%`}}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{Math.round(progressPercentage)}%</span>
                        <span>{currentCustomer.points} / {camp.pointsRequired} PTS</span>
                      </div>
                    </div>

                    <div className="sm:text-center shrink-0">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${isEligible ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
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
        <div className="text-center py-12 text-gray-400">
          No customers registered yet. Go to the merchant dashboard to add some.
        </div>
      )}
    </div>
  );
};