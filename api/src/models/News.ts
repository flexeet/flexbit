import mongoose, { Schema, Document } from 'mongoose';

export interface INews extends Document {
    id: number; // MySQL ID
    headline: string;
    content: string;
    date: Date;
    image: string;
}

const NewsSchema: Schema = new Schema({
    id: { type: Number, required: true, unique: true },
    headline: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, required: true },
    image: { type: String, required: true }
}, {
    timestamps: true
});

export default mongoose.model<INews>('News', NewsSchema);
