import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import './ReviewList.css';

const ReviewList = ({ reviews, currentUserId, isAdmin, onReviewDeleted }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setDeletingId(reviewId);
      setError('');
      await axiosInstance.delete(`/reviews/${reviewId}`);
      onReviewDeleted(reviewId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <span className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'star-filled' : 'star-empty'}>
            ★
          </span>
        ))}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  if (reviews.length === 0) {
    return (
      <div className="no-reviews">
        <p>No reviews yet. Be the first to review this point!</p>
      </div>
    );
  }

  return (
    <div className="review-list">
      {error && <div className="error-message">{error}</div>}
      
      {reviews.map((review) => {
        const isOwner = currentUserId && review.userId?._id === currentUserId;
        const canDelete = isOwner || isAdmin;

        return (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {review.userId?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="reviewer-details">
                  <h4 className="reviewer-name">
                    {review.userId?.username || 'Anonymous'}
                  </h4>
                  <span className="review-date">{formatDate(review.createdAt)}</span>
                </div>
              </div>
              
              {canDelete && (
                <button
                  onClick={() => handleDelete(review._id)}
                  className="delete-btn"
                  disabled={deletingId === review._id}
                  aria-label="Delete review"
                >
                  {deletingId === review._id ? '...' : '🗑️'}
                </button>
              )}
            </div>

            <div className="review-ratings">
              <div className="rating-item">
                <span className="rating-label">⭐ Overall:</span>
                {renderStars(review.ratingOverall)}
                <span className="rating-number">{review.ratingOverall}/5</span>
              </div>
              <div className="rating-item">
                <span className="rating-label">💰 Price:</span>
                {renderStars(review.ratingPrice)}
                <span className="rating-number">{review.ratingPrice}/5</span>
              </div>
              <div className="rating-item">
                <span className="rating-label">🚗 Arrival:</span>
                {renderStars(review.ratingAccessibilityArrival)}
                <span className="rating-number">{review.ratingAccessibilityArrival}/5</span>
              </div>
              <div className="rating-item">
                <span className="rating-label">♿ Disability:</span>
                {renderStars(review.ratingAccessibilityDisability)}
                <span className="rating-number">{review.ratingAccessibilityDisability}/5</span>
              </div>
            </div>

            <p className="review-text">{review.text}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;
