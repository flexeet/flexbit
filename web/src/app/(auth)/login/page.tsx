"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import Image from 'next/image';
import { useTheme } from 'next-themes';

const loginUser = async (credentials: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include'
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
    }
    return res.json();
};

export default function LoginPage() {
    const { data: user, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const queryClient = useQueryClient();
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        if (user && !isLoading) {
            router.replace('/dashboard');
        }
    }, [user, isLoading, router]);

    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth'] });
            router.push('/dashboard');
        },
        onError: (err: any) => {
            setError(err.message);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        mutation.mutate({ email, password });
    };

    if (isLoading) return null;

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
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground text-sm">Sign in to continue to FlexBit Pro</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#8B3D88] focus:border-[#8B3D88] outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className="text-right">
                            <Link href="/forgot-password" className="text-xs text-[#8B3D88] hover:underline transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full bg-[#8B3D88] cursor-pointer hover:opacity-90 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {mutation.isPending ? (
                            <>
                                <Spinner color="text-white" />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary hover:underline font-medium transition-colors">
                        Create Account
                    </Link>
                </div>

                {/* Demo Info */}
                {/* <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-border/50 text-center">
                    <p className="text-muted-foreground text-xs mb-1">Demo Account:</p>
                    <p className="text-foreground text-xs font-mono font-medium">testuser@flexbit.id / password123</p>
                </div> */}
            </div>

            <p className="mt-8 text-muted-foreground text-xs">
                © 2025 FlexBit. All rights reserved.
            </p>
        </div>
    );
}
