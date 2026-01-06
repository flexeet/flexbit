import { Router } from 'express';
import { getFaqs } from '../controllers/faqController';

const router = Router();

// GET /api/faq - Get all FAQs (public)
router.get('/', getFaqs);

export default router;
