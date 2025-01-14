export const LocationHelper = {
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      console.log('Starting location detection...');
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      console.log('API Key available:', !!apiKey);
      
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log('Browser location received:', position.coords);
          const { latitude, longitude } = position.coords;
          
          try {
            // Try to get the location name using Nominatim (OpenStreetMap) service
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'Accept-Language': 'en-US,en;q=0.9',
                  'User-Agent': 'INA-Trading-Web-App'
                }
              }
            );
            const data = await response.json();
            console.log('Location data:', data);

            if (data.address) {
              const address = data.address;
              const city = address.city || address.town || address.village || address.suburb || '';
              const country = address.country || '';
              const shortFormat = [city, country].filter(Boolean).join(', ');
              
              resolve({
                coords: { latitude, longitude },
                address: {
                  locality: city,
                  state: address.state || 'Unknown',
                  country: country,
                  formatted: shortFormat || 'Location unavailable'
                }
              });
            } else {
              throw new Error('No address found');
            }
          } catch (error) {
            console.error('Error getting location name:', error);
            // Fallback to coordinates if location name lookup fails
            resolve({
              coords: { latitude, longitude },
              address: {
                formatted: 'Location unavailable',
                locality: 'Unknown',
                state: 'Unknown',
                country: 'Unknown'
              }
            });
          }
        },
        (error) => {
          console.error('Browser geolocation error:', error);
          switch(error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Please allow location access to see places near you'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information is unavailable'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out'));
              break;
            default:
              reject(new Error('An unknown error occurred getting your location'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }
}; 