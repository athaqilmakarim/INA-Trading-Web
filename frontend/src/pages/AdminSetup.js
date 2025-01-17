import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/UserService';
import { useNavigate } from 'react-router-dom';

const AdminSetup = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSetupAdmin = async () => {
    if (!currentUser) {
      setError('You must be logged in to set up admin');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      await userService.setUserAsAdmin(currentUser.uid);
      navigate('/admin');
    } catch (error) {
      setError('Failed to set up admin: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-red-600 text-center">
              Please sign in first to set up admin access
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Setup
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 text-red-600 text-center">
              {error}
            </div>
          )}
          
          <div className="text-center mb-6">
            <p className="text-gray-600">
              This will set up your account ({currentUser.email}) as an admin user.
            </p>
          </div>

          <button
            onClick={handleSetupAdmin}
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Setting up...' : 'Set Up Admin Access'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup; 