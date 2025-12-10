import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../css/ReviewSection.css';

export default function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/reviews/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
        calculateStats(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    const total = reviewsData.length;
    if (total === 0) {
      setStats({ averageRating: 0, totalReviews: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
      return;
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviewsData.forEach(review => {
      sum += review.rating;
      distribution[review.rating]++;
    });

    setStats({
      averageRating: (sum / total).toFixed(1),
      totalReviews: total,
      ratingDistribution: distribution
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  return (
    <div className="review-section">
      <div className="review-summary">
        <h3>Customer Reviews</h3>
        
        <div className="rating-overview">
          <div className="average-rating">
            <div className="rating-number">{stats.averageRating}</div>
            {renderStars(Math.round(stats.averageRating))}
            <div className="total-reviews">{stats.totalReviews} reviews</div>
          </div>

          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating];
              const percentage = stats.totalReviews > 0 
                ? (count / stats.totalReviews) * 100 
                : 0;

              return (
                <div key={rating} className="rating-bar-row">
                  <span className="rating-label">{rating} ★</span>
                  <div className="rating-bar">
                    <div 
                      className="rating-bar-fill" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="rating-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="reviewer-name">
                      {review.userName}
                      {review.verifiedPurchase && (
                        <span className="verified-badge" title="Verified Purchase">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="review-date">{formatDate(review.createdAt)}</div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              
              <div className="review-content">
                <p>{review.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

ReviewSection.propTypes = {
  productId: PropTypes.string.isRequired
};
