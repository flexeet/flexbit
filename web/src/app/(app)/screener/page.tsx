"use client";

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getMaxStocksDisplay, canAccessStockDetail } from '@/utils/tierAccess';

interface Stock {
    ticker: string;
    companyName: string;
    logo?: string;
    analysis: {
        flexbitScore: number;
        businessQuality: string;
        timingLabel: string;
        timingScore: number;
        conflict: {
            hasConflict: boolean;
        };
        stockProfile?: {
            emoji?: string;
        };
        flexbitDiagnosis?: string;
    };
    technical: {
        lastPrice: number;
        priceChangePercent: number;
    };
}

const QUALITIES = ['Sangat Solid', 'Cukup Sehat', 'Perlu Perhatian', 'Bermasalah'];
const TIMINGS = ['Momentum', 'Zona Akumulasi', 'Stabilisasi', 'Hindari'];

// Helper to keep filter param backward compatible if needed, but we prefer explicit params
const fetchStocks = async (quality: string, timing: string, conflict: string, page: number = 1) => {
    const params = new URLSearchParams();
    if (quality) params.append('quality', quality);
    if (timing) params.append('timing', timing);
    if (conflict) params.append('conflict', conflict);
    params.append('page', page.toString());
    params.append('limit', '10');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks?${params.toString()}`);
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    return res.json();
};

export default function ScreenerPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: user } = useAuth();

    const page = Number(searchParams.get('page')) || 1;

    // Parse URL params directly
    // Also support legacy 'filter' param if sidebar hasn't fully propagated or cached
    const filterParam = searchParams.get('filter') || '';

    let activeQuality = searchParams.get('quality') || '';
    let activeTiming = searchParams.get('timing') || '';
    let activeConflict = searchParams.get('conflict') || '';

    // Legacy Fallback (Optional, can be removed if Sidebar update is sufficient)
    if (filterParam === 'momentum') activeTiming = 'Momentum';
    if (filterParam === 'accumulation') activeTiming = 'Akumulasi';
    if (filterParam === 'wait') activeTiming = 'Stabilisasi';
    if (filterParam === 'avoid') activeTiming = 'Hindari';
    if (filterParam === 'conflict') activeConflict = 'true';
    if (filterParam === 'aligned') activeConflict = 'false';

    const setParams = (key: string, value: string) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (value) {
            current.set(key, value);
        } else {
            current.delete(key);
        }

        // Reset page on filter change
        if (key !== 'page') {
            current.set('page', '1');
            // Remove legacy filter if user interacts with specific controls
            current.delete('filter');
        }

        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`/screener${query}`);
    };

    const { data, isLoading } = useQuery({
        // Include filterParam in key to trigger refetch if it changes
        queryKey: ['stocks', activeQuality, activeTiming, activeConflict, page, filterParam],
        queryFn: () => fetchStocks(activeQuality, activeTiming, activeConflict, page)
    });

    // Tier Logic
    const maxStocks = getMaxStocksDisplay(user?.subscription?.tier);
    const hasDetailAccess = canAccessStockDetail(user?.subscription?.tier);

    let stocks = data?.stocks || [];
    const totalCount = data?.total || 0;

    // Apply limit if free tier
    if (stocks.length > maxStocks) {
        stocks = stocks.slice(0, maxStocks);
    }

    const totalPages = maxStocks === Infinity ? (data?.pages || 1) : 1;

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Stock Screener</h1>
                <p className="text-muted-foreground">Filter saham berdasarkan Kualitas Bisnis dan Timing Harga (Narrative System)</p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-3">
                    <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Step 1: Kualitas Bisnis</label>
                    <div className="flex flex-wrap gap-2">
                        {QUALITIES.map(q => (
                            <button
                                key={q}
                                onClick={() => setParams('quality', activeQuality === q ? '' : q)}
                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${activeQuality === q
                                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                    : 'bg-card hover:bg-secondary border-border'
                                    }`}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Step 2: Timing Harga</label>
                    <div className="flex flex-wrap gap-2">
                        {TIMINGS.map(t => (
                            <button
                                key={t}
                                onClick={() => setParams('timing', activeTiming === t ? '' : t)}
                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${activeTiming === t
                                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                    : 'bg-card hover:bg-secondary border-border'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="font-bold text-lg">Hasil Screening ({totalCount})</h2>
                    {(activeQuality || activeTiming || activeConflict) && (
                        <button
                            onClick={() => router.push('/screener')}
                            className="text-xs text-red-500 hover:text-red-400 font-medium"
                        >
                            Reset Filter {activeConflict && '(Termasuk Konflik)'}
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="p-10 text-center text-muted-foreground">Sedang memuat data...</div>
                ) : stocks && stocks.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                                <tr>
                                    <th className="p-4">Ticker</th>
                                    <th className="p-4">Company</th>
                                    <th className="p-4">FlexBit Score</th>
                                    <th className="p-4">Quality</th>
                                    <th className="p-4">Timing</th>
                                    <th className="p-4 text-center">Conflict</th>
                                    <th className="p-4 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.map((stock: Stock) => (
                                    <tr key={stock.ticker} className="border-b border-border hover:bg-secondary/20 transition-colors">
                                        <td className="p-4 font-bold text-primary">
                                            {hasDetailAccess ? (
                                                <Link href={`/stocks/${stock.ticker}`} className="hover:underline flex items-center gap-2">
                                                    {stock.logo ? (
                                                        <Image src={stock.logo} alt={stock.ticker} width={24} height={24} className="w-6 h-6 rounded object-cover" />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                                            {stock.ticker.substring(0, 2)}
                                                        </div>
                                                    )}
                                                    {stock.ticker.replace('.JK', '')}
                                                    {stock.analysis?.stockProfile?.emoji && <span>{stock.analysis.stockProfile.emoji}</span>}
                                                </Link>
                                            ) : (
                                                <div className="flex items-center gap-2 opacity-70 cursor-not-allowed" title="Upgrade to view details">
                                                    {stock.logo ? (
                                                        <Image src={stock.logo} alt={stock.ticker} width={24} height={24} className="w-6 h-6 rounded object-cover grayscale" />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">
                                                            {stock.ticker.substring(0, 2)}
                                                        </div>
                                                    )}
                                                    {stock.ticker.replace('.JK', '')}
                                                    <span className="text-[10px] bg-secondary text-muted-foreground px-1 rounded">Locked</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-muted-foreground truncate max-w-[200px]">{stock.companyName}</td>
                                        <td className="p-4 font-bold">{stock.analysis.flexbitScore}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${stock.analysis.businessQuality === 'Sangat Solid' ? 'bg-green-500/10 text-green-500' :
                                                stock.analysis.businessQuality === 'Cukup Sehat' ? 'bg-blue-500/10 text-blue-500' :
                                                    stock.analysis.businessQuality === 'Perlu Perhatian' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-red-500/10 text-red-500'
                                                }`}>
                                                {stock.analysis.businessQuality}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-medium text-xs border border-border px-2 py-1 rounded-md">
                                                {stock.analysis.timingLabel}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {stock.analysis?.conflict?.hasConflict ? (
                                                <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                                                    ⚠️ ALERT
                                                </span>
                                            ) : (
                                                <span className="text-green-500 text-xs">✅ OK</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right font-mono">
                                            <div className={stock.technical.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                                                {stock.technical.lastPrice.toLocaleString('id-ID')}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-lg font-bold mb-2">Tidak ada saham yang sesuai</h3>
                        <p className="text-muted-foreground">Coba ubah filter Kualitas atau Timing untuk hasil yang lebih luas.</p>
                        {(activeConflict) && <p className="text-xs text-muted-foreground mt-2">(Filter Konflik Sedang Aktif)</p>}
                    </div>
                )}

                {/* Pagination */}
                {stocks.length > 0 && (
                    <div className="p-4 border-t border-border flex justify-between items-center bg-secondary/10">
                        <button
                            disabled={page === 1}
                            onClick={() => setParams('page', String(page - 1))}
                            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-secondary disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-muted-foreground font-mono">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setParams('page', String(page + 1))}
                            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-secondary disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

