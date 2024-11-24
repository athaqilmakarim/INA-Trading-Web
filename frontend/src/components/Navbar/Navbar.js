import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserService, UserType } from '../../services/UserService';

const Navbar = () => {
  const { currentUser } = useAuth();
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchUserType = async () => {
      if (currentUser) {
        try {
          setIsLoading(true);
          const type = await UserService.checkUserType(currentUser.uid);
          setUserType(type);
        } catch (error) {
          console.error('Error fetching user type:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUserType(null);
        setIsLoading(false);
      }
    };
    
    fetchUserType();
  }, [currentUser]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
        isActive(to)
          ? 'text-red-600'
          : 'text-gray-600 hover:text-red-600'
      }`}
    >
      {children}
    </Link>
  );

  const ActionButton = ({ to, children }) => (
    <Link
      to={to}
      className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors duration-200"
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and main navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img 
                src="/logo.png"
                alt="INA Trading Logo" 
                className="h-12 w-auto"
              />
            </Link>

            <div className="hidden sm:flex sm:items-center sm:space-x-6">
              <NavLink to="/explore">Explore</NavLink>
              <NavLink to="/export-products">Export Products</NavLink>
            </div>
          </div>

          {/* Right side - Auth and actions */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {!isLoading && currentUser && (
              <>
                {userType === UserType.B2B_SUPPLIER && (
                  <ActionButton to="/add-export-product">
                    Add Product
                  </ActionButton>
                )}
                {userType === UserType.B2C_BUSINESS_OWNER && (
                  <ActionButton to="/add-place">
                    Add Place
                  </ActionButton>
                )}
                {userType === UserType.ADMIN && (
                  <NavLink to="/admin">Admin</NavLink>
                )}
                <div className="h-6 w-px bg-gray-200"></div>
                <NavLink to="/profile">Profile</NavLink>
              </>
            )}
            
            {!currentUser && (
              <ActionButton to="/auth">
                Sign In
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 