import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axiosInstance';
import './ManageUsers.css';

const ManageUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchUsers();
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/map-ranger/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to promote this user to Map Ranger?')) return;
    
    try {
      await axios.patch(`/map-ranger/users/${userId}/promote`);
      setSuccessMessage('User promoted to Map Ranger successfully');
      fetchUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to promote user');
    }
  };

  const handleDemoteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to demote this user to regular user?')) return;
    
    try {
      await axios.patch(`/map-ranger/users/${userId}/demote`);
      setSuccessMessage('User demoted to regular user successfully');
      fetchUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to demote user');
    }
  };

  const handleBack = () => {
    navigate('/map-ranger');
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="manage-users">
      <div className="users-header">
        <h1>👥 User Management</h1>
        <p className="users-subtitle">Promote or demote users to Map Ranger role</p>
      </div>

      <button className="btn btn-back" onClick={handleBack}>
        ← Back to Map Ranger Panel
      </button>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      
      {error && (
        <div className="error-message">{error}</div>
      )}

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-content">
          {users.length === 0 ? (
            <p className="no-data">No users found</p>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge role-${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.role === 'user' && (
                          <button 
                            className="btn btn-small btn-promote"
                            onClick={() => handlePromoteUser(u._id)}
                          >
                            Promote to Map Ranger
                          </button>
                        )}
                        {u.role === 'mapRanger' && (
                          <button 
                            className="btn btn-small btn-demote"
                            onClick={() => handleDemoteUser(u._id)}
                          >
                            Demote to User
                          </button>
                        )}
                        {u.role === 'admin' && (
                          <span className="admin-label">Admin (Protected)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
