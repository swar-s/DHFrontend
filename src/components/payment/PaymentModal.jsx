import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCreditCard, FaPaypal, FaGooglePay, FaTimes } from 'react-icons/fa';
import axios from 'axios';

function PaymentModal({ show, onClose, bookingData, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Ensure we have the correct user data format
  useEffect(() => {
    if (bookingData && bookingData.user) {
      // Check if we have email but missing cid
      if (bookingData.user.email && !bookingData.user.cid) {
        // Try to fetch user info by email
        const fetchUserByEmail = async () => {
          try {
            console.log("Fetching customer by email:", bookingData.user.email);
            const response = await axios.get(`https://desihatti-production.up.railway.app/api/customers/email/${bookingData.user.email}`);
            if (response.data) {
              console.log("Found customer:", response.data);
              // Update the user object with the customer data
              bookingData.user = response.data;
            }
          } catch (error) {
            console.error("Error fetching customer by email:", error);
          }
        };
        
        fetchUserByEmail();
      }
    }
  }, [bookingData]);

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value
    });
  };

  const processPayment = async () => {
    setIsProcessing(true);
    
    try {
      console.log("Processing payment with user data:", bookingData.user);
      
      // Directly use the customer ID from the user object
      const customerId = bookingData.user.cid;
      
      if (!customerId) {
        console.error("Customer ID is missing for email:", bookingData.user.email);
        toast.error("Customer information is incomplete. Please try again or contact support.");
        setIsProcessing(false);
        return;
      }
      
      // First create a payment record
      const paymentData = {
        amount: bookingData.totalPrice,
        method: paymentMethod,
        status: "COMPLETED",
        transactionDate: new Date().toISOString(),
        property: { pid: bookingData.property.pid },
        customer: { cid: customerId }
      };
      
      console.log("Sending payment data:", paymentData);
      const paymentResponse = await axios.post('https://desihatti-production.up.railway.app/api/payments', paymentData);
      console.log("Payment response:", paymentResponse.data);
      
      // Then create the booking with payment information
      const finalBookingData = {
        property: { pid: bookingData.property.pid },
        customer: { cid: customerId },
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        totalPrice: bookingData.totalPrice,
        status: "CONFIRMED",
        bookingDate: new Date().toISOString(),
        paymentStatus: "PAID",
        paymentMethod: paymentMethod
      };
      
      console.log("Sending booking data:", finalBookingData);
      const bookingResponse = await axios.post('https://desihatti-production.up.railway.app/api/bookings', finalBookingData);
      
      toast.success('Payment processed and booking confirmed!');
      onSuccess(bookingResponse.data);
    } catch (error) {
      console.error('Payment or booking failed:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-lg font-semibold">Total Amount: ₹{bookingData.totalPrice}</p>
          <p className="text-sm text-gray-600">Property: {bookingData.property.title}</p>
          <p className="text-sm text-gray-600">
            Dates: {new Date(bookingData.checkInDate).toLocaleDateString()} - {new Date(bookingData.checkOutDate).toLocaleDateString()}
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Select Payment Method</h3>
          <div className="grid grid-cols-3 gap-2">
            <button 
              className={`p-3 border rounded-lg flex flex-col items-center justify-center ${paymentMethod === 'CARD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              onClick={() => handlePaymentMethodSelect('CARD')}
            >
              <FaCreditCard className="text-2xl mb-1" />
              <span className="text-sm">Card</span>
            </button>
            <button 
              className={`p-3 border rounded-lg flex flex-col items-center justify-center ${paymentMethod === 'PAYPAL' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              onClick={() => handlePaymentMethodSelect('PAYPAL')}
            >
              <FaPaypal className="text-2xl mb-1" />
              <span className="text-sm">PayPal</span>
            </button>
            <button 
              className={`p-3 border rounded-lg flex flex-col items-center justify-center ${paymentMethod === 'GOOGLE_PAY' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              onClick={() => handlePaymentMethodSelect('GOOGLE_PAY')}
            >
              <FaGooglePay className="text-2xl mb-1" />
              <span className="text-sm">Google Pay</span>
            </button>
          </div>
        </div>
        
        {paymentMethod === 'CARD' && (
          <div className="mb-6 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input 
                type="text" 
                name="cardNumber"
                value={cardDetails.cardNumber}
                onChange={handleCardDetailsChange}
                placeholder="1234 5678 9012 3456"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
              <input 
                type="text" 
                name="cardHolder"
                value={cardDetails.cardHolder}
                onChange={handleCardDetailsChange}
                placeholder="John Doe"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input 
                  type="text" 
                  name="expiryDate"
                  value={cardDetails.expiryDate}
                  onChange={handleCardDetailsChange}
                  placeholder="MM/YY"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input 
                  type="text" 
                  name="cvv"
                  value={cardDetails.cvv}
                  onChange={handleCardDetailsChange}
                  placeholder="123"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
        
        <button 
          onClick={processPayment}
          disabled={!paymentMethod || isProcessing}
          className={`w-full py-3 rounded-lg font-semibold ${
            !paymentMethod || isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#B22222] text-white hover:bg-[#8B1A1A]'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Complete Payment'}
        </button>
      </div>
    </div>
  );
}

export default PaymentModal; 