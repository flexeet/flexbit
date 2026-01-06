import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z.object({
    fullName: z.string().min(2, { message: "Full Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    phoneNumber: z.string().regex(/^62\d+$/, { message: "Phone number must start with 62 and contain only numbers" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Profile Update Schema
export const profileSchema = z.object({
    fullName: z.string().min(2, { message: "Full Name must be at least 2 characters" }).optional(),
    phoneNumber: z.string().regex(/^62\d+$/, { message: "Phone number must start with 62" }).optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// Password Change Schema
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
})
    .refine((data) => data.newPassword !== data.currentPassword, {
        message: "New password cannot be the same as current password",
        path: ["newPassword"],
    });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
});

// Reset Password Schema
export const resetPasswordSchema = z.object({
    token: z.string().min(1, { message: "Token is required" }),
    newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
});
