"use client";

import { useEffect, ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { UIStoreProvider } from '@/providers/StoreProvider';

export default function AppLayout({
    children,
    modal
}: {
    children: ReactNode;
    modal: ReactNode;
}) {
    const { data: user, isLoading, isError } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
                    <div className="text-muted-foreground text-sm">Authenticating...</div>
                </div>
            </div>
        );
    }

    if (!user) return null; // Prevent flash of content before redirect

    return (
        <UIStoreProvider>
            <div className="min-h-screen bg-background text-foreground font-sans">
                <Sidebar />

                <div className="md:ml-64 min-h-screen flex flex-col">
                    <TopBar />

                    <main className="flex-1 p-4 md:p-6 overflow-x-hidden mt-16 bg-background/50">
                        {children}
                    </main>
                </div>
                {modal}
            </div>
        </UIStoreProvider>
    );
}
