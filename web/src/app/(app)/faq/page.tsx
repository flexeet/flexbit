"use client";

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface Faq {
    _id: string;
    question: string;
    answer: string;
    categoryId: number;
    difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    isPopular: boolean;
    viewCount: number;
    tags: string[];
    displayOrder: number;
}

const fetchFaqs = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faq`);
    if (!res.ok) throw new Error('Failed to fetch FAQs');
    return res.json();
};

export default function FaqPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openId, setOpenId] = useState<string | null>(null);

    const { data: faqs, isLoading, error } = useQuery({
        queryKey: ['faqs'],
        queryFn: fetchFaqs
    });

    const getDifficultyColor = (level: string) => {
        switch (level) {
            case 'BEGINNER': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'INTERMEDIATE': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'ADVANCED': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const filteredFaqs = faqs?.filter((faq: Faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="h-10 bg-secondary/50 rounded-lg animate-pulse w-48"></div>
                <div className="h-12 bg-secondary/50 rounded-xl animate-pulse"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <div className="text-4xl mb-4">❌</div>
                <h2 className="text-xl font-bold mb-2">Gagal Memuat FAQ</h2>
                <p className="text-muted-foreground">Silakan coba lagi nanti.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 font-sans">
            {/* Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    ❓ Frequently Asked Questions
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Temukan jawaban untuk pertanyaan yang sering diajukan</p>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Cari pertanyaan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="bg-card border border-border rounded-lg px-4 py-2">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold ml-2">{faqs?.length || 0} FAQ</span>
                </div>
                <div className="bg-card border border-border rounded-lg px-4 py-2">
                    <span className="text-muted-foreground">Popular:</span>
                    <span className="font-bold ml-2 text-yellow-500">{faqs?.filter((f: Faq) => f.isPopular).length || 0}</span>
                </div>
            </div>

            {/* FAQ List */}
            {filteredFaqs.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-bold mb-2">Tidak Ada Hasil</h3>
                    <p className="text-muted-foreground">Coba kata kunci lain.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredFaqs.map((faq: Faq) => (
                        <div
                            key={faq._id}
                            className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/50"
                        >
                            {/* Question Header */}
                            <button
                                onClick={() => setOpenId(openId === faq._id ? null : faq._id)}
                                className="w-full px-5 py-4 flex items-start justify-between gap-4 text-left"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        {faq.isPopular && (
                                            <span className="text-yellow-500 text-xs font-bold">⭐ Popular</span>
                                        )}
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getDifficultyColor(faq.difficultyLevel)}`}>
                                            {faq.difficultyLevel}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-sm md:text-base">{faq.question}</h3>
                                </div>
                                <div className={`text-xl transition-transform duration-300 ${openId === faq._id ? 'rotate-180' : ''}`}>
                                    ⌄
                                </div>
                            </button>

                            {/* Answer Panel */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openId === faq._id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-5 pb-5 pt-0 border-t border-border">
                                    <p className="text-sm text-muted-foreground leading-relaxed mt-4 whitespace-pre-line">
                                        {faq.answer}
                                    </p>
                                    {faq.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {faq.tags.map((tag, i) => (
                                                <span key={i} className="px-2 py-1 bg-secondary text-xs rounded-md text-muted-foreground">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Contact CTA */}
            <div className="bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/20 rounded-xl p-6 text-center">
                <h3 className="font-bold mb-2">Masih ada pertanyaan?</h3>
                <p className="text-sm text-muted-foreground mb-4">Hubungi tim support kami untuk bantuan lebih lanjut.</p>
                <a
                    href="mailto:flexeet.app@gmail.com"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    ✉️ Hubungi Support
                </a>
            </div>
        </div>
    );
}
