
"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { FileTextIcon, LockIcon, StarIcon, TrashIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTheme } from 'next-themes';

const fetchWatchlist = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watchlist`, {
        credentials: 'include'
    });
    if (!res.ok) {
        throw new Error('Failed to fetch watchlist');
    }
    return res.json();
};

const removeFromWatchlist = async (ticker: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watchlist/${ticker}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to remove');
    return res.json();
};

export default function WatchlistPage() {
    const { data: user, isLoading: authLoading } = useAuth();
    const queryClient = useQueryClient();
    const theme = useTheme();

    const { data: watchlist, isLoading: listLoading } = useQuery({
        queryKey: ['watchlist'],
        queryFn: fetchWatchlist,
        enabled: !!user,
    });

    const removeMutation = useMutation({
        mutationFn: removeFromWatchlist,
        onSuccess: () => {
            toast.success('Stock removed from watchlist', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: theme.theme == "light" ? "light" : "dark",
            });
            queryClient.invalidateQueries({ queryKey: ['watchlist'] });
        }
    });

    const handleExportWatchlist = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watchlist/export`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.message || 'Export failed (Upgrade to Growth/Pro)');
                return;
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'flexbit_watchlist_export.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export watchlist');
        }
    };

    if (authLoading || (user && listLoading)) return <div className="p-10 text-center">Loading...</div>;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Login Required</h2>
                <p className="text-muted-foreground mb-6">Please login to access your watchlist.</p>
                <Link href="/login" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold">
                    Login
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col gap-2 md:flex-row justify-between md:items-center mb-8">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold">My Watchlist</h1>
                    <p className="text-muted-foreground text-sm">Monitor saham favorit Anda ({watchlist?.stocks?.length || 0} items)</p>
                </div>

                {/* Upgrade CTA if Free/Pioneer */}
                <div className="flex gap-4 items-center">
                    {['growth', 'pro'].includes(user.subscription.tier) ? (
                        <button
                            onClick={handleExportWatchlist}
                            className="bg-secondary cursor-pointer hover:bg-secondary/80 hover:font-semibold text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                        >
                            <FileTextIcon className="w-4 h-4 text-primary" />
                            Export CSV
                        </button>
                    ) : (
                        <button
                            disabled
                            title="Upgrade to Growth to export data"
                            className="bg-muted text-muted-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-not-allowed opacity-70"
                        >
                            <LockIcon className="w-4 h-4 text-primary" />
                            Export CSV
                        </button>
                    )}

                    {/* {user.subscription.tier === 'pioneer' && (
                        <div className="hidden md:block bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 px-4 py-2 rounded-lg text-sm">
                            <span>🚀 Upgrade for Alerts</span>
                        </div>
                    )} */}
                </div>
            </div>

            {watchlist?.stocks?.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <StarIcon className="w-12 h-12 text-primary mb-4 mx-auto" />
                    <h3 className="text-lg font-bold mb-2">Watchlist Kosong</h3>
                    <p className="text-muted-foreground mb-6">Mulai tambahkan saham dari Dashboard atau Screener.</p>
                    <Link href="/dashboard" className="text-primary hover:underline">
                        Explore Market
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {watchlist?.stocks?.map((item: any) => (
                        <div key={item.ticker} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 w-full">
                                <Link href={`/stocks/${item.ticker}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                                    {item.logo ? (
                                        <Image src={item.logo} alt={item.ticker} width={40} height={40} className="w-10 h-10 rounded-lg object-cover bg-secondary" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                            {item.ticker.substring(0, 2)}
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-bold text-lg">{item.ticker}</div>
                                        <div className="text-xs text-muted-foreground">Added {new Date(item.addedAt).toLocaleDateString()}</div>
                                    </div>
                                </Link>
                            </div>

                            {/* Alert Config Mockup */}
                            <div className="flex items-center gap-4">
                                {/* <div className="flex flex-col items-end mr-4">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Alerts</div>
                                    {item.alertConfig?.active ? (
                                        <span className="text-green-500 text-sm font-bold">Active</span>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Off</span>
                                    )}
                                </div>

                                <button
                                    className="p-2 rounded bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => alert('Fitur Setting Alert akan muncul modal (Implemented in Growth Tier)')}
                                >
                                    🔔
                                </button> */}

                                <button
                                    disabled={removeMutation.isPending}
                                    onClick={() => removeMutation.mutate(item.ticker)}
                                    className="p-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
