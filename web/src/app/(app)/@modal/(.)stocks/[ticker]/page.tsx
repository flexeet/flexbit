"use client";

import Sheet from '@/components/ui/Sheet';
import StockDetailContent from '@/features/stock/StockDetailContent';
import { useParams } from 'next/navigation';

export default function StockDetailModal() {
    const params = useParams();
    const ticker = params.ticker as string;

    return (
        <Sheet>
            <StockDetailContent ticker={ticker} />
        </Sheet>
    );
}
