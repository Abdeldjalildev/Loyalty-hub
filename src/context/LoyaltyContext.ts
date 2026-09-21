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

export interface LoyaltyTransaction {
  id: string;
  transactionId: string;
  customerId: string;
  type: 'earn' | 'redeem';
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  rewardId?: string;
  redemptionId?: string;
  createdAt?: unknown;
}

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
  createQrToken: (customerId: string) => Promise<{ qrPayload: string; expiresAt: number; ttlSeconds: number }>;
  redeemReward: (qrPayload: string, rewardId: string) => Promise<{ redemptionId: string; balanceAfter: number; pointsCost: number }>;
  transactions: LoyaltyTransaction[];

}

export const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);
