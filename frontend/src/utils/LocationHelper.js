import { Loader } from '@googlemaps/js-api-loader';
import { requireGoogleMapsApiKey } from '../config/appConfig';

export class LocationHelper {
  static async initGoogleMaps() {
    const loader = new Loader({
      apiKey: requireGoogleMapsApiKey(),
      version: "weekly",
      libraries: ["places", "geocoding"]
    });
    
    await loader.load();
    return window.google;
  }

  static async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const locationDetails = await this.getLocationDetails(latitude, longitude);
            resolve(locationDetails);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  static async getLocationDetails(latitude, longitude) {
    const google = await this.initGoogleMaps();
    const geocoder = new google.maps.Geocoder();
    
    try {
      const response = await geocoder.geocode({
        location: { lat: latitude, lng: longitude }
      });

      if (!response.results || response.results.length === 0) {
        throw new Error('No results found');
      }

      const result = response.results[0];
      const components = this.parseAddressComponents(result.address_components);
      
      // Get the major city and suburb
      let displayCity = '';
      
      // For Australian addresses
      if (components.country === 'Australia') {
        // Map major Australian cities to their metropolitan areas
        const metroAreas = {
          'New South Wales': 'Sydney',
          'Victoria': 'Melbourne',
          'Queensland': 'Brisbane',
          'Western Australia': 'Perth',
          'South Australia': 'Adelaide'
        };
        
        // If in a major metropolitan area, use the major city name
        if (components.administrative_area_level_1 in metroAreas) {
          displayCity = metroAreas[components.administrative_area_level_1];
        }
      }
      
      // If not in a mapped Australian metro area, use the standard city detection
      if (!displayCity) {
        // Try to get the major city name from locality or administrative area
        displayCity = components.locality || 
                     components.administrative_area_level_2 || 
                     'Unknown City';
      }
      
      return {
        formatted_address: `${displayCity}, ${components.country}`,
        coordinates: { latitude, longitude },
        locality: components.locality,
        country: components.country,
        // Keep these for metropolitan area checking
        administrative_area_level_1: components.administrative_area_level_1,
        administrative_area_level_2: components.administrative_area_level_2,
        postal_code: components.postal_code
      };
    } catch (error) {
      console.error('Error getting location details:', error);
      throw error;
    }
  }

  static parseAddressComponents(components = []) {
    const parsed = {
      street_number: '',
      route: '',
      sublocality: '',
      locality: '',
      administrative_area_level_2: '',
      administrative_area_level_1: '',
      country: '',
      postal_code: ''
    };

    if (!components) return parsed;

    components.forEach(component => {
      const type = component.types[0];
      if (parsed.hasOwnProperty(type)) {
        parsed[type] = component.long_name;
      }
    });

    return parsed;
  }

  static async isInSameMetropolitanArea(address1, address2) {
    const google = await this.initGoogleMaps();
    const geocoder = new google.maps.Geocoder();

    try {
      const [result1, result2] = await Promise.all([
        geocoder.geocode({ address: address1 }),
        geocoder.geocode({ address: address2 })
      ]);

      if (!result1.results[0] || !result2.results[0]) {
        return false;
      }

      const location1 = {
        components: this.parseAddressComponents(result1.results[0].address_components),
        coords: result1.results[0].geometry.location
      };

      const location2 = {
        components: this.parseAddressComponents(result2.results[0].address_components),
        coords: result2.results[0].geometry.location
      };

      // Check if locations are in the same metropolitan area using multiple criteria
      return this.checkMetropolitanMatch(location1, location2);
    } catch (error) {
      console.error('Error comparing locations:', error);
      return false;
    }
  }

  static checkMetropolitanMatch(location1, location2) {
    // First check: If they're in the same locality (city), they're definitely in the same metro area
    if (location1.components.locality && location2.components.locality && 
        location1.components.locality === location2.components.locality) {
      return true;
    }

    // Second check: If they're in the same administrative area level 2 (usually county/district) and state
    if (location1.components.administrative_area_level_2 && location2.components.administrative_area_level_2 &&
        location1.components.administrative_area_level_2 === location2.components.administrative_area_level_2 &&
        location1.components.administrative_area_level_1 === location2.components.administrative_area_level_1) {
      return true;
    }

    // Third check: If they're in the same state/province and within 50km of each other
    if (location1.components.administrative_area_level_1 === location2.components.administrative_area_level_1) {
      const distance = this.calculateDistance(
        location1.coords.lat(), location1.coords.lng(),
        location2.coords.lat(), location2.coords.lng()
      );
      // 50km is a reasonable distance for most metropolitan areas
      return distance <= 50;
    }

    return false;
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  static deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  static isLocationInMetro(location, criteria) {
    // Check state/province if specified
    if (criteria.state && 
        location.administrative_area_level_1 !== criteria.state) {
      return false;
    }

    // Check postal code prefix if specified
    if (criteria.postalCodePrefix && 
        location.postal_code && 
        !location.postal_code.startsWith(criteria.postalCodePrefix)) {
      return false;
    }

    // Check if location is in any of the specified regions
    return criteria.regions.some(region => 
      location.locality === region ||
      location.sublocality === region ||
      location.administrative_area_level_2 === region
    );
  }

  static openInMaps(address) {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  }
} 
