"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StarIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'react-toastify';

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
    const queryClient = useQueryClient();
    const theme = useTheme();
    console.log(theme.theme);

    const mutation = useMutation({
        mutationFn: addToWatchlist,
        onSuccess: () => {
            toast.success(`${ticker} added to Watchlist`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: theme.theme == "light" ? "light" : "dark",
            });
            queryClient.invalidateQueries({ queryKey: ['watchlist'] });
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to add to watchlist', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: theme.theme == "light" ? "light" : "dark",
            });
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
        </div>
    );
}
