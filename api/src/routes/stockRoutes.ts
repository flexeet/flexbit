import express from 'express';
import { getStocks, getStockByTicker, screenerStocks, getStockStats } from '../controllers/stockController';
import { exportStocksToCSV } from '../controllers/exportController';
import { protect } from '../middleware/authMiddleware';
import { checkPermission, Feature } from '../middleware/access_control';

const router = express.Router();


router.get('/', getStocks);
router.get('/screener', screenerStocks);
router.get('/stats', getStockStats);

router.get('/export', protect, checkPermission(Feature.EXPORT_DATA), exportStocksToCSV);
router.get('/:ticker', getStockByTicker);

export default router;
