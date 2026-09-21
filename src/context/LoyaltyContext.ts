import { createContext } from 'react';

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

export interface LoyaltyContextType {
  customers: Customer[];
  campaigns: Campaign[];
  addPoints: (customerId: string, points: number) => void;
  redeemReward: (customerId: string, pointsRequired: number) => boolean;
  addNewCustomer: (name: string, email: string, phone: string) => void;
}

export const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);
