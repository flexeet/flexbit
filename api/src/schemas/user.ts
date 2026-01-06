import { z } from 'zod';
import { UserTier } from '../models/User';

export const updateUserSchema = z.object({
    fullName: z.string().min(2, { message: "Full Name must be at least 2 characters" }).optional(),
    email: z.string().email({ message: "Invalid email address" }).optional(),
    phoneNumber: z.string().optional(),
    role: z.enum(['user', 'admin']).optional(),
    subscription: z.object({
        tier: z.nativeEnum(UserTier).optional(),
        status: z.enum(['active', 'expired', 'canceled']).optional(),
        startDate: z.string().or(z.date()).optional(),
        expiryDate: z.string().or(z.date()).nullable().optional(),
        paymentId: z.string().optional()
    }).optional()
});
