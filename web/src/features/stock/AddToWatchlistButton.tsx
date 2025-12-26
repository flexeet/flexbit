"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, StarIcon } from 'lucide-react';
import { useState } from 'react';

interface AddToWatchlistButtonProps {
    ticker: string;
    compact?: boolean;
}

const addToWatchlist = async (ticker: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
        credentials: 'include'
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to add to watchlist');
    }
    return res.json();
};

export default function AddToWatchlistButton({ ticker, compact = false }: AddToWatchlistButtonProps) {
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: addToWatchlist,
        onSuccess: () => {
            setMessage({ type: 'success', text: 'Added to Watchlist' });
            queryClient.invalidateQueries({ queryKey: ['watchlist'] });
            setTimeout(() => setMessage(null), 3000);
        },
        onError: (err: any) => {
            setMessage({ type: 'error', text: err.message });
            setTimeout(() => setMessage(null), 5000);
        }
    });

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if inside a Link
        e.stopPropagation();
        mutation.mutate(ticker);
    };

    return (
        <div className="inline-block">
            <button
                onClick={handleClick}
                disabled={mutation.isPending}
                className={`${compact ? 'p-2' : 'px-4 py-2'} rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors flex items-center gap-2`}
            >
                {mutation.isPending ? '...' : <StarIcon className="w-4 h-4 cursor-pointer hover:text-yellow-500" />}
                {!compact && <span>Watchlist</span>}
            </button>

            {/* Toast Notification */}
            {message && (
                <div className={`absolute top-4 right-4 w-max px-3 py-2 rounded text-xs font-bold z-50 shadow-lg ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
