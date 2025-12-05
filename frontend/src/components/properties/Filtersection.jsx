import { Home, Filter, Bed, Bath, Maximize } from "lucide-react";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { formatPrice, parsePrice } from "../../utils/format";

// Property types with translation keys
const getPropertyTypes = (t) => [
  { key: "house", label: t('filters.house') },
  { key: "apartment", label: t('filters.apartment') },
  { key: "villa", label: t('filters.villa') },
  { key: "office", label: t('filters.office') },
  { key: "land", label: t('filters.land') }
];

const getAvailabilityTypes = (t) => [
  { key: "rent", label: t('filters.rent') },
  { key: "buy", label: t('filters.buy') }
];

const getAmenitiesList = (t) => [
  { key: "lake_view", label: t('amenities.lake_view') },
  { key: "fireplace", label: t('amenities.fireplace') },
  { key: "central_heating", label: t('amenities.central_heating') },
  { key: "dock", label: t('amenities.dock') },
  { key: "pool", label: t('amenities.pool') },
  { key: "garage", label: t('amenities.garage') },
  { key: "garden", label: t('amenities.garden') },
  { key: "gym", label: t('amenities.gym') },
  { key: "security_system", label: t('amenities.security_system') },
  { key: "master_bathroom", label: t('amenities.master_bathroom') },
  { key: "guest_bathroom", label: t('amenities.guest_bathroom') },
  { key: "home_theater", label: t('amenities.home_theater') },
  { key: "exercise_room", label: t('amenities.exercise_room') },
  { key: "covered_parking", label: t('amenities.covered_parking') },
  { key: "internet_ready", label: t('amenities.internet_ready') }
];

const FilterSection = ({ filters, setFilters, onApplyFilters, maxPrice: maxPriceProp }) => {
  const { t } = useTranslation();
  
  const propertyTypes = getPropertyTypes(t);
  const availabilityTypes = getAvailabilityTypes(t);
  const amenitiesList = getAmenitiesList(t);
  const [minPrice, setMinPrice] = useState(filters.priceRange[0]);
  const [maxPrice, setMaxPrice] = useState(filters.priceRange[1]);

  const [minPriceFormatted, setMinPriceFormatted] = useState(formatPrice(filters.priceRange[0]));
  const [maxPriceFormatted, setMaxPriceFormatted] = useState(formatPrice(filters.priceRange[1]));

  useEffect(() => {
    setMinPrice(filters.priceRange[0]);
    setMaxPrice(filters.priceRange[1]);
    setMinPriceFormatted(formatPrice(filters.priceRange[0]));
    setMaxPriceFormatted(formatPrice(filters.priceRange[1]));
  }, [filters.priceRange]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      const newAmenities = checked
        ? [...filters.amenities, value]
        : filters.amenities.filter((amenity) => amenity !== value);
      setFilters((prev) => ({
        ...prev,
        amenities: newAmenities,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePriceInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = parsePrice(value);
    if (name === "minPrice") {
      setMinPrice(parsedValue);
      setMinPriceFormatted(value);
    } else {
      setMaxPrice(parsedValue);
      setMaxPriceFormatted(value);
    }
  };

  const handlePriceBlur = (e) => {
    const { name } = e.target;
    if (name === "minPrice") {
      setMinPriceFormatted(formatPrice(minPrice));
    } else {
      setMaxPriceFormatted(formatPrice(maxPrice));
    }
    setFilters((prev) => ({
      ...prev,
      priceRange: [minPrice, maxPrice],
    }));
  };

  const handleReset = () => {
    setFilters({
      propertyType: "",
      priceRange: [0, maxPriceProp],
      bedrooms: "0",
      bathrooms: "0",
      sqft: "",
      amenities: [],
      availability: "",
      searchQuery: "",
      sortBy: "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white p-6 rounded-xl shadow-lg"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">{t('common.filter')}</h2>
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {t('properties.clear_filters')}
        </button>
      </div>

      <div className="space-y-6">
        {/* Availability */}
        <div className="filter-group">
          <label className="filter-label">{t('properties.availability')}</label>
          <div className="grid grid-cols-2 gap-2">
            {availabilityTypes.map((type) => (
              <button
                key={type.key}
                onClick={() =>
                  handleChange({
                    target: { name: "availability", value: type.key },
                  })
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    filters.availability === type.key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div className="filter-group">
          <label className="filter-label">
            <Home className="w-4 h-4 mr-2" />
            {t('properties.filter_by_type')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {propertyTypes.map((type) => (
              <button
                key={type.key}
                onClick={() =>
                  handleChange({
                    target: { name: "propertyType", value: type.key },
                  })
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    filters.propertyType === type.key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="font-bold mr-2">TND</span>
            {t('properties.filter_by_price')}
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              name="minPrice"
              value={minPriceFormatted}
              onChange={handlePriceInputChange}
              onBlur={handlePriceBlur}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder={t('properties.min_price')}
            />
            <input
              type="text"
              name="maxPrice"
              value={maxPriceFormatted}
              onChange={handlePriceInputChange}
              onBlur={handlePriceBlur}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder={t('properties.max_price')}
            />
          </div>
          <input
            type="range"
            min="0"
            max={maxPriceProp}
            step="10000"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setMinPriceFormatted(formatPrice(e.target.value));
            }}
            onMouseUp={handlePriceBlur}
            className="w-full mt-2"
          />
          <input
            type="range"
            min="0"
            max={maxPriceProp}
            step="10000"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setMaxPriceFormatted(formatPrice(e.target.value));
            }}
            onMouseUp={handlePriceBlur}
            className="w-full"
          />
        </div>

        {/* Bedrooms */}
        <div className="filter-group">
          <label className="filter-label">
            <Bed className="w-4 h-4 mr-2" />
            {t('properties.bedrooms')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((beds) => (
              <button
                key={beds}
                onClick={() =>
                  handleChange({ target: { name: "bedrooms", value: beds } })
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filters.bedrooms == beds
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {beds}+
              </button>
            ))}
          </div>
        </div>

        {/* Bathrooms */}
        <div className="filter-group">
          <label className="filter-label">
            <Bath className="w-4 h-4 mr-2" />
            {t('properties.bathrooms')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((baths) => (
              <button
                key={baths}
                onClick={() =>
                  handleChange({ target: { name: "bathrooms", value: baths } })
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filters.bathrooms == baths
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {baths}+
              </button>
            ))}
          </div>
        </div>

        {/* Square Meters */}
        <div className="filter-group">
          <label className="filter-label">
            <Maximize className="w-4 h-4 mr-2" />
            {t('properties.sqft')}
          </label>
          <input
            type="number"
            name="sqft"
            value={filters.sqft}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder={t('properties.sqft')}
          />
        </div>

        {/* Amenities */}
        <div className="filter-group">
          <label className="filter-label">{t('properties.amenities')}</label>
          <div className="grid grid-cols-2 gap-2">
            {amenitiesList.map((amenity) => (
              <label key={amenity.key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="amenities"
                  value={amenity.key}
                  checked={filters.amenities.includes(amenity.key)}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm">{amenity.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
          <button
            onClick={() => onApplyFilters(filters)}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 
              transition-colors font-medium"
          >
            {t('properties.apply_filters')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterSection;
