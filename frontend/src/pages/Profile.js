import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const createdAt = data.createdAt?.toDate?.() || new Date();
          const lastUpdated = data.lastUpdated?.toDate?.() || new Date();
          
          setUserData({
            ...data,
            createdAt,
            lastUpdated
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No user data available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="font-medium">{userData.email}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600">User Type</label>
            <p className="font-medium">{userData.userType}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Account Created</label>
            <p className="font-medium">
              {userData.createdAt.toLocaleDateString()}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Last Updated</label>
            <p className="font-medium">
              {userData.lastUpdated.toLocaleDateString()}
            </p>
          </div>

          <div className="pt-6">
            <button
              onClick={handleSignOut}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 