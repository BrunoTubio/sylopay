import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BNPLProvider, useBNPL } from './hooks/useBNPL';
import CheckoutPage from './pages/CheckoutPage';
import QuotationPage from './pages/QuotationPage';
import ContractPage from './pages/ContractPage';
import ProcessingPage from './pages/ProcessingPage';
import DashboardPage from './pages/DashboardPage';
import './styles/globals.css';

function AppContent() {
  const { state } = useBNPL();

  const getRouteForStep = (step: string) => {
    switch (step) {
      case 'checkout':
        return '/';
      case 'quotation':
        return '/quotation';
      case 'contract':
        return '/contract';
      case 'processing':
        return '/processing';
      case 'dashboard':
        return '/dashboard';
      default:
        return '/';
    }
  };

  const shouldRedirect = (currentPath: string, requiredStep: string) => {
    const currentRoute = getRouteForStep(state.currentStep);
    const requiredRoute = getRouteForStep(requiredStep);
    
    // Allow access to current step or previous steps
    const stepOrder = ['checkout', 'quotation', 'contract', 'processing', 'dashboard'];
    const currentIndex = stepOrder.indexOf(state.currentStep);
    const requiredIndex = stepOrder.indexOf(requiredStep);
    
    return currentPath !== currentRoute && requiredIndex > currentIndex;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              shouldRedirect('/', 'checkout') 
                ? <Navigate to={getRouteForStep(state.currentStep)} replace />
                : <CheckoutPage />
            } 
          />
          <Route 
            path="/quotation" 
            element={
              shouldRedirect('/quotation', 'quotation')
                ? <Navigate to={getRouteForStep(state.currentStep)} replace />
                : <QuotationPage />
            } 
          />
          <Route 
            path="/contract" 
            element={
              shouldRedirect('/contract', 'contract')
                ? <Navigate to={getRouteForStep(state.currentStep)} replace />
                : <ContractPage />
            } 
          />
          <Route 
            path="/processing" 
            element={
              shouldRedirect('/processing', 'processing')
                ? <Navigate to={getRouteForStep(state.currentStep)} replace />
                : <ProcessingPage />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              shouldRedirect('/dashboard', 'dashboard')
                ? <Navigate to={getRouteForStep(state.currentStep)} replace />
                : <DashboardPage />
            } 
          />
          {/* Catch all route */}
          <Route 
            path="*" 
            element={<Navigate to={getRouteForStep(state.currentStep)} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <BNPLProvider>
      <AppContent />
    </BNPLProvider>
  );
}

export default App;