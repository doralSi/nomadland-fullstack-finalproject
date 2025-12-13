import express from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';
import allowOwnerOrAdmin from '../middleware/allowOwnerOrAdmin.js';
import {
  createPoint,
  getPoints,
  getPointById,
  updatePoint,
  deletePoint,
  addToFavorites,
  removeFromFavorites,
  getFavoritePoints
} from '../controllers/pointController.js';

const router = express.Router();

// Public route with optional auth - get all points
router.get('/', optionalAuthMiddleware, getPoints);

// Favorites routes (before :id route)
router.get('/favorites/my', authMiddleware, getFavoritePoints);

// Public route - get single point
router.get('/:id', getPointById);

// Protected route - create point (requires authentication)
router.post('/', authMiddleware, createPoint);

// Protected route - update point (requires owner or admin)
router.put('/:id', authMiddleware, allowOwnerOrAdmin, updatePoint);

// Protected route - delete point (requires owner or admin)
router.delete('/:id', authMiddleware, allowOwnerOrAdmin, deletePoint);

// Favorites routes
router.post('/:id/favorite', authMiddleware, addToFavorites);
router.delete('/:id/favorite', authMiddleware, removeFromFavorites);

export default router;
