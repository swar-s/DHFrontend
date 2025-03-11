import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FaCalendarAlt, FaCheckCircle, FaSpinner, FaTimesCircle, FaStar } from 'react-icons/fa';
import Modal from '../../common/Modal';
import { useNavigate } from 'react-router-dom';

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [propertyToRate, setPropertyToRate] = useState(null);
  const [ratedProperties, setRatedProperties] = useState(new Set());

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !user.cid) {
        console.error("Cannot fetch bookings: user or user.cid is undefined", user);
        setIsLoading(false);
        setError("User information is missing. Please log in again.");
        return;
      }

      try {
        console.log(`Fetching all bookings to filter for customer ID: ${user.cid}`);
        // Get all bookings instead of using the customer-specific endpoint
        const response = await axios.get('https://desihatti-production.up.railway.app/api/bookings');
        console.log("All bookings response:", response.data);
        
        // Filter bookings client-side to find those matching the current user's cid
        const userBookings = response.data.filter(booking => 
          booking.customer && booking.customer.cid === user.cid
        );
        
        console.log(`Filtered ${userBookings.length} bookings for customer ID: ${user.cid}`);
        setBookings(userBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError("Failed to load bookings. Please try again later.");
        
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
        }
        
        toast.error('Failed to load your bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

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

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.put(`https://desihatti-production.up.railway.app/api/bookings/${bookingId}/status?status=CANCELLED`);
      toast.success('Booking cancelled successfully');
      
      // Update the local state
      setBookings(bookings.map(booking => 
        booking.bookingId === bookingId 
          ? {...booking, status: 'CANCELLED'} 
          : booking
      ));
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return <FaCheckCircle className="mr-1" />;
      case 'PENDING':
        return <FaSpinner className="mr-1" />;
      case 'CANCELLED':
        return <FaTimesCircle className="mr-1" />;
      default:
        return null;
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
        // Optionally refresh the bookings to show updated UI
        fetchBookings();
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
    navigate(`/properties/${propertyId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B22222]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
        <div className="flex flex-col items-center justify-center h-48">
          <p className="text-gray-500 mb-4">You don't have any bookings yet.</p>
          <a href="/properties" className="px-4 py-2 bg-[#B22222] text-white rounded hover:bg-red-700 transition">
            Browse Properties
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.bookingId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.property?.title || 'Property Name'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.property?.city || 'Location'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    <span>
                      {format(new Date(booking.checkInDate), 'dd MMM yyyy')} - 
                      {format(new Date(booking.checkOutDate), 'dd MMM yyyy')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">₹{booking.totalPrice}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button 
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    onClick={() => navigateToProperty(booking.property.pid)}
                  >
                    View Property
                  </button>
                  {(booking.status === 'COMPLETED' || booking.status === 'CONFIRMED') && 
                   !ratedProperties.has(booking.property?.pid) && (
                    <button
                      className="text-yellow-600 hover:text-yellow-800 ml-3 flex items-center"
                      onClick={() => openRatingModal(booking)}
                    >
                      <FaStar className="mr-1" /> Rate
                    </button>
                  )}
                  {ratedProperties.has(booking.property?.pid) && (
                    <span className="text-gray-500 flex items-center ml-3">
                      <FaStar className="mr-1 text-yellow-500" /> Rated
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

export default MyBookings; 