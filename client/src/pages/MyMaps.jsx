import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRegions } from '../api/personalMaps';
import { useAuth } from '../context/AuthContext';
import './MyMaps.css';

const MyMaps = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserRegions();
    }
  }, [user]);

  const fetchUserRegions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserRegions();
      setRegions(response.regions || []);
    } catch (err) {
      console.error('Error fetching user regions:', err);
      setError(err.response?.data?.message || 'Failed to load regions');
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
        <button onClick={fetchUserRegions} className="btn-retry">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="my-maps-container">
      <div className="my-maps-header">
        <h1>My NomadLand Maps</h1>
        <p>Your personal journey across digital nomad communities</p>
      </div>

      {regions.length === 0 ? (
        <div className="no-maps">
          <p>You haven't created or favorited any points yet.</p>
          <p>Start exploring the map and add your favorite places!</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Go to Map
          </button>
        </div>
      ) : (
        <div className="regions-grid">
          {regions.map((region) => (
            <div
              key={region._id}
              className="region-card"
              onClick={() => navigate(`/me/maps/${region.slug}`)}
            >
              {region.heroImageUrl && (
                <div className="region-image">
                  <img src={region.heroImageUrl} alt={region.name} />
                </div>
              )}
              <div className="region-content">
                <h3>{region.name}</h3>
                <div className="region-stats">
                  <span className="stat">
                    <span className="material-symbols-outlined">add_location</span>
                    {region.createdCount} created
                  </span>
                  <span className="stat">
                    <span className="material-symbols-outlined">favorite</span>
                    {region.favoriteCount} favorited
                  </span>
                  <span className="stat">
                    <span className="material-symbols-outlined">rate_review</span>
                    {region.reviewedCount || 0} reviewed
                  </span>
                  <span className="stat total">
                    <span className="material-symbols-outlined">location_on</span>
                    {region.pointCount} total
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMaps;
