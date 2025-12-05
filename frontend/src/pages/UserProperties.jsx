import React, { useState, useEffect } from "react";
import {
  Trash2,
  Edit3,
  Search,
  Filter,
  Plus,
  Home,
  BedDouble,
  Bath,
  Maximize,
  MapPin,
  Building,
  Loader,
  Eye,
  Heart,
  Calendar,
  TrendingUp,
  Clock
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { Backendurl } from "../App";

const PropertyListings = () => {
  const { t } = useTranslation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    pendingAppointments: 0,
    topProperty: null
  });
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  const fetchData = async () => {
    try {
      console.log('🔄 UserProperties: Starting to fetch data...');
      const startTime = Date.now();
      setLoading(true);
      setAppointmentsLoading(true);
      
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Make both API calls in parallel with cache-busting
      const timestamp = Date.now();
      const [propertiesResponse, appointmentsResponse] = await Promise.all([
        axios.get(`${Backendurl}/api/products/user-list?t=${timestamp}`, { headers }),
        axios.get(`${Backendurl}/api/appointments/all?t=${timestamp}`, { headers })
      ]);
      
      const fetchTime = Date.now() - startTime;
      console.log(`⏱️ UserProperties: API calls completed in ${fetchTime}ms`);
      
      // Handle properties
      if (propertiesResponse.data.success) {
        const props = propertiesResponse.data.property;
        console.log(`🏠 UserProperties: Found ${props.length} properties`);
        setProperties(props);
        
        // Calculate stats
        const totalViews = props.reduce((sum, prop) => sum + (prop.views || 0), 0);
        const totalLikes = props.reduce((sum, prop) => sum + (prop.likes || 0), 0);
        const topProperty = props.reduce((max, prop) => 
          (prop.views || 0) > (max?.views || 0) ? prop : max, null
        );
        
        setStats(prev => ({ ...prev, totalViews, totalLikes, topProperty }));
      }
      
      // Handle appointments
      if (appointmentsResponse.data.success) {
        const appointments = appointmentsResponse.data.appointments;
        console.log(`📅 UserProperties: Found ${appointments.length} total appointments`);
        
        // Log each appointment status
        appointments.forEach((apt, index) => {
          console.log(`Appointment ${index + 1}: ${apt._id} - status: ${apt.status}`);
        });
        
        const pendingCount = appointments.filter(apt => apt.status === 'pending').length;
        console.log(`⏳ UserProperties: ${pendingCount} pending appointments`);
        setStats(prev => ({ ...prev, pendingAppointments: pendingCount }));
      }
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ UserProperties: Data fetched successfully in ${totalTime}ms`);
      
    } catch (error) {
      console.error('❌ UserProperties: Error fetching data:', error);
      toast.error(t('admin.fetch_error'));
    } finally {
      setLoading(false);
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRemoveProperty = async (propertyId, propertyTitle) => {
    if (window.confirm(t('admin.confirm_remove', { title: propertyTitle }))) {
      try {
        const response = await axios.post(`${Backendurl}/api/products/remove`, {
          id: propertyId
        });

        if (response.data.success) {
          toast.success(t('admin.remove_success'));
          await fetchProperties();
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error("Error removing property:", error);
        toast.error(t('admin.remove_error'));
      }
    }
  };

  const filteredProperties = properties
    .filter(property => {
      const matchesSearch = !searchTerm || 
        [
          property.title,
          property.location,
          property.type
        ]
          .some(field => field.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === "all" || property.type.toLowerCase() === filterType.toLowerCase();
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{loading || appointmentsLoading ? '...' : value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('admin.loading_properties')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Property Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your properties and track performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Home}
            title="Total Properties"
            value={properties.length}
            color="#3B82F6"
            subtitle="Properties listed"
          />
          <StatCard
            icon={Eye}
            title="Total Views"
            value={stats.totalViews.toLocaleString()}
            color="#10B981"
            subtitle="Across all properties"
          />
          <StatCard
            icon={Heart}
            title="Total Likes"
            value={stats.totalLikes}
            color="#EF4444"
            subtitle="Property likes received"
          />
          <StatCard
            icon={Clock}
            title="Pending Appointments"
            value={stats.pendingAppointments}
            color="#F59E0B"
            subtitle="Awaiting confirmation"
          />
        </div>

        {/* Top Property */}
        {stats.topProperty && (
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  🏆 Best Performing Property
                </h2>
                <Link 
                  to="/user/add-property"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <img
                  src={stats.topProperty.image[0]}
                  alt={stats.topProperty.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{stats.topProperty.title}</h3>
                  <p className="text-sm text-gray-600">{stats.topProperty.location}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">{stats.topProperty.views} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium">{stats.topProperty.likes || 0} likes</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">{stats.topProperty.price.toLocaleString()} TND</p>
                  <p className="text-sm text-gray-600">For {stats.topProperty.availability}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Properties Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              My Properties ({filteredProperties.length})
            </h2>
            <p className="text-sm text-gray-600">
              Manage and edit your property listings
            </p>
          </div>
          <Link 
            to="/user/appointments"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2" />
            View Appointments
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t('admin.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-4 h-4" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('admin.all_types')}</option>
                  <option value="house">{t('admin.houses')}</option>
                  <option value="apartment">{t('admin.apartments')}</option>
                  <option value="villa">{t('admin.villas')}</option>
                  <option value="office">{t('admin.offices')}</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">{t('admin.newest_first')}</option>
                <option value="price-low">{t('admin.price_low_high')}</option>
                <option value="price-high">{t('admin.price_high_low')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProperties.map((property) => (
              <motion.div
                key={property._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Property Image */}
                <div className="relative h-48">
                  <img
                    src={property.image[0] || "/placeholder.jpg"}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                      {property.type}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
                      <Eye className="w-3 h-3" />
                      {property.views || 0}
                    </div>
                    <Link 
                      to={`/user/update-property/${property._id}`}
                      className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleRemoveProperty(property._id, property.title)}
                      className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {property.title}
                    </h2>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {property.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <p className="text-2xl font-bold text-blue-600">
                      {property.price.toLocaleString()} TND
                    </p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${ 
                      property.availability === 'rent' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      For {property.availability}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <BedDouble className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-600">{property.beds} {t('property_card.beds')}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <Bath className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-600">{property.baths} {t('property_card.baths')}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <Maximize className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-600">{property.sqft} m²</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  {property.amenities.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">{t('properties.amenities')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            <Building className="w-3 h-3 mr-1" />
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{property.amenities.length - 3} {t('admin.more')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProperties.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-lg shadow-sm"
          >
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {properties.length === 0 ? 'No properties yet' : 'No properties found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {properties.length === 0 ? 'Start by adding your first property' : 'Try adjusting your search or filters'}
            </p>
            {properties.length === 0 && (
              <Link 
                to="/user/add-property"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Property
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PropertyListings;