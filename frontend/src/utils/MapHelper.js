import { requireGoogleMapsApiKey } from '../config/appConfig';

export const MapHelper = {
  openInMaps: (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  },

  getCoordinates: async (address) => {
    try {
      const apiKey = requireGoogleMapsApiKey();
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch coordinates');
      }

      const data = await response.json();
      
      if (data.results && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        console.log('Coordinates found:', { lat, lng });
        return { latitude: lat, longitude: lng };
      }
      
      console.warn('No coordinates found, using default location');
      // Default to Jakarta coordinates if no results
      return { latitude: -6.2088, longitude: 106.8456 };
    } catch (error) {
      console.error('Error getting coordinates:', error);
      // Return default coordinates in case of error
      return { latitude: -6.2088, longitude: 106.8456 };
    }
  }
}; 
