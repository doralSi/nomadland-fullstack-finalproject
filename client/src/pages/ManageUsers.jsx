import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axiosInstance';
import { useConfirm } from '../hooks/useConfirm';
import { useAlert } from '../hooks/useAlert';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertDialog from '../components/AlertDialog';
import './ManageUsers.css';

const ManageUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const confirmDialog = useConfirm();
  const alertDialog = useAlert();

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
    const confirmed = await confirmDialog.confirm({
      title: 'Promote to Map Ranger',
      message: 'Are you sure you want to promote this user to Map Ranger?',
      confirmText: 'Promote',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;
    
    try {
      await axios.patch(`/map-ranger/users/${userId}/promote`);
      await alertDialog.alert({
        type: 'success',
        title: 'Success',
        message: 'User promoted to Map Ranger successfully'
      });
      fetchUsers();
    } catch (err) {
      await alertDialog.alert({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Failed to promote user'
      });
    }
  };

  const handleDemoteUser = async (userId) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Demote to Regular User',
      message: 'Are you sure you want to demote this user to regular user?',
      confirmText: 'Demote',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;
    
    try {
      await axios.patch(`/map-ranger/users/${userId}/demote`);
      await alertDialog.alert({
        type: 'success',
        title: 'Success',
        message: 'User demoted to regular user successfully'
      });
      fetchUsers();
    } catch (err) {
      await alertDialog.alert({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Failed to demote user'
      });
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
      
      <div className="users-header">
        <h1>User Management</h1>
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
