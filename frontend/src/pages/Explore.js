import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { firestore } from '../firebase';
import { MapHelper } from '../utils/MapHelper';
import { placeService } from '../services/PlaceService';

const Explore = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSort, setSelectedSort] = useState('rating'); // ['rating', 'distance', 'name']

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching places for explore page...');

        const placesData = await placeService.getApprovedPlaces();
        console.log('Fetched places:', placesData);

        // Process the data
        const processedPlaces = placesData.map(place => ({
          id: place.id,
          ...place,
          name: place.name || '',
          type: place.type || 'Restaurant',
          description: place.description || '',
          address: place.address || '',
          contact: place.contact || '',
          rating: place.rating || 0,
          imageURL: place.imageURL || '',
          menu: place.menu || []
        }));

        console.log('Processed places:', processedPlaces);
        setPlaces(processedPlaces);
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, [selectedSort]);

  const handleViewOnMap = (address) => {
    MapHelper.openInMaps(address);
  };

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         place.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || place.type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Explore Indonesian Places</h1>
        <p className="text-gray-600">Discover authentic Indonesian experiences near you</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search places..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="restaurant">Restaurant</option>
              <option value="shop">Shop</option>
              <option value="cultural">Cultural</option>
              <option value="business">Business</option>
              <option value="worship">Worship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="rating">Rating</option>
              <option value="distance">Distance</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Places Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaces.length > 0 ? (
          filteredPlaces.map(place => (
            <Link 
              to={`/place/${place.id}`} 
              key={place.id} 
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
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
                  <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    {place.type}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{place.description}</p>
                <div className="text-sm text-gray-500 mb-4">
                  <div className="flex items-center mb-1">
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
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-gray-700">{place.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  {place.type.toLowerCase() === 'restaurant' && place.menu?.length > 0 && (
                    <span className="text-primary-500 text-sm">
                      {place.menu.length} Menu Items
                    </span>
                  )}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleViewOnMap(place.address);
                    }}
                    className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                  >
                    View on Map
                  </button>
                  <span className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <div className="text-gray-500">No places found matching your criteria</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore; 