import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import LocationMarker from '../components/map/LocationMarker';
import '../utils/leafletConfig';
import './EditEvent.css';
import 'leaflet/dist/leaflet.css';

const EditEvent = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const eventDate = searchParams.get('date');
  const [event, setEvent] = useState(null);
  const [editMode, setEditMode] = useState(null); // 'single' or 'series'
  const [showModeSelector, setShowModeSelector] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    cost: '',
    language: 'he',
    repeat: 'none',
    repeatDays: [],
    startDate: '',
    endDate: '',
    time: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/events/${id}`);
      const eventData = response.data;
      setEvent(eventData);

      // Set form data
      setForm({
        title: eventData.title,
        description: eventData.description,
        cost: eventData.cost || '',
        language: eventData.language || 'he',
        repeat: eventData.repeat || 'none',
        repeatDays: eventData.repeatDays || [],
        startDate: eventData.startDate.split('T')[0],
        endDate: eventData.endDate.split('T')[0],
        time: eventData.time,
      });

      setPosition({
        lat: eventData.location.lat,
        lng: eventData.location.lng
      });

      if (eventData.imageUrl) {
        setImagePreview(eventData.imageUrl);
      }

      // Show mode selector if it's a repeating event
      if (eventData.repeat !== 'none' && eventDate) {
        setShowModeSelector(true);
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err.response?.data?.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRepeatDaysChange = (day) => {
    setForm(prev => {
      const days = prev.repeatDays.includes(day)
        ? prev.repeatDays.filter(d => d !== day)
        : [...prev.repeatDays, day];
      return { ...prev, repeatDays: days };
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axios.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.imageUrl) {
        return response.data.imageUrl;
      } else {
        throw new Error('Invalid upload response');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      throw new Error(err.response?.data?.message || 'Failed to upload image');
    }
  };

  const handleModeSelection = (mode) => {
    setEditMode(mode);
    setShowModeSelector(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Validate required fields
      if (!form.title.trim()) {
        throw new Error('כותרת היא שדה חובה');
      }
      if (!form.description.trim()) {
        throw new Error('תיאור הוא שדה חובה');
      }
      if (!position) {
        throw new Error('יש לבחור מיקום על המפה');
      }

      // Upload new image if selected
      let imageUrl = event.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      // Prepare update data
      let updateData = {
        title: form.title,
        description: form.description,
        cost: form.cost,
        language: form.language,
        time: form.time,
        location: {
          lat: position.lat,
          lng: position.lng
        },
        imageUrl
      };

      // If editing series, include all fields
      if (editMode === 'series' || event.repeat === 'none') {
        updateData = {
          ...updateData,
          repeat: form.repeat,
          repeatDays: form.repeat === 'weekly' ? form.repeatDays : undefined,
          startDate: form.startDate,
          endDate: form.endDate,
        };
      } else if (editMode === 'single' && eventDate) {
        // Create override for single occurrence
        const overrides = event.overrides || [];
        const existingOverrideIndex = overrides.findIndex(
          o => new Date(o.date).toDateString() === new Date(eventDate).toDateString()
        );

        const newOverride = {
          date: eventDate,
          cancelled: false,
          title: form.title !== event.title ? form.title : undefined,
          description: form.description !== event.description ? form.description : undefined,
          cost: form.cost !== event.cost ? form.cost : undefined,
          time: form.time !== event.time ? form.time : undefined,
          location: (position.lat !== event.location.lat || position.lng !== event.location.lng) ? position : undefined
        };

        if (existingOverrideIndex >= 0) {
          overrides[existingOverrideIndex] = newOverride;
        } else {
          overrides.push(newOverride);
        }

        updateData = { overrides };
      }

      // Update event
      await axios.patch(`/events/${id}`, updateData);
      
      alert('האירוע עודכן בהצלחה!');
      navigate(`/event/${id}`);
    } catch (err) {
      console.error('Update event error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to update event'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/event/${id}`);
  };

  if (loading) {
    return (
      <div className="edit-event-container">
        <div className="edit-event-loading">טוען...</div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="edit-event-container">
        <div className="edit-event-error">
          <span className="material-icons">error_outline</span>
          <h2>{error}</h2>
          <button onClick={handleCancel} className="back-btn">חזרה</button>
        </div>
      </div>
    );
  }

  // Show mode selector for repeating events
  if (showModeSelector && event.repeat !== 'none') {
    return (
      <div className="edit-event-container">
        <div className="mode-selector-card">
          <h1>ערוך אירוע</h1>
          <p className="mode-question">האירוע הזה חוזר על עצמו. איך תרצה לערוך אותו?</p>
          <div className="mode-options">
            <button
              className="mode-option-btn"
              onClick={() => handleModeSelection('single')}
            >
              <span className="material-icons">event</span>
              <div>
                <h3>ערוך מופע זה בלבד</h3>
                <p>שינויים יחולו רק על התאריך הנבחר</p>
              </div>
            </button>
            <button
              className="mode-option-btn"
              onClick={() => handleModeSelection('series')}
            >
              <span className="material-icons">event_repeat</span>
              <div>
                <h3>ערוך את כל הסדרה</h3>
                <p>שינויים יחולו על כל המופעים של האירוע</p>
              </div>
            </button>
          </div>
          <button onClick={handleCancel} className="cancel-btn">
            ביטול
          </button>
        </div>
      </div>
    );
  }

  const daysOfWeek = [
    { value: 0, label: 'ראשון' },
    { value: 1, label: 'שני' },
    { value: 2, label: 'שלישי' },
    { value: 3, label: 'רביעי' },
    { value: 4, label: 'חמישי' },
    { value: 5, label: 'שישי' },
    { value: 6, label: 'שבת' }
  ];

  const isEditingSeries = editMode === 'series' || event.repeat === 'none';

  return (
    <div className="edit-event-container">
      <div className="edit-event-card">
        <h1>ערוך אירוע</h1>
        {editMode === 'single' && (
          <p className="edit-mode-badge">עריכת מופע בודד - {new Date(eventDate).toLocaleDateString('he-IL')}</p>
        )}
        {editMode === 'series' && (
          <p className="edit-mode-badge">עריכת כל הסדרה</p>
        )}

        {error && (
          <div className="error-box">
            <span className="material-icons">error_outline</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="event-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">כותרת *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">תיאור *</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              disabled={saving}
              rows="5"
            />
          </div>

          {/* Cost */}
          <div className="form-group">
            <label htmlFor="cost">עלות</label>
            <input
              type="text"
              id="cost"
              name="cost"
              value={form.cost}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label htmlFor="image">תמונה</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={saving}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          {/* Date and Time Row (only for series edit) */}
          {isEditingSeries && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">תאריך התחלה *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">תאריך סיום *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">שעה *</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
              </div>
            </div>
          )}

          {/* Time only for single edit */}
          {!isEditingSeries && (
            <div className="form-group">
              <label htmlFor="time">שעה *</label>
              <input
                type="time"
                id="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </div>
          )}

          {/* Language (only for series) */}
          {isEditingSeries && (
            <div className="form-group">
              <label htmlFor="language">שפה *</label>
              <select
                id="language"
                name="language"
                value={form.language}
                onChange={handleChange}
                required
                disabled={saving}
              >
                <option value="he">עברית (יוצג גם באנגלית)</option>
                <option value="en">English (אנגלית בלבד)</option>
              </select>
            </div>
          )}

          {/* Repeat (only for series) */}
          {isEditingSeries && (
            <div className="form-group">
              <label htmlFor="repeat">חזרתיות</label>
              <select
                id="repeat"
                name="repeat"
                value={form.repeat}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="none">ללא חזרה</option>
                <option value="daily">יומי</option>
                <option value="weekly">שבועי</option>
                <option value="monthly">חודשי</option>
              </select>
            </div>
          )}

          {/* Repeat Days (only for weekly series) */}
          {isEditingSeries && form.repeat === 'weekly' && (
            <div className="form-group">
              <label>ימים בשבוע *</label>
              <div className="days-selector">
                {daysOfWeek.map(day => (
                  <label key={day.value} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={form.repeatDays.includes(day.value)}
                      onChange={() => handleRepeatDaysChange(day.value)}
                      disabled={saving}
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          <div className="form-group">
            <label>מיקום *</label>
            <p className="map-instruction">לחץ על המפה כדי לשנות את המיקום</p>
            <div className="map-container">
              <MapContainer
                center={[position.lat, position.lng]}
                zoom={13}
                style={{ height: '400px', width: '100%', borderRadius: '8px' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
            {position && (
              <div className="coordinates-display">
                מיקום: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn"
              disabled={saving}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={saving}
            >
              {saving ? 'שומר...' : 'שמור שינויים'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;
