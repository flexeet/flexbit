"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { resolvedTheme } = useTheme();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setSuccess(data.message);
            setEmail('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            {/* Logo */}
            <Link href="/" className="mb-8 group flex items-center gap-2">
                <Image
                    src={resolvedTheme === 'light' ? "/logo-dark.png" : "/logo-white.png"}
                    alt="FlexBit Pro"
                    width={120}
                    height={32}
                    className="h-16 w-auto object-contain"
                    priority
                />
            </Link>

            {/* Card */}
            <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-sm">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Forgot Password?</h1>
                    <p className="text-muted-foreground text-sm">Enter your email and we'll send you a reset link</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm text-center">
                        <span className="mr-2">✅</span>{success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Email Address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Spinner color="text-primary-foreground" />
                                <span>Sending...</span>
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Remember your password?{' '}
                    <Link href="/login" className="text-primary hover:underline font-medium transition-colors">
                        Sign In
                    </Link>
                </div>
            </div>

            <p className="mt-8 text-muted-foreground text-xs">
                © 2025 FlexBit. All rights reserved.
            </p>
        </div>
    );
}
