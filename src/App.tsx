import { MerchantDashboard } from './components/MerchantDashboard';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { useAuth } from './context/useAuth';

function App() {
  const { session, merchant, loading, signOut } = useAuth();

  if (loading && !session) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">Loading…</div>;
  if (!session || !merchant) return <AuthScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Navbar onSignOut={signOut} merchantName={merchant.merchant.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><MerchantDashboard /></main>
    </div>
  );
}
export default App;
