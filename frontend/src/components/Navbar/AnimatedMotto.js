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
      setIsVisible(false); // Start fade out
      
      setTimeout(() => {
        setCurrentMottoIndex((prevIndex) => 
          prevIndex === mottos.length - 1 ? 0 : prevIndex + 1
        );
        setIsVisible(true); // Start fade in
      }, 500); // Wait for fade out to complete
      
    }, 4000); // Change motto every 4 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="h-6 flex items-center justify-center overflow-hidden">
      <p
        className={`
          text-sm text-secondary-600
          transition-all duration-500 ease-in-out
          ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}
        `}
      >
        {mottos[currentMottoIndex]}
      </p>
    </div>
  );
};

export default AnimatedMotto; 