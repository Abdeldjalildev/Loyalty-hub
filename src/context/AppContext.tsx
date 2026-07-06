import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar' | 'fr';
export type Theme = 'light' | 'dark';
export type Direction = 'ltr' | 'rtl';

export interface AppContextType {
  /** The current active UI theme mode (light or dark) */
  theme: Theme;
  /** Toggles the application theme between light and dark modes */
  toggleTheme: () => void;
  /** The current active global language locale ('en', 'ar', 'fr') */
  lang: Language;
  /** Updates the application's global language locale */
  setLang: (lang: Language) => void;
  /** Translation function that retrieves localized strings by predefined keys */
  t: (key: string) => string;
  /** Layout direction based on the current active language ('rtl' or 'ltr') */
  dir: Direction;
}

// Global Core Dictionary Translation Matrix
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
    // Existing keys...
    navBrand: "LoyaltyHub",
    merchantTooltip: "Switch to Merchant View",
    customerTooltip: "Switch to Customer View",
    langFr: "Français",
    totalCustomers: "Total Customers",
    pointsInCirculation: "Points in Circulation",
    averagePointsClient: "Average Points / Client",
    customerPointsAnalytics: "Customer Points Analytics",
    registerNewCustomer: "Register New Customer",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    emailOptional: "Email (Optional)",
    addAccount: "Add Account",
    activeAccounts: "Active Accounts",
    scanQRCode: "Scan QR Code",
    tableClient: "Client",
    tablePhone: "Phone",
    tableActions: "Actions",
    quickActionsPlaceholder: "Redeem...",
    recentActivity: "Recent Activity",
    received: "received",
    redeemed: "redeemed",
    addPointsPrompt: "Enter points to add:",
    toastSuccessRedeem: "Reward redeemed successfully!",
    toastCustomerFound: "Customer found: ",
    toastCustomerNotFound: "Customer not found!",
    toastPointsSuccess: "Points successfully added!",
    customerSimulator: "Customer View Simulator (Select a client):",
    cardHolder: "Card Holder",
    scanInstruction: "Show this code at the counter to scan",
    currentPointsBalance: "Your Current Points Balance",
    rewardsCatalog: "Available Rewards Catalog",
    noCustomers: "No customers registered yet. Go to the merchant dashboard to add some.",
    scanTitle: "Scan Customer QR Code",
    scanCameraInstruction: "Place the QR code in front of the camera"
  
  
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
    // Existing keys...
    navBrand: "لوحة الولاء",
    merchantTooltip: "التبديل إلى عرض التاجر",
    customerTooltip: "التبديل إلى عرض الزبون",
    langFr: "Français",
    totalCustomers: "إجمالي الزبائن",
    pointsInCirculation: "النقاط المتداولة",
    averagePointsClient: "معدل نقاط الزبون",
    customerPointsAnalytics: "تحليل نقاط الزبائن",
    registerNewCustomer: "تسجيل زبون جديد",
    fullName: "الاسم الكامل",
    phoneNumber: "رقم الهاتف",
    emailOptional: "البريد الإلكتروني (اختياري)",
    addAccount: "إضافة الحساب",
    activeAccounts: "قائمة الحسابات النشطة",
    scanQRCode: "مسح كود سريع",
    tableClient: "الزبون",
    tablePhone: "الهاتف",
    tableActions: "العمليات السريعة",
    quickActionsPlaceholder: "استبدال مكافأة...",
    recentActivity: "أحدث العمليات (اليوم)",
    received: "شحن",
    redeemed: "استبدل",
    addPointsPrompt: "أدخل عدد النقاط لإضافتها:",
    toastSuccessRedeem: "تم استبدال المكافأة بنجاح!",
    toastCustomerFound: "تم العثور على الزبون: ",
    toastCustomerNotFound: "عذراً، هذا الحساب غير مسجل لدينا!",
    toastPointsSuccess: "تم شحن النقاط بنجاح!",
    customerSimulator: "محاكي بوابة الزبون (اختر زبوناً لترى واجهته):",
    cardHolder: "حامل البطاقة",
    scanInstruction: "إظهار هذا الكود للكاشير عند الشراء",
    currentPointsBalance: "رصيد نقاطك الحالي",
    rewardsCatalog: "المكافآت المتاحة والمستهدفة",
    noCustomers: "لا يوجد زبائن مسجلون حالياً. توجه إلى لوحة تحكم التاجر لإضافة حسابات.",
    scanTitle: "مسح رمز QR للزبون",
    scanCameraInstruction: "ضع كود الزبون أمام الكاميرا ليتم التعرف عليه تلقائياً"
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
    navBrand: "LoyaltyHub",
    merchantTooltip: "Passer à la vue commerçant",
    customerTooltip: "Passer à la vue client",
    langFr: "Français",
    totalCustomers: "Total Clients",
    pointsInCirculation: "Points en Circulation",
    averagePointsClient: "Moyenne des Points",
    customerPointsAnalytics: "Analyse des Points",
    registerNewCustomer: "Nouveau Client",
    fullName: "Nom Complet",
    phoneNumber: "Numéro de Téléphone",
    emailOptional: "Email (Optionnel)",
    addAccount: "Ajouter le Compte",
    activeAccounts: "Liste des Comptes Actifs",
    scanQRCode: "Scan QR Code",
    tableClient: "Client",
    tablePhone: "Téléphone",
    tableActions: "Actions",
    quickActionsPlaceholder: "Échanger...",
    recentActivity: "Activité Récente",
    received: "a reçu",
    redeemed: "a échangé",
    addPointsPrompt: "Points à ajouter :",
    toastSuccessRedeem: "Récompense échangée avec succès !",
    toastCustomerFound: "Client trouvé: ",
    toastCustomerNotFound: "Client introuvable !",
    toastPointsSuccess: "Points ajoutés avec succès !",
    customerSimulator: "Simulateur Client (Choisir un client) :",
    cardHolder: "Titulaire",
    scanInstruction: "Présentez ce code au scanner",
    currentPointsBalance: "Votre Solde de Points",
    rewardsCatalog: "Catalogue des Récompenses",
    noCustomers: "Aucun client enregistré pour le moment. Allez sur le tableau de bord du commerçant.",
    scanTitle: "Scanner le Code QR",
    scanCameraInstruction: "Placez le code QR devant la caméra"
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Global App Core Provider handles localized dictionary lookups, HTML document
 * language attributes, layout directions, and local storage state persistence for Theme/Lang.
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => 
    (localStorage.getItem('theme') as Theme) || 'light'
  );
  const [lang, setLang] = useState<Language>(() => 
    (localStorage.getItem('lang') as Language) || 'en'
  );

  // Syncs and persists HTML root element dark classes dynamically
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr';

  // Synchronizes global HTML node parameters for multi-language presentation
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }, [lang, dir]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
 
  const t = (key: string): string => {
    return translations[lang][key] || translations['en'][key] || key;
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