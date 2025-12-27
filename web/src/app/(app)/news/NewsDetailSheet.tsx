"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarDays, Share2 } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface NewsDetailSheetProps {
    isOpen: boolean;
    onClose: () => void;
    news: any;
}

export const NewsDetailSheet = ({ isOpen, onClose, news }: NewsDetailSheetProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-50 flex justify-end transition-colors duration-300 ${isOpen ? 'bg-background/80 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`}
            onClick={onClose}
        >
            <div
                className={`w-full md:w-[600px] lg:w-[700px] bg-background border-l border-border h-full shadow-2xl relative transition-transform duration-300 ease-in-out transform flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Actions */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                        onClick={onClose}
                        className="p-2 cursor-pointer bg-background/50 backdrop-blur-md rounded-full border border-border/50 text-foreground hover:bg-secondary transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {news && (
                    <div className="overflow-y-auto h-full pb-20">
                        {/* Image Hero */}
                        <div className="relative w-full aspect-video">
                            <Image
                                src={news.image}
                                alt={news.headline}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="px-6 md:px-8 py-6 -mt-12 relative">
                            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-3">
                                <CalendarDays className="w-4 h-4" />
                                <time dateTime={news.date}>
                                    {format(new Date(news.date), 'dd MMMM yyyy', { locale: id })}
                                </time>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-extrabold mb-6 leading-tight">
                                {news.headline}
                            </h1>

                            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground/80 leading-relaxed font-sans space-y-4 whitespace-pre-wrap">
                                {news.content}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
