import express from 'express';
import { getWikis } from '../controllers/wikiController';

const router = express.Router();

router.get('/', getWikis);

export default router;
