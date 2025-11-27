import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants/categories';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import './PointDetails.css';

const PointDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [point, setPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchPoint();
  }, [id]);

  useEffect(() => {
    if (point) {
      fetchReviews();
    }
  }, [id, point]);

  const fetchPoint = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/points/${id}`);
      setPoint(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch point details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axiosInstance.get(`/reviews/${id}`);
      // Filter reviews by point language
      // If point is English-only, show only English reviews
      // If point is Hebrew, show Hebrew reviews
      let filteredReviews = response.data;
      if (point?.language === 'en') {
        filteredReviews = response.data.filter(r => r.language === 'en');
      } else if (point?.language === 'he') {
        filteredReviews = response.data.filter(r => r.language === 'he');
      }
      setReviews(filteredReviews);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleReviewAdded = (newReview) => {
    setReviews([newReview, ...reviews]);
    setShowReviewForm(false);
    fetchPoint(); // Refresh point to get updated averages
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews(reviews.filter(r => r._id !== reviewId));
    fetchPoint(); // Refresh point to get updated averages
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this point?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/points/${id}`);
      navigate('/points');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete point');
    }
  };

  if (loading) {
    return (
      <div className="point-details-container">
        <p className="loading-message">Loading point details...</p>
      </div>
    );
  }

  if (error || !point) {
    return (
      <div className="point-details-container">
        <div className="error-message">{error || 'Point not found'}</div>
        <button onClick={() => navigate('/points')} className="btn btn-secondary">
          Back to Points
        </button>
      </div>
    );
  }

  const isOwner = user && point.createdBy && user.id === point.createdBy._id;
  const isAdmin = user && user.role === 'admin';
  const canModify = isOwner || isAdmin;
  const userHasReviewed = user && reviews.some(r => r.userId?._id === user.id);

  return (
    <div className="point-details-container">
      <button onClick={() => navigate('/points')} className="back-button">
        ← Back to Points
      </button>

      <div className="point-details-card">
        {point.images?.[0] && (
          <div className="point-details-image">
            <img src={point.images[0]} alt={point.title} />
          </div>
        )}

        <div className="point-details-content">
          <div className="point-details-header">
            <h1>{point.title}</h1>
            <span className="point-details-category">
              {CATEGORIES.find(c => c.key === point.category)?.label || point.category}
            </span>
          </div>

          <p className="point-details-description">{point.description}</p>

          <div className="point-details-info">
            <div className="info-item">
              <strong>📍 Location:</strong>
              <span>
                {point.lat?.toFixed(6)}, {point.lng?.toFixed(6)}
              </span>
            </div>

            <div className="info-item">
              <strong>👤 Created by:</strong>
              <span>
                {point.createdBy?.username || point.createdBy?.name || 'Anonymous'}
              </span>
            </div>

            <div className="info-item">
              <strong>🌐 Language:</strong>
              <span>
                {point.language === 'he' ? 'עברית (Hebrew)' : 'English'}
              </span>
            </div>

            <div className="info-item">
              <strong>📅 Created:</strong>
              <span>{new Date(point.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {canModify && (
            <div className="point-actions">
              <button onClick={handleDelete} className="btn btn-danger">
                Delete Point
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Summary */}
      {(point.averageRating !== null || reviews.length > 0) && (
        <div className="reviews-summary-card">
          <h2>Reviews Summary</h2>
          <div className="reviews-summary-grid">
            <div className="summary-item">
              <span className="summary-label">Overall Rating</span>
              <span className="summary-value">
                {point.averageRating ? `⭐ ${point.averageRating.toFixed(1)}` : 'N/A'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Price Level</span>
              <span className="summary-value">
                {point.averagePriceLevel ? `💰 ${point.averagePriceLevel.toFixed(1)}` : 'N/A'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Accessibility (Arrival)</span>
              <span className="summary-value">
                {point.averageAccessibilityArrival ? `🚗 ${point.averageAccessibilityArrival.toFixed(1)}` : 'N/A'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Accessibility (Disability)</span>
              <span className="summary-value">
                {point.averageAccessibilityDisability ? `♿ ${point.averageAccessibilityDisability.toFixed(1)}` : 'N/A'}
              </span>
            </div>
          </div>
          <div className="reviews-count">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </div>
        </div>
      )}

      {/* Write Review Section */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h2>Reviews</h2>
          {user && !userHasReviewed && !showReviewForm && (
            <button 
              onClick={() => setShowReviewForm(true)} 
              className="btn btn-primary"
            >
              Write a Review
            </button>
          )}
        </div>

        {!user && (
          <p className="login-prompt">Please log in to write a review.</p>
        )}

        {user && userHasReviewed && (
          <p className="already-reviewed-message">You have already reviewed this point.</p>
        )}

        {showReviewForm && (
          <>
            {point.language === 'en' && (
              <div className="language-notice" style={{
                backgroundColor: '#e3f2fd',
                padding: '0.75rem 1rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                ℹ️ This is an English point. Please write your review in English only.
              </div>
            )}
            <ReviewForm
              pointId={id}
              onReviewAdded={handleReviewAdded}
              onCancel={() => setShowReviewForm(false)}
              requiredLanguage={point.language === 'en' ? 'en' : 'he'}
            />
          </>
        )}

        <ReviewList
          reviews={reviews}
          currentUserId={user?.id}
          isAdmin={isAdmin}
          onReviewDeleted={handleReviewDeleted}
        />
      </div>
    </div>
  );
};

export default PointDetails;
