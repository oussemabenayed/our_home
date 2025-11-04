import Neighborhood from '../models/neighborhoodModel.js';
import axios from 'axios';

class NeighborhoodService {
  
  generateAmenityName(tags) {
    // Try multiple name fields
    const name = tags?.name || 
                 tags?.brand || 
                 tags?.operator || 
                 tags?.shop || 
                 tags?.cuisine;
    
    if (name && name !== 'yes') {
      return name;
    }
    
    // Generate descriptive names based on amenity type
    const amenityType = tags?.amenity;
    const amenityNames = {
      restaurant: 'Restaurant',
      cafe: 'Café',
      school: 'School',
      hospital: 'Hospital',
      pharmacy: 'Pharmacy',
      bank: 'Bank',
      atm: 'ATM',
      fuel: 'Gas Station',
      parking: 'Parking',
      post_office: 'Post Office',
      police: 'Police Station',
      fire_station: 'Fire Station',
      library: 'Library',
      place_of_worship: 'Place of Worship',
      clinic: 'Medical Clinic',
      dentist: 'Dental Clinic',
      veterinary: 'Veterinary Clinic',
      kindergarten: 'Kindergarten',
      university: 'University',
      college: 'College',
      fast_food: 'Fast Food',
      bar: 'Bar',
      pub: 'Pub',
      marketplace: 'Market',
      supermarket: 'Supermarket',
      convenience: 'Convenience Store',
      bakery: 'Bakery',
      butcher: 'Butcher Shop',
      hairdresser: 'Hair Salon',
      beauty_salon: 'Beauty Salon',
      gym: 'Gym',
      fitness_centre: 'Fitness Center',
      swimming_pool: 'Swimming Pool',
      cinema: 'Cinema',
      theatre: 'Theatre',
      museum: 'Museum',
      townhall: 'Town Hall',
      community_centre: 'Community Center'
    };
    
    return amenityNames[amenityType] || null;
  }

  async geocodeAddress(address) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      const response = await axios.get(url);
      const data = response.data;
      
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      throw new Error('Address not found');
    } catch (error) {
      throw new Error('Failed to geocode address');
    }
  }

  async fetchAmenities(lat, lng) {
    try {
      const overpassQuery = `
        [out:json][timeout:15];
        (
          node["amenity"](around:1000,${lat},${lng});
          way["amenity"](around:1000,${lat},${lng});
        );
        out center meta;
      `;

      const response = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
        headers: {
          'Content-Type': 'text/plain'
        },
        timeout: 10000 // 10 second timeout
      });
      
      const data = response.data;
      
      // Check if response is valid JSON
      if (!data || !data.elements) {
        console.warn('Invalid response from Overpass API, using fallback data');
        return this.getFallbackAmenities(lat, lng);
      }
      
      return data.elements.map(element => {
        const name = this.generateAmenityName(element.tags);
        
        // Only include amenities with meaningful names
        if (!name) return null;
        
        return {
          id: element.id,
          name: name,
          lat: element.lat || element.center?.lat,
          lng: element.lon || element.center?.lon,
          amenityTag: element.tags?.amenity
        };
      }).filter(item => item && item.lat && item.lng && item.amenityTag && item.name);
    } catch (error) {
      console.error('Error fetching amenities:', error.message);
      // Return fallback data instead of empty array
      return this.getFallbackAmenities(lat, lng);
    }
  }

  getFallbackAmenities(lat, lng) {
    // Return some basic amenities as fallback when API fails
    return [
      {
        id: 'fallback_1',
        name: 'Local Market',
        lat: lat + 0.002,
        lng: lng + 0.002,
        amenityTag: 'marketplace'
      },
      {
        id: 'fallback_2', 
        name: 'Pharmacy',
        lat: lat + 0.001,
        lng: lng - 0.001,
        amenityTag: 'pharmacy'
      },
      {
        id: 'fallback_3',
        name: 'School',
        lat: lat - 0.001,
        lng: lng + 0.001,
        amenityTag: 'school'
      },
      {
        id: 'fallback_4',
        name: 'Restaurant',
        lat: lat + 0.0005,
        lng: lng + 0.0005,
        amenityTag: 'restaurant'
      }
    ];
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 1000); // Distance in meters
  }

  calculateTravelTime(distance, mode = 'foot') {
    const distanceKm = distance / 1000;
    if (mode === 'foot') {
      return Math.round(distanceKm * 24); // 24 minutes per km walking
    } else {
      return Math.round(distanceKm * 6); // 6 minutes per km driving
    }
  }

  async analyzeNeighborhood(propertyId, location, coordinates) {
    try {
      // Check if we have recent data (less than 30 days old)
      const existingData = await Neighborhood.findOne({ 
        propertyId,
        expiresAt: { $gt: new Date() }
      });

      // If coordinates changed, delete old data to force refresh
      if (existingData && coordinates && 
          (Math.abs(existingData.coordinates.lat - coordinates.lat) > 0.001 || 
           Math.abs(existingData.coordinates.lng - coordinates.lng) > 0.001)) {
        await Neighborhood.findOneAndDelete({ propertyId });
      } else if (existingData) {
        return existingData.amenities;
      }

      // Get coordinates if not provided
      let coords = coordinates;
      if (!coords || !coords.lat || !coords.lng) {
        try {
          coords = await this.geocodeAddress(location);
        } catch (geocodeError) {
          console.warn('Geocoding failed, using default coordinates for Tunisia');
          coords = { lat: 36.8065, lng: 10.1815 }; // Tunis coordinates as fallback
        }
      }

      // Fetch amenities (will return fallback data if API fails)
      const rawAmenities = await this.fetchAmenities(coords.lat, coords.lng);

      // Process amenities
      const processedAmenities = rawAmenities
        .map(amenity => {
          const distance = this.calculateDistance(coords.lat, coords.lng, amenity.lat, amenity.lng);
          if (distance <= 2000) { // Only include amenities within 2km
            return {
              ...amenity,
              distance,
              walkTime: this.calculateTravelTime(distance, 'foot'),
              driveTime: this.calculateTravelTime(distance, 'car')
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 50); // Limit to 50 closest amenities

      // Validate and clean amenities data
      const validAmenities = processedAmenities.filter(amenity => 
        amenity && 
        typeof amenity.id !== 'undefined' && 
        typeof amenity.name === 'string' &&
        typeof amenity.lat === 'number' &&
        typeof amenity.lng === 'number'
      );

      // Save to database
      await Neighborhood.findOneAndUpdate(
        { propertyId },
        {
          propertyId,
          location,
          coordinates: coords,
          amenities: validAmenities,
          lastUpdated: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        { upsert: true, new: true }
      );

      return validAmenities;
    } catch (error) {
      console.error('Error analyzing neighborhood:', error.message);
      // Return empty array instead of throwing error to prevent property creation failure
      return [];
    }
  }

  async getNeighborhoodData(propertyId) {
    try {
      const data = await Neighborhood.findOne({ 
        propertyId,
        expiresAt: { $gt: new Date() }
      });
      return data ? data.amenities : null;
    } catch (error) {
      console.error('Error getting neighborhood data:', error);
      return null;
    }
  }
}

export default new NeighborhoodService();