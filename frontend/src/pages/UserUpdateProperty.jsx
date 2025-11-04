import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Backendurl } from '../App';
import { X, Upload, Save, ArrowLeft, MapPin } from 'lucide-react';

const PROPERTY_TYPES = ['house', 'apartment', 'office', 'villa', 'land'];
const AVAILABILITY_TYPES = ['rent', 'buy'];
const AMENITIES = ['lake_view', 'fireplace', 'central_heating', 'dock', 'pool', 'garage', 'garden', 'gym', 'security_system', 'master_bathroom', 'guest_bathroom', 'home_theater', 'exercise_room', 'covered_parking', 'internet_ready'];

const Update = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const mapInstanceRef = React.useRef(null);
  const mapInitialized = React.useRef(false);
  const initTimeoutRef = React.useRef(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`${Backendurl}/api/products/single/${id}`);
        if (response.data.success) {
          const property = response.data.property;
          
          let amenitiesArray = property.amenities;
          if (typeof amenitiesArray === 'string') {
            try {
              amenitiesArray = JSON.parse(amenitiesArray);
            } catch (e) {
              amenitiesArray = [];
            }
          }
          if (!Array.isArray(amenitiesArray)) {
            amenitiesArray = [];
          }

          setFormData({
            title: property.title,
            type: property.type,
            price: property.price,
            location: property.location,
            latitude: property.latitude || '',
            longitude: property.longitude || '',
            description: property.description,
            beds: property.beds,
            baths: property.baths,
            sqft: property.sqft,
            phone: property.phone,
            availability: property.availability,
            amenities: amenitiesArray,
            images: property.image
          });
          
          // Set selected coordinates if available
          if (property.latitude && property.longitude) {
            setSelectedCoords({
              lat: parseFloat(property.latitude),
              lng: parseFloat(property.longitude)
            });
          }
          setPreviewUrls(property.image);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log('Error fetching property:', error);
        toast.error('An error occurred. Please try again.');
      }
    };

    fetchProperty();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = t('validation.title_required');
    if (!formData.description.trim()) newErrors.description = t('validation.description_required');
    if (!formData.type) newErrors.type = t('validation.type_required');
    if (!formData.availability) newErrors.availability = t('validation.availability_required');
    if (!formData.location.trim()) newErrors.location = t('validation.location_required');
    if (!formData.beds || formData.beds < 0) newErrors.beds = t('validation.beds_required');
    if (!formData.baths || formData.baths < 0) newErrors.baths = t('validation.baths_required');
    if (!formData.sqft || formData.sqft < 0) newErrors.sqft = t('validation.sqft_required');
    if (!formData.price || formData.price <= 0) newErrors.price = t('validation.price_required');
    if (!formData.phone.trim()) newErrors.phone = t('validation.phone_required');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + previewUrls.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }
    
    setNewImages(files);
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);

    try {
      const formdata = new FormData();
      formdata.append('id', id);
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
      
      if (newImages.length > 0) {
        newImages.forEach((image, index) => {
          formdata.append(`image${index + 1}`, image);
        });
      } else if (formData.images.length > 0) {
        formdata.append('existingImages', JSON.stringify(formData.images));
      }

      const response = await axios.post(`${Backendurl}/api/products/update`, formdata);
      if (response.data.success) {
        toast.success(t('admin.property_updated_success'));
        navigate('/user/properties');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('admin.update_property')}</h1>
            <p className="text-gray-600">Update your property information</p>
          </div>
          <button
            onClick={() => navigate('/user/properties')}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Properties
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-8">
              {/* Basic Information Section */}
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
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

                  <div className="lg:col-span-2">
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

              {/* Property Details Section */}
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Property Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="md:col-span-2">
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
                        placeholder="Enter property location..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowMapPicker(true)}
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
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-semibold ${
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
              </div>

              {/* Amenities Section */}
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {AMENITIES.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
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

              {/* Images Section */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Property Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="h-32 w-full object-cover rounded-xl"
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
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-gray-50 px-8 py-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    {t('admin.updating')}
                  </>
                ) : (
                  <>
                    <Save size={20} className="mr-3" />
                    {t('admin.update_property')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {showMapPicker && <MapPicker />}
      </div>
    </div>
  );

  // Map picker component
  function MapPicker() {
    React.useEffect(() => {
      if (!showMapPicker || mapInitialized.current) {
        return;
      }
      
      const initMap = () => {
        const container = document.getElementById('location-picker-map');
        
        if (!container || container.offsetWidth === 0) {
          setTimeout(initMap, 100);
          return;
        }
        
        try {
          const map = window.L.map('location-picker-map').setView([34.0, 9.0], 7);
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
          
          // Add existing marker if coordinates exist
          let marker = null;
          if (selectedCoords) {
            marker = window.L.marker([selectedCoords.lat, selectedCoords.lng]).addTo(map);
            map.setView([selectedCoords.lat, selectedCoords.lng], 13);
          }
          
          const handleMapClick = (e) => {
            const { lat, lng } = e.latlng;
            
            // Remove existing marker
            if (marker) {
              map.removeLayer(marker);
            }
            
            // Add new marker
            marker = window.L.marker([lat, lng]).addTo(map);
            
            // Update coordinates
            setSelectedCoords({ lat, lng });
            setFormData(prev => ({ 
              ...prev, 
              latitude: lat.toString(), 
              longitude: lng.toString()
            }));
            
            // Fetch address
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
              .then(response => response.json())
              .then(data => {
                if (data && data.display_name) {
                  setFormData(prev => ({ ...prev, location: data.display_name }));
                }
              })
              .catch(error => console.log('Geocoding error:', error));
          };
          
          map.on('click', handleMapClick);
          mapInstanceRef.current = map;
          mapInitialized.current = true;
        } catch (error) {
          console.error('Map initialization error:', error);
        }
      };
      
      if (window.L) {
        setTimeout(initMap, 300);
      } else {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setTimeout(initMap, 300);
        document.head.appendChild(script);
      }
    }, [showMapPicker]);
    
    React.useEffect(() => {
      return () => {
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            console.log('Cleanup error:', e);
          }
          mapInstanceRef.current = null;
        }
        mapInitialized.current = false;
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
          <div className="p-6 border-t flex justify-between">
            <button
              onClick={() => setShowMapPicker(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => setShowMapPicker(false)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default Update;