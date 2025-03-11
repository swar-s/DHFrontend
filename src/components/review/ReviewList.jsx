import React from 'react';

function ReviewList({ reviews }) {
  // Check if reviews is defined and is an array
  if (!reviews || !Array.isArray(reviews)) {
    return <div>No reviews available.</div>;
  }

  return (
    <div>
      {reviews.map((review, index) => (
        <div key={index} className="border-b py-2">
          <h4 className="font-semibold">{review.user}</h4>
          <p>{review.comment}</p>
        </div>
      ))}
    </div>
  );
}

export default ReviewList; 