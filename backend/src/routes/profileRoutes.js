import express from "express";
import {
  detectProfile,
  saveProfile,
  getProfile,
  getAllProfiles,
  updateProfile,
} from "../controllers/profileController.js";

const router = express.Router();

// POST /api/profile/detect - AI-powered profile detection
router.post("/detect", detectProfile);

// GET /api/profile - Get all profiles (must be before /:profileId)
router.get("/", getAllProfiles);

// POST /api/profile - Save complete profile
router.post("/", saveProfile);

// GET /api/profile/:profileId - Get profile by ID
router.get("/:profileId", getProfile);

// PUT /api/profile/:profileId - Update profile
router.put("/:profileId", updateProfile);

export default router;
