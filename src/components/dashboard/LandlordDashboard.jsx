import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiUpload, FiImage, FiEdit2, FiTrash2, FiCalendar, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';

// Use a placeholder image URL instead of importing a file that doesn't exist
const defaultPropertyImage = "https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image";

function LandlordDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [uploadingProperty, setUploadingProperty] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('properties');
  const navigate = useNavigate();

  const fetchProperties = async (page = 0) => {
    try {
      if (!user || !user.lid) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.get(`https://desihatti-production.up.railway.app/api/properties/landlord/${user.lid}`, {
        params: {
          page,
          size: 9,
          sortBy: 'createdAt',
          direction: 'desc'
        }
      });

      const propertiesData = response.data.content || [];
      
      // Create a set of existing property IDs for quick lookup
      const existingPids = new Set(properties.map(p => p.pid));
      
      // Filter out any duplicates from the new data
      const uniqueNewProperties = propertiesData.filter(p => !existingPids.has(p.pid));
      
      console.log(`Fetched ${propertiesData.length} properties, ${uniqueNewProperties.length} are unique`);
      
      // Fetch images for each property
      const propertiesWithImages = await Promise.all(
        uniqueNewProperties.map(async (property) => {
          try {
            const imagesResponse = await axios.get(`https://desihatti-production.up.railway.app/api/property-images/${property.pid}`);
            
            if (imagesResponse.data && imagesResponse.data.length > 0) {
              return { ...property, image: imagesResponse.data[0].imageURL };
            } else {
              return { ...property, image: defaultPropertyImage };
            }
          } catch (error) {
            console.error(`Error fetching images for property ${property.pid}:`, error);
            return { ...property, image: defaultPropertyImage };
          }
        })
      );

      if (page === 0) {
        setProperties(propertiesWithImages);
      } else {
        setProperties(prev => [...prev, ...propertiesWithImages]);
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

  const fetchBookingsForLandlord = async () => {
    try {
      // First get all the properties of this landlord
      const propertiesResponse = await axios.get(`https://desihatti-production.up.railway.app/api/properties/landlord/${user.lid}`);
      const landlordProperties = propertiesResponse.data.content || [];
      
      // Then fetch all bookings
      const bookingsResponse = await axios.get('https://desihatti-production.up.railway.app/api/bookings');
      
      // Filter bookings that match the landlord's properties
      const propertyIds = landlordProperties.map(prop => prop.pid);
      const relevantBookings = bookingsResponse.data.filter(booking => 
        booking.property && propertyIds.includes(booking.property.pid)
      );
      
      console.log(`Found ${relevantBookings.length} bookings for landlord properties`);
      setBookings(relevantBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load property bookings');
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchBookingsForLandlord();
  }, []);

  const handleLoadMore = () => {
    fetchProperties(currentPage + 1);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadImage = async (propertyId) => {
    if (!selectedFile) {
      toast.error('Please select an image to upload');
      return;
    }

    setIsUploading(true);
    setUploadingProperty(propertyId);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('pid', propertyId);

      const response = await axios.post('https://desihatti-production.up.railway.app/api/property-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update the property with the new image
      setProperties(prevProperties => 
        prevProperties.map(property => 
          property.pid === propertyId 
            ? { ...property, image: response.data.imageURL } 
            : property
        )
      );

      toast.success('Image uploaded successfully');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadingProperty(null);
    }
  };

  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const handleDeleteProperty = async (pid) => {
    // Placeholder for delete functionality
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await axios.delete(`https://desihatti-production.up.railway.app/api/properties/${pid}`);
        toast.success('Property deleted successfully');
        fetchProperties();
      } catch (error) {
        console.error('Error deleting property:', error);
        toast.error('Failed to delete property');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B22222]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name || 'Landlord'}</h1>
        <h2 className="text-xl text-gray-600">Your Properties</h2>
      </div>

      <div className="flex justify-end mb-6">
        <Link
          to="/property/new"
          className="flex items-center gap-2 bg-[#B22222] text-white px-4 py-2 rounded-lg hover:bg-[#8B1A1A] transition-colors"
        >
          <FiPlus /> Add New Property
        </Link>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'properties' 
            ? 'text-[#B22222] border-b-2 border-[#B22222]' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('properties')}
        >
          My Properties
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'bookings' 
            ? 'text-[#B22222] border-b-2 border-[#B22222]' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('bookings')}
        >
          Booked Properties
        </button>
      </div>

      {activeTab === 'properties' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">My Properties</h2>
            
          </div>

          {properties.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 mb-4">You haven't listed any properties yet.</p>
              <Link
                to="/property/new"
                className="bg-[#B22222] text-white px-4 py-2 rounded-md hover:bg-[#8B1A1A] transition-colors"
              >
                Add Your First Property
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.pid} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Property Image */}
                  <div className="relative h-48 w-full bg-gray-200">
                    <img
                      src={property.image || defaultPropertyImage}
                      alt={property.title || 'Property'}
                      className="w-full h-full object-cover"
                    />
                    {/* Approval Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        property.approved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {property.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{property.title || 'Untitled Property'}</h3>
                    <div className="text-gray-600 mb-2">
                      <p>{property.bhk} BHK</p>
                      <p>{property.city || 'Location not specified'}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-[#B22222]">
                        ₹{property.price?.toLocaleString() || 0}/day
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'bookings' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Booked Properties</h2>
          
          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">No bookings found for your properties.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                // Find the property details from our properties list
                const property = properties.find(p => p.pid === booking.property?.pid) || booking.property;
                
                return (
                  <div key={booking.bookingId} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {/* Property image */}
                      <div className="md:w-1/4">
                        <img 
                          src={property?.image || defaultPropertyImage} 
                          alt={property?.title || 'Property'} 
                          className="w-full h-32 md:h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultPropertyImage;
                          }}
                        />
                      </div>
                      
                      {/* Booking details */}
                      <div className="p-4 md:w-3/4">
                        <div className="flex justify-between mb-2">
                          <h3 className="text-lg font-semibold">{property?.title || 'Property'}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status || 'Unknown Status'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-500 flex items-center">
                              <FiCalendar className="mr-1" /> Check-in: {formatDate(booking.checkInDate)}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <FiCalendar className="mr-1" /> Check-out: {formatDate(booking.checkOutDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 flex items-center">
                              <FiUser className="mr-1" /> Guest: {booking.customer?.name || 'Guest'}
                            </p>
                            <p className="font-medium text-[#B22222]">
                              ₹{booking.totalPrice || 0}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <button 
                            onClick={() => window.location.href = `/property/${property?.pid}`}
                            className="text-blue-600 hover:underline"
                          >
                            View Property
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!isLoading && currentPage < totalPages - 1 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-[#B22222] text-white rounded-lg hover:bg-[#8B1A1A] transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

export default LandlordDashboard; 