import express from 'express';
import { createTransaction, handleNotification, verifyTransaction, getPaymentHistory } from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/transaction', protect, createTransaction);
router.post('/verify', protect, verifyTransaction);
router.post('/notification', handleNotification);
router.get('/history', protect, getPaymentHistory);

export default router;
