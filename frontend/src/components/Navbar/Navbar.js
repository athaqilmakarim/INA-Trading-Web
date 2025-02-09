import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserType } from '../../services/UserService';

const Navbar = () => {
  const { currentUser, userType } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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
                src="/Logo INA TRADING KOTAK 2.png"
                alt="INA Trading Logo" 
                className="h-11 w-auto"
                style={{ minWidth: '140px', objectFit: 'contain' }}
              />
            </Link>

            <div className="hidden sm:flex sm:items-center sm:space-x-6">
              <NavLink to="/about">About</NavLink>
              <NavLink to="/news">News</NavLink>
              <NavLink to="/explore">Explore</NavLink>
              <NavLink to="/export-products">Export Products</NavLink>
              <NavLink to="/contact">Contact Us</NavLink>
            </div>
          </div>

          {/* Right side - Auth and actions */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {currentUser && (
              <>
                {(userType === UserType.B2B_SUPPLIER || userType === "B2B Supplier/Exporter" || userType === UserType.ADMIN || userType === "Admin") && (
                  <ActionButton to="/add-export-product">
                    Add Product
                  </ActionButton>
                )}
                {(userType === UserType.B2C_BUSINESS_OWNER || userType === "B2C Business Owner" || userType === UserType.ADMIN || userType === "Admin") && (
                  <ActionButton to="/add-place">
                    Add Place
                  </ActionButton>
                )}
                {(userType === UserType.ADMIN || userType === "Admin") && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Admin Panel</span>
                  </Link>
                )}
                <div className="h-6 w-px bg-gray-200"></div>
                <NavLink to="/profile">Profile</NavLink>
              </>
            )}
            
            {!currentUser && (
              <ActionButton to="/login">
                Sign In
              </ActionButton>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <MobileNavLink to="/about">About</MobileNavLink>
          <MobileNavLink to="/news">News</MobileNavLink>
          <MobileNavLink to="/explore">Explore</MobileNavLink>
          <MobileNavLink to="/export-products">Export Products</MobileNavLink>
          <MobileNavLink to="/contact">Contact Us</MobileNavLink>
        </div>
        
        {/* Mobile menu auth section */}
        <div className="pt-4 pb-3 border-t border-gray-200">
          {currentUser && (
            <div className="space-y-1">
              {(userType === UserType.B2B_SUPPLIER || userType === "B2B Supplier/Exporter" || userType === UserType.ADMIN || userType === "Admin") && (
                <MobileNavLink to="/add-export-product">Add Product</MobileNavLink>
              )}
              {(userType === UserType.B2C_BUSINESS_OWNER || userType === "B2C Business Owner" || userType === UserType.ADMIN || userType === "Admin") && (
                <MobileNavLink to="/add-place">Add Place</MobileNavLink>
              )}
              {(userType === UserType.ADMIN || userType === "Admin") && (
                <MobileNavLink to="/admin">Admin Panel</MobileNavLink>
              )}
              <MobileNavLink to="/profile">Profile</MobileNavLink>
            </div>
          )}
          {!currentUser && (
            <div className="px-4">
              <Link
                to="/login"
                className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const MobileNavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`block px-3 py-2 text-base font-medium ${
        isActive
          ? 'text-red-600 bg-red-50'
          : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar; 