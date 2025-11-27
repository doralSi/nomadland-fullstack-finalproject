import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isMapRangerOrAdmin } from '../middleware/mapRangerAuth.js';
import {
  getPendingPoints,
  approvePoint,
  rejectPoint,
  deletePointByMapRanger,
  updatePointLocation,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  deleteEventByMapRanger,
  getUsers,
  promoteToMapRanger,
  demoteToUser
} from '../controllers/mapRangerController.js';

const router = express.Router();

// All routes require authentication and mapRanger/admin role
router.use(authMiddleware);
router.use(isMapRangerOrAdmin);

// ==================== POINTS ROUTES ====================
router.get('/pending/points', getPendingPoints);
router.patch('/points/:id/approve', approvePoint);
router.patch('/points/:id/reject', rejectPoint);
router.delete('/points/:id', deletePointByMapRanger);
router.patch('/points/:id/location', updatePointLocation);

// ==================== EVENTS ROUTES ====================
router.get('/pending/events', getPendingEvents);
router.patch('/events/:id/approve', approveEvent);
router.patch('/events/:id/reject', rejectEvent);
router.delete('/events/:id', deleteEventByMapRanger);

// ==================== USER MANAGEMENT (Admin Only) ====================
router.get('/users', getUsers);
router.patch('/users/:id/promote', promoteToMapRanger);
router.patch('/users/:id/demote', demoteToUser);

export default router;
