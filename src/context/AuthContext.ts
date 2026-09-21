import { createContext } from 'react';
import type { AuthSession } from '../firebase/auth';

export interface MerchantContext {
  merchantId: string;
  role: 'owner';
  status: 'active';
  merchant: {
    merchantId: string;
    name: string;
    ownerUid: string;
    ownerEmail: string | null;
    status: string;
  };
}
export interface AuthContextType {
  session: AuthSession | null;
  merchant: MerchantContext | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => void;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
