import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

const ProtectedRoute = ({ children, allowedUserTypes }) => {
  const { currentUser } = useAuth();
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserType = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        if (userDoc.exists()) {
          console.log('User type from DB:', userDoc.data().userType); // Debug log
          setUserType(userDoc.data().userType);
        }
      } catch (error) {
        console.error('Error checking user type:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserType();
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('No current user, redirecting to auth'); // Debug log
    return <Navigate to="/auth" />;
  }

  if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
    console.log('User type not allowed:', userType, 'Allowed types:', allowedUserTypes); // Debug log
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute; 