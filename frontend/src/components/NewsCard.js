import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NewsCard = ({ news }) => {
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
    >
      <div className="relative aspect-video">
        <img
          src={news.images?.[0] || '/images/news-placeholder.jpg'}
          alt={news.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
          {news.category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {truncateText(news.title, 60)}
        </h3>
        
        <p className="text-gray-600 mb-4 text-sm">
          {truncateText(news.content, 120)}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {new Date(news.createdAt).toLocaleDateString()}
          </span>
          <Link
            to={`/news/${news.id}`}
            className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
          >
            Read More →
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsCard; 