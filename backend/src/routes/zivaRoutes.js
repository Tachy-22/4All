import express from 'express';
import { 
  processZivaMessage, 
  getProactiveGuidance 
} from '../controllers/zivaController.js';

const router = express.Router();

// POST /api/ziva - Process conversational message
router.post('/', processZivaMessage);

// POST /api/ziva/guidance - Get proactive financial guidance
router.post('/guidance', getProactiveGuidance);

export default router;

