import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NewsService from '../services/NewsService';
import { format, parseISO } from 'date-fns';

const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsData = await NewsService.getNewsById(id);
        setNews(newsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return '';
      const date = parseISO(dateString);
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-gray-600">News article not found</div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === news.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? news.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link to="/" className="hover:text-red-600">Home</Link>
          </li>
          <li>›</li>
          <li>
            <Link to="/news" className="hover:text-red-600">News</Link>
          </li>
          <li>›</li>
          <li className="text-gray-900 font-medium truncate">{news.title}</li>
        </ol>
      </nav>

      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{news.title}</h1>
        <h2 className="text-xl text-gray-600 mb-4">{news.subtitle}</h2>
        <p className="text-gray-500">
          {formatDate(news.createdAt)}
        </p>
      </div>

      {/* Image Carousel */}
      {news.images && news.images.length > 0 && (
        <div className="relative mb-8 bg-gray-100 rounded-xl overflow-hidden">
          <div className="h-[300px] md:h-[400px] lg:h-[500px] relative">
            <img
              src={news.images[currentImageIndex]}
              alt={`${news.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.src = '/placeholder-news.jpg';
                e.target.className = 'w-full h-full object-contain p-4';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
          </div>
          
          {news.images.length > 1 && (
            <>
              <button
                onClick={previousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full hover:bg-black/75 transition-all duration-300 flex items-center justify-center text-2xl"
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full hover:bg-black/75 transition-all duration-300 flex items-center justify-center text-2xl"
              >
                ›
              </button>
              
              {/* Thumbnails */}
              <div className="flex justify-center gap-2 p-4 bg-white border-t">
                {news.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentImageIndex ? 'border-red-600 scale-105' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="prose max-w-none">
        <p className="text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
          {news.content}
        </p>
      </div>
    </div>
  );
};

export default NewsDetail; 