"use client";

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getMaxStocksDisplay, canAccessStockDetail } from '@/utils/tierAccess';

const fetchStocks = async (page: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks?page=${page}&limit=10`);
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    return res.json();
};

export default function VQSGPage() {
    const { data: user } = useAuth();
    const [page, setPage] = useState(1);

    const { data: stocksData, isLoading, error } = useQuery({
        queryKey: ['stocks', page],
        queryFn: () => fetchStocks(page),
    });

    if (isLoading && !stocksData) return <div className="p-10 text-center">Loading VQSG Analysis...</div>;
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

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500 font-bold';
        if (score >= 60) return 'text-green-600 font-medium';
        if (score >= 40) return 'text-yellow-600 font-medium';
        return 'text-red-500 font-bold';
    };

    return (
        <div className="space-y-6 font-sans">
            {/* Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    📊 VQSG Analysis
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Breakdown skor Valuation, Quality, Safety, Growth</p>
            </div>

            {/* VQSG Table */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-center whitespace-nowrap">V-Score</th>
                                <th className="px-6 py-4 text-center whitespace-nowrap">Q-Score</th>
                                <th className="px-6 py-4 text-center whitespace-nowrap">S-Score</th>
                                <th className="px-6 py-4 text-center whitespace-nowrap">G-Score</th>
                                <th className="px-6 py-4 text-center whitespace-nowrap">FlexBit</th>
                                <th className="px-6 py-4 whitespace-nowrap">Strongest</th>
                                <th className="px-6 py-4">Weakest</th>
                                <th className="px-6 py-4 text-center">Confidence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {stocks.map((stock: any) => {
                                // Derive logic from backend data
                                const v = stock.analysis.vqsg?.v || 50;
                                const q = stock.analysis.vqsg?.q || 50;
                                const s = stock.analysis.vqsg?.s || 50;
                                const g = stock.analysis.vqsg?.g || 50;

                                const scores = { Valuation: v, Quality: q, Safety: s, Growth: g };
                                const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
                                const strongest = sorted[0];
                                const weakest = sorted[3];
                                const confidence = (stock.analysis.flexbitScore > 70 || stock.analysis.flexbitScore < 30) ? 'High' : 'Medium';

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
                                                        <div className="font-bold text-muted-foreground opacity-70 cursor-not-allowed flex items-center gap-1" title="Upgrade to view details">
                                                            {stock.ticker.replace('.JK', '')}
                                                            <span className="text-[10px] bg-secondary px-1 rounded">Locked</span>
                                                        </div>
                                                    )}
                                                    <div className="hidden md:block text-xs text-muted-foreground truncate max-w-[150px]">{stock.companyName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 text-center ${getScoreColor(v)}`}>{Math.floor(v)}</td>
                                        <td className={`px-6 py-4 text-center ${getScoreColor(q)}`}>{Math.floor(q)}</td>
                                        <td className={`px-6 py-4 text-center ${getScoreColor(s)}`}>{Math.floor(s)}</td>
                                        <td className={`px-6 py-4 text-center ${getScoreColor(g)}`}>{Math.floor(g)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`font-bold text-lg ${stock.analysis.flexbitScore >= 70 ? 'text-green-500' : 'text-blue-500'}`}>
                                                {stock.analysis.flexbitScore || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs">
                                                <span className="text-green-500 font-bold">{stock.analysis?.flexbitStrongest || `${strongest[0]} (${Math.floor(strongest[1] as number)})`}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs">
                                                <span className="text-red-500 font-bold">{stock.analysis?.flexbitWeakest || `${weakest[0]} (${Math.floor(weakest[1] as number)})`}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${confidence === 'High' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {confidence}
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
                            className="px-3 py-1 rounded border border-border hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                            Previous
                        </button>
                        <span className="hidden md:flex items-center px-2">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 rounded bg-background border border-border hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
