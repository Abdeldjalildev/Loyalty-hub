import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LoyaltyCardProps {
  customerId: string;
  customerName: string;
  points: number;
}

export const LoyaltyCard: React.FC<LoyaltyCardProps> = ({ customerId, customerName, points }) => {
  const { t } = useApp();

  return (
    <div className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 flex flex-col items-center text-center">
      {/* Pass Layout */}
      <div className="w-full bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-xl text-white text-left rtl:text-right relative overflow-hidden mb-6 shadow-md">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <h4 className="text-lg font-bold tracking-wide">LoyaltyHub Pass</h4>
        <p className="text-xs text-indigo-200 mt-1">ID: {customerId}</p>
        
        <div className="mt-8">
          <p className="text-xs text-indigo-100 opacity-80">{t('cardHolder')}</p>
          <h3 className="text-xl font-bold truncate mt-0.5">{customerName}</h3>
        </div>
      </div>

      {/* QR Code Dynamic Generator */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-inner inline-block my-2">
        <QRCodeSVG value={customerId} size={160} level="H" includeMargin={false} />
      </div>
      
      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1 justify-center">
        <QrCode size={14} />
        {t('scanInstruction')}
      </p>

      <div className="w-full border-t border-gray-100 dark:border-gray-750 my-5"></div>

      {/* Point Balance */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('currentPointsBalance')}</p>
        <h2 className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
          {points} <span className="text-lg font-bold text-gray-500">PTS</span>
        </h2>
      </div>
    </div>
  );
};