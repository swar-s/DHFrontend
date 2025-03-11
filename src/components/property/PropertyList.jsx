import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Transition } from '@headlessui/react';
import { FiSearch, FiFilter, FiX, FiHome, FiMap, FiCheck, FiChevronDown, FiChevronUp, FiCalendar } from 'react-icons/fi';
import { BiBuildings } from 'react-icons/bi';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios';
import { toast } from 'react-toastify';

function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const searchTimeout = useRef(null);
  
  const [filters, setFilters] = useState({
    bhk1: false,
    bhk2: false,
    bhk3: false,
    hasPool: false,
    poolFacing: false,
    hasGym: false,
    hasParking: false,
    hasBeach: false,
    beachFacing: false,
    hasGarden: false,
    gardenFacing: false,
    hasGamezone: false,
    hasWifi: false
  });

  const handleSearch = async (page = 0) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('https://desihatti-production.up.railway.app/api/properties/search', {
        params: {
          query: searchQuery || undefined,
          page,
          size: 9
        }
      });

      if (page === 0) {
        setProperties(response.data.content);
        setFilteredProperties(response.data.content);
      } else {
        setProperties(prevProps => [...prevProps, ...response.data.content]);
        setFilteredProperties(prevFiltered => [...prevFiltered, ...response.data.content]);
      }
      
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to fetch properties');
      toast.error('Failed to fetch properties');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClick = () => {
    handleSearch(0);
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    handleSearch(nextPage);
  };

  const clearFilters = () => {
    setFilters({
      bhk1: false,
      bhk2: false,
      bhk3: false,
      hasPool: false,
      poolFacing: false,
      hasGym: false,
      hasParking: false,
      hasBeach: false,
      beachFacing: false,
      hasGarden: false,
      gardenFacing: false,
      hasGamezone: false,
      hasWifi: false
    });
    setFilteredProperties(properties);
  };

  const applyFilters = useCallback((propertiesToFilter = properties) => {
    let filtered = [...propertiesToFilter];

    const selectedBhk = [];
    if (filters.bhk1) selectedBhk.push(1);
    if (filters.bhk2) selectedBhk.push(2);
    if (filters.bhk3) selectedBhk.push(3);
    if (selectedBhk.length > 0) {
      filtered = filtered.filter(property => selectedBhk.includes(property.bhk));
    }

    if (filters.hasPool) filtered = filtered.filter(p => p.pool);
    if (filters.poolFacing) filtered = filtered.filter(p => p.poolFacing);
    if (filters.hasBeach) filtered = filtered.filter(p => p.beach);
    if (filters.beachFacing) filtered = filtered.filter(p => p.beachFacing);
    if (filters.hasGarden) filtered = filtered.filter(p => p.garden);
    if (filters.gardenFacing) filtered = filtered.filter(p => p.gardenFacing);
    if (filters.hasGym) filtered = filtered.filter(p => p.gym);
    if (filters.hasParking) filtered = filtered.filter(p => p.parking);
    if (filters.hasGamezone) filtered = filtered.filter(p => p.gameZone);
    if (filters.hasWifi) filtered = filtered.filter(p => p.wifi);

    setFilteredProperties(filtered);
  }, [filters, properties]);

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: checked
    }));
    applyFilters();
  };

  useEffect(() => {
    handleSearch(0);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true
    });
  }, []);

  const PropertySkeleton = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200" /> {/* Image placeholder */}
        <div className="p-4 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4" /> {/* Title */}
          <div className="h-4 bg-gray-200 rounded w-1/2" /> {/* Price */}
          <div className="flex space-x-2">
            <div className="h-6 w-16 bg-gray-200 rounded" /> {/* Tag */}
            <div className="h-6 w-16 bg-gray-200 rounded" /> {/* Tag */}
          </div>
        </div>
      </div>
    </motion.div>
  );

  useEffect(() => {
    const fetchImagesForProperties = async () => {
      const newProperties = await Promise.all(
        properties.map(async (property) => {
          if (property.image) return property; // Skip if already has image

          try {
            const response = await axios.get(`https://desihatti-production.up.railway.app/api/property-images/${property.pid}`);
            return {
              ...property,
              image: response.data.length > 0 ? response.data[0].imageURL : '/default-image.jpg',
            };
          } catch (error) {
            console.error(`Error fetching images for property ${property.pid}:`, error);
            return {
              ...property,
              image: '/default-image.jpg',
            };
          }
        })
      );

      setProperties(newProperties);
      setFilteredProperties(prev => {
        const filteredNew = newProperties.filter(newProp => 
          prev.some(p => p.pid === newProp.pid)
        );
        return [...prev.filter(p => 
          !newProperties.some(newProp => newProp.pid === p.pid)
        ), ...filteredNew];
      });
    };

    if (properties.length > 0) {
      fetchImagesForProperties();
    }
  }, [properties.length]); // Only run when properties length changes

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-[#B22222] to-[#D64545] bg-clip-text text-transparent">
          Find Your Desi Vacation Place <br /> 
        </h1>
      </motion.div>

      {/* Search Bar with Dates Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-md p-6 mb-4 border border-[#E5E5E5]"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <FiMap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B22222]" />
            <input
              type="text"
              placeholder="Search by location ..."
              value={searchQuery}
              onChange={handleSearchInput}
              className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#B22222] transition-all duration-150 bg-white"
            />
          </div>

          {/* Check-in Date */}
          {/* <div className="relative w-full md:w-40">
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B22222] h-4 w-4" />
              <input
                type="date"
                value={filters.checkIn}
                onChange={(e) => setFilters(prev => ({ ...prev, checkIn: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                placeholder="Check In"
                className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#B22222] transition-all duration-150 bg-white"
              />
            </div>
          </div>

          {/* Check-out Date */}
          {/* <div className="relative w-full md:w-40">
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B22222] h-4 w-4" />
              <input
                type="date"
                value={filters.checkOut}
                onChange={(e) => setFilters(prev => ({ ...prev, checkOut: e.target.value }))}
                min={filters.checkIn || new Date().toISOString().split('T')[0]}
                placeholder="Check Out"
                className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#B22222] transition-all duration-150 bg-white"
              />
            </div>
          </div> */}

          {/* Search Button */}
          <button
            onClick={handleSearchClick}
            className="w-full md:w-auto px-6 py-3 bg-[#B22222] text-white rounded-lg hover:bg-[#8B1A1A] transition-colors duration-150 focus:outline-none flex items-center justify-center gap-2"
          >
            <FiSearch />
            <span>Search</span>
          </button>
        </div>
      </motion.div>

      {/* Collapsible Filters Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-md overflow-hidden mb-6 border border-[#E5E5E5]"
      >
        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="w-full px-6 py-4 flex items-center justify-between text-gray-700 hover:bg-gray-50 transition-colors duration-150 focus:outline-none"
        >
          <span className="flex items-center gap-2">
            <FiFilter className="text-[#B22222]" />
            <span className="font-medium">Advanced Filters</span>
          </span>
          {isFiltersOpen ? (
            <FiChevronUp className="text-[#B22222]" />
          ) : (
            <FiChevronDown className="text-[#B22222]" />
          )}
        </button>

        {/* Collapsible Content */}
        <motion.div
          initial={false}
          animate={{ 
            height: isFiltersOpen ? 'auto' : 0,
            opacity: isFiltersOpen ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-6 border-t border-gray-100">
            {/* Date Range Section */}
            

            {/* BHK Quick Filters */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Number of Bedrooms</h3>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map(bhk => (
                  <motion.button
                    key={bhk}
                    type="button"
                    onClick={() => handleFilterChange({ target: { name: `bhk${bhk}`, checked: !filters[`bhk${bhk}`] } })}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none ${
                      filters[`bhk${bhk}`] 
                        ? 'bg-[#B22222] text-white' 
                        : 'bg-[#F8F8F8] text-[#222222] border border-[#E5E5E5] hover:border-[#B22222]'
                    }`}
                  >
                    {bhk} BHK
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'hasPool', label: 'Pool', icon: '🏊‍♂️' },
                  { name: 'poolFacing', label: 'Pool Facing', icon: '🌅' },
                  { name: 'hasBeach', label: 'Beach', icon: '🏖️' },
                  { name: 'beachFacing', label: 'Beach Facing', icon: '🌊' },
                  { name: 'hasGarden', label: 'Garden', icon: '🌳' },
                  { name: 'gardenFacing', label: 'Garden Facing', icon: '🌿' },
                  { name: 'hasGym', label: 'Gym', icon: '💪' },
                  { name: 'hasParking', label: 'Parking', icon: '🚗' },
                  { name: 'hasWifi', label: 'WiFi', icon: '📶' },
                  { name: 'hasGamezone', label: 'Game Zone', icon: '🎮' }
                ].map(amenity => (
                  <motion.label
                    key={amenity.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-150 focus:outline-none ${
                      filters[amenity.name]
                        ? 'bg-[#B22222] text-white border border-[#B22222]'
                        : 'bg-[#F8F8F8] hover:bg-white border border-[#E5E5E5] hover:border-[#B22222]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name={amenity.name}
                      checked={filters[amenity.name]}
                      onChange={handleFilterChange}
                      className="hidden"
                    />
                    <span className="text-lg">{amenity.icon}</span>
                    <span className="text-sm font-medium">{amenity.label}</span>
                    {filters[amenity.name] && (
                      <FiCheck className="ml-auto text-white" />
                    )}
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 mt-6 border-t border-gray-100">
              <motion.button
                type="button"
                onClick={clearFilters}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-[#222222] hover:text-[#B22222] px-4 py-2 rounded-lg hover:bg-[#F8F8F8] transition-colors duration-150 focus:outline-none"
              >
                <FiX /> Reset All
              </motion.button>
              <motion.button
                type="button"
                onClick={() => handleSearch(currentPage)}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-[#B22222] text-white px-6 py-2 rounded-lg hover:bg-[#8B1A1A] transition-colors duration-150 focus:outline-none"
              >
                <FiFilter /> Apply Filters
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Property Grid */}
      <motion.div 
        layout 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
      >
        <AnimatePresence>
          {isLoading && currentPage === 0 ? (
            // Show skeleton loaders while loading initial page
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <PropertySkeleton key={i} />
              ))}
            </>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <h3 className="text-xl text-red-600">{error}</h3>
              <button
                onClick={() => handleSearch(0)}
                className="mt-4 text-[#B22222] hover:text-[#8B1A1A]"
              >
                Try Again
              </button>
            </motion.div>
          ) : filteredProperties.length > 0 ? (
            filteredProperties.map(property => (
              <motion.div
                key={property.pid}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <Link to={`/property/${property.pid}`}>
                  <div className="relative">
                    <img
                      src={property.image || '/default-property.jpg'}
                      alt={property.address}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-white px-2 py-1 rounded-md text-sm font-medium text-gray-700">
                        ₹{property.price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {property.title}
                    </h3>
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span
                            key={index}
                            className={`text-sm ${
                              index < Math.round(property.rating || 0) 
                                ? 'text-yellow-500' 
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="ml-2 text-gray-600 text-xs">
                        {property.rating ? property.rating.toFixed(1) : 'No ratings'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{property.city}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {property.bhk} BHK
                      </span>
                      {property.pool && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          Pool
                        </span>
                      )}
                      {property.gym && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          Gym
                        </span>
                      )}
                      {property.garden && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          Garden
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <h3 className="text-xl text-gray-600">No properties found</h3>
              <button
                onClick={clearFilters}
                className="mt-4 text-[#B22222] hover:text-[#8B1A1A]"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Load More Button */}
      {!isLoading && currentPage < totalPages - 1 && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            className="bg-[#B22222] text-white px-6 py-2 rounded hover:bg-[#8B1A1A]"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

export default PropertyList; 