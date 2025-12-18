import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { saveToken, getToken, removeToken, saveUser, getUser } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const logoutTimerRef = React.useRef(null);

  // Auto logout after 4 hours of inactivity
  const INACTIVITY_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

  const resetLogoutTimer = React.useCallback(() => {
    // Clear existing timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    // Set new timer only if user is logged in
    if (user) {
      logoutTimerRef.current = setTimeout(() => {
        logout();
        // Show alert to user that they were logged out
        alert('You have been logged out due to inactivity. Please log in again.');
      }, INACTIVITY_TIMEOUT);
    }
  }, [user]);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      const userData = getUser();
      setUser(userData);
    }
    setLoading(false);
  }, []);

  // Setup activity listeners and logout timer
  useEffect(() => {
    if (!user) {
      // Clear timer if user logs out
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
      return;
    }

    // Start the logout timer
    resetLogoutTimer();

    // Activity events that reset the timer
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetLogoutTimer);
    });

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetLogoutTimer);
      });
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [user, resetLogoutTimer]);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      saveToken(token);
      saveUser(userData);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await axiosInstance.post('/auth/register', userData);
      const { token, user: newUser } = response.data;
      
      saveToken(token);
      saveUser(newUser);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    // Clear the logout timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    removeToken();
    setUser(null);
    setError(null);
  };

  const googleLogin = async (credential) => {
    try {
      setError(null);
      const response = await axiosInstance.post('/auth/google', { credential });
      const { token, user: userData } = response.data;
      
      saveToken(token);
      saveUser(userData);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Google login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    googleLogin,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
