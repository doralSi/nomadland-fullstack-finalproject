import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './EventDetails.css';
import 'leaflet/dist/leaflet.css';

const EventDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const eventDate = searchParams.get('date');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/events/${id}`);
      setEvent(response.data);
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError(err.response?.data?.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/event/${id}/edit${eventDate ? `?date=${eventDate}` : ''}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את האירוע?')) {
      return;
    }

    try {
      setDeleting(true);
      await axios.delete(`/events/${id}`);
      alert('האירוע נמחק בהצלחה');
      navigate(`/region/${event.region.slug}/events`);
    } catch (err) {
      console.error('Error deleting event:', err);
      alert(err.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => {
    if (event && event.region) {
      navigate(`/region/${event.region.slug}/events`);
    } else {
      navigate(-1);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  if (loading) {
    return (
      <div className="event-details-container">
        <div className="event-details-loading">טוען פרטי אירוע...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-details-container">
        <div className="event-details-error">
          <span className="material-icons">error_outline</span>
          <h2>{error || 'האירוע לא נמצא'}</h2>
          <button onClick={handleBack} className="back-btn">
            חזרה
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user && event.createdBy && event.createdBy._id === user.id;
  const isAdmin = user && user.role === 'admin';
  const canEdit = isOwner || isAdmin;

  return (
    <div className="event-details-container">
      {/* Header */}
      <div className="event-details-header">
        <button onClick={handleBack} className="back-btn">
          <span className="material-icons">arrow_back</span>
          חזרה ללוח אירועים
        </button>
        {canEdit && (
          <div className="event-actions">
            <button onClick={handleEdit} className="edit-btn">
              <span className="material-icons">edit</span>
              ערוך
            </button>
            <button onClick={handleDelete} className="delete-btn" disabled={deleting}>
              <span className="material-icons">delete</span>
              {deleting ? 'מוחק...' : 'מחק'}
            </button>
          </div>
        )}
      </div>

      {/* Event Hero */}
      {event.imageUrl && (
        <div className="event-hero">
          <img src={event.imageUrl} alt={event.title} />
          {event.cost && (
            <div className="event-cost-badge">{event.cost}</div>
          )}
        </div>
      )}

      {/* Event Content */}
      <div className="event-details-content">
        <div className="event-main-info">
          <h1>{event.title}</h1>

          {/* Event Meta */}
          <div className="event-meta">
            <div className="meta-item">
              <span className="material-icons">event</span>
              <div>
                <strong>תאריך</strong>
                <p>{eventDate ? formatDate(eventDate) : formatDate(event.startDate)}</p>
              </div>
            </div>
            <div className="meta-item">
              <span className="material-icons">schedule</span>
              <div>
                <strong>שעה</strong>
                <p>{formatTime(event.time)}</p>
              </div>
            </div>
            {event.cost && (
              <div className="meta-item">
                <span className="material-icons">payments</span>
                <div>
                  <strong>עלות</strong>
                  <p>{event.cost}</p>
                </div>
              </div>
            )}
            <div className="meta-item">
              <span className="material-icons">place</span>
              <div>
                <strong>אזור</strong>
                <p>{event.region?.name}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="event-description">
            <h2>תיאור</h2>
            <p>{event.description}</p>
          </div>

          {/* Repeat Info */}
          {event.repeat !== 'none' && (
            <div className="event-repeat-info">
              <span className="material-icons">repeat</span>
              <span>
                אירוע חוזר: {' '}
                {event.repeat === 'daily' && 'יומי'}
                {event.repeat === 'weekly' && 'שבועי'}
                {event.repeat === 'monthly' && 'חודשי'}
              </span>
            </div>
          )}

          {/* Status Badge */}
          <div className={`event-status-badge ${event.status}`}>
            {event.status === 'approved' && 'מאושר'}
            {event.status === 'underReview' && 'בבדיקה'}
            {event.status === 'rejected' && 'נדחה'}
          </div>
        </div>

        {/* Map */}
        {event.location && (
          <div className="event-location-map">
            <h2>מיקום</h2>
            <div className="map-wrapper">
              <MapContainer
                center={[event.location.lat, event.location.lng]}
                zoom={15}
                style={{ height: '300px', width: '100%', borderRadius: '12px' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[event.location.lat, event.location.lng]}>
                  <Popup>{event.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="coordinates">
              קואורדינטות: {event.location.lat.toFixed(6)}, {event.location.lng.toFixed(6)}
            </div>
          </div>
        )}

        {/* Creator Info */}
        {event.createdBy && (
          <div className="event-creator-info">
            <span className="material-icons">person</span>
            <span>נוצר על ידי: {event.createdBy.username || event.createdBy.email}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
