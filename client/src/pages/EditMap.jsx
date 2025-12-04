import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { getCategoryIconSvg } from '../utils/categoryIcons.jsx';
import './EditMap.css';

// Create marker icon
const createIcon = (svg) =>
  L.divIcon({
    html: `
      <div class="map-pin">
        <div class="map-pin-icon">${svg}</div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35]
  });

// Map center updater component
const MapViewController = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

const EditMap = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [map, setMap] = useState(null);
  const [allPoints, setAllPoints] = useState([]);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [mapCenter, setMapCenter] = useState([32.0853, 34.7818]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && id) {
      fetchMapData();
      fetchAllPoints();
    }
  }, [user, id]);

  useEffect(() => {
    // Filter points based on search term
    if (searchTerm.trim()) {
      const filtered = allPoints.filter(
        (point) =>
          point.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          point.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          point.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPoints(filtered);
    } else {
      setFilteredPoints(allPoints);
    }
  }, [searchTerm, allPoints]);

  useEffect(() => {
    // Update map center when points are selected
    if (selectedPoints.length > 0) {
      const firstPoint = selectedPoints[0];
      if (firstPoint.coordinates) {
        setMapCenter([firstPoint.coordinates.lat, firstPoint.coordinates.lng]);
      }
    }
  }, [selectedPoints]);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/personal-maps/${id}`);
      setMap(response.data.map);
      setSelectedPoints(response.data.map.pointIds || []);
    } catch (err) {
      console.error('Error fetching map:', err);
      setError(err.response?.data?.message || 'Failed to load map');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPoints = async () => {
    try {
      const response = await axios.get('/points');
      setAllPoints(response.data);
      setFilteredPoints(response.data);
    } catch (err) {
      console.error('Error fetching points:', err);
    }
  };

  const isPointSelected = (pointId) => {
    return selectedPoints.some((p) => p._id === pointId);
  };

  const handleAddPoint = async (point) => {
    try {
      await axios.patch(`/personal-maps/${id}/add/${point._id}`);
      setSelectedPoints((prev) => [...prev, point]);
    } catch (err) {
      console.error('Error adding point:', err);
      alert(err.response?.data?.message || 'Failed to add point');
    }
  };

  const handleRemovePoint = async (pointId) => {
    try {
      await axios.patch(`/personal-maps/${id}/remove/${pointId}`);
      setSelectedPoints((prev) => prev.filter((p) => p._id !== pointId));
    } catch (err) {
      console.error('Error removing point:', err);
      alert(err.response?.data?.message || 'Failed to remove point');
    }
  };

  const handleUpdateMapInfo = async () => {
    if (!map) return;

    const newTitle = prompt('Enter new map title:', map.title);
    if (!newTitle) return;

    const newDescription = prompt('Enter new map description:', map.description);

    try {
      setSaving(true);
      const response = await axios.patch(`/personal-maps/${id}`, {
        title: newTitle,
        description: newDescription || ''
      });
      setMap(response.data.map);
      alert('Map updated successfully!');
    } catch (err) {
      console.error('Error updating map:', err);
      alert(err.response?.data?.message || 'Failed to update map');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMap = async () => {
    if (!window.confirm('Are you sure you want to delete this map? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/personal-maps/${id}`);
      alert('Map deleted successfully');
      navigate('/me/maps');
    } catch (err) {
      console.error('Error deleting map:', err);
      alert(err.response?.data?.message || 'Failed to delete map');
    }
  };

  if (!user) {
    return (
      <div className="edit-map-container">
        <div className="no-auth">
          <p>Please log in to edit maps</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="edit-map-container">
        <div className="loading">Loading map editor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-map-container">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/me/maps')} className="btn-back">
          Back to My Maps
        </button>
      </div>
    );
  }

  return (
    <div className="edit-map-container">
      <div className="edit-map-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/me/maps')}>
            ← Back
          </button>
          <h1>{map?.title}</h1>
        </div>
        <div className="header-actions">
          <button className="btn-view" onClick={() => navigate(`/me/maps/${id}`)}>
            👁 View
          </button>
          <button className="btn-edit-info" onClick={handleUpdateMapInfo} disabled={saving}>
            ✏️ Edit Info
          </button>
          <button className="btn-delete" onClick={handleDeleteMap}>
            🗑 Delete Map
          </button>
        </div>
      </div>

      <div className="edit-map-content">
        {/* Left Panel - Point Browser */}
        <div className="points-panel">
          <div className="panel-header">
            <h2>Available Points</h2>
            <div className="selected-count">
              {selectedPoints.length} point{selectedPoints.length !== 1 ? 's' : ''} selected
            </div>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search points..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="points-list">
            {filteredPoints.length === 0 ? (
              <div className="no-results">
                {searchTerm ? 'No points found' : 'Loading points...'}
              </div>
            ) : (
              filteredPoints.map((point) => {
                const isSelected = isPointSelected(point._id);
                return (
                  <div key={point._id} className={`point-item ${isSelected ? 'selected' : ''}`}>
                    <div className="point-info">
                      <h4>{point.name}</h4>
                      <p className="point-location">{point.location}</p>
                      <p className="point-category">{point.category}</p>
                    </div>
                    <button
                      className={`btn-toggle ${isSelected ? 'btn-remove' : 'btn-add'}`}
                      onClick={() =>
                        isSelected ? handleRemovePoint(point._id) : handleAddPoint(point)
                      }
                    >
                      {isSelected ? '✓ Added' : '+ Add'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Map View */}
        <div className="map-panel">
          <div className="map-wrapper">
            <MapContainer
              center={mapCenter}
              zoom={8}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <MapViewController center={mapCenter} />

              {selectedPoints.map((point) => {
                if (!point.coordinates) return null;

                const { lat, lng } = point.coordinates;
                const iconSvg = getCategoryIconSvg(point.category);

                return (
                  <Marker
                    key={point._id}
                    position={[lat, lng]}
                    icon={createIcon(iconSvg)}
                  >
                    <Popup>
                      <div className="popup-content">
                        <h3>{point.name}</h3>
                        {point.imageUrl && (
                          <img src={point.imageUrl} alt={point.name} className="popup-image" />
                        )}
                        <p>{point.description}</p>
                        <p>
                          <strong>Location:</strong> {point.location}
                        </p>
                        <p>
                          <strong>Category:</strong> {point.category}
                        </p>
                        <button
                          className="btn-remove-from-map"
                          onClick={() => handleRemovePoint(point._id)}
                        >
                          Remove from Map
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {selectedPoints.length === 0 && (
            <div className="map-empty-state">
              <p>No points selected yet</p>
              <p>Add points from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditMap;
