import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import userService from '../services/UserService';
import { toast } from 'react-hot-toast';

export default function VerifyEmailRequired() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

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
          // Try to login - this will succeed only if email is verified
          await userService.login(email, password);
          
          // If login succeeds, clear interval and redirect
          clearInterval(interval);
          localStorage.removeItem('pendingEmail');
          localStorage.removeItem('pendingPassword');
          toast.success('Email verified successfully! Welcome to INA Trading.');
          navigate('/');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Verify Your Email
        </h1>
        
        <div className="mt-4 space-y-4">
          <p className="text-gray-600">
            A verification link has been sent to your email address.
            Please check your inbox and click the link to verify your account.
          </p>
          
          <p className="text-gray-500">
            If you don't see the email, please check your spam folder.
          </p>

          <p className="text-gray-600 font-medium">
            Once verified, you will be automatically redirected to the homepage.
          </p>
        </div>
      </div>
    </div>
  );
} 