import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { getCategoryIconSvg } from '../utils/categoryIcons.jsx';
import './ViewMap.css';

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

const ViewMap = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState([32.0853, 34.7818]);

  useEffect(() => {
    if (user && id) {
      fetchMapData();
    }
  }, [user, id]);

  useEffect(() => {
    // Update map center when map data is loaded
    if (map && map.pointIds && map.pointIds.length > 0) {
      const firstPoint = map.pointIds[0];
      if (firstPoint.coordinates) {
        setMapCenter([firstPoint.coordinates.lat, firstPoint.coordinates.lng]);
      }
    }
  }, [map]);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/personal-maps/${id}`);
      setMap(response.data.map);
    } catch (err) {
      console.error('Error fetching map:', err);
      setError(err.response?.data?.message || 'Failed to load map');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="view-map-container">
        <div className="no-auth">
          <p>Please log in to view this map</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="view-map-container">
        <div className="loading">Loading map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-map-container">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/me/maps')} className="btn-back">
          Back to My Maps
        </button>
      </div>
    );
  }

  if (!map) {
    return (
      <div className="view-map-container">
        <div className="error">Map not found</div>
        <button onClick={() => navigate('/me/maps')} className="btn-back">
          Back to My Maps
        </button>
      </div>
    );
  }

  const points = map.pointIds || [];

  return (
    <div className="view-map-container">
      {/* Header */}
      <div className="view-map-header">
        <div className="header-content">
          <button className="btn-back" onClick={() => navigate('/me/maps')}>
            ← Back to My Maps
          </button>
          
          {map.coverImage && (
            <div
              className="header-cover"
              style={{ backgroundImage: `url(${map.coverImage})` }}
            />
          )}
          
          <div className="header-info">
            <h1>{map.title}</h1>
            {map.description && <p className="map-description">{map.description}</p>}
            <div className="map-meta">
              <span className="points-count">
                📍 {points.length} point{points.length !== 1 ? 's' : ''}
              </span>
              <span className="update-date">
                Updated: {new Date(map.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <button
            className="btn-edit"
            onClick={() => navigate(`/me/maps/${id}/edit`)}
          >
            ✏️ Edit Map
          </button>
        </div>
      </div>

      {/* Map View */}
      <div className="map-section">
        {points.length === 0 ? (
          <div className="no-points">
            <p>This map doesn't have any points yet.</p>
            <button
              className="btn-add-points"
              onClick={() => navigate(`/me/maps/${id}/edit`)}
            >
              Add Points
            </button>
          </div>
        ) : (
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

            {points.map((point) => {
              if (!point.coordinates) return null;

              const { lat, lng } = point.coordinates;
              const iconSvg = getCategoryIconSvg(point.category);

              return (
                <Marker key={point._id} position={[lat, lng]} icon={createIcon(iconSvg)}>
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
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Points List */}
      {points.length > 0 && (
        <div className="points-list-section">
          <h2>Points in This Map</h2>
          <div className="points-grid">
            {points.map((point) => (
              <div key={point._id} className="point-card">
                {point.imageUrl && (
                  <div
                    className="point-card-image"
                    style={{ backgroundImage: `url(${point.imageUrl})` }}
                  />
                )}
                <div className="point-card-content">
                  <h3>{point.name}</h3>
                  <p className="point-location">📍 {point.location}</p>
                  <p className="point-category">{point.category}</p>
                  {point.description && (
                    <p className="point-description">{point.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMap;
