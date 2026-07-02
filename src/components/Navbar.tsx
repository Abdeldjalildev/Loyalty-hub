import React from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Globe, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  currentView: 'merchant' | 'customer';
  onViewChange: (view: 'merchant' | 'customer') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
 const { theme, toggleTheme, lang, setLang, t } = useApp();

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-750 shadow-sm transition-colors duration-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* الشعار وعنوان المنصة */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <span className="font-bold text-xl tracking-wider">LH</span>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:block">
              LoyaltyHub
            </span>
          </div>

          {/* أزرار التبديل بين لوحة التاجر وبوابة الزبون */}
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => onViewChange('merchant')}
              className={`flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentView === 'merchant'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              <ShieldCheck size={16} />
              <span className="hidden md:inline">{t('dashboard')}</span>
            </button>
            <button
              onClick={() => onViewChange('customer')}
              className={`flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentView === 'customer'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              <User size={16} />
              <span className="hidden md:inline">{t('customerPortal')}</span>
            </button>
          </div>

          {/* أدوات التحكم: اللغة والوضع الداكن */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            
            {/* قائمة تبديل اللغات */}
            <div className="relative flex items-center space-x-1 rtl:space-x-reverse text-gray-600 dark:text-gray-300">
              <Globe size={18} />
              <select
                value={lang}
               onChange={(e) => setLang(e.target.value as any)}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-gray-700 dark:text-gray-200"
              >
                <option value="en" className="dark:bg-gray-800">{t('langEn')}</option>
                <option value="ar" className="dark:bg-gray-800">{t('langAr')}</option>
                <option value="fr" className="dark:bg-gray-800">{t('langFr')}</option>
              </select>
            </div>

            {/* زر تبديل الوضع الداكن/المضيء */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={t('toggleTheme')}
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>

          </div>

        </div>
      </div>
    </nav>
  );
};