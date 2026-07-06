import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AppProvider } from './context/AppContext.tsx';
import { LoyaltyProvider } from './context/LoyaltyContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <LoyaltyProvider>
        <App />
      </LoyaltyProvider>
    </AppProvider>
  </StrictMode>,
);