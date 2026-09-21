import { createContext } from 'react';
import type { AuthSession } from '../firebase/auth';

export interface CustomerContext {
  merchantId: string;
  customerId: string;
  customer: { id?: string; name: string; email: string; phone: string; points: number; status: string };
}
export interface CustomerAuthContextType {
  session: AuthSession | null;
  customer: CustomerContext | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, merchantId: string) => Promise<void>;
  signOut: () => void;
}
export const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);