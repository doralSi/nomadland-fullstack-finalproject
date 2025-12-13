import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import allowEventOwnerOrAdmin from '../middleware/allowEventOwnerOrAdmin.js';
import {
  createEventTemplate,
  getEventsInRange,
  getEventTemplateById,
  updateEventTemplate,
  deleteEventTemplate,
  getMyEvents,
  addRSVP,
  removeRSVP,
  getEventRSVPs
} from '../controllers/eventController.js';

const router = express.Router();

// Protected route - get my events (must be before /:id route)
router.get('/me', authMiddleware, getMyEvents);

// Public route - get events in date range
router.get('/', getEventsInRange);

// Public route - get single event template
router.get('/:id', getEventTemplateById);

// RSVP routes
router.post('/:id/rsvp', authMiddleware, addRSVP);
router.delete('/:id/rsvp', authMiddleware, removeRSVP);
router.get('/:id/rsvps', getEventRSVPs);

// Protected route - create event template (requires authentication)
router.post('/', authMiddleware, createEventTemplate);

// Protected route - update event template (requires owner or admin)
router.patch('/:id', authMiddleware, allowEventOwnerOrAdmin, updateEventTemplate);

// Protected route - delete event template (requires owner or admin)
router.delete('/:id', authMiddleware, allowEventOwnerOrAdmin, deleteEventTemplate);

export default router;
