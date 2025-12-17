import { useState, useCallback } from 'react';

// Custom hook for managing favorites
export const useFavorites = (user) => {
  const [favoritePoints, setFavoritePoints] = useState([]);

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setFavoritePoints(data.user.favoritePoints || []);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  }, [user]);

  const isFavorite = useCallback((pointId) => {
    return favoritePoints.includes(pointId);
  }, [favoritePoints]);

  return {
    favoritePoints,
    setFavoritePoints,
    loadFavorites,
    isFavorite
  };
};
