import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { MapHelper } from '../utils/MapHelper';
import { useAuth } from '../context/AuthContext';
import AddPromo from '../components/Promo/AddPromo';
import PromoList from '../components/Promo/PromoList';
import { promoService } from '../services/PromoService';
import { motion, AnimatePresence } from 'framer-motion';

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
          const data = placeDoc.data();
          // Handle both imageURLs and legacy images field
          const images = data.imageURLs || data.images || [];
          setPlace({
            id: placeDoc.id,
            ...data,
            imageURLs: images
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

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading place details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!place) return null;

  const isOwner = currentUser?.uid === place.ownerId;

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm text-gray-600">
          <span className="hover:text-red-600 cursor-pointer" onClick={() => window.history.back()}>Places</span>
          <span className="mx-2">›</span>
          <span className="text-red-600">{place.name}</span>
        </div>

        {/* Header */}
        <motion.div 
          className="mb-8"
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{place.name}</h1>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  {place.type}
                </span>
                {isOwner && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Owner
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          {/* Image Gallery */}
          <div className="relative h-[500px] bg-gray-200">
            <AnimatePresence mode="wait">
              {place?.imageURLs && place.imageURLs.length > 0 ? (
                <motion.img 
                  key={activeImageIndex}
                  src={place.imageURLs[activeImageIndex]} 
                  alt={`${place.name} - Image ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => {
                    console.error('Image load error:', {
                      placeId: place.id,
                      placeName: place.name,
                      imageUrl: place.imageURLs[activeImageIndex],
                      imageIndex: activeImageIndex
                    });
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/800x400?text=No+Image+Available';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </AnimatePresence>

            {place?.imageURLs && place.imageURLs.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-colors transform hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-colors transform hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {place.imageURLs.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === activeImageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <nav className="container mx-auto px-6 -mb-px flex gap-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-6 text-sm font-medium relative transition-colors ${
                  activeTab === 'details'
                    ? 'text-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Details
                {activeTab === 'details' && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                    layoutId="activeTab"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('promos')}
                className={`py-4 px-6 text-sm font-medium relative transition-colors ${
                  activeTab === 'promos'
                    ? 'text-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Promotions
                {activeTab === 'promos' && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                    layoutId="activeTab"
                  />
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'details' ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="prose max-w-none">
                    <p className="text-lg text-gray-700 leading-relaxed">{place.description}</p>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-600">{place.address}</span>
                      </div>
                      <button
                        onClick={handleViewOnMap}
                        className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        View on Map
                      </button>
                    </div>

                    {place.contact && (
                      <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-red-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-gray-600">{place.contact}</span>
                        </div>
                        <a
                          href={`tel:${place.contact}`}
                          className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Call Now
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="promos"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {isOwner && !showAddPromo && (
                    <motion.div 
                      className="mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <button
                        onClick={() => setShowAddPromo(true)}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New Promotion
                      </button>
                    </motion.div>
                  )}

                  {showAddPromo && (
                    <motion.div 
                      className="mb-6"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <AddPromo
                        placeId={id}
                        onSuccess={handleAddPromoSuccess}
                        onCancel={() => setShowAddPromo(false)}
                      />
                    </motion.div>
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PlaceDetails; 