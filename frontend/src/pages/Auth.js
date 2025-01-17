import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import userService from '../services/UserService';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    // Handle email verification
    if (mode === 'verifyEmail' && oobCode) {
      verifyEmail(oobCode);
    } else {
      // If no verification parameters, close this tab
      window.close();
    }
  }, [searchParams]);

  const verifyEmail = async (actionCode) => {
    setIsVerifying(true);
    try {
      await userService.verifyEmail(actionCode);
      // Close this tab and return to original tab
      if (window.opener) {
        window.opener.focus(); // Focus the original tab
      }
      window.close(); // Close this tab
    } catch (error) {
      console.error('Verification error:', error);
      if (window.opener) {
        window.opener.focus(); // Focus the original tab
      }
      window.close(); // Close this tab
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-red-900 transition-all duration-500 ease-in-out">
      <div className="w-full max-w-md px-6 py-8 bg-white/10 backdrop-filter backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl hover:bg-white/[0.12] transition-all duration-300">
        <div className="mb-8">
          <h2 className="text-center text-3xl font-bold text-white mb-2">
            Email Verification
          </h2>
          <div className="flex flex-col items-center justify-center mt-6 space-y-4">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-300 animate-pulse">
              {isVerifying ? 'Verifying your email...' : 'Redirecting...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 