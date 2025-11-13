import express from "express";
import {
  getPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  trackPromotionMetric,
} from "../controllers/promotionsController.js";

const router = express.Router();

// Get all promotions
router.get("/", getPromotions);

// Get single promotion
router.get("/:id", getPromotion);

// Create promotion
router.post("/", createPromotion);

// Update promotion
router.put("/:id", updatePromotion);

// Delete promotion
router.delete("/:id", deletePromotion);

// Track promotion metric
router.post("/:id/track", trackPromotionMetric);

export default router;

