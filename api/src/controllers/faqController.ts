import { Request, Response } from 'express';
import Faq from '../models/Faq';

// @desc    Get all active FAQs
// @route   GET /api/faq
// @access  Public
export const getFaqs = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;

        const filter: any = { isActive: true };
        if (category) {
            filter.category = category as string;
        }

        const faqs = await Faq.find(filter)
            .sort({ category: 1, question: 1 }) // improved sorting
            .select('-__v');

        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};
