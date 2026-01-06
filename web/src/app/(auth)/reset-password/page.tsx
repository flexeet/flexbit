"use client";

import { useState, Suspense, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Spinner } from '@/components/ui/Spinner';
import { resetPasswordSchema } from '@/features/auth/schemas';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const validation = resetPasswordSchema.safeParse({ token: token || '', newPassword });
        if (!validation.success) {
            setError(validation.error.errors[0].message);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setSuccess(data.message);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Invalid Reset Link</h2>
                <p className="text-muted-foreground mb-6">No reset token found. Please request a new password reset.</p>
                <Link
                    href="/forgot-password"
                    className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg transition-all shadow-sm"
                >
                    Request New Link
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">Reset Password</h1>
                <p className="text-muted-foreground text-sm">Enter your new password below</p>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm text-center">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm text-center">
                    <span className="mr-2">✅</span>{success}
                    <p className="text-xs mt-1 text-green-500/70">Redirecting to login...</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">New Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Confirm New Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !!success}
                    className="w-full bg-primary cursor-pointer hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Spinner color="text-primary-foreground" />
                            <span>Resetting...</span>
                        </>
                    ) : (
                        'Reset Password'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline font-medium transition-colors">
                    ← Back to Login
                </Link>
            </div>
        </>
    );
}

export default function ResetPasswordPage() {
    const { resolvedTheme } = useTheme();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            {/* Logo */}
            <Link href="/" className="mb-8 group flex items-center gap-1 hover:opacity-90 transition-opacity">
                <Image
                    src={resolvedTheme === 'light' ? "/logo_flexbit_light.png" : "/logo_flexbit_dark.png"}
                    alt="FlexBit Pro"
                    width={60}
                    height={60}
                    className="h-14 w-auto object-contain"
                    priority
                />
                <div className="flex items-center">
                    <span className="text-3xl font-extrabold bg-gradient-to-r from-[#8B3D88] to-indigo-600 bg-clip-text text-transparent tracking-tight">
                        FlexBit Pro
                    </span>
                </div>
            </Link>


            {/* Card */}
            <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-sm">
                <Suspense fallback={
                    <div className="flex items-center justify-center py-12">
                        <Spinner color="text-primary-foreground" />
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>
            </div>

            <p className="mt-8 text-muted-foreground text-xs">
                © 2025 FlexBit. All rights reserved.
            </p>
        </div>
    );
}
