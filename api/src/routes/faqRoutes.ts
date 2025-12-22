import { Router } from 'express';
import { getFaqs, incrementViewCount } from '../controllers/faqController';

const router = Router();

// GET /api/faq - Get all FAQs (public)
router.get('/', getFaqs);

// POST /api/faq/:id/view - Increment view count (public)
router.post('/:id/view', incrementViewCount);

export default router;
