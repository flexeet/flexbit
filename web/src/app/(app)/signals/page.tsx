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

export default function SignalsPage() {
    const { data: user } = useAuth();
    const [page, setPage] = useState(1);

    const { data: stocksData, isLoading, error } = useQuery({
        queryKey: ['stocks', page],
        queryFn: () => fetchStocks(page),
    });

    if (isLoading && !stocksData) return <div className="p-10 text-center">Loading Technical Signals...</div>;
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

    const formatCurrency = (val: number) => {
        if (!val) return '-';
        return `Rp ${val.toLocaleString('id-ID')}`;
    };

    const getSignalColor = (call?: string) => {
        if (!call) return 'bg-secondary text-muted-foreground';
        if (call.includes('Buy')) return 'bg-green-500 text-white';
        if (call.includes('Sell')) return 'bg-red-500 text-white';
        if (call.includes('Wait')) return 'bg-yellow-500/20 text-yellow-500';
        return 'bg-secondary text-muted-foreground';
    };

    return (
        <div className="space-y-6 font-sans">
            {/* Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    📈 FlexTech Signal
                </h1>
                <p className="text-muted-foreground text-sm">Trading signals, entry points, targets & stop loss</p>
            </div>

            {/* Signal Table */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-sm text-left whitespace-nowrap">
                        <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Signal</th>
                                <th className="px-6 py-4">Trend</th>
                                <th className="px-6 py-4 text-blue-500">Entry</th>
                                <th className="px-6 py-4 text-green-500">TP 1</th>
                                <th className="px-6 py-4 text-red-500">Stop Loss</th>
                                <th className="px-6 py-4 text-center">R/R</th>
                                <th className="px-6 py-4 text-center">RSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {stocks.map((stock: any) => {
                                const signals = stock.technical?.signals || {};
                                const price = stock.technical?.lastPrice;
                                const entry = signals.entryPrice || price;
                                const tp = signals.tp1 || signals.targetPrice || price;
                                const sl = signals.stopLoss || price;
                                const rr = signals.rrConservative || (sl !== entry ? ((tp - entry) / (entry - sl)).toFixed(1) : '-');

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
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold shadow-sm opacity-50 cursor-not-allowed shrink-0">
                                                        {stock.ticker.substring(0, 2)}
                                                    </div>
                                                )}
                                                <div>
                                                    {hasDetailAccess ? (
                                                        <Link href={`/stocks/${stock.ticker}`} className="font-bold hover:text-primary transition-colors">
                                                            {stock.ticker.replace('.JK', '')} {stock.analysis.stockProfile?.emoji}
                                                        </Link>
                                                    ) : (
                                                        <div className="font-bold text-muted-foreground opacity-70 cursor-not-allowed" title="Upgrade to view details">
                                                            {stock.ticker.replace('.JK', '')} {stock.analysis.stockProfile?.emoji}
                                                        </div>
                                                    )}
                                                    <div className="hidden md:block text-xs text-muted-foreground truncate max-w-[120px]">{stock.companyName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold">
                                            {formatCurrency(price)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getSignalColor(signals.call || 'Hold')}`}>
                                                {signals.call || 'Hold'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {stock.technical?.trend || 'Sideways'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-blue-500">
                                            {formatCurrency(entry)}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-500">
                                            {formatCurrency(tp)}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-red-500">
                                            {formatCurrency(sl)}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold">
                                            {rr}
                                        </td>
                                        <td className={`px-6 py-4 text-center font-bold ${(signals.rsi || 50) > 70 ? 'text-red-500' : (signals.rsi || 50) < 30 ? 'text-green-500' : 'text-blue-500'}`}>
                                            {signals.rsi?.toFixed(1) || '-'}
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
