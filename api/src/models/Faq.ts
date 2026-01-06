import mongoose, { Document, Schema } from 'mongoose';

export interface IFaq extends Document {
    question: string;
    answer: string;
    category: string;
    note?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FaqSchema = new Schema<IFaq>({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'BASIC INVESTING',
            'FUNDAMENTAL ANALYSIS',
            'NARRATIVE SYSTEM',
            'PEMBELIAN & AKSES',
            'SINYAL SINTESIS',
            'STRATEGI & PSIKOLOGI',
            'TECHNICAL ANALYSIS',
            'TENTANG FLEXBIT'
        ]
    },
    note: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for common queries
FaqSchema.index({ isActive: 1 });
FaqSchema.index({ category: 1 });

export default mongoose.model<IFaq>('Faq', FaqSchema);
