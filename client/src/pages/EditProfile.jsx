import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { saveToken, saveUser } from '../utils/auth';
import { useConfirm } from '../hooks/useConfirm';
import { useAlert } from '../hooks/useAlert';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertDialog from '../components/AlertDialog';
import './Auth.css';

const EditProfile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const confirmDialog = useConfirm();
  const alertDialog = useAlert();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.firstName || '',
        email: user.email || '',
        currentPassword: '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check if trying to change password
    const isChangingPassword = formData.password || formData.confirmPassword || formData.currentPassword;

    // If password fields are filled, validate
    if (isChangingPassword) {
      // Check if current password is provided
      if (!formData.currentPassword) {
        setError('Current password is required to change password');
        return;
      }
      
      // Check if new password is provided
      if (!formData.password) {
        setError('New password is required');
        return;
      }

      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      // Validate password requirements
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d.*\d.*\d.*\d)(?=.*[!@#$%^&*\-_]).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setError('Password must be at least 8 characters and contain: 1 uppercase letter, 1 lowercase letter, 4 digits, and 1 special character (!@#$%^&*-_)');
        return;
      }

      // Ask for confirmation before changing password
      const confirmed = await confirmDialog.confirm({
        title: 'Change Password',
        message: 'Are you sure you want to change your password? You will need to use the new password for your next login.',
        confirmText: 'Change Password',
        cancelText: 'Cancel'
      });

      if (!confirmed) {
        setLoading(false);
        return;
      }
    }

    setLoading(true);

    try {
      const updateData = {
        name: formData.name
      };

      // Only include password data if changing password
      if (isChangingPassword && formData.password) {
        updateData.currentPassword = formData.currentPassword;
        updateData.password = formData.password;
      }

      const response = await axiosInstance.put('/users/profile', updateData);
      
      // Update user in context with new data
      const { token, user: updatedUser } = response.data;
      
      if (isChangingPassword) {
        await alertDialog.alert({
          type: 'success',
          title: 'Success',
          message: 'Password changed successfully! Please login with your new password.'
        });
      } else {
        await alertDialog.alert({
          type: 'success',
          title: 'Success',
          message: 'Profile updated successfully!'
        });
      }

      if (token) {
        saveToken(token);
        saveUser(updatedUser);
        // Force page reload to update context
        window.location.href = '/profile';
        return;
      }

      setLoading(false);
      navigate('/profile');
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      await alertDialog.alert({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.handleClose}
        onConfirm={confirmDialog.config.onConfirm}
        message={confirmDialog.config.message}
        title={confirmDialog.config.title}
        confirmText={confirmDialog.config.confirmText}
        cancelText={confirmDialog.config.cancelText}
      />
      
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={alertDialog.handleClose}
        message={alertDialog.config.message}
        title={alertDialog.config.title}
        type={alertDialog.config.type}
        confirmText={alertDialog.config.confirmText}
      />
      
      <div className="auth-card">
        <h2>Edit Profile</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="disabled-input"
              title="Email cannot be changed"
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentPassword">Current Password (required to change password)</label>
            <div className="password-input-wrapper">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password to change"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined">
                  {showCurrentPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">New Password (optional)</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="profile-buttons">
            <button 
              type="button" 
              onClick={handleCancel} 
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
