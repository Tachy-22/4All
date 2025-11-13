import express from 'express';
import { 
  processBillPayment, 
  getBillPayments 
} from '../controllers/billsController.js';

const router = express.Router();

// POST /api/bills - Process bill payment
router.post('/', processBillPayment);

// GET /api/bills - Get bill payment history
router.get('/', getBillPayments);

export default router;

