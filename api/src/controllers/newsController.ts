import { Request, Response } from 'express';
import News from '../models/News';

export const getNews = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 6;
        const search = req.query.search as string;

        const skip = (page - 1) * limit;

        let query: any = {};
        if (search) {
            query = {
                $or: [
                    { headline: { $regex: search, $options: 'i' } },
                    { content: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const totalItems = await News.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);

        const news = await News.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            data: news,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching news', error });
    }
};
