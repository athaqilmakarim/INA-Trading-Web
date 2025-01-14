import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { placeService } from '../services/PlaceService';
import { UserService, UserType } from '../services/UserService';

const Profile = () => {
  const { currentUser, signOut } = useAuth();
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const [userPlaces, type, profile] = await Promise.all([
          placeService.getUserPlaces(currentUser.uid),
          UserService.checkUserType(currentUser.uid),
          UserService.getUserProfile(currentUser.uid)
        ]);
        
        setPlaces(userPlaces);
        setUserType(type);
        setUserData(profile);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view your profile</p>
          <Link to="/auth" className="text-red-600 hover:text-red-700 font-medium">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userData?.displayName || currentUser.email.split('@')[0]}
                </h1>
                <p className="text-gray-600 mt-1">{currentUser.email}</p>
                {userData?.phoneNumber && (
                  <p className="text-gray-600 mt-1">{userData.phoneNumber}</p>
                )}
                {userData?.bio && (
                  <p className="text-gray-600 mt-2 max-w-xl">{userData.bio}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Account Type: {userType}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={signOut}
                className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Places */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <h2 className="text-xl font-semibold p-6">My Places</h2>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {places.length > 0 ? (
                places.map(place => (
                  <Link
                    key={place.id}
                    to={`/place/${place.id}`}
                    className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{place.name}</h3>
                        <p className="text-gray-600 mt-1">{place.type}</p>
                        <p className="text-sm text-gray-500 mt-2">{place.address}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        place.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : place.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {place.status.charAt(0).toUpperCase() + place.status.slice(1)}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't added any places yet</p>
                  {userType === UserType.B2C_BUSINESS_OWNER && (
                    <Link
                      to="/add-place"
                      className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Add a Place
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 