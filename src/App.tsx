import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { DashboardRouter } from './components/dashboard/DashboardRouter';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastProvider, useToast } from './components/ui/toast-container';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut, sendEmailVerification, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { VerificationPage } from './components/auth/VerificationPage';

interface User {
  id: string;
  role: 'student' | 'class-representative' | 'admin';
  [key: string]: any;
}

type Page = 'login' | 'signup' | 'forgot-password' | 'dashboard' | 'verification';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(true);
      setFirebaseUser(user);

      if (user) {
        if (user.emailVerified) {
          const userDocRef = doc(db, 'users', user.uid);
          const docUnsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              const userData = { id: user.uid, ...doc.data() } as User;
              setCurrentUser(userData);
              setCurrentPage('dashboard');
            } else {
              setCurrentUser(null);
              setCurrentPage('login');
            }
            setIsLoading(false);
          });
          return () => docUnsubscribe();
        } else {
          setCurrentUser(null);
          setCurrentPage('verification');
          setIsLoading(false);
        }
      } else {
        setCurrentUser(null);
        setCurrentPage('login');
        setIsLoading(false);
      }
    });

    return () => authUnsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      setCurrentUser(null);
      setFirebaseUser(null);
      setCurrentPage('login');
      showToast('Logged out successfully', 'info');
    });
  };

  const handleResendVerification = () => {
    if (firebaseUser) {
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      };
      sendEmailVerification(firebaseUser, actionCodeSettings)
        .then(() => {
          showToast('A new verification email has been sent to your address.', 'success');
        })
        .catch((error) => {
            if (error.code === 'auth/too-many-requests') {
                showToast('Too many requests. Please try again later.', 'error');
            } else {
                showToast('Failed to send verification email. Please try again.', 'error');
            }
        });
    }
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
          onLogin={() => { /* onAuthStateChanged handles navigation */ }}
          onNavigateToSignup={() => setCurrentPage('signup')}
          onNavigateToForgotPassword={() => setCurrentPage('forgot-password')}
        />
      )}

      {currentPage === 'signup' && (
        <SignupPage
          onSignupSuccess={(email) => {
            if (auth.currentUser) {
                setFirebaseUser(auth.currentUser)
            }
            setCurrentPage('verification');
          }}
          onNavigateToLogin={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'verification' && firebaseUser && (
        <VerificationPage
          email={firebaseUser.email || ''}
          onResendVerification={handleResendVerification}
          onReturnToLogin={() => {
              signOut(auth); // Log out the user before returning to login
              setCurrentPage('login');
          }}
        />
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
