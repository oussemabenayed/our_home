import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Backendurl } from '../App';
import { Upload, X, Home, MapPin, DollarSign, Camera, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PROPERTY_TYPES = ['house', 'apartment', 'office', 'villa', 'land'];
const AVAILABILITY_TYPES = ['rent', 'buy'];
const AMENITIES = ['lake_view', 'fireplace', 'central_heating', 'dock', 'pool', 'garage', 'garden', 'gym', 'security_system', 'master_bathroom', 'guest_bathroom', 'home_theater', 'exercise_room', 'covered_parking', 'internet_ready'];

const PropertyForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    price: '',
    location: '',
    latitude: '',
    longitude: '',
    description: '',
    beds: '',
    baths: '',
    sqft: '',
    phone: '',
    availability: '',
    amenities: [],
    images: []
  });

  const [showMapPicker, setShowMapPicker] = useState(false);
  const mapInstanceRef = React.useRef(null);
  const currentMarkerRef = React.useRef(null);
  const mapInitialized = React.useRef(false);
  const initTimeoutRef = React.useRef(null);
  const [selectedCoords, setSelectedCoords] = useState(null);

  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: 'Basic Info', icon: Home },
    { id: 2, title: 'Details', icon: MapPin },
    { id: 3, title: 'Pricing', icon: DollarSign },
    { id: 4, title: 'Images', icon: Camera }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + previewUrls.length > 4) {
      alert('Maximum 4 images allowed');
      return;
    }

    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = t('validation.title_required');
        if (!formData.description.trim()) newErrors.description = t('validation.description_required');
        if (!formData.type) newErrors.type = t('validation.type_required');
        if (!formData.availability) newErrors.availability = t('validation.availability_required');
        break;
      case 2:
        if (!formData.location.trim()) newErrors.location = t('validation.location_required');
        if (!formData.beds || formData.beds < 0) newErrors.beds = t('validation.beds_required');
        if (!formData.baths || formData.baths < 0) newErrors.baths = t('validation.baths_required');
        if (!formData.sqft || formData.sqft < 0) newErrors.sqft = t('validation.sqft_required');
        break;
      case 3:
        if (!formData.price || formData.price <= 0) newErrors.price = t('validation.price_required');
        if (!formData.phone.trim()) newErrors.phone = t('validation.phone_required');
        break;
      case 4:
        if (formData.images.length === 0) newErrors.images = t('validation.images_required');
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) {
      return;
    }
    
    setLoading(true);
  
    try {
      const formdata = new FormData();
      formdata.append('title', formData.title);
      formdata.append('type', formData.type);
      formdata.append('price', formData.price);
      formdata.append('location', formData.location);
      formdata.append('latitude', formData.latitude);
      formdata.append('longitude', formData.longitude);
      formdata.append('description', formData.description);
      formdata.append('beds', formData.beds);
      formdata.append('baths', formData.baths);
      formdata.append('sqft', formData.sqft);
      formdata.append('phone', formData.phone);
      formdata.append('availability', formData.availability);
      formdata.append('amenities', formData.amenities);
      formData.images.forEach((image, index) => {
        formdata.append(`image${index + 1}`, image);
      });

      const response = await axios.post(`${Backendurl}/api/products/add`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
          title: '',
          type: '',
          price: '',
          location: '',
          latitude: '',
          longitude: '',
          description: '',
          beds: '',
          baths: '',
          sqft: '',
          phone: '',
          availability: '',
          amenities: [],
          images: []
        });
        setSelectedCoords(null);
        setPreviewUrls([]);
        toast.success('Property added successfully');
        navigate('/user/properties');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error adding property:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-800 mb-2">
                {t('admin.property_title')}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.title ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="Enter property title..."
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-2">
                {t('admin.description')}
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                  errors.description ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="Describe your property..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-gray-800 mb-2">
                  {t('admin.property_type')}
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.type ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">{t('admin.select_type')}</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>
                      {t(`filters.${type}`)}
                    </option>
                  ))}
                </select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
              </div>

              <div>
                <label htmlFor="availability" className="block text-sm font-semibold text-gray-800 mb-2">
                  {t('properties.availability')}
                </label>
                <select
                  id="availability"
                  name="availability"
                  required
                  value={formData.availability}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.availability ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">{t('admin.select_availability')}</option>
                  {AVAILABILITY_TYPES.map(type => (
                    <option key={type} value={type}>
                      {t(`filters.${type}`)}
                    </option>
                  ))}
                </select>
                {errors.availability && <p className="text-red-500 text-sm mt-1">{errors.availability}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {t('properties.filter_by_location')}
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.location ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Enter property address..."
                />
                <button
                  type="button"
                  onClick={() => {
                    console.log('🔄 Opening map picker');
                    setShowMapPicker(true);
                  }}
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center"
                >
                  <MapPin size={16} className="mr-2" />
                  {selectedCoords ? t('map.update_location') : t('map.pick_location')}
                </button>
                {selectedCoords && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <strong>📍 Location Selected:</strong>
                    </div>
                    <div className="mt-1 font-mono text-xs">
                      Lat: {selectedCoords.lat.toFixed(6)}<br/>
                      Lng: {selectedCoords.lng.toFixed(6)}
                    </div>
                  </div>
                )}
              </div>
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="beds" className="block text-sm font-semibold text-gray-800 mb-2">
                  {t('properties.bedrooms')}
                </label>
                <input
                  type="number"
                  id="beds"
                  name="beds"
                  required
                  min="0"
                  value={formData.beds}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.beds ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.beds && <p className="text-red-500 text-sm mt-1">{errors.beds}</p>}
              </div>

              <div>
                <label htmlFor="baths" className="block text-sm font-semibold text-gray-800 mb-2">
                  {t('properties.bathrooms')}
                </label>
                <input
                  type="number"
                  id="baths"
                  name="baths"
                  required
                  min="0"
                  value={formData.baths}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.baths ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.baths && <p className="text-red-500 text-sm mt-1">{errors.baths}</p>}
              </div>

              <div>
                <label htmlFor="sqft" className="block text-sm font-semibold text-gray-800 mb-2">
                  {t('properties.sqft')}
                </label>
                <input
                  type="number"
                  id="sqft"
                  name="sqft"
                  required
                  min="0"
                  value={formData.sqft}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.sqft ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.sqft && <p className="text-red-500 text-sm mt-1">{errors.sqft}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-4">
                {t('properties.amenities')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AMENITIES.map(amenity => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      formData.amenities.includes(amenity)
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t(`amenities.${amenity}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-gray-800 mb-2">
                {t('property_card.price')} (TND)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-2xl font-bold ${
                  errors.price ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="0"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">
                {t('admin.contact_phone')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="+216 12 345 678"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-4">
                {t('admin.property_images')} (Max 4)
              </label>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-40 w-full object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              {previewUrls.length < 4 && (
                <div className={`border-2 border-dashed rounded-xl p-8 text-center hover:border-blue-400 transition-colors ${
                  errors.images ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}>
                  <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <label htmlFor="images" className="cursor-pointer">
                    <span className="text-lg font-medium text-blue-600 hover:text-blue-700">
                      {t('admin.upload_images')}
                    </span>
                    <input
                      id="images"
                      name="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">{t('admin.image_format')}</p>
                </div>
              )}
              {errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Map picker component
  const MapPicker = () => {
    console.log('🗺️ MapPicker render - showMapPicker:', showMapPicker, 'mapInitialized:', mapInitialized.current);
    
    React.useEffect(() => {
      console.log('🔄 useEffect triggered - showMapPicker:', showMapPicker, 'mapInitialized:', mapInitialized.current);
      if (!showMapPicker || mapInitialized.current) {
        console.log('❌ useEffect early return');
        return;
      }
      
      const initMap = () => {
        console.log('🎯 initMap called');
        const container = document.getElementById('location-picker-map');
        console.log('📦 Container found:', !!container, 'offsetWidth:', container?.offsetWidth);
        
        if (!container || container.offsetWidth === 0) {
          console.log('⏳ Container not ready, retrying in 100ms');
          setTimeout(initMap, 100);
          return;
        }
        
        try {
          console.log('🚀 Creating Leaflet map');
          const map = window.L.map('location-picker-map').setView([34.0, 9.0], 7);
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
          
          const handleMapClick = (e) => {
            const { lat, lng } = e.latlng;
            
            // Update form data immediately
            setFormData(prev => ({ 
              ...prev, 
              latitude: lat.toString(), 
              longitude: lng.toString()
            }));
            
            // Fetch address and close modal
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
              .then(response => response.json())
              .then(data => {
                if (data && data.display_name) {
                  setFormData(prev => ({ ...prev, location: data.display_name }));
                }
              })
              .catch(error => console.log('Geocoding error:', error))
              .finally(() => {
                setShowMapPicker(false);
              });
          };
          
          map.on('click', handleMapClick);
          
          mapInstanceRef.current = map;
          mapInitialized.current = true;
          initTimeoutRef.current = null;
          console.log('✅ Map initialized successfully');
        } catch (error) {
          console.error('❌ Map initialization error:', error);
        }
      };
      
      if (window.L) {
        console.log('📚 Leaflet already loaded, scheduling map init');
        if (!initTimeoutRef.current) {
          initTimeoutRef.current = setTimeout(initMap, 300);
        }
      } else {
        console.log('📥 Loading Leaflet library');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          console.log('📚 Leaflet loaded, scheduling map init');
          if (!initTimeoutRef.current) {
            initTimeoutRef.current = setTimeout(initMap, 300);
          }
        };
        document.head.appendChild(script);
      }
    }, [showMapPicker]);
    
    React.useEffect(() => {
      return () => {
        console.log('🗑️ Component unmounting - cleaning up map');
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            console.log('⚠️ Cleanup error:', e);
          }
          mapInstanceRef.current = null;
        }
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
          initTimeoutRef.current = null;
        }
        currentMarkerRef.current = null;
        mapInitialized.current = false;
        console.log('✅ Map cleanup complete');
      };
    }, []);
    

    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold">{t('map.pick_location')}</h3>
            <p className="text-gray-600 mt-1">{t('map.click_to_select')}</p>
          </div>
          <div id="location-picker-map" className="h-96"></div>
          <div className="p-6 border-t flex justify-center">
            <button
              onClick={() => setShowMapPicker(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('admin.add_new_property')}</h1>
          <p className="text-gray-600">Fill in the details to list your property</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          {/* Desktop Progress */}
          <div className="hidden md:flex justify-center">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Progress */}
          <div className="md:hidden">
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                        isCompleted ? 'bg-green-500 text-white' :
                        isActive ? 'bg-blue-500 text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? <CheckCircle size={16} /> : <Icon size={16} />}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-4 h-0.5 mx-2 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-blue-600">
                Step {currentStep}: {steps.find(s => s.id === currentStep)?.title}
              </span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ArrowLeft size={20} className="mr-2" />
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all"
                >
                  Next
                  <ArrowRight size={20} className="ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-8 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('admin.submitting')}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} className="mr-2" />
                      {t('admin.submit_property')}
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
        
        {showMapPicker && <MapPicker />}
      </div>
    </div>
  );
};

export default PropertyForm;