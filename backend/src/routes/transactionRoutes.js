import express from 'express';
import { 
  getTransactions, 
  createTransaction 
} from '../controllers/transactionController.js';

const router = express.Router();

// GET /api/transactions - Get transaction history
router.get('/', getTransactions);

// POST /api/transactions - Create new transaction
router.post('/', createTransaction);

export default router;

