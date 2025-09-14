import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from './Dashboard/Header';
import Sidebar from './Dashboard/Sidebar';
import Overview from './Dashboard/Overview';
import EnhancedTransactions from './Dashboard/EnhancedTransactions';
import Clients from './Dashboard/Clients';
import Suppliers from './Dashboard/Suppliers';
import Users from './Dashboard/Users';
import Reports from './Dashboard/Reports';
import Settings from './Dashboard/Settings';
import SalesAnalytics from './Dashboard/SalesAnalytics';
import FinancialAnalytics from './Dashboard/FinancialAnalytics';
import SalesReports from './Dashboard/SalesReports';
import AdminSettings from './Dashboard/AdminSettings';
import SalesRanking from './Dashboard/SalesRanking';
import PassengerControl from './Dashboard/PassengerControl';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'transactions':
        return <EnhancedTransactions />;
      case 'clients':
        return <Clients />;
      case 'suppliers':
        return <Suppliers />;
      case 'users':
        return <Users />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'sales-analytics':
        return <SalesAnalytics />;
      case 'financial-analytics':
        return <FinancialAnalytics />;
      case 'sales-reports':
        return <SalesReports />;
      case 'admin-settings':
        return <AdminSettings />;
      case 'sales-ranking':
        return <SalesRanking />;
      default:
        return <Overview />;
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Close sidebar on mobile after selection
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        !isMobile && sidebarOpen ? 'lg:ml-64' : !isMobile ? 'lg:ml-16' : ''
      }`}>
        <Header 
          user={user} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile}
        />
        
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;