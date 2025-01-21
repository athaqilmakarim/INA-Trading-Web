import React, { useEffect, useRef, useState } from 'react';

const AddressAutocomplete = ({ onAddressSelect, placeholder = "Enter address...", initialValue = "" }) => {
  const inputRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFromDropdown, setSelectedFromDropdown] = useState(true);
  const [value, setValue] = useState(initialValue);

  // Update value when initialValue changes
  useEffect(() => {
    setValue(initialValue);
    setSelectedFromDropdown(!!initialValue);
  }, [initialValue]);

  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true);
        setError(null);
        initAutocomplete();
      } else if (window.gm_authFailure) {
        setError('Google Maps authentication failed. Please check API key configuration.');
      } else {
        setTimeout(checkGoogleMapsLoaded, 100);
      }
    };

    const initAutocomplete = () => {
      if (!inputRef.current) return;

      try {
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          fields: ['formatted_address', 'geometry'],
          types: ['address']
        });

        // Remove the old pac-container if it exists
        const oldContainer = document.querySelector('.pac-container');
        if (oldContainer) {
          oldContainer.remove();
        }

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          
          if (place.formatted_address) {
            setSelectedFromDropdown(true);
            setValue(place.formatted_address);
            onAddressSelect(place.formatted_address);
          } else {
            setSelectedFromDropdown(false);
            setError('Please select an address from the dropdown suggestions');
          }
        });

        // Style the dropdown
        const observer = new MutationObserver((mutations) => {
          const pacContainer = document.querySelector('.pac-container');
          if (pacContainer) {
            pacContainer.style.zIndex = '10000';
            pacContainer.style.marginTop = '2px';
            pacContainer.style.borderRadius = '0.375rem';
            pacContainer.style.border = '1px solid #e5e7eb';
            pacContainer.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            pacContainer.style.backgroundColor = 'white';
            // Make dropdown items more visible on dark background
            const items = pacContainer.querySelectorAll('.pac-item');
            items.forEach(item => {
              item.style.color = '#1f2937';
              item.style.padding = '8px 12px';
            });
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        return () => observer.disconnect();
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
        setError('Error initializing address autocomplete');
      }
    };

    checkGoogleMapsLoaded();

    return () => {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer) {
        pacContainer.remove();
      }
    };
  }, [onAddressSelect]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    setSelectedFromDropdown(false);
    if (newValue === '') {
      onAddressSelect('');
    }
    setError(null);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={isLoaded ? placeholder : "Loading address autocomplete..."}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${error ? 'border-red-500' : ''}`}
        autoComplete="off"
        disabled={!isLoaded}
      />
      {!isLoaded && !error && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      {error && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
      {!selectedFromDropdown && value && !error && (
        <div className="text-blue-500 text-sm mt-1">Please select an address from the dropdown suggestions</div>
      )}
    </div>
  );
};

export default AddressAutocomplete; 