import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axiosInstance';
import './MapRangerPanel.css';

const MapRangerPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pendingPoints');
  const [pendingPoints, setPendingPoints] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const isAdmin = user?.role === 'admin';
  const isMapRangerOrAdmin = user?.role === 'mapRanger' || user?.role === 'admin';

  useEffect(() => {
    // Check permissions
    if (!isMapRangerOrAdmin) {
      navigate('/');
      return;
    }

    fetchData();
  }, [activeTab, isMapRangerOrAdmin, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'pendingPoints') {
        const response = await axios.get('/map-ranger/pending/points');
        setPendingPoints(response.data);
      } else if (activeTab === 'pendingEvents') {
        const response = await axios.get('/map-ranger/pending/events');
        setPendingEvents(response.data);
      } else if (activeTab === 'users' && isAdmin) {
        const response = await axios.get('/map-ranger/users');
        setUsers(response.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePoint = async (pointId) => {
    try {
      await axios.patch(`/map-ranger/points/${pointId}/approve`);
      setSuccessMessage('Point approved successfully');
      setPendingPoints(pendingPoints.filter(p => p._id !== pointId));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve point');
    }
  };

  const handleRejectPoint = async (pointId) => {
    try {
      await axios.patch(`/map-ranger/points/${pointId}/reject`);
      setSuccessMessage('Point rejected');
      setPendingPoints(pendingPoints.filter(p => p._id !== pointId));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject point');
    }
  };

  const handleDeletePoint = async (pointId) => {
    if (!window.confirm('Are you sure you want to delete this point?')) return;
    
    try {
      await axios.delete(`/map-ranger/points/${pointId}`);
      setSuccessMessage('Point deleted successfully');
      setPendingPoints(pendingPoints.filter(p => p._id !== pointId));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete point');
    }
  };

  const handleApproveEvent = async (eventId) => {
    try {
      await axios.patch(`/map-ranger/events/${eventId}/approve`);
      setSuccessMessage('Event approved successfully');
      setPendingEvents(pendingEvents.filter(e => e._id !== eventId));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve event');
    }
  };

  const handleRejectEvent = async (eventId) => {
    try {
      await axios.patch(`/map-ranger/events/${eventId}/reject`);
      setSuccessMessage('Event rejected');
      setPendingEvents(pendingEvents.filter(e => e._id !== eventId));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await axios.delete(`/map-ranger/events/${eventId}`);
      setSuccessMessage('Event deleted successfully');
      setPendingEvents(pendingEvents.filter(e => e._id !== eventId));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const handlePromoteUser = async (userId) => {
    try {
      await axios.patch(`/map-ranger/users/${userId}/promote`);
      setSuccessMessage('User promoted to Map Ranger');
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to promote user');
    }
  };

  const handleDemoteUser = async (userId) => {
    try {
      await axios.patch(`/map-ranger/users/${userId}/demote`);
      setSuccessMessage('User demoted to regular user');
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to demote user');
    }
  };

  const handleEditPointLocation = (pointId) => {
    navigate(`/map-ranger/edit-point/${pointId}`);
  };

  if (!isMapRangerOrAdmin) {
    return null;
  }

  return (
    <div className="map-ranger-panel">
      <div className="panel-header">
        <h1>🗺️ Map Ranger Panel</h1>
        <p className="panel-subtitle">Moderate and manage NomadLand content</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'pendingPoints' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('pendingPoints')}
        >
          Pending Points ({pendingPoints.length})
        </button>
        <button
          className={activeTab === 'pendingEvents' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('pendingEvents')}
        >
          Pending Events ({pendingEvents.length})
        </button>
        {isAdmin && (
          <button
            className={activeTab === 'users' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
        )}
      </div>

      {/* Messages */}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Content */}
      <div className="panel-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Pending Points Tab */}
            {activeTab === 'pendingPoints' && (
              <div className="points-list">
                {pendingPoints.length === 0 ? (
                  <p className="no-data">No pending points</p>
                ) : (
                  pendingPoints.map(point => (
                    <div key={point._id} className="moderation-card">
                      <div className="card-header">
                        <h3>{point.title}</h3>
                        <span className="status-badge pending">Pending</span>
                      </div>
                      {point.images && point.images.length > 0 && (
                        <img src={point.images[0]} alt={point.title} className="card-image" />
                      )}
                      <div className="card-body">
                        <p><strong>Description:</strong> {point.description || 'N/A'}</p>
                        <p><strong>Category:</strong> {point.category || 'N/A'}</p>
                        <p><strong>Location:</strong> {point.lat}, {point.lng}</p>
                        <p><strong>Created by:</strong> {point.createdBy?.name || 'Unknown'} ({point.createdBy?.email})</p>
                      </div>
                      <div className="card-actions">
                        <button 
                          className="btn btn-approve"
                          onClick={() => handleApprovePoint(point._id)}
                        >
                          ✓ Approve
                        </button>
                        <button 
                          className="btn btn-reject"
                          onClick={() => handleRejectPoint(point._id)}
                        >
                          ✗ Reject
                        </button>
                        <button 
                          className="btn btn-edit"
                          onClick={() => handleEditPointLocation(point._id)}
                        >
                          📍 Edit Location
                        </button>
                        <button 
                          className="btn btn-delete"
                          onClick={() => handleDeletePoint(point._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pending Events Tab */}
            {activeTab === 'pendingEvents' && (
              <div className="events-list">
                {pendingEvents.length === 0 ? (
                  <p className="no-data">No pending events</p>
                ) : (
                  pendingEvents.map(event => (
                    <div key={event._id} className="moderation-card">
                      <div className="card-header">
                        <h3>{event.title}</h3>
                        <span className="status-badge pending">Under Review</span>
                      </div>
                      {event.imageUrl && (
                        <img src={event.imageUrl} alt={event.title} className="card-image" />
                      )}
                      <div className="card-body">
                        <p><strong>Description:</strong> {event.description}</p>
                        <p><strong>Region:</strong> {event.region?.name || 'Unknown'}</p>
                        <p><strong>Start Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> {new Date(event.endDate).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {event.time}</p>
                        <p><strong>Cost:</strong> {event.cost || 'Free'}</p>
                        <p><strong>Repeat:</strong> {event.repeat}</p>
                        <p><strong>Language:</strong> {event.language}</p>
                        <p><strong>Created by:</strong> {event.createdBy?.name || 'Unknown'} ({event.createdBy?.email})</p>
                      </div>
                      <div className="card-actions">
                        <button 
                          className="btn btn-approve"
                          onClick={() => handleApproveEvent(event._id)}
                        >
                          ✓ Approve
                        </button>
                        <button 
                          className="btn btn-reject"
                          onClick={() => handleRejectEvent(event._id)}
                        >
                          ✗ Reject
                        </button>
                        <button 
                          className="btn btn-delete"
                          onClick={() => handleDeleteEvent(event._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Users Management Tab */}
            {activeTab === 'users' && isAdmin && (
              <div className="users-list">
                {users.length === 0 ? (
                  <p className="no-data">No users found</p>
                ) : (
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
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MapRangerPanel;
