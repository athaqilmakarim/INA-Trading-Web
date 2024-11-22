import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { firestore } from '../firebase';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Add admin check
  useEffect(() => {
    if (currentUser && currentUser.userType !== 'Admin') {
      console.log('Non-admin user attempted to access admin page');
      navigate('/');
    }
  }, [currentUser, navigate]);

  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // ['pending', 'approved', 'rejected']
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      setIsLoading(true);
      const placesRef = collection(firestore, 'places');
      const placesQuery = query(placesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(placesQuery);
      
      const placesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      console.log('Fetched places:', placesData);
      setPlaces(placesData);
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (placeId, newStatus) => {
    try {
      setIsUpdating(true);
      const placeRef = doc(firestore, 'places', placeId);
      
      // Add timestamp for tracking
      const updateData = {
        status: newStatus,
        updatedAt: new Date(),
        reviewedAt: new Date(),
        reviewedBy: auth.currentUser?.uid // Add reviewer ID
      };
      
      await updateDoc(placeRef, updateData);
      
      // Update local state
      setPlaces(places.map(place => 
        place.id === placeId 
          ? { ...place, status: newStatus }
          : place
      ));

      // Show success message
      alert(`Place ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      
      // More specific error message
      if (error.code === 'permission-denied') {
        alert('You do not have permission to update place status. Please make sure you are logged in as an admin.');
      } else {
        alert('Error updating status: ' + error.message);
      }
    } finally {
      setIsUpdating(false);
      setSelectedPlace(null);
    }
  };

  const filteredPlaces = places.filter(place => {
    if (activeTab === 'pending') return place.status === 'pending';
    if (activeTab === 'approved') return place.status === 'approved';
    if (activeTab === 'rejected') return place.status === 'rejected';
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={fetchPlaces}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
        >
          Refresh Data
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {['pending', 'approved', 'rejected'].map((status) => (
          <div key={status} className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-lg font-medium capitalize">{status}</div>
            <div className="text-2xl font-bold">
              {places.filter(place => place.status === status).length}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {['pending', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-600 hover:text-primary-500'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} ({places.filter(place => place.status === tab).length})
          </button>
        ))}
      </div>

      {/* Places List */}
      <div className="space-y-4">
        {filteredPlaces.map(place => (
          <div 
            key={place.id} 
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{place.name}</h3>
                  <p className="text-sm text-gray-500">
                    Submitted on {place.createdAt?.toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  place.status === 'approved' 
                    ? 'bg-green-100 text-green-600'
                    : place.status === 'rejected'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {place.status.charAt(0).toUpperCase() + place.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-gray-800">{place.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact</p>
                  <p className="text-gray-800">{place.contact}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-gray-800">{place.address}</p>
                </div>
                {place.type === 'restaurant' && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Menu Items</p>
                    <p className="text-gray-800">{place.menu?.length || 0} items</p>
                  </div>
                )}
              </div>

              <p className="text-gray-600 mb-4">{place.description}</p>

              {/* Action Buttons */}
              {place.status === 'pending' && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleUpdateStatus(place.id, 'approved')}
                    disabled={isUpdating}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(place.id, 'rejected')}
                    disabled={isUpdating}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}

              {place.status !== 'pending' && (
                <button
                  onClick={() => handleUpdateStatus(place.id, 'pending')}
                  disabled={isUpdating}
                  className="text-gray-600 hover:text-primary-500 disabled:opacity-50"
                >
                  Reset to Pending
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredPlaces.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">No {activeTab} places found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin; 