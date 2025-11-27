import express from 'express';
import { handleGoogleLogin } from '../controllers/googleAuthController.js';

const router = express.Router();

/**
 * POST /api/auth/google
 * Handle Google login
 */
router.post('/', handleGoogleLogin);

export default router;
