import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { LoanList } from './pages/LoanList';
import { LoanDetail } from './pages/LoanDetail';
import { LoanOrigination } from './pages/LoanOrigination';
import { RiskReports } from './pages/RiskReports';
import { Alerts } from './pages/Alerts';
import { MarketIntelligence } from './pages/MarketIntelligence';
import { Login } from './pages/Login';
import { AIContextProvider } from './contexts/AIContext';
import { AIChatWidget } from './components/AIChatWidget';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedLoanId(null);
  };

  const handleViewLoan = (id: string) => {
    setSelectedLoanId(id);
    setCurrentPage('details');
  };

  const handleCreateLoan = () => {
    setCurrentPage('origination');
  }

  return (
    <AIContextProvider>
        <div className="flex min-h-screen bg-slate-50">
        <Sidebar activePage={currentPage} onNavigate={handleNavigate} />
        
        <main className="flex-1 ml-64 relative">
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'loans' && <LoanList onView={handleViewLoan} onCreate={handleCreateLoan} />}
            {currentPage === 'details' && selectedLoanId && (
                <LoanDetail loanId={selectedLoanId} onBack={() => handleNavigate('loans')} />
            )}
            {currentPage === 'origination' && (
                <LoanOrigination onBack={() => handleNavigate('loans')} onComplete={() => handleNavigate('loans')} />
            )}
            {currentPage === 'reports' && <RiskReports />}
            {currentPage === 'alerts' && <Alerts />}
            {currentPage === 'market' && <MarketIntelligence />}
            
            <AIChatWidget />
        </main>
        </div>
    </AIContextProvider>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default App;