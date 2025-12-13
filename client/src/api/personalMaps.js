import axiosInstance from './axiosInstance';

// Create a new personal map
export const createPersonalMap = async (data) => {
  const response = await axiosInstance.post('/personal-maps', data);
  return response.data;
};

// Get all maps for the current user
export const getMyMaps = async () => {
  const response = await axiosInstance.get('/personal-maps/my');
  return response.data;
};

// Get a specific personal map by ID
export const getMapById = async (id) => {
  const response = await axiosInstance.get(`/personal-maps/${id}`);
  return response.data;
};

// Update a personal map
export const updatePersonalMap = async (id, data) => {
  const response = await axiosInstance.patch(`/personal-maps/${id}`, data);
  return response.data;
};

// Delete a personal map
export const deletePersonalMap = async (id) => {
  const response = await axiosInstance.delete(`/personal-maps/${id}`);
  return response.data;
};

// Add a point to a personal map
export const addPointToMap = async (mapId, pointId) => {
  const response = await axiosInstance.patch(`/personal-maps/${mapId}/add/${pointId}`);
  return response.data;
};

// Remove a point from a personal map
export const removePointFromMap = async (mapId, pointId) => {
  const response = await axiosInstance.patch(`/personal-maps/${mapId}/remove/${pointId}`);
  return response.data;
};

// Get regions where user has created or favorited points
export const getUserRegions = async () => {
  const response = await axiosInstance.get('/personal-maps/regions');
  return response.data;
};

// Get user's points in a specific region
export const getUserPointsInRegion = async (regionSlug) => {
  const response = await axiosInstance.get(`/personal-maps/regions/${regionSlug}`);
  return response.data;
};
