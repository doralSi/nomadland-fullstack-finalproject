import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);
router.get("/me", authMiddleware, getProfile); // Same as profile, for compatibility

export default router;
