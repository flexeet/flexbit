
import mongoose, { Document, Schema } from 'mongoose';

export interface IWatchlist extends Document {
    user: mongoose.Types.ObjectId;
    name: string;
    stocks: {
        ticker: string;
        addedAt: Date;
        notes?: string;
        alertConfig?: {
            priceAbove?: number;
            priceBelow?: number;
            active: boolean;
        };
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const WatchlistSchema = new Schema<IWatchlist>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        default: 'My Watchlist'
    },
    stocks: [{
        ticker: {
            type: String,
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        },
        notes: String,
        alertConfig: {
            priceAbove: Number,
            priceBelow: Number,
            active: {
                type: Boolean,
                default: true
            }
        }
    }]
}, {
    timestamps: true
});

// Ensure a user can only have one watchlist with the same name (optional, but good for now)
WatchlistSchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model<IWatchlist>('Watchlist', WatchlistSchema);
