import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

import connectDB from './config/db';
import stockRoutes from './routes/stockRoutes';
import authRoutes from './routes/authRoutes';
import watchlistRoutes from './routes/watchlistRoutes';
import userRoutes from './routes/userRoutes';
import paymentRoutes from './routes/paymentRoutes';
import faqRoutes from './routes/faqRoutes';
import { initMigrationScheduler } from './jobs/migrationScheduler';

// Connect Database then initialize scheduler
connectDB().then(() => {
    // Initialize migration scheduler after DB is connected
    initMigrationScheduler();
});

// Security Middleware
app.use(helmet());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Performance Middleware
app.use(compression());

// Middleware
app.use(cors({
    origin: `${process.env.CLIENT_URL}`, // Frontend
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health Check
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'FlexBit API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/stocks', stockRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/faq', faqRoutes);


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
