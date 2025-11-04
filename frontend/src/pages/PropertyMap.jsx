import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Backendurl } from '../App';
import { MapPin, Search, Filter, Info, X, Play, ChevronRight, Target, Home } from 'lucide-react';
import '../styles/PropertyMap.css';

// Leaflet CSS
const leafletCSS = `
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
`;

// Add Leaflet CSS to head
if (typeof document !== 'undefined') {
  document.head.insertAdjacentHTML('beforeend', leafletCSS);
}

const PropertyMap = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchRadius, setSearchRadius] = useState(3);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Pre-defined coordinates for common Tunisia locations
  const locationCoords = {
    'tunis': { lat: 36.8065, lng: 10.1815 },
    'sfax': { lat: 34.7406, lng: 10.7603 },
    'sousse': { lat: 35.8256, lng: 10.636 },
    'monastir': { lat: 35.7643, lng: 10.826 },
    'bizerte': { lat: 37.2744, lng: 9.8739 },
    'gabes': { lat: 33.8815, lng: 10.0982 },
    'kairouan': { lat: 35.6781, lng: 10.0963 },
    'mahdia': { lat: 35.5047, lng: 11.0622 },
    'nabeul': { lat: 36.456, lng: 10.7376 },
    'hammamet': { lat: 36.4, lng: 10.6167 },
    'ariana': { lat: 36.8625, lng: 10.1647 },
    'manouba': { lat: 36.8089, lng: 10.0969 },
    'ben arous': { lat: 36.7544, lng: 10.2181 },
    'la marsa': { lat: 36.8778, lng: 10.3247 },
    'sidi bou said': { lat: 36.8697, lng: 10.3475 },
    'carthage': { lat: 36.8531, lng: 10.3294 },
    'medenine': { lat: 33.3549, lng: 10.5055 },
    'tozeur': { lat: 33.9197, lng: 8.1335 },
    'gafsa': { lat: 34.425, lng: 8.7842 },
    'kasserine': { lat: 35.1674, lng: 8.8363 }
  };

  // Fast coordinate lookup
  const getCoordinates = (location) => {
    const key = location.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    
    // Direct match
    if (locationCoords[key]) return locationCoords[key];
    
    // Partial match
    for (const [city, coords] of Object.entries(locationCoords)) {
      if (key.includes(city) || city.includes(key)) {
        return coords;
      }
    }
    
    // Default to Tunis if no match
    return locationCoords.tunis;
  };

  // Handle browser navigation events
  useEffect(() => {
    const handlePopState = () => {
      // Force component remount on browser back/forward
      window.location.reload();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize map with location key dependency
  useEffect(() => {
    const initializeMap = () => {
      if (typeof window !== 'undefined' && window.L && mapRef.current) {
        // Clean up existing map
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        
        // Clear container
        mapRef.current.innerHTML = '';
        
        const L = window.L;
        const mapInstance = L.map(mapRef.current).setView([34.0, 9.0], 7);
        
        // Satellite imagery layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri, Maxar, Earthstar Geographics',
          maxZoom: 18
        }).addTo(mapInstance);
        
        // Clear labels layer for better readability
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
          attribution: '© CARTO',
          subdomains: 'abcd',
          maxZoom: 18,
          opacity: 0.9
        }).addTo(mapInstance);
        
        mapInstance.on('click', function(e) {
          mapInstance.closePopup();
        });
        
        mapInstanceRef.current = mapInstance;
        setMap(mapInstance);
      }
    };
    
    if (window.L) {
      initializeMap();
    } else {
      // Load Leaflet dynamically
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      document.head.appendChild(script);
    }
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [location.key]);

  // Add property markers to map
  useEffect(() => {
    if (map && properties.length > 0 && window.L) {
      // Clear existing markers
      markers.forEach(marker => {
        try {
          map.removeLayer(marker);
        } catch (e) {
          // Ignore errors if marker already removed
        }
      });
      
      const newMarkers = [];
      const L = window.L;
      
      properties.forEach((property) => {
        // Use exact coordinates if available, otherwise fallback to location lookup
        const coords = property.latitude && property.longitude 
          ? { lat: parseFloat(property.latitude), lng: parseFloat(property.longitude) }
          : getCoordinates(property.location);
          
        const marker = L.marker([coords.lat, coords.lng]).addTo(map);
        
        const popupContent = `
          <div style="width: 200px;">
            <img src="${property.image[0]}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px;" />
            <h3 style="margin: 8px 0 4px 0; font-size: 14px; font-weight: bold;">${property.title}</h3>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">${property.location}</p>
            <p style="margin: 4px 0; font-size: 14px; font-weight: bold; color: #2563eb;">${Number(property.price).toLocaleString()} TND</p>
            <button onclick="window.showPropertyDetails('${property._id}')" style="width: 100%; padding: 6px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 8px;">View Details</button>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        
        marker.on('click', function(e) {
          L.DomEvent.stopPropagation(e);
        });
        newMarkers.push(marker);
      });
      
      setMarkers(newMarkers);
    }
    
    // Cleanup markers on unmount
    return () => {
      markers.forEach(marker => {
        try {
          if (map) map.removeLayer(marker);
        } catch (e) {
          // Ignore cleanup errors
        }
      });
    };
  }, [map, properties]);

  // Global function to show property details
  useEffect(() => {
    window.showPropertyDetails = (propertyId) => {
      const property = properties.find(p => p._id === propertyId);
      if (property) {
        setSelectedProperty(property);
      }
    };
  }, [properties]);

  const tunisiaLocations = [
    'Tunis Centre-Ville',
    'La Marsa',
    'Sidi Bou Said',
    'Carthage',
    'Ariana',
    'Manouba',
    'Ben Arous',
    'Sfax Centre',
    'Sousse Médina',
    'Monastir',
    'Mahdia',
    'Kairouan',
    'Bizerte',
    'Nabeul',
    'Hammamet',
    'Gabès',
    'Médenine',
    'Tozeur',
    'Gafsa',
    'Kasserine'
  ];

  const tutorialSteps = [
    {
      title: t('map.tutorial.step1_title'),
      description: t('map.tutorial.step1_desc'),
      target: 'search-input'
    },
    {
      title: t('map.tutorial.step2_title'),
      description: t('map.tutorial.step2_desc'),
      target: 'radius-slider'
    },
    {
      title: t('map.tutorial.step3_title'),
      description: t('map.tutorial.step3_desc'),
      target: 'map-container'
    },
    {
      title: t('map.tutorial.step4_title'),
      description: t('map.tutorial.step4_desc'),
      target: 'property-list'
    }
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Backendurl}/api/products/list`);
      if (response.data.success) {
        setProperties(response.data.property);
        setFilteredProperties(response.data.property);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = () => {
    if (!selectedLocation.trim()) {
      setFilteredProperties(properties);
      setIsSearchActive(false);
      return;
    }

    setIsSearchActive(true);
    // Simple location-based filtering (in real app, use geocoding API)
    const filtered = properties.filter(property => {
      const distance = Math.random() * 10; // Mock distance calculation
      return distance <= searchRadius;
    });
    
    setFilteredProperties(filtered);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setShowSuggestions(false);
  };

  const filteredSuggestions = tunisiaLocations.filter(location =>
    location.toLowerCase().includes(selectedLocation.toLowerCase())
  );

  const startTutorial = () => {
    setShowTutorial(true);
    setTutorialStep(0);
  };

  const nextTutorialStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      setTutorialStep(0);
    }
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    setTutorialStep(0);
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('map.title')}</h1>
              <p className="text-gray-600 mt-1">{t('map.subtitle')}</p>
            </div>
            <button
              onClick={startTutorial}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Play size={16} className="mr-2" />
              {t('map.start_tutorial')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Map Container - Full Width */}
        <div className="w-full">
            <div id="map-container" className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-[70vh] relative">
                <div ref={mapRef} className="w-full h-full rounded-lg" style={{zIndex: 1}}></div>
                
                {/* Map Info Overlay */}
                <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
                  <div className="text-sm font-semibold text-gray-800">
                    {properties.length} {t('map.properties')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {t('map.click_pins')}
                  </div>
                </div>
              </div>
            </div>

          {/* Property Details Modal */}
          {selectedProperty && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
              <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                <div className="relative">
                  <img
                    src={selectedProperty.image[0]}
                    alt={selectedProperty.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{selectedProperty.title}</h3>
                  <p className="text-gray-600 flex items-center mb-4">
                    <MapPin size={16} className="mr-2" />
                    {selectedProperty.location}
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    {Number(selectedProperty.price).toLocaleString()} TND
                  </p>
                  <p className="text-gray-700 mb-4">{selectedProperty.description}</p>
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>{selectedProperty.beds} beds</span>
                    <span>{selectedProperty.baths} baths</span>
                    <span>{selectedProperty.sqft} sqft</span>
                  </div>
                  <a 
                    href={`/properties/single/${selectedProperty._id}`}
                    className="block w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors text-center"
                  >
                    {t('properties.view_details')}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{tutorialSteps[tutorialStep].title}</h3>
                <p className="text-sm text-gray-500">
                  {t('map.tutorial.step')} {tutorialStep + 1} {t('map.tutorial.of')} {tutorialSteps.length}
                </p>
              </div>
              <button onClick={closeTutorial} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">{tutorialSteps[tutorialStep].description}</p>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === tutorialStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextTutorialStep}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {tutorialStep === tutorialSteps.length - 1 ? t('map.tutorial.finish') : t('common.next')}
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyMap;