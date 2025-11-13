import express from 'express';
import { 
  receiveAnalytics, 
  getAnalytics 
} from '../controllers/analyticsController.js';

const router = express.Router();

// POST /api/analytics - Receive analytics events
router.post('/', receiveAnalytics);

// GET /api/analytics - Get aggregated analytics
router.get('/', getAnalytics);

export default router;

