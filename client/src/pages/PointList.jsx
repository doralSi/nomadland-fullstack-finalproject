import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { CATEGORIES } from '../constants/categories';
import './PointList.css';

const PointList = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/points');
      setPoints(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch points');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="points-container">
        <p className="loading-message">Loading points...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="points-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="points-container">
      <div className="points-header">
        <h1>Travel Points</h1>
        <Link to="/create-point" className="btn btn-primary">
          Add New Point
        </Link>
      </div>

      {points.length === 0 ? (
        <div className="no-points">
          <p>No points found. Be the first to create one!</p>
          <Link to="/create-point" className="btn btn-secondary">
            Create Point
          </Link>
        </div>
      ) : (
        <div className="points-grid">
          {points.map((point) => {
            const image = point.images?.[0] || "/default.jpg";
            return (
            <Link to={`/points/${point._id}`} key={point._id} className="point-card">
              <div className="point-image">
                <img src={image} alt={point.title} />
              </div>
              <div className="point-content">
                <h3>{point.title}</h3>
                <p className="point-description">{point.description}</p>
                <div className="point-meta">
                  <span className="point-category">
                    {CATEGORIES.find(c => c.key === point.category)?.label || point.category}
                  </span>
                  <span className="point-location">
                    📍 {point.lat?.toFixed(4)}, {point.lng?.toFixed(4)}
                  </span>
                </div>
                <div className="point-footer">
                  <span className="point-author">
                    By: {point.createdBy?.username || point.createdBy?.name || 'Anonymous'}
                  </span>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PointList;
