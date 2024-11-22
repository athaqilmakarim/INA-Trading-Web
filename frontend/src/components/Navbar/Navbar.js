import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserType } from '../../types/UserType';

const Navbar = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-500 hover:text-primary-600 transition-colors">
              INA Trading
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link 
              to="/"
              className={`${
                isActive('/') 
                  ? 'text-primary-500 font-medium' 
                  : 'text-secondary-600 hover:text-primary-500'
              } transition-colors`}
            >
              Home
            </Link>
            <Link 
              to="/explore"
              className={`${
                isActive('/explore') 
                  ? 'text-primary-500 font-medium' 
                  : 'text-secondary-600 hover:text-primary-500'
              } transition-colors`}
            >
              Explore
            </Link>
            {currentUser ? (
              <>
                <Link 
                  to="/profile"
                  className={`${
                    isActive('/profile') 
                      ? 'text-primary-500 font-medium' 
                      : 'text-secondary-600 hover:text-primary-500'
                  } transition-colors`}
                >
                  Profile
                </Link>
                {currentUser?.userType === UserType.B2C_BUSINESS_OWNER && (
                  <Link 
                    to="/add-place"
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                  >
                    Add Place
                  </Link>
                )}
              </>
            ) : (
              <Link 
                to="/auth"
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 