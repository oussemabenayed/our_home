import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Car, Footprints, School, Hospital, ShoppingCart, Coffee, Dumbbell, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Backendurl } from '../App';

const NeighborhoodAnalysis = ({ propertyId }) => {
  const { t } = useTranslation();
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const amenityTypes = [
    { 
      key: 'education', 
      icon: School, 
      color: 'text-blue-600', 
      name: t('neighborhood.education'),
      tags: ['school', 'kindergarten', 'university', 'college']
    },
    { 
      key: 'healthcare', 
      icon: Hospital, 
      color: 'text-red-600', 
      name: t('neighborhood.healthcare'),
      tags: ['hospital', 'clinic', 'doctors', 'pharmacy', 'dentist']
    },
    { 
      key: 'shopping', 
      icon: ShoppingCart, 
      color: 'text-green-600', 
      name: t('neighborhood.shopping'),
      tags: ['supermarket', 'marketplace', 'bazaar', 'convenience', 'shopping_centre', 'general']
    },
    { 
      key: 'dining', 
      icon: Coffee, 
      color: 'text-orange-600', 
      name: t('neighborhood.dining'),
      tags: ['restaurant', 'cafe', 'fast_food', 'bar']
    },
    { 
      key: 'fitness', 
      icon: Dumbbell, 
      color: 'text-indigo-600', 
      name: t('neighborhood.fitness'),
      tags: ['gym', 'fitness_centre', 'sports_centre', 'swimming_pool']
    },
    { 
      key: 'others', 
      icon: MapPin, 
      color: 'text-gray-600', 
      name: t('neighborhood.others'),
      tags: []
    }
  ];

  useEffect(() => {
    fetchNeighborhoodData();
  }, [propertyId]);

  const fetchNeighborhoodData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Backendurl}/api/products/neighborhood/${propertyId}`);
      
      if (response.data.success) {
        setAmenities(response.data.amenities || []);
      } else {
        setError('Failed to load neighborhood data');
      }
    } catch (err) {
      console.error('Error fetching neighborhood data:', err);
      setError('Failed to load neighborhood analysis');
    } finally {
      setLoading(false);
    }
  };

  const filterAmenitiesByCategory = (amenityCategory) => {
    if (amenityCategory.key === 'others') {
      const usedTags = amenityTypes
        .filter(type => type.key !== 'others')
        .flatMap(type => type.tags);
      
      return amenities
        .filter(amenity => !usedTags.includes(amenity.amenityTag))
        .slice(0, 5);
    }
    
    return amenities
      .filter(amenity => amenityCategory.tags.includes(amenity.amenityTag))
      .slice(0, 5);
  };

  const groupedAmenities = amenityTypes
    .map(type => ({
      ...type,
      places: filterAmenitiesByCategory(type)
    }))
    .filter(category => category.places.length > 0); // Only show categories with results

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">{t('neighborhood.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            onClick={fetchNeighborhoodData}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {t('neighborhood.try_again')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('neighborhood.title')}</h3>
        <p className="text-gray-600 text-sm">{t('neighborhood.subtitle')}</p>
      </div>

      <div className="p-6">
        {groupedAmenities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedAmenities.map((category) => (
              <div key={category.key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <category.icon className={`w-5 h-5 ${category.color}`} />
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <span className="text-xs text-gray-500">({category.places.length})</span>
                </div>
                
                <div className="space-y-2">
                  {category.places.map((place) => (
                    <div key={place.id} className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 text-sm mb-1">
                        {place.name}
                      </h5>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{place.distance}m</span>
                        </div>
                        {place.walkTime && (
                          <div className="flex items-center gap-1">
                            <Footprints className="w-3 h-3" />
                            <span>{place.walkTime}min</span>
                          </div>
                        )}
                        {place.driveTime && (
                          <div className="flex items-center gap-1">
                            <Car className="w-3 h-3" />
                            <span>{place.driveTime}min</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>{t('neighborhood.no_amenities')}</p>
          </div>
        )}


      </div>
    </motion.div>
  );
};

export default NeighborhoodAnalysis;