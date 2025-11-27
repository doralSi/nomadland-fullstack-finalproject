import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './MyMaps.css';

const MyMaps = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMyMaps();
    }
  }, [user]);

  const fetchMyMaps = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/personal-maps/my');
      setMaps(response.data.maps || []);
    } catch (err) {
      console.error('Error fetching my maps:', err);
      setError(err.response?.data?.message || 'Failed to load maps');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mapId) => {
    if (!window.confirm('Are you sure you want to delete this map?')) {
      return;
    }

    try {
      await axios.delete(`/personal-maps/${mapId}`);
      alert('Map deleted successfully');
      fetchMyMaps(); // Refresh list
    } catch (err) {
      console.error('Error deleting map:', err);
      alert(err.response?.data?.message || 'Failed to delete map');
    }
  };

  if (!user) {
    return (
      <div className="my-maps-container">
        <div className="no-auth">
          <p>Please log in to view your maps</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-maps-container">
        <div className="loading">Loading your maps...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-maps-container">
        <div className="error">{error}</div>
        <button onClick={fetchMyMaps} className="btn-retry">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="my-maps-container">
      <div className="my-maps-header">
        <h1>My Personal Maps</h1>
        <button
          className="btn-create-map"
          onClick={() => navigate('/me/maps/create')}
        >
          + Create New Map
        </button>
      </div>

      {maps.length === 0 ? (
        <div className="no-maps">
          <p>You haven't created any maps yet.</p>
          <p>Start by creating your first personal map collection!</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/me/maps/create')}
          >
            Create Your First Map
          </button>
        </div>
      ) : (
        <div className="maps-grid">
          {maps.map((map) => (
            <div key={map._id} className="map-card">
              {map.coverImage && (
                <div
                  className="map-card-image"
                  style={{ backgroundImage: `url(${map.coverImage})` }}
                />
              )}
              <div className="map-card-content">
                <h3>{map.title}</h3>
                {map.description && <p className="map-description">{map.description}</p>}
                <p className="map-points-count">
                  {map.pointIds?.length || 0} point{map.pointIds?.length !== 1 ? 's' : ''}
                </p>
                <p className="map-date">
                  Updated: {new Date(map.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="map-card-actions">
                <button
                  className="btn-view"
                  onClick={() => navigate(`/me/maps/${map._id}`)}
                >
                  View
                </button>
                <button
                  className="btn-edit"
                  onClick={() => navigate(`/me/maps/${map._id}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(map._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMaps;
