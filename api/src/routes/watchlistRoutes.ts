
import express from 'express';
import { getWatchlist, addToWatchlist, removeFromWatchlist, updateAlertConfig } from '../controllers/watchlistController';
import { exportWatchlistToCSV } from '../controllers/exportController';
import { protect } from '../middleware/authMiddleware';
import { checkPermission, Feature } from '../middleware/access_control';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getWatchlist);
router.get('/export', checkPermission(Feature.EXPORT_DATA), exportWatchlistToCSV);
router.post('/', addToWatchlist);
router.delete('/:ticker', removeFromWatchlist);
router.put('/:ticker/alert', updateAlertConfig);

export default router;
