"use client";

import { useQuery } from '@tanstack/react-query';
import { HelpCircle, MailIcon, SearchIcon, InfoIcon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';

interface Faq {
    _id: string;
    question: string;
    answer: string;
    category: string;
    note?: string;
    isActive: boolean;
}

const CATEGORIES = [
    'ALL',
    'BASIC INVESTING',
    'FUNDAMENTAL ANALYSIS',
    'NARRATIVE SYSTEM',
    'PEMBELIAN & AKSES',
    'SINYAL SINTESIS',
    'STRATEGI & PSIKOLOGI',
    'TECHNICAL ANALYSIS',
    'TENTANG FLEXBIT'
];

const fetchFaqs = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faq`);
    if (!res.ok) throw new Error('Failed to fetch FAQs');
    return res.json();
};

export default function FaqPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [openId, setOpenId] = useState<string | null>(null);
    const { resolvedTheme } = useTheme();

    const { data: faqs, isLoading, error } = useQuery({
        queryKey: ['faqs'],
        queryFn: fetchFaqs
    });

    const filteredFaqs = faqs?.filter((faq: Faq) => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || faq.category === selectedCategory;

        return matchesSearch && matchesCategory;
    }) || [];

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pt-10 px-4">
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
            <div className="max-w-4xl mx-auto text-center py-12 px-4">
                <div className="text-4xl mb-4">❌</div>
                <h2 className="text-xl font-bold mb-2">Gagal Memuat FAQ</h2>
                <p className="text-muted-foreground">Silakan coba lagi nanti.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 font-sans py-10 px-4">
            {/* Header */}
            <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center md:justify-start gap-2 mb-2">
                    <HelpCircle className="w-8 h-8 text-primary" />
                    Frequently Asked Questions
                </h1>
                <p className="text-muted-foreground">Temukan jawaban untuk pertanyaan seputar FlexBit</p>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Cari pertanyaan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-5 py-4 pl-12 bg-card border border-border rounded-xl text-base outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <SearchIcon className="w-5 h-5 text-primary" />
                </span>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all cursor-pointer ${selectedCategory === cat
                            ? 'bg-primary text-primary-foreground shadow-md scale-105 text-white'
                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* FAQ List */}
            {filteredFaqs.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-bold mb-2">Tidak Ada Hasil</h3>
                    <p className="text-muted-foreground">Coba kata kunci lain atau ubah kategori.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredFaqs.map((faq: Faq) => (
                        <div
                            key={faq._id}
                            className={`bg-card border rounded-xl overflow-hidden transition-all duration-200 ${openId === faq._id ? 'border-primary ring-1 ring-primary/20 shadow-md' : 'border-border hover:border-primary/50'
                                }`}
                        >
                            {/* Question Header */}
                            <button
                                onClick={() => setOpenId(openId === faq._id ? null : faq._id)}
                                className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left cursor-pointer"
                            >
                                <div className="flex-1">
                                    <div className="mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-secondary text-muted-foreground border border-border">
                                            {faq.category}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-base md:text-lg leading-relaxed">{faq.question}</h3>
                                </div>
                                <div className={`text-2xl text-muted-foreground transition-transform duration-300 ${openId === faq._id ? 'rotate-180 text-primary' : ''}`}>
                                    ⌄
                                </div>
                            </button>

                            {/* Answer Panel */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openId === faq._id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-6 pb-6 pt-0 border-t border-border/50">
                                    <div className="text-base text-muted-foreground leading-relaxed mt-4 whitespace-pre-line">
                                        {faq.answer}
                                    </div>

                                    {/* Note Section */}
                                    {faq.note && (
                                        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                                            <InfoIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                            <div className="text-sm text-blue-600 dark:text-blue-400">
                                                <span className="font-bold block mb-1">Catatan:</span>
                                                {faq.note}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Stats */}
            <div className="text-center text-xs text-muted-foreground pt-8 border-t border-border">
                Menampilkan {filteredFaqs.length} dari {faqs?.length || 0} pertanyaan
            </div>

            {/* Contact CTA */}
            <div className="bg-gradient-to-r from-primary/5 via-background to-blue-500/5 border border-primary/20 rounded-xl p-8 text-center mt-8">
                <h3 className="font-bold text-lg mb-2">Masih punya pertanyaan?</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    Jika Anda tidak menemukan jawaban yang Anda cari, tim support kami siap membantu Anda kapan saja.
                </p>
                <a
                    href="mailto:flexeet.app@gmail.com"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                    <MailIcon className="w-4 h-4" />
                    Hubungi Support
                </a>
            </div>
        </div>
    );
}
