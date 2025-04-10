import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { inapasService } from '../services/INAPASService';
import { useAuth } from '../context/AuthContext';

const INAPASCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract parameters from the URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for error returned from INApas
        if (error) {
          throw new Error(errorDescription || error);
        }

        // Validate required parameters
        if (!code || !state) {
          throw new Error('Missing required parameters (code or state)');
        }

        // Handle the callback using our service
        const user = await inapasService.handleCallback(code, state);

        // Update auth context with the user data
        await login(user);

        toast.success('Successfully logged in with INA PAS!');
        navigate('/');
      } catch (error) {
        console.error('Error handling INA PAS callback:', error);
        setErrorMessage(error.message || 'Failed to complete authentication');
        toast.error(error.message || 'Failed to complete authentication');
        
        // Delay navigation to show the error
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-red-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/10 backdrop-filter backdrop-blur-sm rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            {loading ? 'Completing Authentication' : (errorMessage ? 'Authentication Failed' : 'Authentication Complete')}
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            {loading
              ? 'Please wait while we complete your authentication...'
              : (errorMessage
                 ? `Error: ${errorMessage}. Redirecting to login...`
                 : 'Successfully authenticated. Redirecting...')}
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          {loading && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          )}
          {!loading && errorMessage && (
            <div className="text-red-500 text-5xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-12 w-12">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          )}
          {!loading && !errorMessage && (
            <div className="text-green-500 text-5xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-12 w-12">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default INAPASCallback; 