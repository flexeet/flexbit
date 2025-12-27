"use client";

import { useQuery } from '@tanstack/react-query';
import { Newspaper, CalendarDays, Search, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { NewsDetailSheet } from './NewsDetailSheet';
import { useSearchParams, useRouter } from 'next/navigation';

interface NewsItem {
    _id: string;
    id: number;
    headline: string;
    content: string;
    date: string;
    image: string;
}

interface NewsResponse {
    data: NewsItem[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    }
}

// Separate component for Image with Skeleton
const NewsImage = ({ src, alt }: { src: string, alt: string }) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="relative w-full aspect-video overflow-hidden bg-secondary">
            {isLoading && (
                <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-none" />
            )}
            <Image
                src={src}
                alt={alt}
                fill
                className={`object-cover transition-transform duration-500 hover:scale-110 duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
        </div>
    );
};

export default function NewsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Check local query parsing or use state
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const { data: newsData, isLoading } = useQuery<NewsResponse>({
        queryKey: ['news', page, debouncedSearch],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '6',
                search: debouncedSearch
            });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?${params}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch news');
            return res.json();
        },
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new
    });

    const handleReadMore = (item: NewsItem) => {
        setSelectedNews(item);
        setIsSheetOpen(true);
    };

    const handleCloseSheet = () => {
        setIsSheetOpen(false);
        setTimeout(() => setSelectedNews(null), 300);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8 pb-20">
            {/* Header */}
            <div className="text-center space-y-4 pt-8">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4">
                    <Newspaper className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                    FlexBit News
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Berita terkini seputar pasar modal dan emiten pilihan.
                </p>

                {/* Search Bar */}
                <div className="max-w-md mx-auto relative mt-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Cari berita..."
                        className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            {isLoading && !newsData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-card border border-border rounded-xl overflow-hidden h-full flex flex-col">
                            <Skeleton className="w-full aspect-video rounded-none" />
                            <div className="p-5 space-y-3 flex-1">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-2/3" />
                                <Skeleton className="h-4 w-full mt-4" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {newsData?.data?.map((item) => (
                            <div key={item.id} onClick={() => handleReadMore(item)} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col h-full cursor-pointer">
                                {/* Image */}
                                <NewsImage src={item.image} alt={item.headline} />

                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                        <CalendarDays className="w-3.5 h-3.5" />
                                        <time dateTime={item.date}>
                                            {format(new Date(item.date), 'dd MMMM yyyy', { locale: id })}
                                        </time>
                                    </div>

                                    <h2 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                        {item.headline}
                                    </h2>

                                    <p className="text-sm text-foreground/70 line-clamp-3 mb-4 flex-1">
                                        {item.content}
                                    </p>

                                    <button
                                        className="text-xs cursor-pointer font-bold text-primary uppercase tracking-wider hover:underline self-start mt-auto"
                                    >
                                        Baca Selengkapnya
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {newsData?.data?.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-card border border-border rounded-xl">
                            <Search className="w-12 h-12 text-primary mx-auto mb-4" />
                            <h3 className="text-lg font-bold mb-2">Berita tidak ditemukan</h3>
                            <p className="text-muted-foreground">Silakan coba kata kunci lain.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {newsData && newsData.pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 pt-8">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={!newsData.pagination.hasPrevPage}
                                className="p-2 cursor-pointer rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <span className="text-sm font-medium px-4">
                                Page {newsData.pagination.currentPage} of {newsData.pagination.totalPages}
                            </span>

                            <button
                                onClick={() => setPage(p => Math.min(newsData.pagination.totalPages, p + 1))}
                                disabled={!newsData.pagination.hasNextPage}
                                className="p-2 cursor-pointer rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}

            <NewsDetailSheet
                isOpen={isSheetOpen}
                onClose={handleCloseSheet}
                news={selectedNews}
            />
        </div>
    );
}
