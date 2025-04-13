import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import userService from '../services/UserService';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerificationMode, setIsVerificationMode] = useState(false);

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    // Handle email verification
    if (mode === 'verifyEmail' && oobCode) {
      setIsVerificationMode(true);
      verifyEmail(oobCode);
    } else {
      // If no verification parameters, do not close the window immediately.
      // The component will render the login/register prompt.
      setIsVerificationMode(false);
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

  // Render verification UI only if in verification mode
  if (isVerificationMode) {
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
                {isVerifying ? 'Verifying your email...' : 'Processing...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render login/register prompt if not in verification mode
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 p-4">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-2xl shadow-xl text-center">
        <svg className="mx-auto h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          Authentication Required
        </h2>
        <p className="mt-2 text-gray-600">
          You need to be logged in to view this page. Please log in or create an account.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-4 sm:space-y-0">
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
} 