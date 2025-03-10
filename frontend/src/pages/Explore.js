import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapHelper } from '../utils/MapHelper';
import { placeService } from '../services/PlaceService';
import { LocationHelper } from '../utils/LocationHelper';

const Explore = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSort, setSelectedSort] = useState('rating');
  const [activeImageIndexes, setActiveImageIndexes] = useState({});
  const [location, setLocation] = useState('Detecting...');
  const [userCity, setUserCity] = useState(null);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const filterPlacesByLocation = async (places, userLocation) => {
    if (!userLocation || !places.length) {
      console.log('No location or places to filter:', { userLocation, placesCount: places.length });
      return places;
    }

    console.log('Filtering places with user location:', {
      userAddress: userLocation.formatted_address,
      userLocality: userLocation.locality,
      userState: userLocation.administrative_area_level_1,
      userPostcode: userLocation.postal_code
    });

    const filteredPlaces = [];
    for (const place of places) {
      try {
        console.log(`Checking place: ${place.name}, Address: ${place.address}`);
        const isInSameArea = await LocationHelper.isInSameMetropolitanArea(
          userLocation.formatted_address,
          place.address
        );
        console.log(`Result for ${place.name}: ${isInSameArea ? 'Match' : 'No match'}`);
        
        if (isInSameArea) {
          filteredPlaces.push(place);
        }
      } catch (error) {
        console.error('Error checking location match:', {
          placeName: place.name,
          placeAddress: place.address,
          error: error.message
        });
        // If there's an error checking the location, include the place to avoid filtering it out
        filteredPlaces.push(place);
      }
    }

    console.log(`Filtered ${places.length} places down to ${filteredPlaces.length} places`);
    return filteredPlaces;
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const locationData = await LocationHelper.getCurrentLocation();
        console.log('Location data in component:', locationData);
        
        // Handle the location data properly
        setLocation(locationData.formatted_address || 'Location found but address unavailable');
        setUserCity(locationData.locality || null);
        setCurrentLocation(locationData);
        setLocationLoaded(true);
      } catch (err) {
        console.error('Error in component:', err);
        setLocation(err.message || 'Location not available');
        setLocationLoaded(true);
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch places first
        const placesData = await placeService.getApprovedPlaces();
        
        // If we have location data, filter places
        if (currentLocation && currentLocation.formatted_address) {
          const filteredPlaces = await filterPlacesByLocation(placesData, currentLocation);
          setPlaces(filteredPlaces);
        } else {
          // If no location data, show all places
          setPlaces(placesData);
        }

      } catch (error) {
        console.error('Error in fetchPlaces:', error);
        setError(error.message);
        // If location fails, still show all places
        const placesData = await placeService.getApprovedPlaces();
        setPlaces(placesData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, [currentLocation]); // Only re-run when currentLocation changes

  const handleViewOnMap = (address) => {
    MapHelper.openInMaps(address);
  };

  const handlePrevImage = (e, placeId) => {
    e.preventDefault();
    setActiveImageIndexes((prev) => ({
      ...prev,
      [placeId]: prev[placeId] > 0 ? prev[placeId] - 1 : 0
    }));
  };

  const handleNextImage = (e, placeId, maxIndex) => {
    e.preventDefault();
    setActiveImageIndexes((prev) => ({
      ...prev,
      [placeId]: prev[placeId] < maxIndex ? prev[placeId] + 1 : maxIndex
    }));
  };

  const filteredPlaces = places.filter((place) => {
    const matchesSearch =
      place.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === 'all' ||
      place.type?.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Explore Indonesian Places
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Discover authentic Indonesian experiences near you
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md space-x-2 text-gray-600">
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-gray-800 font-medium">
              {location === 'Detecting...' ? (
                <span className="flex items-center">
                  <span className="animate-pulse">Detecting location</span>
                  <span className="animate-bounce ml-1">...</span>
                </span>
              ) : (
                location
              )}
            </span>
          </div>
        </div>

        {/* Search and Filters */}
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
          /* Places Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaces.length > 0 ? (
              filteredPlaces.map((place) => {
                // Safely handle images array
                const images = place.imageURLs || place.images || [];
                const activeIndex = activeImageIndexes[place.id] || 0;

                return (
                  <Link
                    to={`/place/${place.id}`}
                    key={place.id}
                    className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Image Container with carousel */}
                    <div className="relative h-64 overflow-hidden bg-gray-200">
                      {images && images.length > 0 ? (
                        <>
                          <img
                            src={images[activeIndex]}
                            alt={`${place.name || 'Place'} - Image ${activeIndex + 1}`}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              console.error('Image load error:', {
                                placeId: place.id,
                                placeName: place.name,
                                imageUrl: images[activeIndex],
                                imageIndex: activeIndex
                              });
                              e.target.onerror = null;
                              e.target.src =
                                'https://via.placeholder.com/400x300?text=No+Image+Available';
                            }}
                          />
                          {images.length > 1 && (
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
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                              </button>
                              {/* Next button */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleNextImage(e, place.id, images.length - 1);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                              {/* Image counter */}
                              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                                {activeIndex + 1}/{images.length}
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
                        {place.type || 'Unknown'}
                      </span>
                    </div>

                    <div className="p-6">
                      {/* Title and Rating */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary-600 transition-colors">
                          {place.name || 'Unnamed Place'}
                        </h3>
                        <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="font-semibold text-gray-700">
                            {place.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {place.description || 'No description available'}
                      </p>

                      {/* Location and Contact */}
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="line-clamp-1">{place.address || 'Address not available'}</span>
                        </div>
                        {place.contact && (
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-2 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
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
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                          </svg>
                          Map
                        </button>
                        <span className="text-primary-500 font-medium flex items-center">
                          View Details
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-16">
                <div className="text-gray-500 text-lg">
                  No places found matching your criteria
                </div>
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
