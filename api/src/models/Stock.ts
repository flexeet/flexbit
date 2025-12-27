import mongoose, { Schema, Document } from 'mongoose';

export interface IStock extends Document {
    ticker: string;
    companyName: string;
    sector: string;
    industry?: string;
    logo?: string;
    stockbit_url?: string;
    isFinancialSector?: boolean;
    financials: {
        per?: number;
        pbv?: number;
        roe?: number;
        der?: number;
        dividendYield?: number;
        revenueGrowth?: number;
        lastUpdated: Date;
    };
    analysis: {
        flexbitScore: number;
        businessQuality: string;
        timingScore: number;
        timingLabel: string;
        trend?: string;
        conflict: {
            hasConflict: boolean;
            type: string;
            message?: string;
        };
        investorProfile?: string;
        investorAvoid?: string;
        vqsg: {
            v: number;
            q: number;
            s: number;
            g: number;
        };
        stockProfile?: {
            emoji?: string;
            name?: string;
            description?: string;
            risk?: string;
        };
        flexbitDiagnosis?: string;
        flexbitCategory?: string;
        flexbitStrongest?: string;
        flexbitWeakest?: string;
        flexbitFundamentalSignal?: string;
        synthesis?: {
            profile?: string;
            description?: string;
            category?: string;
            alignment?: string;
        };
        dataConfidence?: string;
        valuationConfidence?: string;
        qualityConfidence?: string;
        safetyConfidence?: string;
        growthConfidence?: string;
        safetyNote?: string;
        qualityFlags?: string;
        analystNotes?: string;
    };
    technical: {
        lastPrice: number;
        priceChange?: number;
        priceChangePercent?: number;
        volume?: number;
        volumeCategory?: string;
        week52High?: number;
        week52Low?: number;
        positionIn52WeekRange?: number;
        trend?: string;
        trendStrength?: string;
        lastUpdated: Date;
        signals?: {
            call?: string;
            entryPrice?: number;
            tp1?: number;
            tp2?: number;
            stopLoss?: number;
            rsi?: number;
            rrConservative?: number;
        };
    };
    dividend?: {
        yield?: number;
        payout?: number;
        exDate?: string;
    };
    analyst?: {
        recommendation?: string;
        upsidePct?: number;
        count?: number;
    };
    reportDate?: Date;
}

const StockSchema: Schema = new Schema({
    ticker: { type: String, required: true, unique: true, uppercase: true },
    companyName: { type: String, required: true },
    sector: { type: String, required: true },
    industry: String,
    logo: String,
    stockbit_url: String,
    isFinancialSector: Boolean,
    financials: {
        per: Number,
        pbv: Number,
        roe: Number,
        der: Number,
        dividendYield: Number,
        revenueGrowth: Number,
        lastUpdated: { type: Date, default: Date.now },
    },
    analysis: {
        flexbitScore: Number,
        businessQuality: String,
        timingScore: Number,
        timingLabel: String,
        trend: String,
        conflict: {
            hasConflict: Boolean,
            type: { type: String },
            message: String,
        },
        investorProfile: String,
        investorAvoid: String,
        vqsg: {
            v: Number,
            q: Number,
            s: Number,
            g: Number
        },
        stockProfile: {
            emoji: String,
            name: String,
            description: String,
            risk: String
        },
        flexbitDiagnosis: String,
        flexbitCategory: String,
        flexbitStrongest: String,
        flexbitWeakest: String,
        flexbitFundamentalSignal: String,
        synthesis: {
            profile: String,
            description: String,
            category: String,
            alignment: String
        },
        dataConfidence: String,
        valuationConfidence: String,
        qualityConfidence: String,
        safetyConfidence: String,
        growthConfidence: String,
        safetyNote: String,
        qualityFlags: String,
        analystNotes: String
    },
    technical: {
        lastPrice: Number,
        priceChange: Number,
        priceChangePercent: Number,
        volume: Number,
        volumeCategory: String,
        week52High: Number,
        week52Low: Number,
        positionIn52WeekRange: Number,
        trend: String,
        trendStrength: String,
        lastUpdated: { type: Date, default: Date.now },
        signals: {
            call: String,
            entryPrice: Number,
            tp1: Number,
            tp2: Number,
            stopLoss: Number,
            rsi: Number,
            rrConservative: Number
        }
    },
    dividend: {
        yield: Number,
        payout: Number,
        exDate: String
    },
    analyst: {
        recommendation: String,
        upsidePct: Number,
        count: Number
    },
    reportDate: Date,
}, { timestamps: true });

// Indexes for frequent queries and sorting
StockSchema.index({ companyName: 'text', ticker: 'text' });
StockSchema.index({ 'analysis.businessQuality': 1 });
StockSchema.index({ 'analysis.timingLabel': 1 });
StockSchema.index({ 'analysis.conflict.hasConflict': 1 });
StockSchema.index({ 'analysis.flexbitCategory': 1 });
StockSchema.index({ 'technical.lastUpdated': -1 });
StockSchema.index({ sector: 1 });

// Optimization: Compound Indexes
StockSchema.index({ 'analysis.flexbitScore': -1, sector: 1 });
StockSchema.index({ 'technical.trend': 1, 'technical.trendStrength': 1 });

export default mongoose.model<IStock>('Stock', StockSchema);
