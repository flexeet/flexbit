"use client";

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getMaxStocksDisplay, canAccessStockDetail, canExportData } from '@/utils/tierAccess';
import { useRouter } from 'next/navigation';
import { FileTextIcon, LayoutDashboard } from 'lucide-react';

// Types - Updated to match new schema
interface Stock {
    ticker: string;
    companyName: string;
    sector: string;
    industry?: string;
    logo?: string;
    stockbit_url?: string;
    analysis: {
        flexbitScore: number;
        businessQuality: string;
        timingLabel: string;
        timingScore: number;
        conflict: {
            hasConflict: boolean;
            type: string;
        };
        investorProfile?: string;
        stockProfile?: {
            emoji?: string;
            name?: string;
            description?: string;
            risk?: string;
        };
        flexbitDiagnosis?: string;
        flexbitCategory?: string;
    };
    technical: {
        lastPrice: number;
        priceChange?: number;
        priceChangePercent?: number;
        trend?: string;
        trendStrength?: string;
    };
}

const fetchStocks = async (page: number, filter: string, sort: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '10');

    if (filter !== 'All') {
        params.append('quality', filter);
    }

    if (sort === 'Score') params.append('sort', 'score');
    if (sort === 'Ticker') params.append('sort', 'ticker');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks?${params.toString()}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
};

const fetchStats = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
};

