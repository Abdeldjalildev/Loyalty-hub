import React, { useState, useEffect } from 'react';
import { LoyaltyContext, type Campaign, type Customer } from './LoyaltyContext';

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
      id: `CUST-${crypto.randomUUID()}`,
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
