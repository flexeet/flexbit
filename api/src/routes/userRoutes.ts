import express from 'express';
import { getUsers } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { admin } from '../middleware/adminMiddleware';

const router = express.Router();

router.get('/', protect, admin, getUsers);

export default router;
