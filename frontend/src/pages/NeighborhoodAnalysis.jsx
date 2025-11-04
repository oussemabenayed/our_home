import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Car, Footprints, School, Hospital, ShoppingCart, Coffee, Bus, Dumbbell, Search, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NeighborhoodAnalysis = () => {
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [error, setError] = useState('');

  const amenityTypes = [
    { 
      key: 'education', 
      icon: School, 
      color: 'text-blue-600', 
      name: 'Education',
      tags: ['school', 'kindergarten', 'university', 'college']
    },
    { 
      key: 'healthcare', 
      icon: Hospital, 
      color: 'text-red-600', 
      name: 'Healthcare',
      tags: ['hospital', 'clinic', 'doctors', 'pharmacy', 'dentist']
    },
    { 
      key: 'shopping', 
      icon: ShoppingCart, 
      color: 'text-green-600', 
      name: 'Shopping',
      tags: ['supermarket', 'marketplace', 'bazaar', 'convenience', 'shopping_centre', 'general']
    },
    { 
      key: 'religious', 
      icon: MapPin, 
      color: 'text-indigo-600', 
      name: 'Religious',
      tags: ['mosque', 'place_of_worship']
    },
    { 
      key: 'dining', 
      icon: Coffee, 
      color: 'text-orange-600', 
      name: 'Dining',
      tags: ['restaurant', 'cafe', 'fast_food', 'bar']
    },

    { 
      key: 'fitness', 
      icon: Dumbbell, 
      color: 'text-indigo-600', 
      name: 'Fitness',
      tags: ['gym', 'fitness_centre', 'sports_centre', 'swimming_pool']
    },
    { 
      key: 'others', 
      icon: MapPin, 
      color: 'text-gray-600', 
      name: 'Others',
      tags: []
    }
  ];

  const geocodeAddress = async (address) => {
    try {
      const apiStart = performance.now();
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const apiEnd = performance.now();
      console.log(`  📡 Geocoding API call: ${((apiEnd - apiStart) / 1000).toFixed(2)}s`);
      
      const data = await response.json();
      
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
  };

  const fetchAllAmenities = async (lat, lng) => {
    try {
      const overpassQuery = `
        [out:json][timeout:30];
        (
          node["amenity"](around:1500,${lat},${lng});
          way["amenity"](around:1500,${lat},${lng});
          relation["amenity"](around:1500,${lat},${lng});
        );
        out center meta;
      `;

      const apiStart = performance.now();
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      const apiEnd = performance.now();
      console.log(`📡 All amenities API call: ${((apiEnd - apiStart) / 1000).toFixed(2)}s`);

      const data = await response.json();
      console.log(`📊 Total amenities found: ${data.elements.length}`);
      
      // Log all unique amenity tags found
      const allTags = data.elements
        .map(element => element.tags?.amenity)
        .filter(tag => tag)
        .sort();
      const uniqueTags = [...new Set(allTags)];
      console.log(`🏷️ All amenity tags found (${uniqueTags.length}):`, uniqueTags);
      
      return data.elements.map(element => ({
        id: element.id,
        name: element.tags?.name || element.tags?.brand || 'Unknown',
        lat: element.lat || element.center?.lat,
        lng: element.lon || element.center?.lon,
        amenityTag: element.tags?.amenity
      })).filter(item => item.lat && item.lng && item.amenityTag);
    } catch (error) {
      console.error('Error fetching amenities:', error);
      return [];
    }
  };

  const filterAmenitiesByCategory = (allAmenities, amenityCategory) => {
    if (amenityCategory.key === 'others') {
      const usedTags = amenityTypes
        .filter(type => type.key !== 'others')
        .flatMap(type => type.tags);
      
      return allAmenities
        .filter(amenity => !usedTags.includes(amenity.amenityTag))
        .slice(0, 8)
        .map(amenity => ({
          ...amenity,
          type: amenityCategory.key,
          name: amenity.name || amenity.amenityTag || 'Other'
        }));
    }
    
    return allAmenities
      .filter(amenity => amenityCategory.tags.includes(amenity.amenityTag))
      .slice(0, 8)
      .map(amenity => ({
        ...amenity,
        type: amenityCategory.key,
        name: amenity.name || amenityCategory.name
      }));
  };

  const calculateTravelTime = (fromLat, fromLng, toLat, toLng, mode = 'foot') => {
    const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
    const distanceKm = distance / 1000;
    
    if (mode === 'foot') {
      return Math.round(distanceKm * 24); // 24 minutes per km walking (2.5 km/h)
    } else {
      return Math.round(distanceKm * 6); // 6 minutes per km driving in city (10 km/h)
    }
  };

  const handleSearch = async () => {
    if (!address.trim()) return;

    const startTime = performance.now();
    console.log('🚀 Starting neighborhood analysis...');

    setLoading(true);
    setError('');
    setAmenities([]);

    try {
      // Geocode address
      const geocodeStart = performance.now();
      const coords = await geocodeAddress(address);
      const geocodeEnd = performance.now();
      console.log(`📍 Geocoding completed: ${((geocodeEnd - geocodeStart) / 1000).toFixed(2)}s`);
      setCoordinates(coords);

      // Fetch all amenities in single API call
      const amenityFetchStart = performance.now();
      const rawAmenities = await fetchAllAmenities(coords.lat, coords.lng);
      const amenityFetchEnd = performance.now();
      console.log(`🎯 All amenities fetched: ${((amenityFetchEnd - amenityFetchStart) / 1000).toFixed(2)}s`);

      // Filter and process amenities by category
      const allAmenities = [];
      const processingStart = performance.now();
      
      for (const amenityType of amenityTypes) {
        const typeStart = performance.now();
        const nearbyPlaces = filterAmenitiesByCategory(rawAmenities, amenityType);
        const typeEnd = performance.now();
        console.log(`🏢 ${amenityType.name} filtered: ${((typeEnd - typeStart) / 1000).toFixed(3)}s (${nearbyPlaces.length} found)`);
        
        const travelTimeStart = performance.now();
        for (const place of nearbyPlaces) {
          const distance = calculateDistance(coords.lat, coords.lng, place.lat, place.lng);
          
          // Only process places within reasonable distance
          if (distance <= 2000) {
            const walkTime = calculateTravelTime(coords.lat, coords.lng, place.lat, place.lng, 'foot');
            const driveTime = calculateTravelTime(coords.lat, coords.lng, place.lat, place.lng, 'car');
            
            allAmenities.push({
              ...place,
              walkTime,
              driveTime,
              distance
            });
          }
        }
        const travelTimeEnd = performance.now();
        console.log(`⏱️ ${amenityType.name} travel times calculated: ${((travelTimeEnd - travelTimeStart) / 1000).toFixed(3)}s`);
      }

      const processingEnd = performance.now();
      console.log(`⚡ Client-side processing: ${((processingEnd - processingStart) / 1000).toFixed(2)}s`);

      setAmenities(allAmenities);
      
      const totalTime = performance.now();
      console.log(`✅ Analysis completed: ${((totalTime - startTime) / 1000).toFixed(2)}s total`);
    } catch (err) {
      const errorTime = performance.now();
      console.log(`❌ Analysis failed after: ${((errorTime - startTime) / 1000).toFixed(2)}s`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 1000); // Distance in meters
  };

  const groupedAmenities = amenityTypes.map(type => ({
    ...type,
    places: amenities
      .filter(amenity => amenity.type === type.key)
      .sort((a, b) => a.distance - b.distance) // Sort by distance
      .slice(0, 5) // Limit to 5 closest
  }));

  return (
    <div className="min-h-screen pt-32 pb-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('neighborhood.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('neighborhood.subtitle')}
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-xl mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('neighborhood.search_placeholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !address.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {loading ? t('common.loading') : t('neighborhood.analyze')}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </motion.div>

        {/* Results Section */}
        {coordinates && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {groupedAmenities.map((category) => (
              <div key={category.key} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <category.icon className={`w-6 h-6 ${category.color}`} />
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                </div>
                
                {category.places.length > 0 ? (
                  <div className="space-y-3">
                    {category.places.map((place) => (
                      <div key={place.id} className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">{place.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{place.distance}m</span>
                          </div>
                          {place.walkTime && (
                            <div className="flex items-center gap-1">
                              <Footprints className="w-4 h-4" />
                              <span>{place.walkTime}min</span>
                            </div>
                          )}
                          {place.driveTime && (
                            <div className="flex items-center gap-1">
                              <Car className="w-4 h-4" />
                              <span>{place.driveTime}min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">{t('neighborhood.no_amenities')}</p>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-white p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('neighborhood.how_it_works')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Search className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">{t('neighborhood.step1_title')}</h4>
              <p className="text-sm text-gray-600">{t('neighborhood.step1_desc')}</p>
            </div>
            <div className="text-center">
              <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">{t('neighborhood.step2_title')}</h4>
              <p className="text-sm text-gray-600">{t('neighborhood.step2_desc')}</p>
            </div>
            <div className="text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">{t('neighborhood.step3_title')}</h4>
              <p className="text-sm text-gray-600">{t('neighborhood.step3_desc')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NeighborhoodAnalysis;