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
          <div key={review._id} className="review-card-compact">
            <div className="review-header-compact">
              <div className="reviewer-info-compact">
                <div className="reviewer-avatar-compact">
                  {review.userId?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="reviewer-details-compact">
                  <h4 className="reviewer-name-compact">
                    {review.userId?.name || 'Anonymous'}
                  </h4>
                  <span className="review-date-compact">{formatDate(review.createdAt)}</span>
                </div>
              </div>
              
              {canDelete && (
                <button
                  onClick={() => handleDelete(review._id)}
                  className="delete-btn-compact"
                  disabled={deletingId === review._id}
                  aria-label="Delete review"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              )}
            </div>

            <div className="review-ratings-inline">
              <div className="rating-inline-item">
                <span className="material-symbols-outlined">star</span>
                <span className="rating-value-inline">{review.ratingOverall}</span>
              </div>
              <div className="rating-inline-item">
                <span className="material-symbols-outlined">payments</span>
                <span className="rating-value-inline">{review.ratingPrice}</span>
              </div>
              <div className="rating-inline-item">
                <span className="material-symbols-outlined">directions_car</span>
                <span className="rating-value-inline">{review.ratingAccessibilityArrival}</span>
              </div>
              <div className="rating-inline-item">
                <span className="material-symbols-outlined">accessible</span>
                <span className="rating-value-inline">{review.ratingAccessibilityDisability}</span>
              </div>
            </div>

            {review.text && (
              <p className="review-text-compact">{review.text}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;
