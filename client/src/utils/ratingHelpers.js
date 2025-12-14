// Helper functions to convert numeric ratings to text

export const getPriceLabel = (rating) => {
  if (!rating || rating < 1) return 'Unknown';
  if (rating <= 1.5) return 'Very Cheap';
  if (rating <= 2.5) return 'Cheap';
  if (rating <= 3.5) return 'Moderate';
  if (rating <= 4.5) return 'Expensive';
  return 'Very Expensive';
};

export const getAccessibilityArrivalLabel = (rating) => {
  if (!rating || rating < 1) return 'Unknown';
  if (rating <= 1.5) return 'Very Hard';
  if (rating <= 2.5) return 'Hard';
  if (rating <= 3.5) return 'Moderate';
  if (rating <= 4.5) return 'Easy';
  return 'Very Easy';
};

export const getAccessibilityDisabilityLabel = (rating) => {
  if (!rating || rating < 1) return 'Unknown';
  return rating >= 3 ? 'Accessible' : 'Not Accessible';
};

export const getAccessibilityDisabilityIcon = (rating) => {
  if (!rating || rating < 1) return { icon: 'help', accessible: false };
  return rating >= 3 
    ? { icon: 'accessible', accessible: true }
    : { icon: 'not_accessible', accessible: false };
};

// Star rating display
export const getStarRating = (rating) => {
  if (!rating) return '☆☆☆☆☆';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
};
