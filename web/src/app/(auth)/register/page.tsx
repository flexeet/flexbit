"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/features/auth/schemas';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

const registerUser = async (userData: RegisterInput) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
    }
    return res.json();
};

export default function RegisterPage() {
    const { data: user, isLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [serverError, setServerError] = useState('');
    const { resolvedTheme } = useTheme();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema)
    });

    useEffect(() => {
        if (user && !isLoading) {
            router.replace('/dashboard');
        }
    }, [user, isLoading, router]);

    const mutation = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth'] });
            router.push('/dashboard');
        },
        onError: (err: any) => {
            setServerError(err.message);
        }
    });

    const onSubmit = (data: RegisterInput) => {
        setServerError('');
        mutation.mutate(data);
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
                    <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
                    <p className="text-muted-foreground text-sm">Join FlexBit Pro and start investing smarter</p>
                </div>

                {serverError && (
                    <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm text-center">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Full Name</label>
                        <input
                            {...register("fullName")}
                            type="text"
                            placeholder="John Doe"
                            className={`w-full bg-secondary border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground outline-none transition-all ${errors.fullName ? 'border-destructive' : 'border-border focus:ring-2 focus:ring-[#8B3D88] focus:border-[#8B3D88]'}`}
                        />
                        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Phone Number</label>
                        <input
                            {...register("phoneNumber")}
                            type="text"
                            placeholder="628..."
                            className={`w-full bg-secondary border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground outline-none transition-all ${errors.phoneNumber ? 'border-destructive' : 'border-border focus:ring-2 focus:ring-[#8B3D88] focus:border-[#8B3D88]'}`}
                        />
                        <p className="text-xs text-muted-foreground">Format: 628...</p>
                        {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Email</label>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="you@example.com"
                            className={`w-full bg-secondary border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground outline-none transition-all ${errors.email ? 'border-destructive' : 'border-border focus:ring-2 focus:ring-[#8B3D88] focus:border-[#8B3D88]'}`}
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Password</label>
                        <input
                            {...register("password")}
                            type="password"
                            placeholder="••••••••"
                            className={`w-full bg-secondary border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground outline-none transition-all ${errors.password ? 'border-destructive' : 'border-border focus:ring-2 focus:ring-[#8B3D88] focus:border-[#8B3D88]'}`}
                        />
                        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={mutation.isPending || isSubmitting}
                        className="w-full bg-[#8B3D88] hover:opacity-90 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {mutation.isPending ? (
                            <>
                                <Spinner color="text-white" />
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#8B3D88] hover:underline font-medium transition-colors">
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
