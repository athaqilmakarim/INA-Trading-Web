import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NewsService from '../services/NewsService';
import { format, parseISO } from 'date-fns';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsData = await NewsService.getAllNews();
        setNews(newsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Latest News</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((item) => (
          <Link
            key={item.id}
            to={`/news/${item.id}`}
            className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden bg-gray-100">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = '/placeholder-news.jpg'; // Add a placeholder image
                    e.target.className = 'w-full h-full object-contain p-4';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-white text-sm">
                  {formatDate(item.createdAt)}
                </p>
              </div>
            </div>
            <div className="p-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-200 line-clamp-2">
                {item.title}
              </h2>
              {item.subtitle && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.subtitle}
                </p>
              )}
              <p className="text-gray-500 text-sm line-clamp-3">
                {item.summary}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {news.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No news articles available.</p>
        </div>
      )}
    </div>
  );
};

export default NewsList; 