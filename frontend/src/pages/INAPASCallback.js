import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { inapasService } from '../services/INAPASService';

export default function INAPASCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Authentication failed: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing required parameters');
        }

        await inapasService.handleCallback(code, state);
        toast.success('Successfully logged in with INA PAS');
        navigate('/');
      } catch (error) {
        console.error('INA PAS callback error:', error);
        toast.error(error.message || 'Failed to authenticate with INA PAS');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Completing INA PAS authentication...</p>
          </div>
        </div>
      </div>
    </div>
  );
} 