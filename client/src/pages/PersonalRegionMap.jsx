import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { getUserPointsInRegion } from '../api/personalMaps';
import { deletePoint, updatePoint, removeFromFavorites } from '../api/points';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants/categories';
import axiosInstance from '../api/axiosInstance';
import './PersonalRegionMap.css';

// Custom icon colors based on category like in RegionMap
const getCategoryIcon = (categoryKey) => {
  const item = CATEGORIES.find(c => c.key === categoryKey);
  return item ? item.materialIcon : 'location_on';
};

// Create custom DivIcon for points
const createPointIcon = (categoryKey, pointType) => {
  const iconName = getCategoryIcon(categoryKey);
  const typeClass = pointType === 'private' ? 'private-point' : 
                    pointType === 'favorite' ? 'favorite-point' : 
                    pointType === 'reviewed' ? 'reviewed-point' : 'public-point';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="map-marker category-${categoryKey} ${typeClass}">
        <span class="material-symbols-outlined">${iconName}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Map controller to set view
const MapViewController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const PersonalRegionMap = () => {
  const { regionSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [region, setRegion] = useState(null);
  const [createdPoints, setCreatedPoints] = useState([]);
  const [favoritePoints, setFavoritePoints] = useState([]);
  const [reviewedPoints, setReviewedPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPoint, setEditingPoint] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    if (user && regionSlug) {
      fetchRegionData();
    }
  }, [user, regionSlug]);

  const fetchRegionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserPointsInRegion(regionSlug);
      setRegion(response.region);
      setCreatedPoints(response.createdPoints || []);
      setFavoritePoints(response.favoritePoints || []);
      setReviewedPoints(response.reviewedPoints || []);
    } catch (err) {
      console.error('Error fetching region data:', err);
      setError(err.response?.data?.message || 'Failed to load region data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoint = async (pointId) => {
    if (!window.confirm('Are you sure you want to delete this point?')) {
      return;
    }

    try {
      await deletePoint(pointId);
      alert('Point deleted successfully');
      fetchRegionData();
    } catch (err) {
      console.error('Error deleting point:', err);
      alert(err.response?.data?.message || 'Failed to delete point');
    }
  };

  const handleEditPoint = async (pointId, updates) => {
    try {
      await updatePoint(pointId, updates);
      alert('Point updated successfully');
      setEditingPoint(null);
      fetchRegionData();
    } catch (err) {
      console.error('Error updating point:', err);
      alert(err.response?.data?.message || 'Failed to update point');
    }
  };

  const handleRemoveFromFavorites = async (pointId) => {
    if (!window.confirm('Remove this point from your favorites?')) {
      return;
    }

    try {
      await removeFromFavorites(pointId);
      alert('Removed from favorites');
      fetchRegionData();
    } catch (err) {
      console.error('Error removing favorite:', err);
      alert(err.response?.data?.message || 'Failed to remove favorite');
    }
  };

  const handleEditReview = async (reviewId, updates) => {
    try {
      await axiosInstance.put(`/reviews/${reviewId}`, updates);
      alert('Review updated successfully');
      setEditingReview(null);
      fetchRegionData();
    } catch (err) {
      console.error('Error updating review:', err);
      alert(err.response?.data?.message || 'Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/reviews/${reviewId}`);
      alert('Review deleted successfully');
      fetchRegionData();
    } catch (err) {
      console.error('Error deleting review:', err);
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const getReviewCount = (point) => {
    return point.reviewCount || 0;
  };

  if (!user) {
    return (
      <div className="personal-region-map-container">
        <div className="no-auth">
          <p>Please log in to view your personal map</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="personal-region-map-container">
        <div className="loading">Loading your map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="personal-region-map-container">
        <div className="error">{error}</div>
        <button onClick={fetchRegionData} className="btn-retry">
          Try Again
        </button>
      </div>
    );
  }

  if (!region) {
    return (
      <div className="personal-region-map-container">
        <div className="error">Region not found</div>
      </div>
    );
  }

  return (
    <div className="personal-region-map-container">
      <div className="map-header">
        <button onClick={() => navigate('/me/maps')} className="btn-back">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to My Maps
        </button>
        <h1>{region.name}</h1>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-icon" style={{ backgroundColor: '#10b981' }}></div>
            <span>Public Points ({createdPoints.filter(p => !p.isPrivate).length})</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon" style={{ backgroundColor: '#3b82f6' }}></div>
            <span>Private Points ({createdPoints.filter(p => p.isPrivate).length})</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Favorites ({favoritePoints.length})</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>Reviewed ({reviewedPoints.length})</span>
          </div>
        </div>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={[region.center.lat, region.center.lng]}
          zoom={region.zoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapViewController center={region.center} zoom={region.zoom} />

          {/* Region polygon */}
          {region.polygon && (
            <Polygon
              positions={region.polygon.map(coord => [coord[1], coord[0]])}
              pathOptions={{
                color: '#667eea',
                fillColor: '#667eea',
                fillOpacity: 0.05,
                weight: 2
              }}
            />
          )}

          {/* Render created points */}
          {createdPoints.map((point) => {
            const pointType = point.isPrivate ? 'private' : 'public';
            return (
              <Marker
                key={`created-${point._id}`}
                position={[point.lat, point.lng]}
                icon={createPointIcon(point.category, pointType)}
              >
                <Popup maxWidth={340} className="professional-popup">
                  <div className="point-popup-professional">
                    {point.category && (
                      <div className="popup-category-badge">
                        <span className="material-symbols-outlined">
                          {CATEGORIES.find(cat => cat.key === point.category)?.materialIcon || 'place'}
                        </span>
                      </div>
                    )}
                    
                    <div className="popup-title-section">
                      <h3 className="popup-title">{point.title}</h3>
                      {point.category && (
                        <p className="popup-subtitle">
                          {CATEGORIES.find(cat => cat.key === point.category)?.label || 'Location'}
                        </p>
                      )}
                    </div>
                    
                    <div className="popup-stats-section">
                      <div className="popup-stat-item">
                        <span className="material-symbols-outlined">star</span>
                        <span className="stat-value">{point.averageRating ? point.averageRating.toFixed(1) : '0'}</span>
                        <span className="stat-label">Rating</span>
                      </div>
                      <div className="popup-stat-item">
                        <span className="material-symbols-outlined">payments</span>
                        <span className="stat-value">{point.averagePriceLevel ? point.averagePriceLevel.toFixed(1) : '0'}</span>
                        <span className="stat-label">Price</span>
                      </div>
                      <div className="popup-stat-item">
                        <span className="material-symbols-outlined">directions_car</span>
                        <span className="stat-value">{point.averageAccessibilityArrival ? point.averageAccessibilityArrival.toFixed(1) : '0'}</span>
                        <span className="stat-label">Difficulty</span>
                      </div>
                      <div className="popup-stat-item">
                        <span className="material-symbols-outlined">accessible</span>
                        <span className="stat-value">{point.averageAccessibilityDisability ? point.averageAccessibilityDisability.toFixed(1) : '0'}</span>
                        <span className="stat-label">Access</span>
                      </div>
                    </div>
                    
                    <div className="popup-review-count-badge">
                      <span className="material-symbols-outlined">rate_review</span>
                      <span>{getReviewCount(point)} reviews</span>
                    </div>

                    {point.isPrivate && (
                      <div className="popup-type-badge private">
                        <span className="material-symbols-outlined">lock</span>
                        Private Point
                      </div>
                    )}
                    
                    <div className="popup-actions-professional">
                      {point.isPrivate && (
                        <>
                          <button 
                            className="popup-btn-pro popup-btn-edit"
                            onClick={() => setEditingPoint(point)}
                          >
                            <span className="material-symbols-outlined">edit</span>
                            Edit
                          </button>
                          <button 
                            className="popup-btn-pro popup-btn-delete"
                            onClick={() => handleDeletePoint(point._id)}
                          >
                            <span className="material-symbols-outlined">delete</span>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Render favorite points */}
          {favoritePoints.map((point) => (
            <Marker
              key={`favorite-${point._id}`}
              position={[point.lat, point.lng]}
              icon={createPointIcon(point.category, 'favorite')}
            >
              <Popup maxWidth={340} className="professional-popup">
                <div className="point-popup-professional">
                  {point.category && (
                    <div className="popup-category-badge">
                      <span className="material-symbols-outlined">
                        {CATEGORIES.find(cat => cat.key === point.category)?.materialIcon || 'place'}
                      </span>
                    </div>
                  )}
                  
                  <div className="popup-title-section">
                    <h3 className="popup-title">{point.title}</h3>
                    {point.category && (
                      <p className="popup-subtitle">
                        {CATEGORIES.find(cat => cat.key === point.category)?.label || 'Location'}
                      </p>
                    )}
                  </div>
                  
                  <div className="popup-stats-section">
                    <div className="popup-stat-item">
                      <span className="material-symbols-outlined">star</span>
                      <span className="stat-value">{point.averageRating ? point.averageRating.toFixed(1) : '0'}</span>
                      <span className="stat-label">Rating</span>
                    </div>
                    <div className="popup-stat-item">
                      <span className="material-symbols-outlined">payments</span>
                      <span className="stat-value">{point.averagePriceLevel ? point.averagePriceLevel.toFixed(1) : '0'}</span>
                      <span className="stat-label">Price</span>
                    </div>
                    <div className="popup-stat-item">
                      <span className="material-symbols-outlined">directions_car</span>
                      <span className="stat-value">{point.averageAccessibilityArrival ? point.averageAccessibilityArrival.toFixed(1) : '0'}</span>
                      <span className="stat-label">Difficulty</span>
                    </div>
                    <div className="popup-stat-item">
                      <span className="material-symbols-outlined">accessible</span>
                      <span className="stat-value">{point.averageAccessibilityDisability ? point.averageAccessibilityDisability.toFixed(1) : '0'}</span>
                      <span className="stat-label">Access</span>
                    </div>
                  </div>
                  
                  <div className="popup-review-count-badge">
                    <span className="material-symbols-outlined">rate_review</span>
                    <span>{getReviewCount(point)} reviews</span>
                  </div>

                  <div className="popup-type-badge favorite">
                    <span className="material-symbols-outlined">favorite</span>
                    Favorite
                  </div>
                  
                  <div className="popup-actions-professional">
                    <button 
                      className="popup-btn-pro popup-btn-remove-favorite"
                      onClick={() => handleRemoveFromFavorites(point._id)}
                    >
                      <span className="material-symbols-outlined">heart_broken</span>
                      Remove Favorite
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render reviewed points */}
          {reviewedPoints.map((point) => (
            <Marker
              key={`reviewed-${point._id}`}
              position={[point.lat, point.lng]}
              icon={createPointIcon(point.category, 'reviewed')}
            >
              <Popup maxWidth={340} className="professional-popup">
                <div className="point-popup-professional">
                  {point.category && (
                    <div className="popup-category-badge">
                      <span className="material-symbols-outlined">
                        {CATEGORIES.find(cat => cat.key === point.category)?.materialIcon || 'place'}
                      </span>
                    </div>
                  )}
                  
                  <div className="popup-title-section">
                    <h3 className="popup-title">{point.title}</h3>
                    {point.category && (
                      <p className="popup-subtitle">
                        {CATEGORIES.find(cat => cat.key === point.category)?.label || 'Location'}
                      </p>
                    )}
                  </div>
                  
                  <div className="popup-stats-section">
                    <div className="popup-stat-item">
                      <span className="material-symbols-outlined">star</span>
                      <span className="stat-value">{point.averageRating ? point.averageRating.toFixed(1) : '0'}</span>
                      <span className="stat-label">Rating</span>
                    </div>
                    <div className="popup-stat-item">
                      <span className="material-symbols-outlined">payments</span>
                      <span className="stat-value">{point.averagePriceLevel ? point.averagePriceLevel.toFixed(1) : '0'}</span>
                      <span className="stat-label">Price</span>
                    </div>
                    <div className="popup-stat-item">
                      <span className="material-symbols-outlined">directions_car</span>
                      <span className="stat-value">{point.averageAccessibilityArrival ? point.averageAccessibilityArrival.toFixed(1) : '0'}</span>
                      <span className="stat-label">Difficulty</span>
                    </div>
                    <div className="popup-stat-item">
                      <span className="material-symbols-outlined">accessible</span>
                      <span className="stat-value">{point.averageAccessibilityDisability ? point.averageAccessibilityDisability.toFixed(1) : '0'}</span>
                      <span className="stat-label">Access</span>
                    </div>
                  </div>
                  
                  <div className="popup-review-count-badge">
                    <span className="material-symbols-outlined">rate_review</span>
                    <span>{getReviewCount(point)} reviews</span>
                  </div>

                  {point.userReview && (
                    <div className="user-review-section">
                      <h4>Your Review</h4>
                      <div className="review-stars">
                        {'⭐'.repeat(point.userReview.rating)}
                      </div>
                      <p className="review-text">{point.userReview.comment}</p>
                    </div>
                  )}

                  <div className="popup-type-badge reviewed">
                    <span className="material-symbols-outlined">rate_review</span>
                    You Reviewed This
                  </div>
                  
                  <div className="popup-actions-professional">
                    <button 
                      className="popup-btn-pro popup-btn-edit-review"
                      onClick={() => setEditingReview(point.userReview)}
                    >
                      <span className="material-symbols-outlined">edit</span>
                      Edit Review
                    </button>
                    <button 
                      className="popup-btn-pro popup-btn-delete-review"
                      onClick={() => handleDeleteReview(point.userReview._id)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                      Delete Review
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Edit Point Modal */}
      {editingPoint && (
        <div className="modal-overlay" onClick={() => setEditingPoint(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Point</h2>
              <button className="modal-close-btn" onClick={() => setEditingPoint(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleEditPoint(editingPoint._id, {
                  title: formData.get('title'),
                  description: formData.get('description'),
                  category: formData.get('category'),
                });
              }}
              className="modal-form"
            >
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  defaultValue={editingPoint.title}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  defaultValue={editingPoint.category}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={editingPoint.description}
                  rows={4}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingPoint(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="modal-overlay" onClick={() => setEditingReview(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Review</h2>
              <button className="modal-close-btn" onClick={() => setEditingReview(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleEditReview(editingReview._id, {
                  rating: parseInt(formData.get('rating')),
                  comment: formData.get('comment'),
                });
              }}
              className="modal-form"
            >
              <div className="form-group">
                <label htmlFor="rating">Rating</label>
                <select
                  id="rating"
                  name="rating"
                  defaultValue={editingReview.rating}
                  required
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>
                      {'⭐'.repeat(num)} ({num})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="comment">Comment</label>
                <textarea
                  id="comment"
                  name="comment"
                  defaultValue={editingReview.comment}
                  rows={6}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingReview(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalRegionMap;
