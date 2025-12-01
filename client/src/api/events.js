import axiosInstance from './axiosInstance';

export const getEvents = async (regionSlug, startDate, endDate) => {
  const params = {};
  if (regionSlug) params.region = regionSlug;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const response = await axiosInstance.get('/events', { params });
  return response.data;
};

export const getEventById = async (id) => {
  const response = await axiosInstance.get(`/events/${id}`);
  return response.data;
};

export const createEvent = async (data) => {
  const response = await axiosInstance.post('/events', data);
  return response.data;
};

export const updateEvent = async (id, data) => {
  const response = await axiosInstance.patch(`/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await axiosInstance.delete(`/events/${id}`);
  return response.data;
};

export const getMyEvents = async () => {
  const response = await axiosInstance.get('/events/me');
  return response.data;
};

export default {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents
};
