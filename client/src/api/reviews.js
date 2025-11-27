import axiosInstance from './axiosInstance';

// Get all reviews for a specific point
export const getReviews = async (pointId) => {
  const response = await axiosInstance.get(`/reviews/${pointId}`);
  return response.data;
};

// Create a new review for a point
export const createReview = async (pointId, data) => {
  const response = await axiosInstance.post(`/reviews/${pointId}`, data);
  return response.data;
};

// Delete a review
export const deleteReview = async (reviewId) => {
  const response = await axiosInstance.delete(`/reviews/${reviewId}`);
  return response.data;
};
