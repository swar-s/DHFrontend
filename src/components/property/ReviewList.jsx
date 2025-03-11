function ReviewList({ reviews }) {
  const calculateAverageRating = () => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div>
      {/* Average Rating */}
      <div className="mb-6 text-center">
        <div className="text-4xl font-bold text-blue-600">{calculateAverageRating()}</div>
        <div className="text-yellow-500 text-2xl">{'★'.repeat(Math.round(calculateAverageRating()))}</div>
        <div className="text-gray-500">{reviews.length} reviews</div>
      </div>

      {/* Review List */}
      <div className="space-y-6">
        {reviews.map(review => (
          <div key={review.id} className="border-b last:border-0 pb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-semibold">{review.user}</span>
                <div className="text-yellow-500">{'★'.repeat(review.rating)}</div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(review.timestamp).toLocaleDateString()}
              </div>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReviewList; 