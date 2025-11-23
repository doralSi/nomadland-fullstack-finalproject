import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants/categories';
import './PointDetails.css';

const PointDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [point, setPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPoint();
  }, [id]);

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
    </div>
  );
};

export default PointDetails;
