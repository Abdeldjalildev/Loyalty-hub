import { createContext } from 'react';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  status: 'active' | 'archived';
}

export interface Reward {
  id: string;
  titleEn: string;
  titleAr: string;
  titleFr: string;
  pointsRequired: number;
  status: 'active' | 'archived';
}

export type Campaign = Reward;

export interface LoyaltyProgram {
  id: string;
  name: string;
  pointsPerUnit: number;
  status: 'active' | 'archived';
}

export interface LoyaltyContextType {
  customers: Customer[];
  campaigns: Campaign[];
  program: LoyaltyProgram | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addPoints: (customerId: string, points: number) => Promise<{ balanceAfter: number }>;
  addNewCustomer: (name: string, email: string, phone: string) => Promise<Customer>;
  updateCustomer: (customerId: string, name: string, email: string, phone: string) => Promise<Customer>;
  archiveCustomer: (customerId: string) => Promise<void>;
  createReward: (reward: Omit<Reward, 'id' | 'status'>) => Promise<Reward>;
  updateReward: (rewardId: string, reward: Omit<Reward, 'id' | 'status'>) => Promise<Reward>;
}

export const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);
