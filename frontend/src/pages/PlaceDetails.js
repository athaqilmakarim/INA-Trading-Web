import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { MapHelper } from '../utils/MapHelper';

const PlaceDetails = () => {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // ['details', 'menu']

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setIsLoading(true);
        const placeDoc = await getDoc(doc(firestore, 'places', id));
        
        if (placeDoc.exists()) {
          setPlace({
            id: placeDoc.id,
            ...placeDoc.data()
          });
        } else {
          setError('Place not found');
        }
      } catch (err) {
        console.error('Error fetching place:', err);
        setError('Error loading place details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlace();
  }, [id]);

  const handleViewOnMap = () => {
    if (place?.address) {
      MapHelper.openInMaps(place.address);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">{error || 'Place not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {place.imageURL && (
          <div className="h-64 bg-gray-200">
            <img 
              src={place.imageURL} 
              alt={place.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{place.name}</h1>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              {place.type}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{place.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {place.address}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {place.contact}
            </div>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              {place.rating?.toFixed(1) || '0.0'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mt-8 mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'details'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-gray-600 hover:text-primary-500'
          }`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        {place.type.toLowerCase() === 'restaurant' && (
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'menu'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-600 hover:text-primary-500'
            }`}
            onClick={() => setActiveTab('menu')}
          >
            Menu
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'details' ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="prose max-w-none">
            <h2 className="text-xl font-bold mb-4">About {place.name}</h2>
            <p className="text-gray-600">{place.description}</p>
            
            <div className="mt-6">
              <button
                onClick={handleViewOnMap}
                className="inline-flex items-center text-primary-500 hover:text-primary-600"
              >
                View on Map
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Menu Items</h2>
          {place.menu && place.menu.length > 0 ? (
            <div className="grid gap-4">
              {place.menu.map((item) => (
                <div 
                  key={item.id} 
                  className="border-b last:border-b-0 pb-4 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="text-primary-500 font-medium">
                      Rp {item.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No menu items available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaceDetails; 