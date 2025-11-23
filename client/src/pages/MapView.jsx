import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { renderToString } from 'react-dom/server';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axiosInstance from '../api/axiosInstance';
import { getCategoryIconSvg } from '../utils/categoryIcons.jsx';
import { CATEGORIES } from '../constants/categories';
import './MapView.css';

// Create a reusable marker icon with Material Icons
const createIcon = (svg) =>
  L.divIcon({
    html: `
      <div class="map-pin">
        <div class="map-pin-icon">${svg}</div>
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
  });

const MapView = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/points');
      setPoints(response.data);
    } catch (err) {
      console.error('Error fetching points:', err);
      setError(err.response?.data?.message || 'Failed to fetch points');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="map-view-container">
        <div className="map-loading">Loading map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-view-container">
        <div className="map-error">
          <p>{error}</p>
          <button onClick={fetchPoints} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="map-view-container">
      <div className="map-header">
        <h1>Explore NomadLand Points</h1>
        <p>Discover amazing locations shared by our community</p>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={[32.0853, 34.7818]}
          zoom={8}
          scrollWheelZoom={true}
          className="leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {points.map((point) => {
            // Ensure valid coordinates
            const lat = parseFloat(point.lat);
            const lng = parseFloat(point.lng);

            if (isNaN(lat) || isNaN(lng)) {
              console.warn(`Invalid coordinates for point ${point._id}`);
              return null;
            }

            // Get category-specific icon
            const svg = getCategoryIconSvg(point.category);
            const icon = createIcon(svg);

            return (
              <Marker
                key={point._id}
                position={[lat, lng]}
                icon={icon}
              >
                <Popup>
                  <div className="marker-popup">
                    <h3>{point.title}</h3>
                    <p className="popup-category">
                      {CATEGORIES.find(c => c.key === point.category)?.label || point.category}
                    </p>
                    
                    {point.images && point.images.length > 0 && (
                      <img
                        src={point.images[0]}
                        alt={point.title}
                        className="popup-image"
                      />
                    )}
                    
                    <Link to={`/points/${point._id}`} className="popup-link">
                      View Details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="map-stats">
        <p>Showing {points.length} {points.length === 1 ? 'point' : 'points'} on the map</p>
      </div>
    </div>
  );
};

export default MapView;
