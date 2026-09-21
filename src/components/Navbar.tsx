import React from 'react';
import { useApp } from '../context/useApp';
import { Sun, Moon, Globe, ShieldCheck, LogOut } from 'lucide-react';

interface NavbarProps { onSignOut: () => void; merchantName: string; }

export const Navbar: React.FC<NavbarProps> = ({ onSignOut, merchantName }) => {
  const { theme, toggleTheme, lang, setLang, t } = useApp();
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-750 shadow-sm transition-colors duration-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between h-16 gap-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
          <div className="bg-indigo-600 p-2 rounded-lg text-white"><span className="font-bold text-xl tracking-wider">LH</span></div>
          <div className="min-w-0"><span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:block">{t('navBrand')}</span><span className="text-xs text-gray-500 dark:text-gray-400 truncate block">{merchantName}</span></div>
        </div>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="relative flex items-center space-x-1 rtl:space-x-reverse text-gray-600 dark:text-gray-300"><Globe size={18} />
            <select value={lang} onChange={(e) => setLang(e.target.value as typeof lang)} className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-gray-700 dark:text-gray-200">
              <option value="en">{t('langEn')}</option><option value="ar">{t('langAr')}</option><option value="fr">{t('langFr')}</option>
            </select>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" title={t('toggleTheme')}>
            {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
          </button>
          <button onClick={onSignOut} className="flex items-center gap-2 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" title="Sign out">
            <LogOut size={18} /><span className="hidden sm:inline text-sm">Sign out</span>
          </button>
        </div>
      </div></div>
    </nav>
  );
};
