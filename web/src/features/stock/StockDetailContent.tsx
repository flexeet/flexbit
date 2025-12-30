"use client";

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { canAccessStockDetail, canUseWatchlist, getTierLabel } from '@/utils/tierAccess';
import AddToWatchlistButton from '@/features/stock/AddToWatchlistButton';
import { LockIcon } from 'lucide-react';

interface StockDetailContentProps {
    ticker: string;
    isModal?: boolean;
}

const fetchStock = async (ticker: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks/${ticker}`);
    if (!res.ok) {
        throw new Error('Stock not found');
    }
    return res.json();
};

export default function StockDetailContent({ ticker, isModal = false }: StockDetailContentProps) {
    const { data: user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Narrative');

    const canAccess = canAccessStockDetail(user?.subscription?.tier);
    const showWatchlist = canUseWatchlist(user?.subscription?.tier);

    const { data: stock, isLoading, error } = useQuery({
        queryKey: ['stock', ticker],
        queryFn: () => fetchStock(ticker),
        // Only fetch if has access (optional optimization, but good to check anyway)
        enabled: canAccess
    });

    // Access Denied View
    if (!canAccess) {
        return (
            <div className="font-sans max-w-lg mx-auto mt-20 p-8 text-center bg-card border border-border rounded-xl shadow-lg">
                <LockIcon className="text-5xl mb-4 mx-auto text-primary" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground mb-6">
                    Your current plan ({getTierLabel(user?.subscription?.tier)}) does not include access to detailed stock analysis.
                </p>
                <button
                    onClick={() => {
                        if (isModal) {
                            window.location.href = '/pricing';
                        } else {
                            router.push('/pricing');
                        }
                    }}
                    className="bg-primary cursor-pointer text-primary-foreground px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity w-full"
                >
                    Upgrade Plan
                </button>
                <div className="mt-4">
                    <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:underline cursor-pointer">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) return <div className="p-10 text-center">Loading Stock Data...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Error: Stock not found</div>;

    const TabButton = ({ name }: { name: string }) => (
        <button
            onClick={() => setActiveTab(name)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === name
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
        >
            {name}
        </button>
    );

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-500';
        if (score >= 50) return 'text-blue-500';
        if (score >= 30) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="h-full flex flex-col bg-card">
            {/* Header */}
            <div className="border-b border-border bg-background/50 backdrop-blur sticky top-0 z-10 p-4">
                <div className="flex flex-col gap-4">
                    {/* Top Row: Logo, Name, Price */}
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            {stock.logo ? (
                                <div className="relative group flex flex-col items-center">
                                    <div className="absolute -left-1 top-full hidden group-hover:block bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                                        Lihat di Stockbit
                                    </div>

                                    <Image
                                        src={stock.logo}
                                        alt={stock.ticker}
                                        width={48}
                                        height={48}
                                        className="w-10 h-10 cursor-pointer hover:sepia-50 transition-colors md:w-12 md:h-12 rounded-lg object-cover bg-secondary shrink-0"
                                        onClick={() => window.open(stock.stockbit_url, '_blank')}
                                    />
                                </div>
                            ) : (
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg md:text-xl shadow-lg shrink-0">
                                    {ticker.substring(0, 2)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 leading-tight">
                                    {stock.ticker.replace('.JK', '')}
                                    {stock.analysis?.stockProfile?.emoji && (
                                        <span title={stock.analysis.stockProfile.name}>{stock.analysis.stockProfile.emoji}</span>
                                    )}
                                </h1>
                                <p className="text-xs md:text-sm text-muted-foreground truncate">{stock.companyName}</p>
                                <div className="flex flex-wrap gap-2 text-[10px] md:text-xs text-muted-foreground mt-1">
                                    <span>{stock.sector}</span>
                                    <span className="hidden md:inline">•</span>
                                    <span>{stock.industry}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 gap-1">
                            <button
                                onClick={() => router.back()}
                                className="md:hidden w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center -mt-2 -mr-2 mb-1"
                            >
                                ✕
                            </button>
                            <div className="text-lg md:text-2xl font-bold whitespace-nowrap">
                                Rp {stock.technical?.lastPrice?.toLocaleString()}
                            </div>
                            <div className={`text-xs md:text-sm font-medium flex items-center justify-end gap-1 md:gap-2 ${(stock.technical?.priceChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                <span>{(stock.technical?.priceChangePercent || 0) >= 0 ? '+' : ''}{stock.technical?.priceChangePercent?.toFixed(2)}%</span>
                            </div>
                            {showWatchlist && (
                                <div className="mt-1">
                                    <AddToWatchlistButton ticker={stock.ticker} compact />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border bg-background/30 overflow-x-auto shrink-0">
                <TabButton name="Narrative" />
                <TabButton name="Scores" />
                <TabButton name="Technical" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {activeTab === 'Narrative' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="font-bold text-lg">Narrative Analysis</span>
                            <span className="bg-primary text-primary-foreground text-[10px] px-1.5 rounded">V3.5</span>
                        </div>

                        {/* Diagnosis Card */}
                        <div className={`p-4 rounded-xl border text-center ${stock.analysis?.flexbitCategory === 'Buy' || stock.analysis?.flexbitCategory === 'Strong Buy'
                            ? 'bg-green-500/10 border-green-500/20'
                            : stock.analysis?.flexbitCategory === 'Avoid'
                                ? 'bg-red-500/10 border-red-500/20'
                                : 'bg-yellow-500/10 border-yellow-500/20'
                            }`}>
                            <div className="text-xs uppercase tracking-widest font-bold opacity-70 mb-2">Diagnosis</div>
                            <div className="text-3xl font-bold mb-2">{stock.analysis?.flexbitDiagnosis}</div>
                            <div className="text-sm text-muted-foreground">{stock.analysis?.synthesis?.description}</div>
                        </div>

                        {/* Top Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-background border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                <div className="text-xs text-muted-foreground mb-1">Kualitas Bisnis</div>
                                <div className={`text-lg font-bold ${getScoreColor(stock.analysis?.flexbitScore || 0)}`}>
                                    {stock.analysis?.businessQuality}
                                </div>
                            </div>
                            <div className="bg-background border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                <div className="text-xs text-muted-foreground mb-1">Timing Harga</div>
                                <div className="text-lg font-bold text-yellow-500">{stock.analysis?.timingLabel}</div>
                            </div>
                        </div>

                        {/* Conflict Alert */}
                        {stock.analysis?.conflict?.hasConflict ? (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-3 rounded-lg text-sm text-center font-medium">
                                ⚠️ KONFLIK: {stock.analysis.conflict.type === 'fund_lemah_tech_kuat' ? 'Fundamental lemah, tapi teknikal kuat' : 'Fundamental kuat, tapi teknikal lemah'}
                            </div>
                        ) : (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg text-sm text-center font-medium">
                                ✅ SELARAS: Fundamental dan Teknikal searah
                            </div>
                        )}

                        {/* Suitability */}
                        <div className="bg-secondary/20 rounded-lg p-4 border border-border">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-green-500">✅</span> Cocok untuk:
                                </div>
                                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded font-bold">
                                    {stock.analysis?.investorProfile || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-red-500">❌</span> Tidak cocok untuk:
                                </div>
                                <span className="text-red-500 text-xs text-right max-w-[150px] truncate" title={stock.analysis?.investorAvoid}>{stock.analysis?.investorAvoid || '-'}</span>
                            </div>
                        </div>

                        {/* Stock Profile */}
                        {stock.analysis?.stockProfile?.name && (
                            <div>
                                <h3 className="font-bold mb-4 flex items-center gap-2">🏷️ Stock Profile</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-background p-4 rounded-lg border border-border">
                                        <div className="text-xs text-muted-foreground mb-1">Profile</div>
                                        <div className="font-bold flex items-center gap-2 text-sm">
                                            {stock.analysis.stockProfile.emoji} {stock.analysis.stockProfile.name}
                                        </div>
                                    </div>
                                    <div className="bg-background p-4 rounded-lg border border-border">
                                        <div className="text-xs text-muted-foreground mb-1">Risk Level</div>
                                        <div className={`font-bold ${stock.analysis.stockProfile.risk === 'Very High' ? 'text-red-500' : stock.analysis.stockProfile.risk === 'High' ? 'text-yellow-500' : 'text-green-500'}`}>
                                            {stock.analysis.stockProfile.risk}
                                        </div>
                                    </div>
                                    <div className="bg-background p-4 rounded-lg border border-border col-span-2">
                                        <div className="text-xs text-muted-foreground mb-1">Description</div>
                                        <div className="text-xs text-muted-foreground leading-relaxed">{stock.analysis.stockProfile.description}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Analyst Notes */}
                        {stock.analysis?.analystNotes && (
                            <div className="bg-secondary/10 border border-border p-4 rounded-lg text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                                📝 <strong>Analyst Notes:</strong><br />{stock.analysis.analystNotes}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Scores' && (
                    <div className="space-y-8">
                        {/* Main Score */}
                        <div className="text-center py-4">
                            <div className="text-sm text-muted-foreground mb-2">FlexBit Score</div>
                            <div className={`text-6xl font-bold ${getScoreColor(stock.analysis?.flexbitScore || 0)}`}>
                                {stock.analysis?.flexbitScore}
                            </div>
                            <div className={`text-xs mt-2 inline-block px-3 py-1 rounded-full ${getScoreColor(stock.analysis?.flexbitScore || 0)} bg-current/10`}>
                                {stock.analysis?.flexbitScore >= 70 ? 'Excellent' : stock.analysis?.flexbitScore >= 50 ? 'Good' : stock.analysis?.flexbitScore >= 30 ? 'Fair' : 'Poor'}
                            </div>
                        </div>

                        {/* VQSG Grid */}
                        <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="bg-secondary/30 rounded-xl p-3">
                                <div className="text-[10px] text-muted-foreground mb-1">V</div>
                                <div className={`text-xl font-bold ${getScoreColor(stock.analysis?.vqsg?.v || 0)}`}>{stock.analysis?.vqsg?.v}</div>
                                <div className="text-[8px] text-muted-foreground uppercase">Valuation</div>
                            </div>
                            <div className="bg-secondary/30 rounded-xl p-3">
                                <div className="text-[10px] text-muted-foreground mb-1">Q</div>
                                <div className={`text-xl font-bold ${getScoreColor(stock.analysis?.vqsg?.q || 0)}`}>{stock.analysis?.vqsg?.q}</div>
                                <div className="text-[8px] text-muted-foreground uppercase">Quality</div>
                            </div>
                            <div className="bg-secondary/30 rounded-xl p-3">
                                <div className="text-[10px] text-muted-foreground mb-1">S</div>
                                <div className={`text-xl font-bold ${getScoreColor(stock.analysis?.vqsg?.s || 0)}`}>{stock.analysis?.vqsg?.s}</div>
                                <div className="text-[8px] text-muted-foreground uppercase">Safety</div>
                            </div>
                            <div className="bg-secondary/30 rounded-xl p-3">
                                <div className="text-[10px] text-muted-foreground mb-1">G</div>
                                <div className={`text-xl font-bold ${getScoreColor(stock.analysis?.vqsg?.g || 0)}`}>{stock.analysis?.vqsg?.g}</div>
                                <div className="text-[8px] text-muted-foreground uppercase">Growth</div>
                            </div>
                        </div>

                        {/* Strongest/Weakest */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                <div className="text-xs font-bold text-green-500 mb-2">Strongest</div>
                                <div className="font-bold text-sm">{stock.analysis?.flexbitStrongest}</div>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                                <div className="text-xs font-bold text-yellow-500 mb-2">Weakest</div>
                                <div className="font-bold text-sm">{stock.analysis?.flexbitWeakest}</div>
                            </div>
                        </div>

                        {/* Confidence */}
                        <div className="bg-secondary/20 rounded-lg p-4 border border-border">
                            <div className="text-xs font-bold mb-3">Data Confidence</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>Valuation: <span className="font-bold">{stock.analysis?.valuationConfidence}</span></div>
                                <div>Quality: <span className="font-bold">{stock.analysis?.qualityConfidence}</span></div>
                                <div>Safety: <span className="font-bold">{stock.analysis?.safetyConfidence}</span></div>
                                <div>Growth: <span className="font-bold">{stock.analysis?.growthConfidence}</span></div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Technical' && (
                    <div className="space-y-6">
                        {/* Price Info */}
                        <div className="bg-background rounded-xl p-6 border border-border text-center">
                            <div className="text-3xl font-bold">Rp {stock.technical?.lastPrice?.toLocaleString()}</div>
                            <div className={`text-lg font-medium ${(stock.technical?.priceChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {(stock.technical?.priceChangePercent || 0) >= 0 ? '+' : ''}Rp {stock.technical?.priceChange?.toLocaleString()} ({stock.technical?.priceChangePercent?.toFixed(2)}%)
                            </div>
                            <div className="text-sm text-muted-foreground mt-2">
                                52W: Rp {stock.technical?.week52Low?.toLocaleString()} - Rp {stock.technical?.week52High?.toLocaleString()}
                            </div>
                        </div>

                        {/* Signals */}
                        <div>
                            <h3 className="font-bold mb-4 flex items-center gap-2">🚀 Technical Signal</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-background p-4 rounded-lg border border-border">
                                    <div className="text-xs text-muted-foreground mb-1">Signal</div>
                                    <div className={`inline-block px-3 py-1 rounded text-xs font-bold ${stock.technical?.signals?.call?.includes('Buy') ? 'bg-green-500/20 text-green-500' :
                                        stock.technical?.signals?.call?.includes('Sell') ? 'bg-red-500/20 text-red-500' :
                                            'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                        {stock.technical?.signals?.call || '-'}
                                    </div>
                                </div>
                                <div className="bg-background p-4 rounded-lg border border-border">
                                    <div className="text-xs text-muted-foreground mb-1">Trend</div>
                                    <div className={`font-bold ${stock.technical?.trend?.includes('Uptrend') ? 'text-green-500' : 'text-red-500'}`}>
                                        {stock.technical?.trend || '-'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{stock.technical?.trendStrength}</div>
                                </div>
                            </div>
                        </div>

                        {/* Trading Levels */}
                        <div>
                            <h3 className="font-bold mb-4 flex items-center gap-2">🎯 Trading Levels</h3>
                            <div className="bg-card border border-border rounded-xl overflow-hidden text-sm">
                                <div className="flex justify-between p-4 border-b border-border">
                                    <span className="text-muted-foreground">Entry (Conservative)</span>
                                    <span className="font-bold text-blue-500">Rp {stock.technical?.signals?.entryPrice?.toLocaleString() || '-'}</span>
                                </div>
                                <div className="flex justify-between p-4 border-b border-border">
                                    <span className="text-muted-foreground">Target 1</span>
                                    <span className="font-bold text-green-500">Rp {stock.technical?.signals?.tp1?.toLocaleString() || '-'}</span>
                                </div>
                                <div className="flex justify-between p-4 border-b border-border">
                                    <span className="text-muted-foreground">Target 2</span>
                                    <span className="font-bold text-green-500">Rp {stock.technical?.signals?.tp2?.toLocaleString() || '-'}</span>
                                </div>
                                <div className="flex justify-between p-4 border-b border-border">
                                    <span className="text-muted-foreground">Stop Loss</span>
                                    <span className="font-bold text-red-500">Rp {stock.technical?.signals?.stopLoss?.toLocaleString() || '-'}</span>
                                </div>
                                <div className="flex justify-between p-4 border-b border-border">
                                    <span className="text-muted-foreground">RSI</span>
                                    <span className={`font-bold ${(stock.technical?.signals?.rsi || 50) > 70 ? 'text-red-500' : (stock.technical?.signals?.rsi || 50) < 30 ? 'text-green-500' : 'text-blue-500'}`}>
                                        {stock.technical?.signals?.rsi?.toFixed(1) || '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between p-4 bg-secondary/20">
                                    <span className="text-muted-foreground">R/R Ratio</span>
                                    <span className="font-bold">{stock.technical?.signals?.rrConservative?.toFixed(2) || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
