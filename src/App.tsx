import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { DashboardRouter } from './components/dashboard/DashboardRouter';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastProvider, useToast } from './components/ui/toast-container';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';

interface User {
  id: string;
  role: 'student' | 'class-representative' | 'admin';
  [key: string]: any;
}

type Page = 'login' | 'signup' | 'forgot-password' | 'dashboard';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = { id: user.uid, ...userDoc.data() } as User;
          setCurrentUser(userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));
          setCurrentPage('dashboard');
        } else {
          setCurrentUser(null);
          setCurrentPage('login');
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        setCurrentPage('login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      setCurrentUser(null);
      setCurrentPage('login');
      showToast('Logged out successfully', 'info');
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050A30] via-[#1B1F50] to-[#3942A7] flex items-center justify-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
             <div className="w-10 h-10 border-4 border-[#3942A7] border-t-transparent rounded-full animate-spin" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {currentPage === 'login' && (
        <LoginPage
          onLogin={() => { /* onAuthStateChanged will handle navigation */ }}
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
            <DashboardRouter user={currentUser} />
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
