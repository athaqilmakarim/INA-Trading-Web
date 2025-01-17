import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import userService from '../services/UserService';
import { toast } from 'react-hot-toast';

export default function VerifyEmailRequired() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkVerification = async () => {
      const email = localStorage.getItem('pendingEmail');
      const password = localStorage.getItem('pendingPassword');
      
      if (!email || !password) {
        navigate('/login');
        return;
      }

      const interval = setInterval(async () => {
        try {
          // Reload the user to get fresh emailVerified status
          if (auth.currentUser) {
            await auth.currentUser.reload();
          }

          // Try to sign in
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          if (user.emailVerified) {
            // If login succeeds and email is verified, clear interval and redirect
            clearInterval(interval);
            localStorage.removeItem('pendingEmail');
            localStorage.removeItem('pendingPassword');
            toast.success('Email verified successfully! Welcome to INA Trading.');
            navigate('/');
          }
        } catch (error) {
          // If error is not about verification, stop checking
          if (!error.message.includes('verify')) {
            clearInterval(interval);
            console.error('Error checking verification:', error);
          }
        }
      }, 2000); // Check every 2 seconds

      // Cleanup interval on unmount
      return () => clearInterval(interval);
    };

    checkVerification();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-red-900 transition-all duration-500 ease-in-out">
      <div className="w-full max-w-md px-6 py-8 bg-white/10 backdrop-filter backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl hover:bg-white/[0.12] transition-all duration-300">
        <div className="mb-8">
          <h1 className="text-center text-3xl font-bold text-white mb-2">
            Verify Your Email
          </h1>
          
          <div className="mt-4 space-y-4">
            <p className="text-gray-300">
              A verification link has been sent to your email address.
              Please check your inbox and click the link to verify your account.
            </p>
            
            <p className="text-gray-400">
              If you don't see the email, please check your spam folder.
            </p>

            <div className="flex flex-col items-center justify-center mt-6 space-y-4">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-300 animate-pulse">
                Waiting for verification...
              </p>
            </div>

            <p className="text-gray-300 font-medium text-center">
              Once verified, you will be automatically redirected to the homepage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 