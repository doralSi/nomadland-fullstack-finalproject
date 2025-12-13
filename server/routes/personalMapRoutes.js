import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createPersonalMap,
  getMyMaps,
  getMapById,
  updatePersonalMap,
  deletePersonalMap,
  addPointToMap,
  removePointFromMap,
  getUserRegions,
  getUserPointsInRegion
} from '../controllers/personalMapController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get regions where user has points
router.get('/regions', getUserRegions);

// Get user's points in a specific region
router.get('/regions/:regionSlug', getUserPointsInRegion);

// Create a new personal map
router.post('/', createPersonalMap);

// Get all maps for the logged-in user
router.get('/my', getMyMaps);

// Get a specific personal map by ID
router.get('/:id', getMapById);

// Update a personal map
router.patch('/:id', updatePersonalMap);

// Delete a personal map
router.delete('/:id', deletePersonalMap);

// Add a point to a personal map
router.patch('/:mapId/add/:pointId', addPointToMap);

// Remove a point from a personal map
router.patch('/:mapId/remove/:pointId', removePointFromMap);

export default router;
