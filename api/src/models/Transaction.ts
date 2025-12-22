import mongoose, { Schema, Document } from 'mongoose';
import { UserTier } from './User';

export interface ITransaction extends Document {
    user: mongoose.Types.ObjectId;
    orderId: string;
    tier: UserTier;
    amount: number;
    status: 'pending' | 'success' | 'failed' | 'challenge';
    snapToken: string;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, required: true, unique: true },
    tier: { type: String, enum: Object.values(UserTier), required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'success', 'failed', 'challenge'], default: 'pending' },
    snapToken: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
