import mongoose, { Schema, Document } from 'mongoose';

export enum UserTier {
    FREE = 'free',
    PIONEER = 'pioneer',
    EARLY_ADOPTER = 'early_adopter',
    GROWTH = 'growth',
    PRO = 'pro',
}

export interface IUser extends Document {
    email: string;
    phoneNumber: string;
    passwordHash: string;
    fullName: string;
    role: 'user' | 'admin';
    subscription: {
        tier: UserTier;
        status: 'active' | 'expired' | 'canceled';
        startDate: Date;
        expiryDate: Date | null;
        paymentId?: string;
    };
    preferences: {
        theme: 'dark' | 'light';
        notifications: boolean;
    };
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    subscription: {
        tier: { type: String, enum: Object.values(UserTier), default: UserTier.FREE },
        status: { type: String, enum: ['active', 'expired', 'canceled'], default: 'active' },
        startDate: { type: Date, default: Date.now },
        expiryDate: { type: Date, default: null }, // Null for lifetime
        paymentId: String,
    },
    preferences: {
        theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
        notifications: { type: Boolean, default: true },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, { timestamps: true });

// Indexes for performance
UserSchema.index({ fullName: 1 });
UserSchema.index({ resetPasswordToken: 1 });

export default mongoose.model<IUser>('User', UserSchema);

