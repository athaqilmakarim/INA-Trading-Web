import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { MapHelper } from '../utils/MapHelper';
import { useAuth } from '../context/AuthContext';
import AddPromo from '../components/Promo/AddPromo';
import PromoList from '../components/Promo/PromoList';
import { promoService } from '../services/PromoService';

const PlaceDetails = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promos, setPromos] = useState([]);
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);

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

  useEffect(() => {
    const fetchPromos = async () => {
      if (!id) return;
      
      try {
        setIsLoadingPromos(true);
        const promosList = await promoService.getPlacePromos(id);
        setPromos(promosList);
      } catch (err) {
        console.error('Error fetching promos:', err);
      } finally {
        setIsLoadingPromos(false);
      }
    };

    fetchPromos();
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

  const handleAddPromoSuccess = async () => {
    setShowAddPromo(false);
    // Refresh promos list
    const updatedPromos = await promoService.getPlacePromos(id);
    setPromos(updatedPromos);
  };

  const handleDeletePromo = async (promoId) => {
    try {
      await promoService.deletePromo(promoId);
      // Refresh promos list
      const updatedPromos = await promoService.getPlacePromos(id);
      setPromos(updatedPromos);
    } catch (err) {
      console.error('Error deleting promo:', err);
    }
  };

  if (isLoading) {
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

  if (!place) return null;

  const isOwner = currentUser?.uid === place.ownerId;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{place.name}</h1>
          <p className="text-gray-600 mt-2">{place.type}</p>
        </div>

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
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">No images available</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('promos')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'promos'
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Promotions
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'details' ? (
              <>
                <div className="prose max-w-none">
                  <p>{place.description}</p>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 bg-gray-50 rounded-xl p-4">
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

                <div className="mt-8">
                  <button
                    onClick={handleViewOnMap}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    View on Map
                  </button>
                </div>
              </>
            ) : (
              <div>
                {isOwner && !showAddPromo && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowAddPromo(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Add New Promotion
                    </button>
                  </div>
                )}

                {showAddPromo && (
                  <div className="mb-6">
                    <AddPromo
                      placeId={id}
                      onSuccess={handleAddPromoSuccess}
                      onCancel={() => setShowAddPromo(false)}
                    />
                  </div>
                )}

                {isLoadingPromos ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                  </div>
                ) : (
                  <PromoList
                    promos={promos}
                    onDelete={isOwner ? handleDeletePromo : undefined}
                    showActions={isOwner}
                  />
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