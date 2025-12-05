import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { saveScrollPosition } from '../../utils/scrollRestoration';
import { useTranslation } from 'react-i18next';
import { 
  BedDouble, 
  Bath, 
  Maximize, 
  ArrowLeft, 
  Phone, 
  Calendar, 
  MapPin,
  Loader,
  Building,
  Share2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Compass,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Flag
} from "lucide-react";
import { Backendurl } from "../../App.jsx";
import ScheduleViewing from "./ScheduleViewing";
import NeighborhoodAnalysis from "../NeighborhoodAnalysis";
import ReportProperty from "../ReportProperty";

const PropertyDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${Backendurl}/api/products/single/${id}`);

        if (response.data.success) {
          setProperty(response.data.property);
          setUserLiked(response.data.userLiked || false);
          setUserDisliked(response.data.userDisliked || false);
          setLikes(response.data.property.likes || 0);
          setDislikes(response.data.property.dislikes || 0);
          setError(null);
        } else {
          setError(response.data.message || t('property_detail.load_error'));
        }
      } catch (err) {
        console.error("Error fetching property details:", err);
        setError(t('property_detail.load_error_retry'));
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    // Reset scroll position and active image when component mounts
    window.scrollTo(0, 0);
    setActiveImage(0);
  }, [id]);

  const handleKeyNavigation = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      setActiveImage(prev => (prev === 0 ? property.image.length - 1 : prev - 1));
    } else if (e.key === 'ArrowRight') {
      setActiveImage(prev => (prev === property.image.length - 1 ? 0 : prev + 1));
    } else if (e.key === 'Escape' && showSchedule) {
      setShowSchedule(false);
    }
  }, [property?.image?.length, showSchedule]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    return () => window.removeEventListener('keydown', handleKeyNavigation);
  }, [handleKeyNavigation]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: t('property_detail.share_text', { type: property.type, title: property.title }),
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleWhatsApp = () => {
    const message = `Hi! I'm interested in your property: ${property.title} located at ${property.location}. Price: ${Number(property.price).toLocaleString()} TND. Can you provide more details?`;
    const whatsappUrl = `https://wa.me/${property.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLikeLoading(true);
    try {
      const response = await axios.post(
        `${Backendurl}/api/products/like/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setLikes(response.data.likes);
        setDislikes(response.data.dislikes);
        setUserLiked(response.data.userLiked);
        setUserDisliked(response.data.userDisliked);
      }
    } catch (error) {
      console.error('Error liking property:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDislike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLikeLoading(true);
    try {
      const response = await axios.post(
        `${Backendurl}/api/products/dislike/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setLikes(response.data.likes);
        setDislikes(response.data.dislikes);
        setUserLiked(response.data.userLiked);
        setUserDisliked(response.data.userDisliked);
      }
    } catch (error) {
      console.error('Error disliking property:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="w-32 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          
          {/* Main Content Skeleton */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Image Gallery Skeleton */}
            <div className="relative h-[500px] bg-gray-200 rounded-xl mb-8 animate-pulse">
              {/* Image Navigation Buttons */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/50 rounded-full"></div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/50 rounded-full"></div>
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-black/20 rounded-full"></div>
            </div>
  
            {/* Content Skeleton */}
            <div className="p-8">
              {/* Title and Location */}
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-3 w-full max-w-md">
                  <div className="h-10 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
  
              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Price Box */}
                  <div className="h-28 bg-blue-50/50 rounded-lg animate-pulse"></div>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                  
                  {/* Contact */}
                  <div className="space-y-2">
                    <div className="h-7 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
                  </div>
                  
                  {/* Button */}
                  <div className="h-12 bg-blue-200 rounded-lg animate-pulse"></div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <div className="h-7 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse mt-2"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-4/5 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                  </div>
                  
                  {/* Amenities */}
                  <div className="space-y-2">
                    <div className="h-7 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Map Location Skeleton */}
          <div className="mt-8 p-6 bg-blue-50/50 rounded-xl animate-pulse">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
              <div className="h-7 bg-gray-300 rounded-lg w-1/6"></div>
            </div>
            <div className="h-5 bg-gray-300 rounded-lg w-4/5 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded-lg w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link
            to="/properties"
            className="text-blue-600 hover:underline flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> {t('property_detail.back_to_properties')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 pt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <Link
            to="/properties"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> {t('property_detail.back_to_properties')}
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
              hover:bg-gray-100 transition-colors relative"
          >
            {copySuccess ? (
              <span className="text-green-600">
                <Copy className="w-5 h-5" />
                {t('property_detail.copied')}
              </span>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                {t('property_detail.share')}
              </>
            )}
          </button>
        </nav>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="relative h-[500px] bg-gray-100 rounded-xl overflow-hidden mb-8">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={property.image[activeImage]}
                alt={`${property.title} - View ${activeImage + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              />
            </AnimatePresence>

            {/* Image Navigation */}
            {property.image.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage(prev => 
                    prev === 0 ? property.image.length - 1 : prev - 1
                  )}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full
                    bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveImage(prev => 
                    prev === property.image.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full
                    bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 
              bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              {activeImage + 1} / {property.image.length}
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  {property.location}
                </div>
                
                {/* Like/Dislike Section */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    disabled={likeLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      userLiked 
                        ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${likeLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                  >
                    <ThumbsUp className={`w-5 h-5 ${userLiked ? 'fill-current' : ''}`} />
                    <span className="font-medium">{likes}</span>
                  </button>
                  
                  <button
                    onClick={handleDislike}
                    disabled={likeLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      userDisliked 
                        ? 'bg-red-100 text-red-600 border border-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${likeLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                  >
                    <ThumbsDown className={`w-5 h-5 ${userDisliked ? 'fill-current' : ''}`} />
                    <span className="font-medium">{dislikes}</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setShowReport(true)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-red-600 transition-colors"
                  title={t('property_detail.report_property')}
                >
                  <Flag className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <p className="text-3xl font-bold text-blue-600 mb-2">
                    {Number(property.price).toLocaleString()} TND
                  </p>
                  <p className="text-gray-600">
                    {t('property_detail.available_for')} {property.availability}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <BedDouble className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {property.beds} {property.beds > 1 ? t('property_detail.beds') : t('property_detail.bed')}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Bath className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {property.baths} {property.baths > 1 ? t('property_detail.baths') : t('property_detail.bath')}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Maximize className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{property.sqft} sqft</p>
                  </div>
                </div>

                {/* Contact section - hidden on mobile, shown on desktop */}
                <div className="mb-6 hidden md:block">
                  <h2 className="text-xl font-semibold mb-4">{t('property_detail.contact_details')}</h2>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-2" />
                    {property.phone}
                  </div>
                </div>

                <div className="space-y-3 hidden md:flex md:flex-col">
                  <button
                    onClick={() => setShowSchedule(true)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg 
                      hover:bg-blue-700 transition-colors flex items-center 
                      justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    {t('property_detail.schedule_viewing')}
                  </button>
                  
                  <button
                    onClick={handleWhatsApp}
                    className="w-full bg-green-500 text-white py-3 rounded-lg 
                      hover:bg-green-600 transition-colors flex items-center 
                      justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t('property_detail.whatsapp_contact')}
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">{t('property_detail.description')}</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {property.description}
                  </p>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">{t('property_detail.amenities')}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div 
                        key={index}
                        className="flex items-center text-gray-600"
                      >
                        <Building className="w-4 h-4 mr-2 text-blue-600" />
                        {t(`amenities.${amenity}`)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact section - shown on mobile below amenities */}
                <div className="mb-6 md:hidden">
                  <h2 className="text-xl font-semibold mb-4">{t('property_detail.contact_details')}</h2>
                  <div className="flex items-center text-gray-600 mb-4">
                    <Phone className="w-5 h-5 mr-2" />
                    {property.phone}
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowSchedule(true)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg 
                        hover:bg-blue-700 transition-colors flex items-center 
                        justify-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      {t('property_detail.schedule_viewing')}
                    </button>
                    
                    <button
                      onClick={handleWhatsApp}
                      className="w-full bg-green-500 text-white py-3 rounded-lg 
                        hover:bg-green-600 transition-colors flex items-center 
                        justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {t('property_detail.whatsapp_contact')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps Location */}
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <MapPin className="w-5 h-5" />
              <h3 className="text-lg font-semibold">{t('property_detail.location')}</h3>
            </div>
            <p className="text-gray-600">{property.location}</p>
          </div>
          
          <div className="relative h-96">
            <iframe
              src={property.latitude && property.longitude 
                ? `https://maps.google.com/maps?q=${property.latitude},${property.longitude}&t=&z=17&ie=UTF8&iwloc=near&output=embed&markers=${property.latitude},${property.longitude}`
                : `https://maps.google.com/maps?q=${encodeURIComponent(property.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
              }
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map showing ${property.location}`}
            />
          </div>
          
          <div className="p-4 bg-gray-50">
            <a
              href={property.latitude && property.longitude 
                ? `https://maps.google.com/?q=${property.latitude},${property.longitude}`
                : `https://maps.google.com/?q=${encodeURIComponent(property.location)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Compass className="w-4 h-4" />
              {t('property_detail.view_larger_map')}
            </a>
          </div>
        </div>

        {/* Neighborhood Analysis */}
        <NeighborhoodAnalysis propertyId={property._id} />

        {/* Viewing Modal */}
        <AnimatePresence>
          {showSchedule && (
            <ScheduleViewing
              propertyId={property._id}
              onClose={() => setShowSchedule(false)}
            />
          )}
        </AnimatePresence>

        {/* Report Modal */}
        <AnimatePresence>
          {showReport && (
            <ReportProperty
              propertyId={property._id}
              propertyTitle={property.title}
              onClose={() => setShowReport(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PropertyDetails;