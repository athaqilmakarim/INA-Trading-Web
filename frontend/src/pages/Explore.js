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
  const [selectedSort, setSelectedSort] = useState('rating');
  const [activeImageIndexes, setActiveImageIndexes] = useState({});

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching places for explore page...');

        const placesData = await placeService.getApprovedPlaces();
        console.log('Fetched places:', placesData);

        // Process the data
        const processedPlaces = placesData.map(place => {
          console.log('Processing place:', {
            id: place.id,
            name: place.name,
            images: place.images,
            imageURLs: place.imageURLs
          });

          return {
            id: place.id,
            ...place,
            name: place.name || '',
            type: place.type || 'Restaurant',
            description: place.description || '',
            address: place.address || '',
            contact: place.contact || '',
            rating: place.rating || 0,
            imageURLs: place.images || [], // Use images field directly
            menu: place.menu || []
          };
        });

        console.log('Processed places:', processedPlaces.map(p => ({
          id: p.id,
          name: p.name,
          imageURLs: p.imageURLs
        })));
        setPlaces(processedPlaces);

        // Initialize active image indexes
        const initialIndexes = {};
        processedPlaces.forEach(place => {
          initialIndexes[place.id] = 0;
        });
        setActiveImageIndexes(initialIndexes);
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

  const handlePrevImage = (e, placeId) => {
    e.preventDefault();
    setActiveImageIndexes(prev => ({
      ...prev,
      [placeId]: prev[placeId] > 0 ? prev[placeId] - 1 : 0
    }));
  };

  const handleNextImage = (e, placeId, maxIndex) => {
    e.preventDefault();
    setActiveImageIndexes(prev => ({
      ...prev,
      [placeId]: prev[placeId] < maxIndex ? prev[placeId] + 1 : maxIndex
    }));
  };

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         place.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || place.type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with enhanced styling */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Explore Indonesian Places</h1>
          <p className="text-lg text-gray-600">Discover authentic Indonesian experiences near you</p>
        </div>

        {/* Search and Filters with improved styling */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12 transition-all duration-300 hover:shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Places
              </label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort Results
              </label>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="rating">Highest Rated</option>
                <option value="distance">Nearest First</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
          </div>
        ) : (
          /* Places Grid with enhanced styling */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaces.length > 0 ? (
              filteredPlaces.map(place => (
                <Link 
                  to={`/place/${place.id}`} 
                  key={place.id} 
                  className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Image Container with carousel */}
                  <div className="relative h-64 overflow-hidden bg-gray-200">
                    {place.imageURLs && place.imageURLs.length > 0 ? (
                      <>
                        <img 
                          src={place.imageURLs[activeImageIndexes[place.id]]} 
                          alt={`${place.name} - Image ${activeImageIndexes[place.id] + 1}`}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            console.error('Image load error:', {
                              placeId: place.id,
                              placeName: place.name,
                              imageUrl: place.imageURLs[activeImageIndexes[place.id]],
                              imageIndex: activeImageIndexes[place.id]
                            });
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
                          }}
                        />
                        {place.imageURLs.length > 1 && (
                          <>
                            {/* Previous button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handlePrevImage(e, place.id);
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            {/* Next button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleNextImage(e, place.id, place.imageURLs.length - 1);
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            {/* Image counter */}
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                              {activeImageIndexes[place.id] + 1}/{place.imageURLs.length}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">No image available</span>
                      </div>
                    )}
                    {/* Type Badge */}
                    <span className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700">
                      {place.type}
                    </span>
                  </div>

                  <div className="p-6">
                    {/* Title and Rating */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary-600 transition-colors">
                        {place.name}
                      </h3>
                      <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="font-semibold text-gray-700">{place.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2">{place.description}</p>

                    {/* Location and Contact */}
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-1">{place.address}</span>
                      </div>
                      {place.contact && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{place.contact}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleViewOnMap(place.address);
                        }}
                        className="text-primary-500 hover:text-primary-600 font-medium flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Map
                      </button>
                      <span className="text-primary-500 font-medium flex items-center">
                        View Details
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-16">
                <div className="text-gray-500 text-lg">No places found matching your criteria</div>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                  }}
                  className="mt-4 text-primary-500 hover:text-primary-600 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore; 