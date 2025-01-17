import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import userService from '../services/UserService';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    // Handle email verification
    if (mode === 'verifyEmail' && oobCode) {
      verifyEmail(oobCode);
    } else {
      // If no verification parameters, redirect to home
      navigate('/');
    }
  }, [searchParams, navigate]);

  const verifyEmail = async (actionCode) => {
    setIsVerifying(true);
    try {
      await userService.verifyEmail(actionCode);
      toast.success('Email verified successfully! Redirecting to homepage...');
      // User should be automatically signed in by now
      navigate('/');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify email. Please try logging in manually.');
      navigate('/login');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="mb-8">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 px-4">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-4 text-center text-gray-600">
            {isVerifying ? 'Verifying your email address...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    </div>
  );
} 