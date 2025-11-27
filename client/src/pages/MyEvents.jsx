import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './MyEvents.css';

const MyEvents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'

  useEffect(() => {
    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/events/me');
      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching my events:', err);
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את האירוע?')) {
      return;
    }

    try {
      await axios.delete(`/events/${eventId}`);
      alert('האירוע נמחק בהצלחה');
      fetchMyEvents(); // Refresh list
    } catch (err) {
      console.error('Error deleting event:', err);
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const filterEvents = () => {
    const now = new Date();
    if (filter === 'upcoming') {
      return events.filter(event => new Date(event.endDate) >= now);
    } else if (filter === 'past') {
      return events.filter(event => new Date(event.endDate) < now);
    }
    return events;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'underReview':
        return 'status-review';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'מאושר';
      case 'underReview':
        return 'בבדיקה';
      case 'rejected':
        return 'נדחה';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const filteredEvents = filterEvents();

  if (!user) {
    return (
      <div className="my-events-container">
        <div className="my-events-message">
          <span className="material-icons">lock</span>
          <p>יש להתחבר כדי לראות את האירועים שלך</p>
          <button onClick={() => navigate('/login')} className="login-btn">
            התחבר
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-events-container">
      <div className="my-events-header">
        <h1>האירועים שלי</h1>
        <button onClick={() => navigate('/')} className="back-btn">
          <span className="material-icons">arrow_back</span>
          חזרה
        </button>
      </div>

      {/* Filters */}
      <div className="events-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          הכל ({events.length})
        </button>
        <button
          className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          עתידיים ({events.filter(e => new Date(e.endDate) >= new Date()).length})
        </button>
        <button
          className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
          onClick={() => setFilter('past')}
        >
          עברו ({events.filter(e => new Date(e.endDate) < new Date()).length})
        </button>
      </div>

      {/* Content */}
      <div className="my-events-content">
        {loading && (
          <div className="my-events-loading">
            <span className="material-icons rotating">refresh</span>
            <p>טוען אירועים...</p>
          </div>
        )}

        {error && (
          <div className="my-events-error">
            <span className="material-icons">error_outline</span>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="no-events">
            <span className="material-icons">event_busy</span>
            <p>לא נמצאו אירועים</p>
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <div className="events-list">
            {filteredEvents.map(event => (
              <div key={event._id} className="event-item">
                {event.imageUrl && (
                  <div className="event-item-image">
                    <img src={event.imageUrl} alt={event.title} />
                  </div>
                )}
                <div className="event-item-content">
                  <div className="event-item-header">
                    <h3>{event.title}</h3>
                    <span className={`status-badge ${getStatusBadgeClass(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                  </div>
                  <p className="event-item-description">{event.description}</p>
                  <div className="event-item-meta">
                    <div className="meta-info">
                      <span className="material-icons">event</span>
                      <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                    </div>
                    <div className="meta-info">
                      <span className="material-icons">schedule</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="meta-info">
                      <span className="material-icons">place</span>
                      <span>{event.region?.name}</span>
                    </div>
                    {event.repeat !== 'none' && (
                      <div className="meta-info">
                        <span className="material-icons">repeat</span>
                        <span>
                          {event.repeat === 'daily' && 'יומי'}
                          {event.repeat === 'weekly' && 'שבועי'}
                          {event.repeat === 'monthly' && 'חודשי'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="event-item-actions">
                  <button
                    onClick={() => navigate(`/event/${event._id}`)}
                    className="view-btn"
                    title="צפה באירוע"
                  >
                    <span className="material-icons">visibility</span>
                  </button>
                  <button
                    onClick={() => navigate(`/event/${event._id}/edit`)}
                    className="edit-btn"
                    title="ערוך אירוע"
                  >
                    <span className="material-icons">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="delete-btn"
                    title="מחק אירוע"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
