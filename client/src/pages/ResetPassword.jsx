import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d.*\d.*\d.*\d)(?=.*[!@#$%^&*\-_]).{8,}$/;
  
  const validatePassword = (pwd) => {
    return passwordRegex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, four digits, and one special character (!@#$%^&*-_)');
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      toast.success(response.data.message);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigits = (password.match(/\d/g) || []).length >= 4;
    const hasSpecial = /[!@#$%^&*\-_]/.test(password);
    const isLongEnough = password.length >= 8;

    return {
      hasLower,
      hasUpper,
      hasDigits,
      hasSpecial,
      isLongEnough,
      isValid: hasLower && hasUpper && hasDigits && hasSpecial && isLongEnough
    };
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <span className="material-symbols-outlined">lock_reset</span>
          </div>
          <h1>Reset Password</h1>
          <p>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">
              <span className="material-symbols-outlined">password</span>
              New Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            
            {password && strength && (
              <div className="password-requirements">
                <div className={strength.isLongEnough ? 'valid' : 'invalid'}>
                  <span className="material-symbols-outlined">
                    {strength.isLongEnough ? 'check_circle' : 'cancel'}
                  </span>
                  At least 8 characters
                </div>
                <div className={strength.hasUpper ? 'valid' : 'invalid'}>
                  <span className="material-symbols-outlined">
                    {strength.hasUpper ? 'check_circle' : 'cancel'}
                  </span>
                  One uppercase letter
                </div>
                <div className={strength.hasLower ? 'valid' : 'invalid'}>
                  <span className="material-symbols-outlined">
                    {strength.hasLower ? 'check_circle' : 'cancel'}
                  </span>
                  One lowercase letter
                </div>
                <div className={strength.hasDigits ? 'valid' : 'invalid'}>
                  <span className="material-symbols-outlined">
                    {strength.hasDigits ? 'check_circle' : 'cancel'}
                  </span>
                  Four digits
                </div>
                <div className={strength.hasSpecial ? 'valid' : 'invalid'}>
                  <span className="material-symbols-outlined">
                    {strength.hasSpecial ? 'check_circle' : 'cancel'}
                  </span>
                  One special character (!@#$%^&*-_)
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <span className="material-symbols-outlined">check_circle</span>
              Confirm Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <div className="password-requirements">
                <div className="invalid">
                  <span className="material-symbols-outlined">cancel</span>
                  Passwords do not match
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primary btn-full"
            disabled={loading || !strength?.isValid || password !== confirmPassword}
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined spinning">progress_activity</span>
                Resetting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">lock</span>
                Reset Password
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

export default ResetPassword;
