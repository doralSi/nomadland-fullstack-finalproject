import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      toast.success(response.data.message);
      setEmailSent(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon success-icon">
              <span className="material-symbols-outlined">mark_email_read</span>
            </div>
            <h1>Check Your Email</h1>
            <p>We've sent a password reset link to <strong>{email}</strong></p>
          </div>

          <div className="auth-content">
            <div className="info-box">
              <p>
                <span className="material-symbols-outlined">info</span>
                The link will expire in 1 hour
              </p>
            </div>

            <div className="auth-links">
              <Link to="/login" className="link-primary">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <span className="material-symbols-outlined">lock_reset</span>
          </div>
          <h1>Forgot Password?</h1>
          <p>Enter your email and we'll send you a link to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              <span className="material-symbols-outlined">mail</span>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined spinning">progress_activity</span>
                Sending...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">send</span>
                Send Reset Link
              </>
            )}
          </button>

          <div className="auth-links">
            <Link to="/login" className="link-secondary">
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
