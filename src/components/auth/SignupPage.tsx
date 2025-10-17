import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, IdCard, UserPlus, Send, CheckCircle } from 'lucide-react';
import { createUser } from '../../lib/mockData';
import { useToast } from '../ui/toast-container';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface SignupPageProps {
  onNavigateToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student',
    studentId: '',
    password: '',
    confirmPassword: '',
  });
  const [currentStep, setCurrentStep] = useState<'form' | 'verification'>('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [codeError, setCodeError] = useState(false);
  const { showToast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};

    if (!formData.firstName) newErrors.firstName = true;
    if (!formData.lastName) newErrors.lastName = true;
    if (!formData.email) newErrors.email = true;
    if (!formData.studentId) newErrors.studentId = true;
    if (!formData.password) newErrors.password = true;
    if (!formData.confirmPassword) newErrors.confirmPassword = true;

    // Email validation
    if (formData.email && !formData.email.endsWith('@plv.edu.ph')) {
      newErrors.email = true;
      showToast('Only @plv.edu.ph email addresses are allowed', 'error');
      return false;
    }

    // Student ID format validation (XX-XXXX)
    const studentIdRegex = /^\d{2}-\d{4}$/;
    if (formData.studentId && !studentIdRegex.test(formData.studentId)) {
      newErrors.studentId = true;
      showToast('Student ID must be in format: XX-XXXX (e.g., 23-3302)', 'error');
      return false;
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.password = true;
      newErrors.confirmPassword = true;
      showToast('Passwords do not match', 'error');
      return false;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fill in all required fields correctly', 'error');
      return false;
    }

    return true;
  };

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate sending email
    setTimeout(() => {
      const code = generateVerificationCode();
      setVerificationCode(code);
      
      // In production, this would send an email via backend
      console.log('=== EMAIL VERIFICATION CODE ===');
      console.log(`To: ${formData.email}`);
      console.log(`Code: ${code}`);
      console.log('================================');
      
      showToast(
        `Verification code sent to ${formData.email}`,
        'success'
      );
      showToast(
        `[Demo Mode] Check console for verification code`,
        'info'
      );
      
      setCurrentStep('verification');
      setIsLoading(false);
    }, 1500);
  };

  const handleVerifyAndCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(false);

    if (enteredCode !== verificationCode) {
      setCodeError(true);
      showToast('Invalid verification code. Please try again.', 'error');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      try {
        createUser({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          studentId: formData.studentId,
          role: 'student',
          requestedRole: formData.role === 'class-representative' ? 'class-representative' : undefined,
          password: formData.password,
        });

        showToast(
          `Account created successfully! You can now login.`,
          'success'
        );

        if (formData.role === 'class-representative') {
          showToast(
            'Note: Please contact the admin to confirm your Class Representative role',
            'info'
          );
        }

        setTimeout(() => {
          onNavigateToLogin();
        }, 2000);
      } catch (error) {
        showToast('Failed to create account. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleResendCode = () => {
    const code = generateVerificationCode();
    setVerificationCode(code);
    setEnteredCode('');
    setCodeError(false);
    
    console.log('=== NEW VERIFICATION CODE ===');
    console.log(`To: ${formData.email}`);
    console.log(`Code: ${code}`);
    console.log('==============================');
    
    showToast('New verification code sent!', 'success');
    showToast('[Demo Mode] Check console for new code', 'info');
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setEnteredCode('');
    setCodeError(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050A30] via-[#1B1F50] to-[#3942A7] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#3942A7] to-[#1B1F50] p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1737505599159-5ffc1dcbc08f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBjaXJjdWl0fGVufDF8fHx8MTc2MDQzOTM5M3ww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="CIRA"
                className="w-full h-full object-cover rounded-full"
              />
            </motion.div>
            <h1 className="text-white mb-2">CIRA</h1>
            <p className="text-white/80">
              {currentStep === 'form' ? 'Create your account' : 'Verify your email'}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {currentStep === 'form' ? (
              <form onSubmit={handleSendVerificationCode} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[#1E1E1E] mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border ${errors.firstName ? 'border-[#FF4D4F] bg-red-50' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3942A7] transition-all`}
                      placeholder="Juan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#1E1E1E] mb-2">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border ${errors.lastName ? 'border-[#FF4D4F] bg-red-50' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3942A7] transition-all`}
                      placeholder="Dela Cruz"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#1E1E1E] mb-2">Email (@plv.edu.ph only)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-[#FF4D4F] bg-red-50' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3942A7] transition-all`}
                    placeholder="student@plv.edu.ph"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[#1E1E1E] mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3942A7] transition-all"
                  >
                    <option value="student">Student</option>
                    <option value="class-representative">Class Representative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1E1E1E] mb-2">Student ID (XX-XXXX)</label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border ${errors.studentId ? 'border-[#FF4D4F] bg-red-50' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3942A7] transition-all`}
                      placeholder="23-3302"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[#1E1E1E] mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border ${errors.password ? 'border-[#FF4D4F] bg-red-50' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3942A7] transition-all`}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#1E1E1E] mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border ${errors.confirmPassword ? 'border-[#FF4D4F] bg-red-50' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3942A7] transition-all`}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#3942A7] to-[#1B1F50] text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Verification Code</span>
                    </>
                  )}
                </motion.button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-[#3942A7]/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-[#3942A7]" />
                  </div>
                  <h2 className="text-[#1E1E1E] mb-2">Check your email</h2>
                  <p className="text-[#7A7A7A]">
                    We've sent a 6-digit verification code to
                  </p>
                  <p className="text-[#3942A7]">{formData.email}</p>
                </div>

                <form onSubmit={handleVerifyAndCreateAccount} className="space-y-5">
                  <div>
                    <label className="block text-[#1E1E1E] mb-2 text-center">
                      Enter Verification Code
                    </label>
                    <input
                      type="text"
                      value={enteredCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setEnteredCode(value);
                        setCodeError(false);
                      }}
                      className={`w-full px-4 py-3 border ${
                        codeError ? 'border-[#FF4D4F] bg-red-50' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3942A7] transition-all text-center text-2xl tracking-widest`}
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                    />
                    {codeError && (
                      <p className="text-[#FF4D4F] mt-2 text-center">
                        Invalid verification code
                      </p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading || enteredCode.length !== 6}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-[#3942A7] to-[#1B1F50] text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Verify & Create Account</span>
                      </>
                    )}
                  </motion.button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleBackToForm}
                      className="flex-1 px-4 py-2 border border-gray-300 text-[#7A7A7A] rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Back to Form
                    </button>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="flex-1 px-4 py-2 border border-[#3942A7] text-[#3942A7] rounded-lg hover:bg-[#3942A7]/5 transition-all"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {currentStep === 'form' && (
              <div className="mt-6 text-center">
                <p className="text-[#7A7A7A]">
                  Already have an account?{' '}
                  <button
                    onClick={onNavigateToLogin}
                    className="text-[#3942A7] hover:underline transition-all"
                  >
                    Login
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[#F9FAFB] px-8 py-4 text-center border-t">
            <p className="text-[#7A7A7A]">College of Engineering and Information Technology</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
