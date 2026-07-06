import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
}

export interface Campaign {
  id: string;
  titleEn: string;
  titleAr: string;
  titleFr: string;
  pointsRequired: number;
}

interface LoyaltyContextType {
  /** Reactive managed lists of tracked corporate loyalty customers */
  customers: Customer[];
  /** Pre-configured marketing reward campaigns available */
  campaigns: Campaign[];
  /** Updates individual user account structures with additional loyalty metric balances */
  addPoints: (customerId: string, points: number) => void;
  /** Deducts loyalty point totals following successful incentive validation transactions */
  redeemReward: (customerId: string, pointsRequired: number) => boolean;
  /** Registers a new customer schema profile and appends it to local tracking arrays */
  addNewCustomer: (name: string, email: string, phone: string) => void;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

/**
 * Core Business Logic Provider managing active state calculations, 
 * transactions bookkeeping, mock profiles setup, and persistence workflows.
 */
export const LoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('lh_customers');
    return saved ? JSON.parse(saved) : [
      { id: 'CUST-9821', name: 'Anis Belkacem', email: 'anis@email.com', phone: '0555123456', points: 120 },
      { id: 'CUST-4310', name: 'Sarah Mansouri', email: 'sarah@email.com', phone: '0666987654', points: 45 },
      { id: 'CUST-7712', name: 'Merouane Sifi', email: 'merouane@email.com', phone: '0777112233', points: 210 },
    ];
  });

  const [campaigns] = useState<Campaign[]>([
    { id: 'CAMP-1', titleEn: 'Free Coffee', titleAr: 'قهوة مجانية', titleFr: 'Café Gratuit', pointsRequired: 50 },
    { id: 'CAMP-2', titleEn: 'Free Breakfast Meal', titleAr: 'وجبة فطور مجانية', titleFr: 'Petit Déjeuner Gratuit', pointsRequired: 150 },
    { id: 'CAMP-3', titleEn: '50% Discount Voucher', titleAr: 'قسيمة تخفيض 50%', titleFr: 'Bon de Réduction 50%', pointsRequired: 100 },
  ]);

  useEffect(() => {
    localStorage.setItem('lh_customers', JSON.stringify(customers));
  }, [customers]);

  const addPoints = (customerId: string, points: number) => {
    setCustomers(prev => prev.map(cust => 
      cust.id === customerId ? { ...cust, points: cust.points + points } : cust
    ));
  };

  const redeemReward = (customerId: string, pointsRequired: number): boolean => {
    let success = false;
    setCustomers(prev => prev.map(cust => {
      if (cust.id === customerId && cust.points >= pointsRequired) {
        success = true;
        return { ...cust, points: cust.points - pointsRequired };
      }
      return cust;
    }));
    return success;
  };

  const addNewCustomer = (name: string, email: string, phone: string) => {
    const newCust: Customer = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email,
      phone,
      points: 0
    };
    setCustomers(prev => [newCust, ...prev]);
  };

  return (
    <LoyaltyContext.Provider value={{ customers, campaigns, addPoints, redeemReward, addNewCustomer }}>
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) throw new Error('useLoyalty must be used within a LoyaltyProvider');
  return context;
};