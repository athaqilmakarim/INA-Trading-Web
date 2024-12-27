import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { MapHelper } from '../utils/MapHelper';

const PlaceDetails = () => {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setIsLoading(true);
        const placeDoc = await getDoc(doc(firestore, 'places', id));
        
        if (placeDoc.exists()) {
          setPlace({
            id: placeDoc.id,
            ...placeDoc.data(),
            imageURLs: placeDoc.data().imageURLs || []
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

  const handlePrevImage = () => {
    setActiveImageIndex(prev => (prev > 0 ? prev - 1 : place.imageURLs.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex(prev => (prev < place.imageURLs.length - 1 ? prev + 1 : 0));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-2xl font-bold text-gray-800 mb-4">😕</div>
        <div className="text-gray-600 mb-6">{error || 'Place not found'}</div>
        <Link to="/" className="text-primary-500 hover:text-primary-600 font-medium">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 group"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Explore
        </Link>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="relative h-96 bg-gray-200">
            {place.imageURLs && place.imageURLs.length > 0 ? (
              <>
                <img 
                  src={place.imageURLs[activeImageIndex]} 
                  alt={`${place.name} - Image ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/800x400?text=No+Image+Available';
                  }}
                />
                {place.imageURLs.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {/* Thumbnail Navigation */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {place.imageURLs.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === activeImageIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">No images available</span>
              </div>
            )}
          </div>

          <div className="p-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <div className="flex items-center mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{place.name}</h1>
                  <span className="ml-4 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {place.type}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="font-semibold text-gray-700">{place.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  {place.type.toLowerCase() === 'restaurant' && place.menu && (
                    <span className="text-gray-500 text-sm">
                      {place.menu.length} Menu Items
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleViewOnMap}
                className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                View on Map
              </button>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-600">{place.address}</span>
              </div>
              {place.contact && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600">{place.contact}</span>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex space-x-8">
                <button
                  className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'details'
                      ? 'border-primary-500 text-primary-500'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                {place.type.toLowerCase() === 'restaurant' && (
                  <button
                    className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
                      activeTab === 'menu'
                        ? 'border-primary-500 text-primary-500'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('menu')}
                  >
                    Menu
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' ? (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About {place.name}</h2>
                <p className="text-gray-600 leading-relaxed">{place.description}</p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu Items</h2>
                {place.menu && place.menu.length > 0 ? (
                  <div className="grid gap-6">
                    {place.menu.map((item, index) => (
                      <div 
                        key={item.id || index} 
                        className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                            <p className="text-gray-600">{item.description}</p>
                          </div>
                          <div className="text-primary-500 font-semibold text-lg">
                            Rp {item.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-gray-500">No menu items available</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails; 