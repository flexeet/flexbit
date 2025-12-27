import { Request, Response } from 'express';
import Wiki from '../models/Wiki';

export const getWikis = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        let query = {};

        if (category) {
            query = { fieldCategory: category };
        }

        const wikis = await Wiki.find(query).sort({ displayOrder: 1 });

        // Group by category if no specific category requested, or return flat list
        // Based on user request "grouped by category (Accordion or Tabs)", front end might prefer grouped data
        // For now, let's return flat list and let frontend partial handle grouping, OR we can return grouped object
        // Let's return flat list sorted by Category and Display Order for flexibility

        res.json(wikis);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wikis', error });
    }
};
