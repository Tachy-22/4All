import express from 'express';
import { 
  getDashboardOverview, 
  getUserSegments, 
  getRecommendations 
} from '../controllers/dashboardController.js';

const router = express.Router();

// GET /api/dashboard/overview - Comprehensive dashboard overview
router.get('/overview', getDashboardOverview);

// GET /api/dashboard/user-segments - User segmentation analysis
router.get('/user-segments', getUserSegments);

// GET /api/dashboard/recommendations - AI-driven recommendations
router.get('/recommendations', getRecommendations);

export default router;

