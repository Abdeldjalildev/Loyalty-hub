import { MerchantDashboard } from './components/MerchantDashboard';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { CustomerAuthScreen } from './components/CustomerAuthScreen';
import { CustomerPortalApp } from './components/CustomerPortalApp';
import { useAuth } from './context/useAuth';
import { useCustomerAuth } from './context/useCustomerAuth';

function MerchantApp() {
  const { session, merchant, loading, signOut } = useAuth();
  if (loading && !session) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">Loading…</div>;
  if (!session || !merchant) return <AuthScreen />;
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"><Navbar onSignOut={signOut} merchantName={merchant.merchant.name} /><main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><MerchantDashboard /></main></div>;
}
function CustomerApp() {
  const { session, customer, loading } = useCustomerAuth();
  if (loading && !session) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">Loading…</div>;
  if (!session || !customer) return <CustomerAuthScreen />;
  return <CustomerPortalApp />;
}
function App() { return window.location.pathname.startsWith('/customer') ? <CustomerApp /> : <MerchantApp />; }
export default App;