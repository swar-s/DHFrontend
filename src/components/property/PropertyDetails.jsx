import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ImageGallery from './ImageGallery';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaSwimmingPool, FaParking, FaTree, FaWifi, FaBed, FaBath, FaCar, FaDumbbell } from 'react-icons/fa'; // Import icons
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PaymentModal from '../payment/PaymentModal';

// Placeholder image URL
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image';

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [propertyImage, setPropertyImage] = useState(PLACEHOLDER_IMAGE);
  const [bookingDates, setBookingDates] = useState({
    checkIn: null,
    checkOut: null
  });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0); // State for rating
  const [existingBookings, setExistingBookings] = useState([]); // State for existing bookings
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState(null);
  const [userHasRated, setUserHasRated] = useState(false);
  const [propertyRatings, setPropertyRatings] = useState([]);
  const [canRateProperty, setCanRateProperty] = useState(false);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const fetchPropertyDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`https://desihatti-production.up.railway.app/api/properties/${id}`);
      console.log('API Response:', response.data);
      setProperty(response.data);
      
      // Fetch property images
      try {
        const imagesResponse = await axios.get(`https://desihatti-production.up.railway.app/api/property-images/${id}`);
        if (imagesResponse.data && imagesResponse.data.length > 0) {
          setPropertyImage(imagesResponse.data[0].imageURL);
        }
      } catch (imageError) {
        console.error('Error fetching property images:', imageError);
        // Keep the placeholder image if fetch fails
      }
      
      // Fetch existing bookings for the property
      try {
        const bookingsResponse = await axios.get(`https://desihatti-production.up.railway.app/api/bookings/property/${id}`);
        console.log('Existing bookings for this property:', bookingsResponse.data);
        setExistingBookings(bookingsResponse.data); // Store existing bookings
      } catch (bookingError) {
        console.error('Error fetching property bookings:', bookingError);
        setExistingBookings([]);
      }

      // Fetch existing ratings for this property
      const fetchPropertyRatings = async () => {
        if (property && property.pid) {
          try {
            const response = await axios.get(`https://desihatti-production.up.railway.app/api/ratings/property/${property.pid}`);
            setPropertyRatings(response.data);
            
            // If the user is logged in, check if they've already rated and if they're eligible
            if (user && user.cid) {
              // Check if they've already rated
              const hasRatedResponse = await axios.get(
                `https://desihatti-production.up.railway.app/api/ratings/check?customerId=${user.cid}&propertyId=${property.pid}`
              );
              setUserHasRated(hasRatedResponse.data);
              
              // Check if they've booked this property (and thus eligible to rate)
              const eligibilityResponse = await axios.get(
                `https://desihatti-production.up.railway.app/api/ratings/eligibility?customerId=${user.cid}&propertyId=${property.pid}`
              );
              setCanRateProperty(eligibilityResponse.data);
              
              // If they have rated, find their rating to pre-select stars
              if (hasRatedResponse.data) {
                const userRating = response.data.find(r => r.customer.cid === user.cid);
                if (userRating) {
                  setRating(userRating.value);
                }
              }
            }
          } catch (error) {
            console.error("Error fetching ratings:", error);
          }
        }
      };
      
      fetchPropertyRatings();
    } catch (err) {
      console.error('Error fetching property details:', err);
      setError('Failed to load property details. Please try again later.');
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  useEffect(() => {
    console.log("Current authenticated user:", user);
  }, [user]);

  // Improved function to get blocked dates
  const getBlockedDates = () => {
    if (!existingBookings || existingBookings.length === 0) return [];
    
    return existingBookings.flatMap(booking => {
      if (!booking.checkInDate || !booking.checkOutDate) return [];
      
      // Skip cancelled bookings
      if (booking.status === 'CANCELLED') return [];
      
      const start = new Date(booking.checkInDate);
      const end = new Date(booking.checkOutDate);
      const blockedDates = [];
      
      // Create a temporary date to loop through the range
      const currentDate = new Date(start);
      
      // Loop through each day in the range
      while (currentDate <= end) {
        blockedDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return blockedDates;
    });
  };

  const isDateRangeBooked = (checkIn, checkOut) => {
    return existingBookings.some(booking => {
      const existingCheckIn = new Date(booking.checkin);
      const existingCheckOut = new Date(booking.checkout);
      return (checkIn >= existingCheckIn && checkIn <= existingCheckOut) ||
             (checkOut >= existingCheckIn && checkOut <= existingCheckOut) ||
             (checkIn <= existingCheckIn && checkOut >= existingCheckOut);
    });
  };

  const calculateTotalPrice = () => {
    if (!bookingDates.checkIn || !bookingDates.checkOut) return 0;
    
    const checkIn = new Date(bookingDates.checkIn);
    const checkOut = new Date(bookingDates.checkOut);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return days * property.price;
  };

  const checkDateAvailability = async () => {
    if (!bookingDates.checkIn || !bookingDates.checkOut || !property?.pid) {
      toast.error('Please select both check-in and check-out dates');
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Create a new API endpoint or use the booking API to check availability
      const response = await axios.get(`https://desihatti-production.up.railway.app/api/bookings/check-availability`, {
        params: {
          propertyId: property.pid,
          checkInDate: bookingDates.checkIn.toISOString(),
          checkOutDate: bookingDates.checkOut.toISOString()
        }
      });
      
      if (response.data && response.data.available) {
        return true;
      } else {
        toast.error('These dates are not available. Please select different dates.');
        return false;
      }
    } catch (error) {
      console.error('Error checking date availability:', error);
      toast.error('Failed to check date availability. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to book this property');
      navigate('/login');
      return;
    }
    
    if (user.userType !== 'customer') {
      toast.error('Only customers can book properties');
      return;
    }
    
    console.log("User object for booking:", user);
    
    // First check if dates are available
    const datesAvailable = await checkDateAvailability();
    if (!datesAvailable) {
      return;
    }
    
    // Prepare the booking data with explicit customer ID
    const bookingData = {
      user: {
        ...user, // Spread the entire user object
        // Ensure these fields are explicitly present
        cid: user.cid,
        name: user.name,
        email: user.email
      },
      property: {
        pid: property.pid,
        title: property.title
      },
      checkInDate: bookingDates.checkIn,
      checkOutDate: bookingDates.checkOut,
      totalPrice: calculateTotalPrice(),
      status: "PENDING",
      bookingDate: new Date(),
      paymentStatus: "PENDING"
    };

    console.log("Final booking data to be passed:", bookingData);
    
    // Store the booking data and show payment modal
    setPendingBookingData(bookingData);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (bookingData) => {
    setShowPaymentModal(false);
    toast.success('Booking confirmed successfully!');
    navigate('/dashboard/customer');
  };

  const handleRatingSubmit = async () => {
    if (!user || !user.cid) {
      toast.error("Please login to rate this property");
      return;
    }

    if (rating === 0) {
      toast.warning("Please select a star rating");
      return;
    }

    try {
      const ratingData = {
        customerId: user.cid,
        propertyId: property.pid,
        value: rating,
        comment: "" // You could add a comment field in the UI if desired
      };

      const response = await axios.post('https://desihatti-production.up.railway.app/api/ratings', ratingData);
      
      // Check if there's an error response from the server
      if (response.data && response.data.error) {
        toast.error(response.data.error);
        return;
      }
      
      toast.success("Your rating has been submitted!");
      setUserHasRated(true);
      
      // Refresh property details to show the updated rating
      fetchPropertyDetails();
    } catch (error) {
      console.error('Error submitting rating:', error);
      
      // Handle specific server validation errors
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to submit your rating. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B22222]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/properties" className="text-[#B22222] hover:underline">
          Back to Properties
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">Property not found.</p>
        <Link to="/properties" className="text-[#B22222] hover:underline">
          Back to Properties
        </Link>
      </div>
    );
  }

  // Check if images exist and are an array
  const images = property.images || []; // Default to an empty array if undefined

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
            <div className="rounded-lg overflow-hidden shadow-lg mb-4">
              <img
                src={propertyImage}
                alt={property.title}
                className="w-full h-[400px] object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', propertyImage);
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>
            <p className="text-lg font-semibold mt-4">Description:</p>
            <p className="text-gray-700">{property.description}</p>
            <p className="text-lg font-semibold mt-4">Price: ₹{property.price} per day</p>
            <p className="text-lg font-semibold mt-4">Location: {property.city}, {property.address}</p>

            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Property Details</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold">Size</h3>
                  <p>{property.size} sq.ft</p>
                </div>
                <div>
                  <h3 className="font-semibold">BHK</h3>
                  <p>{property.bhk} BHK</p>
                </div>
              </div>

              <h3 className="font-semibold mb-2">Features</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {property.features && typeof property.features === 'object' && Object.entries(property.features).map(([key, value]) => (
                  value && (
                    <span
                      key={key}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {key.split(/(?=[A-Z])/).join(' ')}
                    </span>
                  )
                ))}
              </div>

              <h3 className="font-semibold mb-2">Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                {property.pool && (
                  <div className="flex items-center p-4 border rounded-lg shadow hover:bg-blue-100 transition">
                    <FaSwimmingPool className="text-blue-600 text-2xl" />
                    <span className="ml-2">Pool</span>
                  </div>
                )}
                {property.poolFacing && (
                  <div className="flex items-center p-4 border rounded-lg shadow hover:bg-blue-100 transition">
                    <FaSwimmingPool className="text-blue-600 text-2xl" />
                    <span className="ml-2">Pool Facing</span>
                  </div>
                )}
                {property.beach && (
                  <div className="flex items-center p-4 border rounded-lg shadow hover:bg-blue-100 transition">
                    <FaSwimmingPool className="text-blue-600 text-2xl" />
                    <span className="ml-2">Beach</span>
                  </div>
                )}
                {property.beachFacing && (
                  <div className="flex items-center p-4 border rounded-lg shadow hover:bg-blue-100 transition">
                    <FaSwimmingPool className="text-blue-600 text-2xl" />
                    <span className="ml-2">Beach Facing</span>
                  </div>
                )}
                {property.garden && (
                  <div className="flex items-center p-4 border rounded-lg shadow hover:bg-green-100 transition">
                    <FaTree className="text-green-600 text-2xl" />
                    <span className="ml-2">Garden</span>
                  </div>
                )}
                {property.gardenFacing && (
                  <div className="flex items-center p-4 border rounded-lg shadow hover:bg-blue-100 transition">
                    <FaSwimmingPool className="text-blue-600 text-2xl" />
                    <span className="ml-2">Garden Facing</span>
                  </div>
                )}
                {property.gameZone && (
                  <div className="flex items-center p-4 border rounded-lg shadow hover:bg-blue-100 transition">
                    <FaSwimmingPool className="text-blue-600 text-2xl" />
                    <span className="ml-2">Game Zone</span>
                  </div>
                )}
                {property.wifi && (
                  <div className="flex items-center p-4 border rounded-lg shadow hover:bg-blue-100 transition">
                    <FaWifi className="text-blue-600 text-2xl" />
                    <span className="ml-2">WiFi</span>
                  </div>
                )}
                {property.parking && (
                  <div className="flex items-center p-4 border rounded-lg shadow hover:bg-gray-100 transition">
                    <FaParking className="text-gray-600 text-2xl" />
                    <span className="ml-2">Parking</span>
                  </div>
                )}
                {property.gym && (
                  <div className="flex items-center p-4 border rounded-lg shadow hover:bg-gray-100 transition">
                    <FaParking className="text-gray-600 text-2xl" />
                    <span className="ml-2">Gym</span>
                  </div>
                )}
              </div>
            </div>

            {/* Display property average rating near the title */}
            <div className="flex items-center mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={`text-xl ${
                      index < Math.round(property.rating || 0) 
                        ? 'text-yellow-500' 
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                {property.rating ? property.rating.toFixed(1) : 'No ratings yet'} 
                {propertyRatings.length > 0 && ` (${propertyRatings.length} ${propertyRatings.length === 1 ? 'review' : 'reviews'})`}
              </span>
            </div>
          </div>

          {/* Rating Section - Only show if user is not a landlord and eligible */}
          {(user && user.userType !== 'landlord' && canRateProperty) && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Rate this Property</h2>
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`cursor-pointer text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {userHasRated ? '(You rated this property)' : '(Click to rate)'}
                </span>
              </div>
              <button
                onClick={handleRatingSubmit}
                className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                {userHasRated ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          )}

          {/* Show a message if the user is logged in but hasn't booked this property */}
          {(user && user.userType !== 'landlord' && !canRateProperty) && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <p className="text-gray-500 italic">
                You can rate this property after staying here. Book this property to share your experience!
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            <div className="mb-4">
              <h3 className="text-2xl font-bold">₹{property.price}</h3>
              <p className="text-gray-600">per day</p>
            </div>

            {(!user || user.userType === 'customer') ? (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check In</label>
                  <DatePicker
                    selected={bookingDates.checkIn}
                    onChange={(date) => setBookingDates(prev => ({ 
                      ...prev, 
                      checkIn: date,
                      // Clear checkout if it's before the new checkin date
                      checkOut: prev.checkOut && date > prev.checkOut ? null : prev.checkOut 
                    }))}
                    selectsStart
                    startDate={bookingDates.checkIn}
                    endDate={bookingDates.checkOut}
                    minDate={new Date()} // Can't book dates in the past
                    excludeDates={getBlockedDates()}
                    placeholderText="Select Check In Date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabledKeyboardNavigation // Prevents keyboard from selecting disabled dates
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Check Out</label>
                  <DatePicker
                    selected={bookingDates.checkOut}
                    onChange={(date) => setBookingDates(prev => ({ ...prev, checkOut: date }))}
                    selectsEnd
                    startDate={bookingDates.checkIn}
                    endDate={bookingDates.checkOut}
                    minDate={bookingDates.checkIn || new Date()} // Can't check out before check in
                    excludeDates={getBlockedDates()}
                    placeholderText="Select Check Out Date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabledKeyboardNavigation
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Book Now
                </button>
              </form>
            ) : (
              <div className="mt-6">
                <p className="text-center text-gray-600 py-3">
                  {user.userType === 'landlord' ? 
                    "Landlords cannot book properties" : 
                    "Administrators cannot book properties"
                  }
                </p>
              </div>
            )}

            <div className="mt-6 border-t pt-6">
              <h3 className="font-semibold mb-2">Landlord</h3>
              <div className="flex items-center">
                <span className="mr-2">{property.landlord.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingData={pendingBookingData}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

export default PropertyDetails; 