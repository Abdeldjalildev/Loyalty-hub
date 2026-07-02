import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. تعريف اللغات والاتجاهات
type Language = 'en' | 'ar' | 'fr';
type Theme = 'light' | 'dark';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  
}

// 2. قاموس الترجمات الأساسية للمشروع (الإنجليزية هي الرئيسية)
const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: "Merchant Dashboard",
    customerPortal: "Customer Portal",
    welcome: "Welcome back",
    points: "Points",
    rewards: "Rewards",
    scanQR: "Scan QR Code",
    settings: "Settings",
    toggleTheme: "Toggle Theme",
    navHome: "Home",
    langAr: "العربية",
    langEn: "English",
    langFr: "Français"
  },
  ar: {
    dashboard: "لوحة تحكم التاجر",
    customerPortal: "بوابة الزبون",
    welcome: "مرحباً بك مجدداً",
    points: "النقاط",
    rewards: "المكافآت",
    scanQR: "مسح رمز QR",
    settings: "الإعدادات",
    toggleTheme: "تغيير الوضع",
    navHome: "الرئيسية",
    langAr: "العربية",
    langEn: "English",
    langFr: "Français"
  },
  fr: {
    dashboard: "Tableau de Bord Commerçant",
    customerPortal: "Portail Client",
    welcome: "Bienvenue",
    points: "Points",
    rewards: "Récompenses",
    scanQR: "Scanner le code QR",
    settings: "Paramètres",
    toggleTheme: "Changer le mode",
    navHome: "Accueil",
    langAr: "العربية",
    langEn: "English",
    langFr: "Français"
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => 
    (localStorage.getItem('theme') as Theme) || 'light'
  );
  const [lang, setLang] = useState<Language>(() => 
    (localStorage.getItem('lang') as Language) || 'en'
  );

  // إدارة الوضع الداكن بإضافة/حذف كلاس dark من عنصر html
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // إدارة اتجاهات الصفحة حسب اللغة
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }, [lang, dir]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
 
  
  // دالة الترجمة الفورية
  const t = (key: string) => {
    return translations[lang][key]|| translations['en'][key] || key;
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, setLang, t, dir }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};