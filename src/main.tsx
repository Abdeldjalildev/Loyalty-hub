import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AppProvider } from './context/AppProvider.tsx';
import { LoyaltyProvider } from './context/LoyaltyProvider.tsx';
import { AuthProvider } from './context/AuthProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <AuthProvider>
        <LoyaltyProvider><App /></LoyaltyProvider>
      </AuthProvider>
    </AppProvider>
  </StrictMode>,
);
