import { z } from 'zod';
import { UserTier } from '../models/User';

export const createTransactionSchema = z.object({
    tier: z.nativeEnum(UserTier, {
        errorMap: () => ({ message: "Invalid subscription tier value" })
    }).refine(val => val !== UserTier.FREE, {
        message: "Free tier cannot be purchased"
    }),
});

export const manualVerificationSchema = z.object({
    orderId: z.string().min(1, { message: "Order ID is required" }),
});
