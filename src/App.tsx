import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MerchantDashboard } from './components/MerchantDashboard';
import { CustomerPortal } from './components/CustomerPortal';

function App() {
  const [view, setView] = useState<'merchant' | 'customer'>('merchant');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Navbar currentView={view} onViewChange={setView} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'merchant' ? (
          <MerchantDashboard />
        ) : (
          <CustomerPortal />
        )}
      </main>
    </div>
  );
}

export default App;
