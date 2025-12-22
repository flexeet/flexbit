"use client";

import { useParams, useRouter } from 'next/navigation';
import StockDetailContent from '@/features/stock/StockDetailContent';

export default function StockDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ticker = params.ticker as string;

    return (
        <div className="font-sans max-w-5xl mx-auto bg-card min-h-[calc(100vh-100px)] shadow-2xl rounded-xl border border-border overflow-hidden relative">
            <div className="absolute top-4 right-4 z-20">
                <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-secondary hover:bg-muted flex items-center justify-center transition-colors">
                    ✕
                </button>
            </div>
            <StockDetailContent ticker={ticker} />
        </div>
    );
}
