import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from '../api/axiosInstance';
import './EditPointLocation.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks and marker dragging
const DraggableMarker = ({ position, setPosition }) => {
  const [draggable, setDraggable] = useState(true);
  const markerRef = React.useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setPosition([newPos.lat, newPos.lng]);
      }
    },
  };

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
};

const EditPointLocation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [point, setPoint] = useState(null);
  const [position, setPosition] = useState([0, 0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPoint();
  }, [id]);

  const fetchPoint = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/points/${id}`);
      setPoint(response.data);
      setPosition([response.data.lat, response.data.lng]);
    } catch (err) {
      console.error('Error fetching point:', err);
      setError(err.response?.data?.message || 'Failed to load point');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await axios.patch(`/map-ranger/points/${id}/location`, {
        lat: position[0],
        lng: position[1]
      });

      setSuccessMessage('Location updated successfully!');
      setTimeout(() => {
        navigate('/map-ranger');
      }, 1500);
    } catch (err) {
      console.error('Error updating location:', err);
      setError(err.response?.data?.message || 'Failed to update location');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/map-ranger');
  };

  if (loading) {
    return (
      <div className="edit-point-location">
        <div className="loading">Loading point data...</div>
      </div>
    );
  }

  if (error && !point) {
    return (
      <div className="edit-point-location">
        <div className="error-message">{error}</div>
        <button className="btn btn-back" onClick={handleCancel}>
          Back to Panel
        </button>
      </div>
    );
  }

  return (
    <div className="edit-point-location">
      <div className="edit-header">
        <h1>📍 Edit Point Location</h1>
        <p className="edit-subtitle">Drag the marker or click on the map to set a new location</p>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      
      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="point-info">
        <h2>{point?.title}</h2>
        <p><strong>Category:</strong> {point?.category || 'N/A'}</p>
        <p><strong>Current Location:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}</p>
      </div>

      <div className="map-container">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={true}
          className="edit-leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      <div className="edit-actions">
        <button 
          className="btn btn-cancel" 
          onClick={handleCancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button 
          className="btn btn-save" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Location'}
        </button>
      </div>
    </div>
  );
};

export default EditPointLocation;
