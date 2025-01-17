import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase';
import userService from '../services/UserService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  // Sign Up function
  const signUp = async (email, password, userType) => {
    return userService.register(email, password, userType);
  };

  // Sign In function
  const signIn = async (email, password) => {
    const user = await userService.login(email, password);
    // Immediately fetch and set user type after successful login
    if (user) {
      try {
        const type = await userService.checkUserType(user.uid);
        console.log('Setting user type after login:', type);
        setUserType(type);
      } catch (error) {
        console.error('Error fetching user type after login:', error);
      }
    }
    return user;
  };

  // Sign Out function
  const signOut = async () => {
    console.log('Signing out, clearing user type');
    setUserType(null);
    return firebaseSignOut(auth);
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setCurrentUser(user);
      if (user) {
        try {
          const type = await userService.checkUserType(user.uid);
          console.log('Fetched user type:', type);
          setUserType(type);
        } catch (error) {
          console.error('Error fetching user type:', error);
        }
      } else {
        console.log('Clearing user type on logout');
        setUserType(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userType,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 