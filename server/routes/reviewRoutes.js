import express from 'express';
import { createReview, getReviewsForPoint, deleteReview } from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/reviews/:pointId - Create a new review
router.post('/:pointId', authMiddleware, createReview);

// GET /api/reviews/:pointId - Get all reviews for a point
router.get('/:pointId', getReviewsForPoint);

// DELETE /api/reviews/:id - Delete a review
router.delete('/:id', authMiddleware, deleteReview);

export default router;
