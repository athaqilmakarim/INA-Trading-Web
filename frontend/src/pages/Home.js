import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { firestore } from '../firebase';
import { placeService } from '../services/PlaceService';
import NewsService from '../services/NewsService';
import { motion } from 'framer-motion';
import NewsCard from '../components/NewsCard';

const workflowSteps = [
  { 
    title: "Sign Up",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
  },
  { 
    title: "Upload",
    icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
  },
  { 
    title: "Sales",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
  }
];

const features = [
  {
    title: "INAPAS",
    description: "Manage and Control Your Digital Identity to Access Various Services",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
  },
  {
    title: "INAKU",
    description: "Access Various Government Services through one integrated portal INAku",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
  },
  {
    title: "UKM BOX Fulfillment Center",
    description: "Worldwide Warehouse & Distribution / Supply Chain",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
  },
  {
    title: "International Marketplace",
    description: "Online Stores in multiple countries",
    icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
  },
  {
    title: "Digital Promotion",
    description: "Digital Promotion on Social Media",
    icon: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
  },
  {
    title: "Finance Technology",
    description: "Use of FinTech such as QRIS, Tokens & Crypto for payments in various countries",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  },
  {
    title: "Artificial Intelligence",
    description: "AI for managing Supply Chain and Buyer Big Data",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
  },
  {
    title: "Blockchain",
    description: "Digital Security and Blockchain to ensure the AUTHENTICITY of Indonesian Products",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
  }
];


const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  const [promos, setPromos] = useState([]);
  const [news, setNews] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMottoVisible, setIsMottoVisible] = useState(true);
  const [isExamplesVisible, setIsExamplesVisible] = useState(false);

  const slides = [
    {
      title: "PLATFORM B2B B2C - PERURI",
      subtitle: "Platform Ekspor untuk UKM, Koperasi & Industri untuk B2B & B2C bagi Aggregator, Eksportir & Importir.",
      image: "/images/hero-bg.jpg" // Make sure to add this image
    },
    {
      title: "Connecting Global Markets",
      subtitle: "Empowering Indonesian Businesses to Reach International Markets",
      image: "/images/hero-bg-2.jpg" // Make sure to add this image
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const setupInitialData = async () => {
      try {
        setIsLoading(true);
        const placesData = await placeService.getApprovedPlaces();
        setPlaces(placesData || []);

        const newsData = await NewsService.getAllNews();
        const latestNews = newsData
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        setNews(latestNews);

        setIsLoading(false);
      } catch (error) {
        console.error('Error in setupInitialData:', error);
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[90vh] overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-black/80"
        />
        
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center"
        >
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6"
            >
              {slides[currentSlide].title}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/90 mb-8"
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                to="/about"
                className="inline-block bg-red-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-red-700 transition-colors duration-300"
              >
                About
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Slide Navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-red-600 w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How INA TRADING Works</h2>
            <div className="max-w-3xl mx-auto space-y-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                INA Trading is a Domestic & International Trade Ecosystem to help SMEs, COOPERATIVES & INDUSTRIES conduct Export, Logistics, Fulfillment, Promotion, Marketing & Sales Abroad.
              </p>
              <p className="text-gray-600 leading-relaxed">
                A facility for SMEs, COOPERATIVES & INDUSTRIES to support the Micro, Small, and Medium Enterprises Innovation Ready, Export Adaptation Ready (MSME CAN Export) Program from the MINISTRY OF TRADE to help Aggregators find Buyers abroad.
              </p>
              <p className="text-gray-600 leading-relaxed">
                SMEs, Cooperatives, Industries, Importers & Aggregators can conduct direct transactions with Importers, Distributors, Shops, Boutiques, Cafes, Restaurants, and Aggregators located in various countries.
              </p>
              
              <div className="mt-8">
                <button 
                  onClick={() => setIsExamplesVisible(!isExamplesVisible)}
                  className="flex items-center justify-between w-full px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <span className="text-lg font-semibold text-gray-900">For example:</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${isExamplesVisible ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: isExamplesVisible ? "auto" : 0,
                    opacity: isExamplesVisible ? 1 : 0
                  }}
                  transition={{
                    height: { duration: 0.3, ease: "easeOut" },
                    opacity: { duration: 0.2, ease: "easeInOut" }
                  }}
                  className="overflow-hidden"
                >
                  <motion.div 
                    className="mt-4 space-y-4 bg-white p-6 rounded-lg shadow-sm"
                    animate={{
                      y: isExamplesVisible ? 0 : -10
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut"
                    }}
                  >
                    <p className="text-gray-600">
                      A lives in Milan, Italy, and wants to eat at a Restaurant that serves Soto Ayam (Indonesian Chicken Soup) and Teh Botol (Indonesian Bottled Tea). A can simply use the Search feature to find Restaurants in Milan, Italy that sell Soto Ayam and Teh Botol.
                    </p>
                    <p className="text-gray-600">
                      B has a cassava chips product in Boyolali, while C lives in Tokyo, Japan. C can order the cassava chips directly from Boyolali to Tokyo.
                    </p>
                    <p className="text-gray-600">
                      D owns a Shop in Madrid, Spain selling ABC Soy Sauce, and E who lives in Barcelona can order directly from D.
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Workflow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              </motion.div>
            ))}
          </div>

  
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Facilities & Features</h2>
            <p className="text-gray-600 text-lg">
              Features & Facilities available in INA TRADING both Domestically & Internationally
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center bg-white rounded-2xl p-8 shadow-sm"
          >
            <p className="text-gray-600 text-lg mb-4">
              INA TRADING, as part of INA DIGITAL, is the Integrated Digital Services Ecosystem Provider for the Indonesian Government. As part of PERURI, we are here to create higher quality, trustworthy, and efficient public services, carrying out the Government's mandate in accordance with Presidential Regulation No. 82 of 2023.
            </p>
            <p className="text-gray-600 text-lg">
              INA Trading is a Domestic & International Trade Ecosystem to help SMEs, COOPERATIVES, INDUSTRIES, EXPORTERS, and AGGREGATORS conduct Export, Logistics, Fulfillment, Promotion, Marketing & Sales Abroad.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured News Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest News</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest news, updates, and insights about Indonesian trade and business opportunities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item, index) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/news"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-red-700 transition-colors duration-300"
            >
              View All News
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home; 