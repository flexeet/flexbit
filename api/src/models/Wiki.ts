import mongoose, { Schema, Document } from 'mongoose';

export interface IWiki extends Document {
    id: number; // Original MySQL ID
    fieldName: string;
    fieldCategory: 'DIVIDEND' | 'MATCHING' | 'NARRATIVE' | 'TECHNICAL' | 'TOTAL' | 'TRADING' | 'VQSG';
    whatIsIt: string;
    scoreMin: number | null;
    scoreMax: number | null;
    rangeLabel: string;
    rangeEmoji: string;
    rangeDescription: string;
    actionableInsight: string;
    displayOrder: number;
}

const WikiSchema: Schema = new Schema({
    id: { type: Number, required: true, unique: true },
    fieldName: { type: String, required: true },
    fieldCategory: {
        type: String,
        enum: ['DIVIDEND', 'MATCHING', 'NARRATIVE', 'TECHNICAL', 'TOTAL', 'TRADING', 'VQSG'],
        required: true
    },
    whatIsIt: { type: String, required: true },
    scoreMin: { type: Number, default: null },
    scoreMax: { type: Number, default: null },
    rangeLabel: { type: String, required: true },
    rangeEmoji: { type: String, required: true },
    rangeDescription: { type: String, required: true },
    actionableInsight: { type: String, required: true },
    displayOrder: { type: Number, required: true }
}, {
    timestamps: true
});

export default mongoose.model<IWiki>('Wiki', WikiSchema);
