import { Request, Response } from 'express';
import { Parser } from 'json2csv';
import Stock from '../models/Stock';
import Watchlist from '../models/Watchlist';

export const exportStocksToCSV = async (req: Request, res: Response) => {
    try {
        const stocks = await Stock.find().sort({ ticker: 1 }).lean();

        if (!stocks || stocks.length === 0) {
            return res.status(404).json({ message: 'No stocks found to export' });
        }

        const fields = [
            'ticker',
            'companyName',
            'sector',
            'industry',
            'analysis.flexbitScore',
            'analysis.businessQuality',
            'analysis.timingLabel',
            'analysis.flexbitDiagnosis',
            'analysis.synthesis.description',
            'analysis.investorProfile',
            'analysis.vqsg.v',
            'analysis.vqsg.q',
            'analysis.vqsg.s',
            'analysis.vqsg.g',
            'technical.lastPrice',
            'technical.priceChangePercent',
            'technical.signals.call',
            'technical.signals.entryPrice',
            'technical.signals.targetPrice',
            'technical.signals.stopLoss'
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(stocks);

        res.header('Content-Type', 'text/csv');
        res.attachment('flexbit_stocks_export.csv');
        return res.send(csv);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ message: 'Error generating CSV export' });
    }
};

export const exportWatchlistToCSV = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const watchlist = await Watchlist.findOne({ user: user._id });

        if (!watchlist || watchlist.stocks.length === 0) {
            return res.status(404).json({ message: 'Watchlist is empty' });
        }

        const tickers = watchlist.stocks.map((s: any) => s.ticker);
        // Find stocks that match the tickers
        const stocks = await Stock.find({ ticker: { $in: tickers } }).sort({ ticker: 1 }).lean();

        if (!stocks || stocks.length === 0) {
            return res.status(404).json({ message: 'No stock data found for watchlist items' });
        }

        const fields = [
            'ticker',
            'companyName',
            'sector',
            'industry',
            'analysis.flexbitScore',
            'analysis.businessQuality',
            'analysis.timingLabel',
            'analysis.flexbitDiagnosis',
            'analysis.synthesis.description',
            'analysis.investorProfile',
            'analysis.vqsg.v',
            'analysis.vqsg.q',
            'analysis.vqsg.s',
            'analysis.vqsg.g',
            'technical.lastPrice',
            'technical.priceChangePercent',
            'technical.signals.call',
            'technical.signals.entryPrice',
            'technical.signals.targetPrice',
            'technical.signals.stopLoss'
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(stocks);

        res.header('Content-Type', 'text/csv');
        res.attachment('flexbit_watchlist_export.csv');
        return res.send(csv);

    } catch (error) {
        console.error('Watchlist Export error:', error);
        res.status(500).json({ message: 'Error generating Watchlist CSV export' });
    }
};
