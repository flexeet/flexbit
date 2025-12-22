
import { Request, Response } from 'express';
import Watchlist from '../models/Watchlist';
import Stock from '../models/Stock';
import { UserTier, getTierConfig, hasPermission, Feature } from '../middleware/access_control';
import { IUser } from '../models/User';

// Helper to get typed user from request
const getUser = (req: Request) => (req as any).user as IUser;

// @desc    Get user watchlist
// @route   GET /api/watchlist
// @access  Private
export const getWatchlist = async (req: Request, res: Response) => {
    try {
        const user = getUser(req);
        let watchlist = await Watchlist.findOne({ user: user._id }).lean();

        if (!watchlist) {
            // Create empty watchlist if not exists
            const newWatchlist = await Watchlist.create({ user: user._id, stocks: [] });
            res.json(newWatchlist);
            return;
        }

        // Enrich with stock details (logo, companyName)
        if (watchlist.stocks && watchlist.stocks.length > 0) {
            const tickers = watchlist.stocks.map((s: any) => s.ticker);
            const stockDetails = await Stock.find({ ticker: { $in: tickers } })
                .select('ticker logo companyName')
                .lean();

            const stockMap = new Map(stockDetails.map((s: any) => [s.ticker, s]));

            watchlist.stocks = watchlist.stocks.map((s: any) => {
                const details = stockMap.get(s.ticker);
                return {
                    ...s,
                    logo: details?.logo,
                    companyName: details?.companyName
                };
            });
        }

        res.json(watchlist);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};

// @desc    Add stock to watchlist
// @route   POST /api/watchlist
// @access  Private
export const addToWatchlist = async (req: Request, res: Response) => {
    try {
        const { ticker } = req.body;
        const user = getUser(req);
        const tier = user.subscription.tier as UserTier;
        const config = getTierConfig(tier);

        // 1. Verify Ticker Exists
        const stockExists = await Stock.findOne({ ticker });
        if (!stockExists) {
            res.status(404).json({ message: 'Stock not found' });
            return;
        }

        // 2. Get Current Watchlist
        let watchlist = await Watchlist.findOne({ user: user._id });
        if (!watchlist) {
            watchlist = await Watchlist.create({ user: user._id, stocks: [] });
        }

        // 3. Check if already added
        const isExists = watchlist.stocks.find(s => s.ticker === ticker);
        if (isExists) {
            res.status(400).json({ message: 'Stock already in watchlist' });
            return;
        }

        // 4. Check Tier Limit
        if (watchlist.stocks.length >= config.maxWatchlistSize) {
            res.status(403).json({
                message: `Your ${tier} tier limit reached (${config.maxWatchlistSize} stocks). Upgrade to add more.`
            });
            return;
        }

        // 5. Add to watchlist
        watchlist.stocks.push({
            ticker,
            addedAt: new Date()
        } as any);

        await watchlist.save();
        res.json(watchlist);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};

// @desc    Remove stock from watchlist
// @route   DELETE /api/watchlist/:ticker
// @access  Private
export const removeFromWatchlist = async (req: Request, res: Response) => {
    try {
        const { ticker } = req.params;
        const user = getUser(req);

        const watchlist = await Watchlist.findOne({ user: user._id });
        if (!watchlist) {
            res.status(404).json({ message: 'Watchlist not found' });
            return;
        }

        watchlist.stocks = watchlist.stocks.filter(s => s.ticker !== ticker);
        await watchlist.save();

        res.json(watchlist);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};

// @desc    Update alert config
// @route   PUT /api/watchlist/:ticker/alert
// @access  Private (Growth/Pro Only)
export const updateAlertConfig = async (req: Request, res: Response) => {
    try {
        const { ticker } = req.params;
        const { priceAbove, priceBelow, active } = req.body;
        const user = getUser(req);
        const tier = user.subscription.tier as UserTier;

        // 1. Check Permission
        if (!hasPermission(tier, Feature.WATCHLIST_ALERTS)) {
            res.status(403).json({
                message: `Alerts feature is locked for ${tier} tier. Upgrade to Growth/Pro.`
            });
            return;
        }

        const watchlist = await Watchlist.findOne({ user: user._id });
        if (!watchlist) {
            res.status(404).json({ message: 'Watchlist not found' });
            return;
        }

        const stockIndex = watchlist.stocks.findIndex(s => s.ticker === ticker);
        if (stockIndex === -1) {
            res.status(404).json({ message: 'Stock not in watchlist' });
            return;
        }

        // Update Config
        watchlist.stocks[stockIndex].alertConfig = {
            priceAbove,
            priceBelow,
            active
        };

        await watchlist.save();
        res.json(watchlist);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};
