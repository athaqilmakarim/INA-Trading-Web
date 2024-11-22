import React, { useEffect, useState } from 'react';

const mottos = [
  "Connecting Indonesian Businesses",
  "Discover Authentic Indonesian Products",
  "Your Gateway to Indonesian Trade",
  "Building Global Business Bridges"
];

const AnimatedMotto = () => {
  const [currentMottoIndex, setCurrentMottoIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentMottoIndex((prevIndex) => 
          prevIndex === mottos.length - 1 ? 0 : prevIndex + 1
        );
        setIsVisible(true);
      }, 500);
      
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-[120px] flex items-center justify-center overflow-hidden bg-gradient-to-r from-primary-50 to-secondary-50 py-8">
      <p
        className={`
          text-3xl md:text-4xl lg:text-5xl font-bold text-center
          bg-gradient-to-r from-primary-600 to-secondary-700 bg-clip-text text-transparent
          transition-all duration-500 ease-in-out px-4
          ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-8'}
        `}
      >
        {mottos[currentMottoIndex]}
      </p>
    </div>
  );
};

export default AnimatedMotto; 