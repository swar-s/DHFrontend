import React, { useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import MyBookings from '../bookings/MyBookings';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FaBed, FaBath, FaRuler, FaStar } from 'react-icons/fa';
import Modal from '../common/Modal';

function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeBookings: 0,
    totalSpent: 0,
    savedProperties: 0,
    reviewsGiven: 0
  });
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [propertyToRate, setPropertyToRate] = useState(null);
  
  // Property image sources - using consistent images for properties
  const propertyImages = {
    apartment: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000",
    villa: "https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?q=80&w=1000",
    house: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000",
    room: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000",
    default: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000"
  };

  // Add this new state at the top of the component
  const [ratedProperties, setRatedProperties] = useState(new Set());

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !user.cid) {
        console.error("Cannot fetch bookings: user or user.cid is undefined", user);
        setLoading(false);
        return;
      }

      try {
        // Use the main bookings endpoint instead of the customer-specific one
        console.log(`CustomerDashboard: Fetching all bookings to filter for customer ID: ${user.cid}`);
        const response = await axios.get('https://desihatti-production.up.railway.app/api/bookings');
        
        // Filter bookings client-side by customer ID
        const userBookings = response.data.filter(booking => 
          booking.customer && booking.customer.cid === user.cid
        );
        
        console.log(`CustomerDashboard: Filtered ${userBookings.length} bookings for user ID: ${user.cid}`);
        setBookings(userBookings);
        
        // Calculate stats from actual bookings data
        calculateStats(userBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load your bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  // Add this function to check which properties the user has already rated
  useEffect(() => {
    const checkRatedProperties = async () => {
      if (!user || !user.cid || bookings.length === 0) return;
      
      const propertyIds = bookings.map(booking => booking.property?.pid).filter(Boolean);
      const ratedProps = new Set();
      
      for (const pid of propertyIds) {
        try {
          const response = await axios.get(
            `https://desihatti-production.up.railway.app/api/ratings/check?customerId=${user.cid}&propertyId=${pid}`
          );
          if (response.data) {
            ratedProps.add(pid);
          }
        } catch (error) {
          console.error(`Error checking rating for property ${pid}:`, error);
        }
      }
      
      setRatedProperties(ratedProps);
    };
    
    if (bookings.length > 0) {
      checkRatedProperties();
    }
  }, [bookings, user]);

  // Get a suitable image for a property
  const getPropertyImage = (property) => {
    if (!property) return propertyImages.default;
    
    // If the property has a valid ID, construct the image URL from the API
    if (property.pid) {
      // This should match the endpoint in PropertyImageController.java
      return `https://desihatti-production.up.railway.app/api/properties/${property.pid}/image`;
    }
    
    console.log("Property without pid:", property);
    
    // Fallbacks if no API-based image is available
    if (property.imageUrl) return property.imageUrl;
    if (property.image) return property.image;
    
    // Use type-based images as last resort
    if (property.ptype && propertyImages[property.ptype.toLowerCase()]) {
      return propertyImages[property.ptype.toLowerCase()];
    }
    
    // If we can't determine the type, use a default based on some characteristic
    if (property.bhk > 3) return propertyImages.villa;
    if (property.bhk > 1) return propertyImages.house;
    return propertyImages.apartment;
  };

  // Calculate actual stats from the booking data
  const calculateStats = (bookingData) => {
    const activeCount = bookingData.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length;
    const totalAmount = bookingData.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    setStats({
      activeBookings: activeCount,
      totalSpent: totalAmount,
      savedProperties: 0, // This would come from a separate API call
      reviewsGiven: 0 // This would come from a separate API call
    });
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.put(`https://desihatti-production.up.railway.app/api/bookings/${bookingId}/status?status=CANCELLED`);
      
      // Update local state
      setBookings(prev =>
        prev.map(booking =>
          booking.bookingId === bookingId
            ? { ...booking, status: 'CANCELLED' }
            : booking
        )
      );
      toast.success('Booking has been cancelled');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error('Failed to cancel booking');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openRatingModal = (booking) => {
    setPropertyToRate(booking.property);
    // Check if user has already rated this property
    const checkExistingRating = async () => {
      try {
        const response = await axios.get(
          `https://desihatti-production.up.railway.app/api/ratings/check?customerId=${user.cid}&propertyId=${booking.property.pid}`
        );
        if (response.data) {
          // User has already rated, get their existing rating
          const ratingsResponse = await axios.get(
            `https://desihatti-production.up.railway.app/api/ratings/property/${booking.property.pid}`
          );
          const userRating = ratingsResponse.data.find(r => r.customer.cid === user.cid);
          if (userRating) {
            setCurrentRating(userRating.value);
          }
        } else {
          setCurrentRating(0);
        }
      } catch (error) {
        console.error("Error checking existing rating:", error);
        setCurrentRating(0);
      }
    };
    
    checkExistingRating();
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (currentRating === 0) {
      toast.warning("Please select a star rating");
      return;
    }

    try {
      const ratingData = {
        customerId: user.cid,
        propertyId: propertyToRate.pid,
        value: currentRating,
        comment: "" // You could add a comment field if desired
      };

      const response = await axios.post('https://desihatti-production.up.railway.app/api/ratings', ratingData);
      
      if (response.data && response.data.error) {
        toast.error(response.data.error);
      } else {
        toast.success("Your rating has been submitted!");
        setShowRatingModal(false);
        
        // Update the rated properties set
        setRatedProperties(prev => new Set(prev).add(propertyToRate.pid));
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to submit your rating. Please try again.");
      }
      console.error('Error submitting rating:', error);
    }
  };

  const navigateToProperty = (propertyId) => {
    if (propertyId) {
      navigate(`/property/${propertyId}`);
    } else {
      toast.error("Property information is missing");
    }
  };

  if (loading) {
    return <div className="text-center p-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B22222] mx-auto"></div>
      <p className="mt-3">Loading your bookings...</p>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-green-700">Active Bookings</h3>
          <p className="text-2xl font-bold">{stats.activeBookings}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-blue-700">Total Spent</h3>
          <p className="text-2xl font-bold">₹{stats.totalSpent}</p>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}</h1>
        <p className="text-gray-600">Manage your bookings and view your rental history</p>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">My Bookings</h2>
        </div>

        {bookings.length === 0 ? (
          <div className="p-6 text-center">
            <p className="mb-4">You don't have any bookings yet.</p>
            <Link to="/" className="px-4 py-2 bg-[#B22222] text-white rounded hover:bg-red-700 transition">
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <div key={booking.bookingId} className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Booking Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800">{booking.property?.title || 'Property'}</h3>
                        <p className="text-sm text-gray-600">{booking.property?.city || 'Location'}</p>
                        
                        {/* Property details */}
                        {booking.property && (
                          <div className="flex items-center mt-2 text-xs text-gray-500 space-x-3">
                            {booking.property.bhk && (
                              <span className="flex items-center">
                                <FaBed className="mr-1" /> {booking.property.bhk} BHK
                              </span>
                            )}
                            {booking.property.size && (
                              <span className="flex items-center">
                                <FaRuler className="mr-1" /> {booking.property.size} sqft
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status || 'Status'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="p-4 bg-green-100 rounded-lg">
                        <p className="text-sm text-gray-500">Check In</p>
                        <p className="font-medium">
                          {booking.checkInDate ? format(new Date(booking.checkInDate), 'dd MMM yyyy') : 'Not set'}
                        </p>
                      </div>
                      <div className="p-4 bg-yellow-100 rounded-lg">
                        <p className="text-sm text-gray-500">Check Out</p>
                        <p className="font-medium">
                          {booking.checkOutDate ? format(new Date(booking.checkOutDate), 'dd MMM yyyy') : 'Not set'}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-100 rounded-lg">
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium">₹{booking.totalPrice || 0}</p>
                      </div>
                      <div className="p-4 bg-blue-100 rounded-lg">
                        <p className="text-sm text-gray-500">Payment</p>
                        <p className="font-medium">{booking.paymentStatus || 'Unknown'}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigateToProperty(booking.property?.pid)}
                        className="text-[#B22222] hover:text-[#8B1A1A] font-medium border-b-2 border-transparent hover:border-[#B22222] transition duration-300"
                      >
                        View Property
                      </button>
                      
                      {(booking.status === 'COMPLETED' || booking.status === 'CONFIRMED') && 
                       !ratedProperties.has(booking.property?.pid) && (
                        <button
                          onClick={() => openRatingModal(booking)}
                          className="text-yellow-600 hover:text-yellow-800 font-medium border-b-2 border-transparent hover:border-yellow-600 transition duration-300 flex items-center"
                        >
                          <FaStar className="mr-1" /> Rate Property
                        </button>
                      )}
                      
                      {ratedProperties.has(booking.property?.pid) && (
                        <span className="text-gray-500 font-medium flex items-center">
                          <FaStar className="mr-1 text-yellow-500" /> Already Rated
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add the rating modal at the bottom */}
      {showRatingModal && (
        <Modal show={showRatingModal} onClose={() => setShowRatingModal(false)}>
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Rate your stay at {propertyToRate?.title}
            </h2>
            
            <div className="flex items-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`cursor-pointer text-3xl ${
                    star <= currentRating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                  onClick={() => setCurrentRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded mr-2"
                onClick={() => setShowRatingModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={submitRating}
              >
                Submit Rating
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CustomerDashboard; 