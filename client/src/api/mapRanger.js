import axiosInstance from './axiosInstance';

// ==================== POINTS MODERATION ====================

/**
 * Get all pending points awaiting approval
 */
export const getPendingPoints = async () => {
  const response = await axiosInstance.get('/map-ranger/pending/points');
  return response.data;
};

/**
 * Approve a point by ID
 */
export const approvePoint = async (pointId) => {
  const response = await axiosInstance.patch(`/map-ranger/points/${pointId}/approve`);
  return response.data;
};

/**
 * Reject a point by ID
 */
export const rejectPoint = async (pointId) => {
  const response = await axiosInstance.patch(`/map-ranger/points/${pointId}/reject`);
  return response.data;
};

/**
 * Delete a point by ID
 */
export const deletePoint = async (pointId) => {
  const response = await axiosInstance.delete(`/map-ranger/points/${pointId}`);
  return response.data;
};

/**
 * Update point location
 * @param {string} pointId - The point ID
 * @param {object} data - Object containing { lat, lng }
 */
export const updatePointLocation = async (pointId, data) => {
  const response = await axiosInstance.patch(`/map-ranger/points/${pointId}/location`, data);
  return response.data;
};

// ==================== EVENTS MODERATION ====================

/**
 * Get all pending events awaiting approval
 */
export const getPendingEvents = async () => {
  const response = await axiosInstance.get('/map-ranger/pending/events');
  return response.data;
};

/**
 * Approve an event by ID
 */
export const approveEvent = async (eventId) => {
  const response = await axiosInstance.patch(`/map-ranger/events/${eventId}/approve`);
  return response.data;
};

/**
 * Reject an event by ID
 */
export const rejectEvent = async (eventId) => {
  const response = await axiosInstance.patch(`/map-ranger/events/${eventId}/reject`);
  return response.data;
};

/**
 * Delete an event by ID
 */
export const deleteEvent = async (eventId) => {
  const response = await axiosInstance.delete(`/map-ranger/events/${eventId}`);
  return response.data;
};

// ==================== USER MANAGEMENT (Admin Only) ====================

/**
 * Get all users (admin only)
 */
export const getUsers = async () => {
  const response = await axiosInstance.get('/map-ranger/users');
  return response.data;
};

/**
 * Promote a user to mapRanger role
 * @param {string} userId - The user ID
 */
export const promoteUser = async (userId) => {
  const response = await axiosInstance.patch(`/map-ranger/users/${userId}/promote`);
  return response.data;
};

/**
 * Demote a user to regular user role
 * @param {string} userId - The user ID
 */
export const demoteUser = async (userId) => {
  const response = await axiosInstance.patch(`/map-ranger/users/${userId}/demote`);
  return response.data;
};

// ==================== POINTS & EVENTS LISTING ====================

/**
 * Get all points with filtering (for Map Ranger panel)
 */
export const getPoints = async (params) => {
  const response = await axiosInstance.get('/map-ranger/points', { params });
  return response.data;
};

/**
 * Get all events with filtering (for Map Ranger panel)
 */
export const getEvents = async (params) => {
  const response = await axiosInstance.get('/map-ranger/events', { params });
  return response.data;
};

/**
 * Get region statistics
 * @param {string} regionSlug - The region slug
 */
export const getRegionStats = async (regionSlug) => {
  const response = await axiosInstance.get(`/map-ranger/stats/${regionSlug}`);
  return response.data;
};

// Export all functions as named exports
export default {
  getPendingPoints,
  approvePoint,
  rejectPoint,
  deletePoint,
  updatePointLocation,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  deleteEvent,
  getUsers,
  promoteUser,
  demoteUser,
  getPoints,
  getEvents,
  getRegionStats
};
