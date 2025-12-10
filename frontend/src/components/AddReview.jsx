import { useState } from 'react';
import PropTypes from 'prop-types';
import '../css/AddReview.css';

export default function AddReview({ productId, onReviewAdded, token }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    console.log('AddReview - Starting submission', { productId, rating, commentLength: comment.length });
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    setLoading(true);

    try {
      // Use token from props or localStorage
      const authToken = token || localStorage.getItem('customerToken') || localStorage.getItem('token');
      
      console.log('AddReview - Token from props:', !!token);
      console.log('AddReview - Token from localStorage (customerToken):', !!localStorage.getItem('customerToken'));
      console.log('AddReview - Token from localStorage (token):', !!localStorage.getItem('token'));
      console.log('AddReview - Final token available:', !!authToken);
      console.log('AddReview - Token preview (first 50 chars):', authToken?.substring(0, 50));
      
      if (!authToken) {
        setError('Please login to submit a review');
        setLoading(false);
        return;
      }

      console.log('AddReview - Sending request to API');
      const response = await fetch('http://localhost:3001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim()
        })
      });

      console.log('AddReview - API Response status:', response.status);
      const data = await response.json();
      console.log('AddReview - API Response data:', data);

      if (response.ok && data.success) {
        setSuccess(true);
        setRating(0);
        setComment('');
        
        if (onReviewAdded) {
          onReviewAdded();
        }

        setTimeout(() => setSuccess(false), 3000);
      } else {
        console.error('AddReview - API Error:', data);
        
        // Check for token expiration or invalid signature
        if (response.status === 401) {
          if (data.details && (data.details.includes('signature') || data.details.includes('expired'))) {
            setError('Your session has expired. Please log out and log back in to continue.');
          } else {
            setError(data.error || 'Authentication failed. Please log in again.');
          }
        } else {
          setError(data.error || 'Failed to submit review');
        }
      }
    } catch (err) {
      console.error('AddReview - Network error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-review-section">
      <h4>Write a Review</h4>
      
      {success && (
        <div className="success-message">
          ✓ Review submitted successfully!
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-input">
          <label>Your Rating *</label>
          <div className="star-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <span className="rating-text">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          )}
        </div>

        <div className="comment-input">
          <label>Your Review *</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows="5"
            maxLength="1000"
            required
          />
          <div className="character-count">
            {comment.length}/1000
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-review-btn"
          disabled={loading || rating === 0}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

AddReview.propTypes = {
  productId: PropTypes.string.isRequired,
  onReviewAdded: PropTypes.func,
  token: PropTypes.string
};
