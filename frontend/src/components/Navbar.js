import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserService, UserType } from '../services/UserService';

const Navbar = () => {
  const { currentUser } = useAuth();
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const fetchUserType = async () => {
      if (currentUser) {
        try {
          const type = await UserService.checkUserType(currentUser.uid);
          setUserType(type);
        } catch (error) {
          console.error('Error fetching user type:', error);
        }
      }
    };
    
    fetchUserType();
  }, [currentUser]);

  return (
    <nav className="bg-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-red-600">
          INA Trading
        </Link>
        <div className="flex space-x-4">
          {userType === UserType.B2B_SUPPLIER && (
            <Link
              to="/add-export-product"
              className="text-gray-700 hover:text-red-600"
            >
              Add Export Product
            </Link>
          )}
          {/* Add other navigation links here */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 