import React, { useState, useCallback, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Clients from './pages/Clients';
import Invoice from './pages/Invoice';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Quotation from './pages/Quotation';
import SettingsPage from './pages/SettingsPage';

type Page = 'dashboard' | 'bookings' | 'clients' | 'invoice' | 'payments' | 'reports' | 'quotation' | 'settings';

export default function App() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const initializeFromToken = useStore((s) => s.initializeFromToken);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [pageParams, setPageParams] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setGlobalError(event.error?.message || event.message || 'Unknown error');
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      setGlobalError(event.reason?.message || String(event.reason) || 'Unhandled promise rejection');
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  useEffect(() => {
    // Try to restore session from token on app load
    initializeFromToken().then(() => {
      setIsInitializing(false);
    });
  }, [initializeFromToken]);

  const handleNavigate = useCallback((page: string, params?: any) => {
    setCurrentPage(page as Page);
    setPageParams(params || null);
  }, []);

  if (globalError) {
    return (
      <div className="min-h-screen bg-red-50 text-gray-900 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-red-200 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Application error</h1>
          <p className="text-sm text-gray-600 mb-6">An unexpected error occurred while loading the app.</p>
          <pre className="text-xs text-left bg-gray-100 rounded-xl p-4 overflow-x-auto text-red-700">{globalError}</pre>
          <button onClick={() => window.location.reload()}
            className="mt-6 px-5 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition">
            Reload app
          </button>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-blue-400 rounded-full mx-auto mb-4" />
          <p className="text-white text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontSize: '13px', fontWeight: '500' },
          }}
        />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'bookings':
        return <Bookings onNavigate={handleNavigate} initialParams={pageParams} />;
      case 'clients':
        return <Clients onNavigate={handleNavigate} />;
      case 'invoice':
        return <Invoice onNavigate={handleNavigate} initialParams={pageParams} />;
      case 'payments':
        return <Payments onNavigate={handleNavigate} initialParams={pageParams} />;
      case 'reports':
        return <Reports />;
      case 'quotation':
        return <Quotation />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={handleNavigate}>
        {renderPage()}
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', fontSize: '13px', fontWeight: '500', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' },
          success: { style: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' } },
          error: { style: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' } },
        }}
      />
    </>
  );
}
