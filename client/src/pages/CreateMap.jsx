import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './CreateMap.css';

const CreateMap = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    coverImage: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setImageFile(file);
      setForm((prev) => ({ ...prev, coverImage: '' }));
      setError('');
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data.url;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw new Error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a map');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      // Upload image if selected
      let coverImageUrl = form.coverImage;
      if (imageFile) {
        coverImageUrl = await uploadImage();
      }

      // Create the personal map
      const mapData = {
        title: form.title,
        description: form.description,
        coverImage: coverImageUrl
      };

      const response = await axios.post('/personal-maps', mapData);
      
      alert('Personal map created successfully!');
      
      // Navigate to edit page to add points
      navigate(`/me/maps/${response.data.map._id}/edit`);
    } catch (err) {
      console.error('Error creating map:', err);
      setError(err.message || err.response?.data?.message || 'Failed to create map');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="create-map-container">
        <div className="no-auth">
          <p>Please log in to create a personal map</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-map-container">
      <div className="create-map-header">
        <h1>Create Personal Map</h1>
        <button className="btn-back" onClick={() => navigate('/me/maps')}>
          ← Back to My Maps
        </button>
      </div>

      <form className="create-map-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">
            Map Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g., My Favorite Trails"
            maxLength={100}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your map collection..."
            maxLength={500}
            rows={4}
          />
          <small>{form.description.length}/500 characters</small>
        </div>

        <div className="form-group">
          <label>Cover Image (Optional)</label>
          <div className="image-input-group">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="file-input"
            />
            {imageFile && (
              <div className="image-preview">
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="preview-img"
                />
                <button
                  type="button"
                  className="btn-remove-image"
                  onClick={() => {
                    setImageFile(null);
                    setForm((prev) => ({ ...prev, coverImage: '' }));
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <small>Or enter image URL:</small>
          <input
            type="url"
            name="coverImage"
            value={form.coverImage}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            disabled={!!imageFile}
            className="url-input"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/me/maps')}
            disabled={loading || uploadingImage}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading || uploadingImage}
          >
            {loading || uploadingImage
              ? uploadingImage
                ? 'Uploading Image...'
                : 'Creating Map...'
              : 'Create Map & Add Points'}
          </button>
        </div>
      </form>

      <div className="info-box">
        <h3>💡 What's Next?</h3>
        <p>
          After creating your map, you'll be able to add points from any region
          to create your personalized collection.
        </p>
      </div>
    </div>
  );
};

export default CreateMap;
