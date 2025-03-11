import React from 'react';
import axios from 'axios';

function SimpleBooking() {
  const createSampleBooking = () => {
    const payload = {
      customer: { cid: 11 },
      property: { pid: 22 },
      checkInDate: new Date(),
      checkOutDate: new Date(Date.now() + 86400000),
      totalPrice: 1000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentMethod: "CASH"
    };
    
    axios.post('https://desihatti-production.up.railway.app/api/bookings', payload)
      .then(response => console.log("Success:", response.data))
      .catch(error => console.error("Error:", error));
  };
  
  return (
    <button onClick={createSampleBooking}>
      Create Test Booking
    </button>
  );
}

export default SimpleBooking; 