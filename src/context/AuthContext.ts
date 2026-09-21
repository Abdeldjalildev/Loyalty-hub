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
    description?: string;
    phone?: string;
    websiteUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    whatsappUrl?: string;
    logoUrl?: string;
    branding?: { primaryColor: string; secondaryColor: string; theme: "light" | "dark" };
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
  refreshMerchant: () => Promise<void>;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
