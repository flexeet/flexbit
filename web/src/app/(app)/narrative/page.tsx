"use client";

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getMaxStocksDisplay, canAccessStockDetail } from '@/utils/tierAccess';
import { Target } from 'lucide-react';

const fetchStocks = async (page: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks?page=${page}&limit=10`);
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    return res.json();
};

export default function NarrativePage() {
    const { data: user } = useAuth();
    const [page, setPage] = useState(1);

    const { data: stocksData, isLoading, error } = useQuery({
        queryKey: ['stocks', page],
        queryFn: () => fetchStocks(page),
    });

    if (isLoading && !stocksData) return <div className="p-10 text-center">Loading Narrative Data...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Error loading data.</div>;



    // Tier Logic
    const maxStocks = getMaxStocksDisplay(user?.subscription?.tier);
    const hasDetailAccess = canAccessStockDetail(user?.subscription?.tier);

    let stocks = stocksData?.stocks || [];
    // Apply limit if free tier
    if (stocks.length > maxStocks) {
        stocks = stocks.slice(0, maxStocks);
    }

    const totalPages = maxStocks === Infinity ? (stocksData?.pages || 1) : 1;
    const totalCount = stocksData?.total || 0;

    // Helper for Styles
    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'Sangat Solid': return 'text-green-500';
            case 'Cukup Sehat': return 'text-blue-500';
            case 'Perlu Perhatian': return 'text-yellow-500';
            case 'Bermasalah': return 'text-red-500';
            default: return 'text-muted-foreground';
        }
    };

    const getTimingColor = (label: string) => {
        if (!label) return 'text-muted-foreground';
        if (label.includes('Momentum')) return 'text-green-500';
        if (label.includes('Akumulasi')) return 'text-blue-500';
        if (label.includes('Stabilisasi')) return 'text-yellow-500';
        if (label.includes('Hindari')) return 'text-red-500';
        return 'text-muted-foreground';
    };

    const getNotSuitable = (profile: string) => {
        if (profile === 'Long-term Value') return 'Trader jangka pendek';
        if (profile === 'Trader') return 'Investor jangka panjang';
        if (profile === 'Income & Value') return 'Growth Hunter';
        if (profile === 'Growth') return 'Dividend Investor';
        return 'Spekulan';
    };

    const getColorInvestorProfile = (profile?: string) => {
        if (!profile) return 'muted-foreground';
        if (profile.includes('Growth') || profile.includes('Berpengalaman')) return 'green-500';
        if (profile.includes('Tidak')) return 'red-500';
        if (profile.includes('Balanced')) return 'yellow-500';
        if (profile.includes('Conservative')) return 'orange-500';
        if (profile.includes('Investor')) return 'blue-500';
        return 'muted-foreground';
    };

    return (
        <div className="space-y-6 font-sans">
            {/* Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" /> Narrative View
                    <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">NEW V3.5</span>
                </h1>
                <p className="text-muted-foreground text-sm mt-1">2 Dimensi: Kualitas Bisnis vs Timing Harga</p>
            </div>

            {/* Narrative Table */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">FlexBit</th>
                                <th className="px-6 py-4">Kualitas Bisnis</th>
                                <th className="px-6 py-4">Timing Harga</th>
                                <th className="px-6 py-4">Timing Score</th>
                                <th className="px-6 py-4">Konflik</th>
                                <th className="px-6 py-4 whitespace-nowrap">✅ Cocok Untuk</th>
                                <th className="px-6 py-4 whitespace-nowrap">❌ Tidak Cocok</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {stocks.map((stock: any) => {
                                // Defaulting profile if array or string
                                const profile = Array.isArray(stock.analysis.investorProfile)
                                    ? stock.analysis.investorProfile[0]
                                    : stock.analysis.investorProfile || 'Balanced';

                                const notSuitable = getNotSuitable(profile);

                                return (
                                    <tr key={stock.ticker} className="hover:bg-secondary/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {hasDetailAccess ? (
                                                    <Link href={`/stocks/${stock.ticker}`} className="shrink-0">
                                                        {stock.logo ? (
                                                            <Image src={stock.logo} alt={stock.ticker} width={40} height={40} className="w-10 h-10 rounded-lg object-cover bg-secondary" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg">
                                                                {stock.ticker.substring(0, 2)}
                                                            </div>
                                                        )}
                                                    </Link>
                                                ) : (
                                                    <div className="opacity-70 cursor-not-allowed">
                                                        {stock.logo ? (
                                                            <Image src={stock.logo} alt={stock.ticker} width={40} height={40} className="w-10 h-10 rounded-lg object-cover bg-secondary grayscale" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg">
                                                                {stock.ticker.substring(0, 2)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    // <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold shadow-sm opacity-50 cursor-not-allowed shrink-0">
                                                    //     {stock.ticker.substring(0, 2)}
                                                    // </div>
                                                )}
                                                <div>
                                                    {hasDetailAccess ? (
                                                        <Link href={`/stocks/${stock.ticker}`} className="font-bold hover:text-primary transition-colors flex items-center gap-1">
                                                            {stock.ticker.replace('.JK', '')}
                                                            {stock.analysis?.stockProfile?.emoji && <span>{stock.analysis.stockProfile.emoji}</span>}
                                                        </Link>
                                                    ) : (
                                                        <div className="font-bold text-muted-foreground flex items-center gap-1 opacity-70 cursor-not-allowed" title="Upgrade to view details">
                                                            {stock.ticker.replace('.JK', '')}
                                                            <span className="text-[10px] bg-secondary px-1 rounded">Locked</span>
                                                        </div>
                                                    )}
                                                    <div className="hidden md:block text-xs text-muted-foreground truncate max-w-[150px]">{stock.companyName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`font-bold text-lg ${stock.analysis.flexbitScore >= 70 ? 'text-green-500' : 'text-blue-500'}`}>
                                                {stock.analysis.flexbitScore || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`font-medium flex items-center gap-2 whitespace-nowrap ${getQualityColor(stock.analysis.businessQuality)}`}>
                                                <span className="w-3 h-3 rounded-full bg-current"></span>
                                                {stock.analysis.businessQuality}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`font-medium flex items-center gap-2 whitespace-nowrap ${getTimingColor(stock.analysis.timingLabel)}`}>
                                                {stock.analysis.timingLabel?.includes('Momentum') ? '⬆️' : '⏳'} {stock.analysis.timingLabel}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 w-32">
                                                <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${stock.analysis.timingLabel?.includes('Momentum') ? 'bg-green-500' : 'bg-red-500'}`}
                                                        style={{ width: `${stock.analysis.timingScore}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-mono">{stock.analysis.timingScore}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {stock.analysis.conflict.hasConflict ? (
                                                <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                                                    ⚠️ Fund ≠ Tech
                                                </span>
                                            ) : (
                                                <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                                                    ✅ Selaras
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`bg-${getColorInvestorProfile(profile)}/10 text-${getColorInvestorProfile(profile)} px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap`}>
                                                {profile}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-red-500 text-xs font-medium truncate max-w-[120px] block">
                                                {stock.analysis?.investorAvoid || notSuitable}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-border bg-secondary/20 flex justify-between items-center text-xs text-muted-foreground">
                    <div>Showing {stocks.length} of {totalCount} stocks</div>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 cursor-pointer rounded border border-border hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                            Previous
                        </button>
                        <span className="hidden md:flex items-center px-2">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 cursor-pointer rounded bg-background border border-border hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