export default function DashboardPage() {
    const router = useRouter();
    const { data: user } = useAuth();
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('All');
    const [sort, setSort] = useState('Score');

    const { data: stocksData, isLoading: isLoadingStocks, error } = useQuery({
        queryKey: ['stocks', page, filter, sort],
        queryFn: () => fetchStocks(page, filter, sort),
    });

    const { data: statsData } = useQuery({
        queryKey: ['stats'],
        queryFn: fetchStats
    });

    if (isLoadingStocks && !stocksData) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-8 w-40" />
                </div>
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        );
    }
    if (error) return <div className="p-10 text-center text-red-500">Error loading data. Is Backend running?</div>;

    // Tier Logic
    const maxStocks = getMaxStocksDisplay(user?.subscription?.tier);
    const hasDetailAccess = canAccessStockDetail(user?.subscription?.tier);
    const canExport = canExportData(user?.subscription?.tier);

    let stocks: Stock[] = stocksData?.stocks || [];
    const totalCount = stocksData?.total || 0;

    // Apply limit if free tier
    if (stocks.length > maxStocks) {
        stocks = stocks.slice(0, maxStocks);
    }

    const totalPages = maxStocks === Infinity ? (stocksData?.pages || 1) : 1;
    const stats = statsData || { total: 0, quality: {}, timing: {}, conflict: {} };

    const getQualityBadgeColor = (quality: string) => {
        switch (quality) {
            case 'Sangat Solid': return 'text-green-500';
            case 'Cukup Sehat': return 'text-blue-500';
            case 'Perlu Perhatian': return 'text-yellow-500';
            case 'Bermasalah': return 'text-red-500';
            default: return 'text-muted-foreground';
        }
    };

    const getQualityIcon = (quality: string) => {
        switch (quality) {
            case 'Sangat Solid': return '🟢';
            case 'Cukup Sehat': return '🔵';
            case 'Perlu Perhatian': return '🟡';
            case 'Bermasalah': return '🔴';
            default: return '⚪';
        }
    };

    const getTimingColor = (label: string) => {
        if (!label) return 'text-muted-foreground';
        if (label.includes('Momentum') || label.includes('Bagus')) return 'text-green-500';
        if (label.includes('Akumulasi') || label.includes('Zona')) return 'text-blue-500';
        if (label.includes('Stabilisasi') || label.includes('Tunggu')) return 'text-yellow-500';
        if (label.includes('Hindari') || label.includes('Hati-hati') || label.includes('Mahal') || label.includes('Konsolidasi')) return 'text-red-500';
        return 'text-muted-foreground';
    };

    const getTimingColorBackground = (label: string) => {
        if (!label) return 'text-muted-foreground';
        if (label.includes('Momentum') || label.includes('Bagus')) return 'bg-green-500';
        if (label.includes('Akumulasi') || label.includes('Zona')) return 'bg-blue-500';
        if (label.includes('Stabilisasi') || label.includes('Tunggu')) return 'bg-yellow-500';
        if (label.includes('Hindari') || label.includes('Hati-hati') || label.includes('Mahal') || label.includes('Hindari') || label.includes('Konsolidasi')) return 'bg-red-500';
        return 'text-muted-foreground';
    };

    const getTimingIcon = (label: string) => {
        if (!label) return '⚪';
        if (label.includes('Momentum') || label.includes('Bagus')) return '⬆️';
        if (label.includes('Akumulasi') || label.includes('Zona')) return '↔️';
        if (label.includes('Stabilisasi') || label.includes('Tunggu')) return '⏳';
        return '🚫';
    };

    const getColorTrend = (trend?: string) => {
        if (!trend) return 'muted-foreground';
        if (trend.includes('Kuat')) return 'green-500';
        if (trend.includes('Lemah')) return 'red-500';
        return 'muted-foreground';
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



    const handleExport = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks/export`, {
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
            a.download = 'flexbit_stocks_export.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data');
        }
    };

    return (
        <div className="space-y-8 font-sans">
            {/* Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <LayoutDashboard className="h-6 w-6 text-primary" /> Dashboard
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Overview semua saham dengan Narrative System V3.5</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                    <div className="text-xs text-muted-foreground mb-1">Total Saham</div>
                    <div className="text-3xl font-bold">{stats.total}</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">🟢 Bisnis Sangat Solid</div>
                    <div className="text-3xl font-bold text-green-500">{stats.quality?.solid || 0}</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">🔵 Momentum Bagus</div>
                    <div className="text-3xl font-bold text-blue-500">{stats.timing?.momentum || 0}</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">🟡 Ada Konflik</div>
                    <div className="text-3xl font-bold text-yellow-500">{stats.conflict?.hasConflict || 0}</div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <span className="text-sm text-muted-foreground mr-2">Filter:</span>
                    {['All', 'Sangat Solid', 'Cukup Sehat', 'Perlu Perhatian', 'Bermasalah'].map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
                            className={`px-4 py-1.5 cursor-pointer rounded-full text-xs font-medium transition-colors whitespace-nowrap border ${filter === f
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'bg-background border-border text-muted-foreground hover:border-primary hover:text-foreground'
                                }`}
                        >
                            {f === 'All' ? `All` : f}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort:</span>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="bg-card cursor-pointer border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="Score">Score ↓</option>
                        <option value="Ticker">Ticker A-Z</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">FlexBit</th>
                                <th className="px-6 py-4 whitespace-nowrap">Kualitas Bisnis</th>
                                <th className="px-6 py-4 whitespace-nowrap">Timing Harga</th>
                                <th className="px-6 py-4 whitespace-nowrap">Timing Score</th>
                                <th className="px-6 py-4 whitespace-nowrap">Konflik</th>
                                <th className="px-6 py-4 whitespace-nowrap">Cocok Untuk</th>
                                <th className="px-6 py-4 whitespace-nowrap">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {stocks.map(stock => (
                                <tr key={stock.ticker} className="hover:bg-secondary/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* Logo */}
                                            {hasDetailAccess ? (
                                                <Link href={`/stocks/${stock.ticker}`} className="font-bold hover:text-primary transition-colors flex items-center gap-2">
                                                    {stock.logo ? (
                                                        <Image
                                                            src={stock.logo}
                                                            alt={stock.ticker}
                                                            width={40}
                                                            height={40}
                                                            className="w-10 h-10 rounded-lg object-cover bg-secondary"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                                            {stock.ticker.substring(0, 2)}
                                                        </div>
                                                    )}
                                                    {stock.ticker.replace('.JK', '')}
                                                    {stock.analysis.stockProfile?.emoji && (
                                                        <span title={stock.analysis.stockProfile.name}>{stock.analysis.stockProfile.emoji}</span>
                                                    )}
                                                </Link>
                                            ) : (
                                                <div className="flex items-center gap-2 opacity-70 cursor-not-allowed" title="Upgrade to view details">
                                                    {stock.logo ? (
                                                        <Image src={stock.logo} alt={stock.ticker} width={40} height={40} className="w-10 h-10 rounded-lg object-cover grayscale" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold">
                                                            {stock.ticker.substring(0, 2)}
                                                        </div>
                                                    )}
                                                    {stock.ticker.replace('.JK', '')}
                                                    <span className="text-[10px] bg-secondary text-muted-foreground px-1 rounded">Locked</span>
                                                </div>
                                            )}
                                            <div className="hidden md:block"> {/* Keep company name hidden on small screens to save some space? Or show it? Narrative hides it too. */}
                                                <div className="text-xs text-muted-foreground truncate max-w-[150px]">{stock.companyName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`font-bold text-lg ${stock.analysis.flexbitScore >= 70 ? 'text-green-500' : stock.analysis.flexbitScore >= 50 ? 'text-blue-500' : stock.analysis.flexbitScore >= 30 ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {stock.analysis.flexbitScore}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`font-medium flex items-center gap-1 whitespace-nowrap ${getQualityBadgeColor(stock.analysis.businessQuality)}`}>
                                            <span>{getQualityIcon(stock.analysis.businessQuality)}</span>
                                            <span>{stock.analysis.businessQuality}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`font-medium whitespace-nowrap text-xs ${getTimingColor(stock.analysis.timingLabel)}`}>
                                            <span className="mr-1">{getTimingIcon(stock.analysis.timingLabel)}</span>
                                            {stock.analysis.timingLabel}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 w-32">
                                            <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${getTimingColorBackground(stock.analysis.timingLabel)}`}
                                                    style={{ width: `${stock.analysis.timingScore}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-mono">{stock.analysis.timingScore}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {stock.analysis.conflict.hasConflict ? (
                                            <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">⚠️ Ya</span>
                                        ) : (
                                            <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">✅ Tidak</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`bg-${getColorInvestorProfile(stock.analysis.investorProfile)}/10 text-${getColorInvestorProfile(stock.analysis.investorProfile)} px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap`}>
                                            {stock.analysis.investorProfile || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`bg-${getColorTrend(stock.technical.trendStrength)}/10 text-${getColorTrend(stock.technical.trendStrength)} px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap`}>
                                            {stock.technical.trendStrength || '-'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-border bg-secondary/20 flex justify-between items-center text-xs text-muted-foreground">
                    <div>Showing {stocks.length} of {totalCount} stocks</div>
                    <div className="flex items-center gap-2">
                        {/* Export Button */}
                        {canExport && (
                            <button
                                onClick={handleExport}
                                className="flex items-center cursor-pointer gap-2 px-3 py-1.5 text-sm font-medium border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                            >
                                <FileTextIcon className="w-4 h-4 text-primary" />
                                <span className="hidden md:inline">Export</span>
                            </button>
                        )}
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 cursor-pointer rounded border border-border hover:bg-secondary disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="hidden md:flex items-center px-2">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 cursor-pointer rounded bg-background border border-border hover:bg-secondary disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
