import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userPlaces, setUserPlaces] = useState([]);
  const [activeTab, setActiveTab] = useState('places'); // ['places', 'settings']

  useEffect(() => {
    const fetchUserPlaces = async () => {
      try {
        setIsLoading(true);
        if (!currentUser?.id) return;

        const placesRef = collection(firestore, 'places');
        const placesQuery = query(
          placesRef,
          where('ownerId', '==', currentUser.id)
        );

        const snapshot = await getDocs(placesQuery);
        const places = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setUserPlaces(places);
      } catch (error) {
        console.error('Error fetching user places:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPlaces();
  }, [currentUser?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">
          Please sign in to view your profile
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl text-gray-600">
              {currentUser.email[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{currentUser.email}</h1>
            <p className="text-gray-600">{currentUser.userType}</p>
            <p className="text-sm text-gray-500">
              Member since {currentUser.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'places'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-red-600'
          }`}
          onClick={() => setActiveTab('places')}
        >
          My Places
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'settings'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-red-600'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      {activeTab === 'places' ? (
        <div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : userPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPlaces.map(place => (
                <div key={place.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {place.imageURL && (
                    <div className="h-48 bg-gray-200">
                      <img 
                        src={place.imageURL} 
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-xl text-gray-800">{place.name}</h3>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        place.status === 'approved' 
                          ? 'bg-green-100 text-green-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {place.status.charAt(0).toUpperCase() + place.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{place.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 text-gray-700">{place.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <span className="text-sm text-gray-500">{place.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">No places added yet</div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full p-2 bg-gray-50 border rounded text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <input
                type="text"
                value={currentUser.userType}
                disabled
                className="w-full p-2 bg-gray-50 border rounded text-gray-600"
              />
            </div>
            <button
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
              onClick={() => {/* Add password change functionality */}}
            >
              Change Password
            </button>
            <button
              onClick={handleSignOut}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 