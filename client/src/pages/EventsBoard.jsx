import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import { useLanguage } from '../context/LanguageContext';
import EventCard from '../components/EventCard';
import './EventsBoard.css';

const EventsBoard = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentRegion } = useRegion();
  const { effectiveLanguages } = useLanguage();
  const [activeTab, setActiveTab] = useState('today');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentRegion) {
      fetchEvents();
    }
  }, [currentRegion, activeTab, effectiveLanguages]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let fromDate, toDate;

      if (activeTab === 'today') {
        fromDate = new Date(today);
        toDate = new Date(today);
        toDate.setHours(23, 59, 59, 999);
      } else {
        // Week view
        fromDate = new Date(today);
        toDate = new Date(today);
        toDate.setDate(toDate.getDate() + 6);
        toDate.setHours(23, 59, 59, 999);
      }

      // Map Rangers and Admins see all languages
      const isMapRangerOrAdmin = user?.role === 'mapRanger' || user?.role === 'admin';
      const languages = isMapRangerOrAdmin ? ['he', 'en'] : effectiveLanguages();

      const response = await axios.get('/events', {
        params: {
          region: currentRegion._id,
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
          languages: languages.join(',')
        }
      });

      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const groupEventsByDay = () => {
    const grouped = {};
    events.forEach(event => {
      const date = new Date(event.date);
      const dateKey = date.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    // Sort events within each day by time
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.time.localeCompare(b.time));
    });

    return grouped;
  };

  const handleAddEvent = () => {
    navigate(`/region/${slug}/events/add`);
  };

  const handleBackToRegion = () => {
    navigate(`/region/${slug}`);
  };

  if (!currentRegion) {
    return (
      <div className="events-board-container">
        <div className="events-board-loading">Loading region...</div>
      </div>
    );
  }

  const groupedEvents = activeTab === 'week' ? groupEventsByDay() : null;
  const todayEvents = activeTab === 'today' ? events : null;

  return (
    <div className="events-board-container">
      {/* Header */}
      <div className="events-board-header">
        <button onClick={handleBackToRegion} className="back-btn">
          <span className="material-icons">arrow_back</span>
          חזרה לאזור
        </button>
        <h1>לוח אירועים - {currentRegion.name}</h1>
        <button onClick={handleAddEvent} className="add-event-btn">
          <span className="material-icons">add</span>
          הוסף אירוע
        </button>
      </div>

      {/* Tabs */}
      <div className="events-tabs">
        <button
          className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          היום
        </button>
        <button
          className={`tab-btn ${activeTab === 'week' ? 'active' : ''}`}
          onClick={() => setActiveTab('week')}
        >
          השבוע הקרוב
        </button>
      </div>

      {/* Content */}
      <div className="events-board-content">
        {loading && <div className="events-loading">טוען אירועים...</div>}

        {error && (
          <div className="events-error">
            <span className="material-icons">error_outline</span>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Today View */}
            {activeTab === 'today' && (
              <div className="today-view">
                {todayEvents && todayEvents.length === 0 ? (
                  <div className="no-events">
                    <span className="material-icons">event_busy</span>
                    <p>אין אירועים מתוכננים להיום</p>
                  </div>
                ) : (
                  <div className="events-grid">
                    {todayEvents.map((event, index) => (
                      <EventCard
                        key={`${event.templateId}-${index}`}
                        event={event}
                        mode="daily"
                        onClick={() => navigate(`/event/${event.templateId}?date=${new Date(event.date).toISOString()}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Week View */}
            {activeTab === 'week' && (
              <div className="week-view">
                {Object.keys(groupedEvents).length === 0 ? (
                  <div className="no-events">
                    <span className="material-icons">event_busy</span>
                    <p>אין אירועים מתוכננים לשבוע הקרוב</p>
                  </div>
                ) : (
                  <div className="week-grid">
                    {Object.keys(groupedEvents).map(dateKey => {
                      const date = new Date(dateKey);
                      const dayName = date.toLocaleDateString('he-IL', { weekday: 'long' });
                      const dayDate = date.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' });

                      return (
                        <div key={dateKey} className="day-column">
                          <div className="day-header">
                            <h3>{dayName}</h3>
                            <p>{dayDate}</p>
                          </div>
                          <div className="day-events">
                            {groupedEvents[dateKey].map((event, index) => (
                              <EventCard
                                key={`${event.templateId}-${index}`}
                                event={event}
                                mode="weekly"
                                onClick={() => navigate(`/event/${event.templateId}?date=${new Date(event.date).toISOString()}`)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventsBoard;
