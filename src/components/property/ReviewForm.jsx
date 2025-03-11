import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

function ReviewForm({ propertyId, onReviewSubmit }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const review = {
      id: Date.now(),
      user: user.name,
      rating,
      comment,
      timestamp: new Date().toISOString()
    };

    onReviewSubmit(review);
    toast.success('Review submitted successfully!');
    setRating(5);
    setComment('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-2xl focus:outline-none"
            >
              {star <= (hoveredRating || rating) ? '★' : '☆'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Share your experience..."
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Submit Review
      </button>
    </form>
  );
}

export default ReviewForm; 