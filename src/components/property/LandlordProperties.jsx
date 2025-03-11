import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

function LandlordProperties() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProperties = async (page = 0) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('Current user:', user);

      if (!user || !user.lid) {
        toast.error('Please login first');
        return;
      }

      console.log('Fetching properties for landlord:', user.lid);

      const response = await axios.get(`https://desihatti-production.up.railway.app/api/properties/landlord/${user.lid}`, {
        params: {
          page,
          size: 9,
          sortBy: 'createdAt',
          direction: 'desc'
        }
      });

      console.log('API Response:', response.data);

      if (page === 0) {
        setProperties(response.data.content || []);
      } else {
        setProperties(prev => [...prev, ...(response.data.content || [])]);
      }
      setTotalPages(response.data.totalPages || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch properties');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDeleteProperty = async (pid) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await axios.delete(`https://desihatti-production.up.railway.app/api/properties/${pid}`);
        toast.success('Property deleted successfully');
        fetchProperties(0);
      } catch (error) {
        console.error('Error deleting property:', error);
        toast.error('Failed to delete property');
      }
    }
  };

  const handleLoadMore = () => {
    fetchProperties(currentPage + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">My Properties</h2>
        <Link
          to="/property/new"
          className="flex items-center gap-2 bg-[#B22222] text-white px-4 py-2 rounded-lg hover:bg-[#8B1A1A] transition-colors"
        >
          <FiPlus /> Add New Property
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : properties.length > 0 ? (
        <motion.div 
          layout 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {properties.map(property => {
              console.log('Rendering property:', property);
              return (
                <motion.div
                  key={property.pid}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={property.image || '/default-property.jpg'}
                      alt={property.address}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        property.isApproved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {property.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {property.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{property.city}</p>
                    <p className="text-lg font-semibold text-[#B22222] mb-4">
                      ₹{property.price?.toLocaleString()}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No properties found</p>
          <Link
            to="/property/new"
            className="inline-flex items-center gap-2 bg-[#B22222] text-white px-4 py-2 rounded-lg hover:bg-[#8B1A1A]"
          >
            <FiPlus /> Add Your First Property
          </Link>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        {currentPage < totalPages - 1 && (
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-[#B22222] text-white rounded-lg hover:bg-[#8B1A1A] transition-colors"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}

export default LandlordProperties;