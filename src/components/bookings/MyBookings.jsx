import React from 'react';

function MyBookings({ bookings }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">My Bookings</h1>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.bid} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold">{booking.property.title}</h2>
              <p>Check-in: {new Date(booking.checkin).toLocaleDateString()}</p>
              <p>Check-out: {new Date(booking.checkout).toLocaleDateString()}</p>
              <p>Status: {booking.status || 'Confirmed'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings; 