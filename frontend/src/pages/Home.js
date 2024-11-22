import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { firestore } from '../firebase';
import { placeService } from '../services/PlaceService';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  const [promos, setPromos] = useState([]);
  const [news, setNews] = useState([]);
  const [currentMottoIndex, setCurrentMottoIndex] = useState(0);

  const mottos = [
    "Connecting You to Indonesian Culture",
    "Discover Authentic Indonesian Experiences",
    "Your Gateway to Indonesian Heritage",
    "Experience Indonesia Worldwide"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMottoIndex((prev) => (prev + 1) % mottos.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [mottos.length]);

  useEffect(() => {
    const setupInitialData = async () => {
      try {
        setIsLoading(true);
        console.log('Starting to fetch data...');

        // Use PlaceService to fetch approved places
        const placesData = await placeService.getApprovedPlaces();
        console.log('Fetched places data:', placesData);
        
        if (!placesData || placesData.length === 0) {
          console.log('No approved places found');
        }
        
        setPlaces(placesData || []);

        // Fetch promos (if you have any)
        try {
          const promosRef = collection(firestore, 'promos');
          const promosSnapshot = await getDocs(promosRef);
          const promosData = promosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('Promos data:', promosData);
          setPromos(promosData);
        } catch (error) {
          console.log('No promos collection yet:', error);
          setPromos([]);
        }

        // Set sample news
        const sampleNews = [
          {
            id: '1',
            title: "New Indonesian Restaurant",
            description: "Grand opening of Warung Nusantara",
            date: "15 Nov 2024",
            imageURL: "news1"
          },
          {
            id: '2',
            title: "Cultural Exhibition",
            description: "Indonesian artifacts showcase",
            date: "20 Nov 2024",
            imageURL: "news2"
          }
        ];
        setNews(sampleNews);

      } catch (error) {
        console.error('Error in setupInitialData:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setupInitialData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Motto */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 transition-all duration-500">
              {mottos[currentMottoIndex]}
            </h1>
            <p className="text-lg opacity-90">
              Discover authentic Indonesian experiences and connect with local businesses
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* News Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Latest News</h2>
            <Link to="/news" className="text-red-600 hover:text-red-700 flex items-center">
              View All <span className="ml-1">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.map(item => (
              <div key={item.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {item.imageURL && (
                  <div className="h-48 bg-gray-200">
                    <img 
                      src={item.imageURL} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600 mb-3">{item.description}</p>
                  <span className="text-sm text-gray-500">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Promos Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Featured Promos</h2>
            <Link to="/promos" className="text-red-600 hover:text-red-700 flex items-center">
              View All <span className="ml-1">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map(promo => (
              <div key={promo.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                      {promo.discountPercentage}% OFF
                    </span>
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{promo.title}</h3>
                  <p className="text-gray-600">{promo.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Places Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Indonesian Places</h2>
            <Link to="/explore" className="text-red-600 hover:text-red-700 flex items-center">
              Explore All <span className="ml-1">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.length > 0 ? (
              places.map(place => (
                <div key={place.id} 
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 text-gray-700">{place.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <Link 
                        to={`/place/${place.id}`}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <div className="text-gray-500">No places available yet</div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home; 