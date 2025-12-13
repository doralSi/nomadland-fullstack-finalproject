import axiosInstance from './axiosInstance';

export const getPoints = async (regionSlug) => {
  const response = await axiosInstance.get('/points', {
    params: regionSlug ? { region: regionSlug } : {}
  });
  return response.data;
};

export const getPointById = async (id) => {
  const response = await axiosInstance.get(`/points/${id}`);
  return response.data;
};

export const createPoint = async (data) => {
  const response = await axiosInstance.post('/points', data);
  return response.data;
};

export const updatePoint = async (id, data) => {
  const response = await axiosInstance.put(`/points/${id}`, data);
  return response.data;
};

export const deletePoint = async (id) => {
  const response = await axiosInstance.delete(`/points/${id}`);
  return response.data;
};

export const addToFavorites = async (id) => {
  const response = await axiosInstance.post(`/points/${id}/favorite`);
  return response.data;
};

export const removeFromFavorites = async (id) => {
  const response = await axiosInstance.delete(`/points/${id}/favorite`);
  return response.data;
};

export const getFavoritePoints = async () => {
  const response = await axiosInstance.get('/points/favorites/my');
  return response.data;
};

export default {
  getPoints,
  getPointById,
  createPoint,
  updatePoint,
  deletePoint,
  addToFavorites,
  removeFromFavorites,
  getFavoritePoints
};
