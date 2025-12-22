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
            filter.categoryId = parseInt(category as string);
        }

        const faqs = await Faq.find(filter)
            .sort({ displayOrder: 1 })
            .select('-__v');

        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};

// @desc    Increment view count for a FAQ
// @route   POST /api/faq/:id/view
// @access  Public
export const incrementViewCount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const faq = await Faq.findByIdAndUpdate(
            id,
            { $inc: { viewCount: 1 } },
            { new: true }
        );

        if (!faq) {
            res.status(404).json({ message: 'FAQ not found' });
            return;
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};
