import mongoose, { Document, Schema } from 'mongoose';

export interface IFaq extends Document {
    question: string;
    answer: string;
    categoryId: number;
    difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    isPopular: boolean;
    viewCount: number;
    helpfulCount: number;
    tags: string[];
    displayOrder: number;
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
    categoryId: {
        type: Number,
        default: 1
    },
    difficultyLevel: {
        type: String,
        enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
        default: 'BEGINNER'
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    viewCount: {
        type: Number,
        default: 0
    },
    helpfulCount: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    displayOrder: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for common queries
FaqSchema.index({ isActive: 1, displayOrder: 1 });
FaqSchema.index({ categoryId: 1 });
FaqSchema.index({ isPopular: -1 });

export default mongoose.model<IFaq>('Faq', FaqSchema);
