import { Request, Response } from 'express';
import Stock from '../models/Stock';
import { stockQuerySchema, tickerParamSchema, screenerQuerySchema } from '../schemas/stock';

// @desc    Get all stocks with pagination and filtering
// @route   GET /api/stocks
// @access  Public (Basic), Private (Full features)
export const getStocks = async (req: Request, res: Response) => {
    try {
        // ✅ SECURITY: Validate and sanitize all query parameters
        const parsed = stockQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json({
                message: 'Invalid query parameters',
                errors: parsed.error.errors
            });
        }

        const { keyword, quality, timing, conflict, sort, page, limit } = parsed.data;
        const query: any = {};

        // Keyword Search (now sanitized)
        if (keyword) {
            query.$or = [
                { ticker: { $regex: keyword, $options: 'i' } },
                { companyName: { $regex: keyword, $options: 'i' } },
            ];
        }

        // Filters (now validated)
        if (quality && quality !== 'All') {
            query['analysis.businessQuality'] = quality;
        }

        if (timing) {
            if (timing === 'Momentum') {
                query['analysis.timingLabel'] = { $regex: 'Momentum', $options: 'i' };
            } else if (timing === 'Akumulasi') {
                query['analysis.timingLabel'] = { $regex: 'Akumulasi', $options: 'i' };
            } else if (timing === 'Stabilisasi') {
                query['analysis.timingLabel'] = { $regex: 'Stabilisasi', $options: 'i' };
            } else if (timing === 'Hindari') {
                query['analysis.timingLabel'] = { $regex: 'Hindari', $options: 'i' };
            } else {
                query['analysis.timingLabel'] = timing;
            }
        }

        if (conflict) {
            query['analysis.conflict.hasConflict'] = conflict === 'true';
        }

        // Sorting (now validated)
        let sortOption: any = { 'analysis.flexbitScore': -1 };
        if (sort === 'ticker') sortOption = { ticker: 1 };
        if (sort === 'price_asc') sortOption = { 'technical.lastPrice': 1 };
        if (sort === 'price_desc') sortOption = { 'technical.lastPrice': -1 };

        const count = await Stock.countDocuments(query);
        const stocks = await Stock.find(query)
            .select('ticker logo companyName sector analysis.flexbitScore analysis.businessQuality analysis.timingLabel analysis.timingScore analysis.conflict analysis.investorProfile analysis.stockProfile.emoji technical.lastPrice technical.priceChangePercent technical.trend technical.trendStrength technical.signals')
            .sort(sortOption)
            .limit(limit)
            .skip(limit * (page - 1))
            .lean();

        res.json({
            stocks,
            page,
            pages: Math.ceil(count / limit),
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single stock by ticker
// @route   GET /api/stocks/:ticker
// @access  Public
export const getStockByTicker = async (req: Request, res: Response) => {
    try {
        const stock = await Stock.findOne({ ticker: req.params.ticker.toUpperCase() }).lean();

        if (stock) {
            res.json(stock);
        } else {
            res.status(404).json({ message: 'Stock not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Filter stocks based on dimensions (Screener)
// @route   GET /api/screener
// @access  Private (Pioneer+)
export const screenerStocks = async (req: Request, res: Response) => {
    try {
        const { quality, timing, minScore, maxScore } = req.query;

        const query: any = {};

        if (quality) {
            query['analysis.businessQuality'] = quality;
        }

        if (timing) {
            query['analysis.timingLabel'] = timing;
        }

        if (minScore || maxScore) {
            query['analysis.flexbitScore'] = {};
            if (minScore) query['analysis.flexbitScore'].$gte = Number(minScore);
            if (maxScore) query['analysis.flexbitScore'].$lte = Number(maxScore);
        }

        const stocks = await Stock.find(query)
            .select('ticker companyName analysis.flexbitScore analysis.businessQuality analysis.timingLabel')
            .sort({ 'analysis.flexbitScore': -1 })
            .lean();
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get stock statistics (Total, Quality Counts, Timing Counts, Conflict Counts)
// @route   GET /api/stocks/stats
// @access  Public
export const getStockStats = async (req: Request, res: Response) => {
    try {
        const total = await Stock.countDocuments();

        // 1. Quality Counts
        const qualityCounts = await Stock.aggregate([
            { $group: { _id: "$analysis.businessQuality", count: { $sum: 1 } } }
        ]);

        // 2. Timing Counts (Regex-like grouping or specific match)
        // Since we use labels like "Momentum Bagus", "Momentum Positif", etc.
        // We will perform a more manual count or regex aggregation if possible, 
        // but aggregate is strictly exact match usually unless we use $cond.
        // For simplicity and performance on small dataset (<1000), specific queries are fine, 
        // OR we can fetch all analysis fields essentially.
        // Let's use countDocuments with regex for robustness as defined in getStocks logic.

        const momentumCount = await Stock.countDocuments({ 'analysis.timingLabel': { $regex: 'Momentum', $options: 'i' } });
        const akumulasiCount = await Stock.countDocuments({ 'analysis.timingLabel': { $regex: 'Akumulasi', $options: 'i' } });
        const stabilisasiCount = await Stock.countDocuments({ 'analysis.timingLabel': { $regex: 'Stabilisasi', $options: 'i' } });
        const hindariCount = await Stock.countDocuments({ 'analysis.timingLabel': { $regex: 'Hindari', $options: 'i' } });

        // 3. Conflict Counts
        const conflictCount = await Stock.countDocuments({ 'analysis.conflict.hasConflict': true });
        const alignedCount = await Stock.countDocuments({ 'analysis.conflict.hasConflict': false });

        const stats = {
            total,
            quality: {
                solid: qualityCounts.find(q => q._id === 'Sangat Solid')?.count || 0,
                fair: qualityCounts.find(q => q._id === 'Cukup Sehat')?.count || 0,
                attention: qualityCounts.find(q => q._id === 'Perlu Perhatian')?.count || 0,
                troubled: qualityCounts.find(q => q._id === 'Bermasalah')?.count || 0,
            },
            timing: {
                momentum: momentumCount,
                accumulation: akumulasiCount,
                stabilization: stabilisasiCount,
                avoid: hindariCount,
            },
            conflict: {
                hasConflict: conflictCount,
                aligned: alignedCount
            }
        };

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
