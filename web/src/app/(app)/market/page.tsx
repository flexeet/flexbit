"use client";

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

const fetchMarketOverview = async () => {
    // Reusing stocks API for now
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks`);
    return res.json();
};

export default function MarketPage() {
    const { data } = useQuery({
        queryKey: ['stocks'],
        queryFn: fetchMarketOverview
    });

    const gainers = data?.stocks?.filter((s: any) => s.technical.priceChangePercent > 0) || [];
    const losers = data?.stocks?.filter((s: any) => s.technical.priceChangePercent < 0) || [];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Market Overview</h1>
                <p className="text-muted-foreground">Snapshot kondisi pasar hari ini.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Gainers */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4 text-green-500">🚀 Top Gainers</h2>
                    <div className="space-y-3">
                        {gainers.map((s: any) => (
                            <Link href={`/stocks/${s.ticker}`} key={s.ticker} className="flex justify-between items-center hover:bg-secondary/50 p-2 rounded transition-colors">
                                <div>
                                    <div className="font-bold">{s.ticker}</div>
                                    <div className="text-xs text-muted-foreground">{s.companyName}</div>
                                </div>
                                <div className="text-green-500 font-mono font-bold">+{s.technical.priceChangePercent}%</div>
                            </Link>
                        ))}
                        {gainers.length === 0 && <div className="text-muted-foreground text-sm">No gainers today.</div>}
                    </div>
                </div>

                {/* Top Losers */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4 text-red-500">🔻 Top Losers</h2>
                    <div className="space-y-3">
                        {losers.map((s: any) => (
                            <Link href={`/stocks/${s.ticker}`} key={s.ticker} className="flex justify-between items-center hover:bg-secondary/50 p-2 rounded transition-colors">
                                <div>
                                    <div className="font-bold">{s.ticker}</div>
                                    <div className="text-xs text-muted-foreground">{s.companyName}</div>
                                </div>
                                <div className="text-red-500 font-mono font-bold">{s.technical.priceChangePercent}%</div>
                            </Link>
                        ))}
                        {losers.length === 0 && <div className="text-muted-foreground text-sm">No losers today.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
