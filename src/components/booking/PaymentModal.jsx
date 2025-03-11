import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCreditCard, FaPaypal, FaMoneyBillAlt } from 'react-icons/fa';

function PaymentModal({ bookingDetails, onClose, user }) {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState('CREDIT_CARD');
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayment = () => {
    setIsProcessing(true);
    console.log("Processing payment with user ID:", user.cid);
    
    // Fix the booking structure to match exactly what the backend expects
    const bookingData = {
      // Pass customer as direct object reference with cid as number
      // This is critical - the format must match what backend expects
      customer: {
        cid: Number(user.cid)  // Ensure this is a number
      },
      // Pass property as direct object reference with pid
      property: {
        pid: Number(bookingDetails.property.pid)  // Ensure this is a number
      },
      // DateTime fields
      checkInDate: bookingDetails.checkInDate,
      checkOutDate: bookingDetails.checkOutDate,
      bookingDate: new Date(),
      
      // Other fields
      totalPrice: bookingDetails.totalPrice,
      status: "CONFIRMED",
      paymentStatus: "PAID", 
      paymentMethod: selectedPayment
    };
    
    console.log("Final booking payload:", bookingData);
    
    // Make the API call
    axios.post('https://desihatti-production.up.railway.app/api/bookings', bookingData)
      .then(response => {
        console.log("Booking Success:", response.data);
        toast.success("Booking confirmed successfully!");
        onClose();
        navigate('/dashboard');
      })
      .catch(error => {
        console.error("API Error:", error);
        if (error.response) {
          console.error("Status:", error.response.status);
          console.error("Data:", error.response.data);
        }
        toast.error("Failed to process booking. Please try again.");
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Complete Your Payment</h2>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <p className="font-semibold">Total Amount: ₹{bookingDetails.totalPrice}</p>
          <p className="text-sm text-gray-600">Property: {bookingDetails.property?.title}</p>
          <p className="text-sm text-gray-600">Customer ID: {user.cid}</p>
        </div>
        
        <h3 className="font-medium mb-2">Select Payment Method</h3>
        <div className="flex flex-col gap-2 mb-6">
          <button 
            className={`flex items-center p-3 border rounded ${selectedPayment === 'CREDIT_CARD' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            onClick={() => setSelectedPayment('CREDIT_CARD')}
          >
            <FaCreditCard className="mr-2" /> Credit Card
          </button>
          <button 
            className={`flex items-center p-3 border rounded ${selectedPayment === 'PAYPAL' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            onClick={() => setSelectedPayment('PAYPAL')}
          >
            <FaPaypal className="mr-2" /> PayPal
          </button>
          <button 
            className={`flex items-center p-3 border rounded ${selectedPayment === 'CASH' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            onClick={() => setSelectedPayment('CASH')}
          >
            <FaMoneyBillAlt className="mr-2" /> Cash
          </button>
        </div>
        
        <div className="flex justify-end gap-2">
          <button 
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            onClick={processPayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal; 