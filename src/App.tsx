import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { ClassRepDashboard } from './components/dashboard/ClassRepDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastProvider, useToast } from './components/ui/toast-container';
import { getCurrentUser, logout as logoutFn } from './lib/mockData';
import { User } from './lib/mockData';

type Page = 'login' | 'signup' | 'forgot-password' | 'dashboard';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = () => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    logoutFn();
    setCurrentUser(null);
    setCurrentPage('login');
    showToast('Logged out successfully', 'info');
  };

  const renderDashboard = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'class-representative':
        return <ClassRepDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {currentPage === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onNavigateToSignup={() => setCurrentPage('signup')}
          onNavigateToForgotPassword={() => setCurrentPage('forgot-password')}
        />
      )}

      {currentPage === 'signup' && (
        <SignupPage onNavigateToLogin={() => setCurrentPage('login')} />
      )}

      {currentPage === 'forgot-password' && (
        <ForgotPasswordPage onNavigateToLogin={() => setCurrentPage('login')} />
      )}

      {currentPage === 'dashboard' && currentUser && (
        <>
          <Navbar user={currentUser} onLogout={handleLogout} />
          <main className="flex-1 bg-[#F9FAFB]">
            {renderDashboard()}
          </main>
          <Footer />
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
