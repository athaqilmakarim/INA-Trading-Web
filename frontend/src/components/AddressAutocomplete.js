import React, { useEffect, useRef, useState } from 'react';

const AddressAutocomplete = ({ onAddressSelect, placeholder = "Enter address...", initialValue = "" }) => {
  const inputRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFromDropdown, setSelectedFromDropdown] = useState(true);
  const [value, setValue] = useState(initialValue);

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
          fields: ['formatted_address'],
          types: ['address'],
        });

        // Remove the old pac-container if it exists
        const oldContainer = document.querySelector('.pac-container');
        if (oldContainer) {
          oldContainer.remove();
        }

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          console.log('Selected place:', place);

          if (place.formatted_address) {
            setSelectedFromDropdown(true);
            onAddressSelect(place.formatted_address);
          } else {
            setSelectedFromDropdown(false);
            setError('Please select an address from the dropdown suggestions');
          }
        });

        // Ensure the dropdown appears above everything
        const observer = new MutationObserver((mutations) => {
          const pacContainer = document.querySelector('.pac-container');
          if (pacContainer) {
            pacContainer.style.zIndex = '10000';
            pacContainer.style.marginTop = '2px';
            pacContainer.style.borderRadius = '0.375rem';
            pacContainer.style.border = '1px solid #e5e7eb';
            pacContainer.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            pacContainer.style.backgroundColor = 'white';
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

    // Add global error handler for Google Maps
    window.gm_authFailure = () => {
      setError('Google Maps authentication failed. Please check API key configuration.');
    };

    checkGoogleMapsLoaded();

    return () => {
      // Cleanup
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer) {
        pacContainer.remove();
      }
      // Remove global error handler
      delete window.gm_authFailure;
    };
  }, [onAddressSelect]);

  const handleInputChange = (e) => {
    setValue(e.target.value);
    if (e.target.value === '') {
      setSelectedFromDropdown(false);
      onAddressSelect(''); // Clear the address when input is cleared
    }
    setError(null);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={isLoaded ? placeholder : "Loading address autocomplete..."}
        className={`w-full px-4 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${error ? 'border-red-500' : ''}`}
        autoComplete="off"
        disabled={!isLoaded}
        onChange={handleInputChange}
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
      {!selectedFromDropdown && inputRef.current?.value && !error && (
        <div className="text-blue-500 text-sm mt-1">Please select an address from the dropdown suggestions</div>
      )}
    </div>
  );
};

export default AddressAutocomplete; 