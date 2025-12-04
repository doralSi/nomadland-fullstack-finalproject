import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import axios from '../api/axiosInstance';
import { useRegion } from '../context/RegionContext';
import './AddEvent.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

const AddEvent = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentRegion } = useRegion();

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationWarning, setLocationWarning] = useState('');

  useEffect(() => {
    if (currentRegion && !position) {
      setPosition({
        lat: currentRegion.center.lat,
        lng: currentRegion.center.lng
      });
    }
  }, [currentRegion]);

  // Check if point is inside region polygon
  const isPointInRegion = (lat, lng) => {
    if (!currentRegion || !currentRegion.polygon) return true;

    const polygon = currentRegion.polygon;
    const x = lng;
    const y = lat;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  };

  // Validate location when position changes
  useEffect(() => {
    if (position && currentRegion) {
      if (!isPointInRegion(position.lat, position.lng)) {
        setLocationWarning(`⚠️ אזהרה: מיקום זה נמצא מחוץ לגבולות אזור ${currentRegion.name}`);
      } else {
        setLocationWarning('');
      }
    }
  }, [position, currentRegion]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!form.title.trim()) {
        throw new Error('כותרת היא שדה חובה');
      }
      if (!form.description.trim()) {
        throw new Error('תיאור הוא שדה חובה');
      }
      if (!form.startDate) {
        throw new Error('תאריך התחלה הוא שדה חובה');
      }
      if (!form.endDate) {
        throw new Error('תאריך סיום הוא שדה חובה');
      }
      if (!form.time) {
        throw new Error('שעה היא שדה חובה');
      }
      if (!position) {
        throw new Error('יש לבחור מיקום על המפה');
      }

      // Validate dates
      if (new Date(form.endDate) < new Date(form.startDate)) {
        throw new Error('תאריך סיום חייב להיות אחרי תאריך התחלה');
      }

      // Validate weekly repeat days
      if (form.repeat === 'weekly' && form.repeatDays.length === 0) {
        throw new Error('יש לבחור לפחות יום אחד לאירוע שבועי');
      }

      // Validate location
      if (currentRegion && !isPointInRegion(position.lat, position.lng)) {
        const proceed = window.confirm(
          `המיקום נמצא מחוץ לגבולות אזור ${currentRegion.name}. האם להמשיך בכל זאת?`
        );
        if (!proceed) {
          setLoading(false);
          return;
        }
      }

      // Upload image if selected
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      // Prepare event data
      const eventData = {
        title: form.title,
        description: form.description,
        cost: form.cost,
        region: currentRegion._id,
        language: form.language,
        repeat: form.repeat,
        repeatDays: form.repeat === 'weekly' ? form.repeatDays : undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        time: form.time,
        location: {
          lat: position.lat,
          lng: position.lng
        },
        imageUrl
      };

      // Create event
      const response = await axios.post('/events', eventData);
      
      alert('האירוע נוצר בהצלחה! הוא ממתין לאישור.');
      navigate(`/region/${slug}/events`);
    } catch (err) {
      console.error('Create event error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to create event'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/region/${slug}/events`);
  };

  if (!currentRegion) {
    return (
      <div className="add-event-container">
        <div className="add-event-loading">טוען...</div>
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

  return (
    <div className="add-event-container">
      <div className="add-event-card">
        <h1>הוסף אירוע חדש</h1>
        <p className="region-name">אזור: {currentRegion.name}</p>

        {locationWarning && (
          <div className="warning-box">
            {locationWarning}
          </div>
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
              disabled={loading}
              placeholder="שם האירוע"
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
              disabled={loading}
              rows="5"
              placeholder="תיאור מפורט של האירוע"
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
              disabled={loading}
              placeholder='לדוגמה: "חינם", "50 ₪", "$10"'
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
              disabled={loading}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          {/* Date and Time Row */}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
          </div>

          {/* Language */}
          <div className="form-group">
            <label htmlFor="language">שפה *</label>
            <select
              id="language"
              name="language"
              value={form.language}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="he">עברית (יוצג גם באנגלית)</option>
              <option value="en">English (אנגלית בלבד)</option>
            </select>
            <small>אירועים בעברית יוצגו גם למשתמשים באנגלית</small>
          </div>

          {/* Repeat */}
          <div className="form-group">
            <label htmlFor="repeat">חזרתיות</label>
            <select
              id="repeat"
              name="repeat"
              value={form.repeat}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="none">ללא חזרה</option>
              <option value="daily">יומי</option>
              <option value="weekly">שבועי</option>
              <option value="monthly">חודשי</option>
            </select>
          </div>

          {/* Repeat Days (only for weekly) */}
          {form.repeat === 'weekly' && (
            <div className="form-group">
              <label>ימים בשבוע *</label>
              <div className="days-selector">
                {daysOfWeek.map(day => (
                  <label key={day.value} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={form.repeatDays.includes(day.value)}
                      onChange={() => handleRepeatDaysChange(day.value)}
                      disabled={loading}
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          <div className="form-group">
            <label>בחר מיקום על המפה *</label>
            <p className="map-instruction">לחץ על המפה כדי לבחור את מיקום האירוע</p>
            <div className="map-container">
              <MapContainer
                center={[currentRegion.center.lat, currentRegion.center.lng]}
                zoom={currentRegion.zoom || 12}
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
                מיקום נבחר: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn"
              disabled={loading}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'יוצר...' : 'צור אירוע'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEvent;
