import { useContext } from 'react';
import { LoyaltyContext } from './LoyaltyContext';

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) throw new Error('useLoyalty must be used within a LoyaltyProvider');
  return context;
};
