import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants/categories';
import './CreatePoint.css';

const CreatePoint = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'trail',
    lat: '',
    lng: '',
    imageUrl: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setForm(prev => ({ ...prev, imageUrl: '' }));
      setError('');
    }
  };

  // Upload image to server
  const uploadImageToServer = async () => {
    if (!imageFile) {
      throw new Error('No image file selected');
    }

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axiosInstance.post('/upload/image', formData, {
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!form.title.trim()) {
        throw new Error('Title is required');
      }
      if (!form.description.trim()) {
        throw new Error('Description is required');
      }
      if (!form.category) {
        throw new Error('Category is required');
      }
      if (!form.lat || !form.lng) {
        throw new Error('Latitude and Longitude are required');
      }
      if (isNaN(form.lat) || isNaN(form.lng)) {
        throw new Error('Latitude and longitude must be valid numbers');
      }

      // Upload image if selected
      let finalImageUrl = form.imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImageToServer();
      }

      // Prepare point data
      const pointData = {
        title: form.title,
        description: form.description,
        category: form.category,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        images: finalImageUrl ? [finalImageUrl] : [],
        language: 'he',
        region: 'default'
      };

      // Create point
      const { data } = await axiosInstance.post('/points', pointData);

      // Redirect to point details
      navigate(`/points/${data._id}`);
    } catch (err) {
      console.error('Create point error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to create point'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Point</h2>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
              Creating point...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Enter point title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                disabled={loading}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Describe this location"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Latitude and Longitude */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  id="lat"
                  name="lat"
                  value={form.lat}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="32.0853"
                />
              </div>
              <div>
                <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  id="lng"
                  name="lng"
                  value={form.lng}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="34.7818"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image
              </label>
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              {imageFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>

            {/* Image URL (Alternative) */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Or Enter Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                disabled={loading || !!imageFile}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Image Preview */}
            {(form.imageUrl && !imageFile) && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-md border border-gray-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !form.title || !form.lat || !form.lng}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating point...' : 'Create Point'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePoint;
