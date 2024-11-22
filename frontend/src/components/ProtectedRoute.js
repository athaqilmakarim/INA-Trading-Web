import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedUserTypes }) => {
  const { currentUser, isLoading } = useAuth();
  
  console.log('Protected Route:', { currentUser, allowedUserTypes });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  if (allowedUserTypes?.includes('Admin') && currentUser.userType !== 'Admin') {
    console.log('Non-admin user attempted to access admin route');
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute; 