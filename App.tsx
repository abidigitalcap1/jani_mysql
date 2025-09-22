
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import NewOrder from './components/NewOrder';
import CustomerHistory from './components/CustomerHistory';
import Expenses from './components/Expenses';
import Income from './components/Income';
import SupplyParties from './components/SupplyParties';
import { Page } from './types';

// Placeholder components for other pages
const Placeholder = ({ pageName }: { pageName: string }) => (
  <div className="p-8">
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-slate-700">{pageName}</h1>
      <p className="mt-4 text-slate-500">This is a placeholder for the {pageName} page. Functionality will be built out here.</p>
    </div>
  </div>
);

const App: React.FC = () => {
  // Session is now just a boolean indicating if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [activePage, setActivePage] = useState<Page>('DASHBOARD');

  useEffect(() => {
    // Check session with our backend on initial load
    const checkSession = async () => {
      try {
        const response = await fetch('/api.php?action=getSession');
        const data = await response.json();
        if (response.ok && data.session) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Failed to check session:", error);
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setActivePage('DASHBOARD');
  };

  const handleLogout = async () => {
    await fetch('/api.php?action=logout');
    setIsLoggedIn(false);
    setActivePage('DASHBOARD');
  };
  
  const handleNavigation = (page: Page) => {
    setActivePage(page);
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'DASHBOARD':
        return <Dashboard />;
      case 'NEW_ORDER':
        return <NewOrder />;
      case 'CUSTOMER_HISTORY':
        return <CustomerHistory />;
      case 'EXPENSES':
        return <Expenses />;
      case 'INCOME':
        return <Income />;
      case 'SUPPLY_PARTIES':
        return <SupplyParties />;
      case 'ADMIN':
        return <Placeholder pageName="Admin Panel" />;
      default:
        return <Dashboard />;
    }
  };

  // Show a loading state while checking session
  if (isLoggedIn === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If not logged in, show the Login component
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // If logged in, show the main application
  return (
    <div className="flex flex-col min-h-screen">
      <Header onNavigate={handleNavigation} onLogout={handleLogout} />
      <main className="flex-grow">
        {renderActivePage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;