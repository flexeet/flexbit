"use client";

import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/ui/Spinner';
import { BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface WikiItem {
    _id: string;
    id: number;
    fieldName: string;
    fieldCategory: string;
    whatIsIt: string;
    scoreMin: number | null;
    scoreMax: number | null;
    rangeLabel: string;
    rangeEmoji: string;
    rangeDescription: string;
    actionableInsight: string;
    displayOrder: number;
}

const CATEGORIES = [
    'ALL',
    'DIVIDEND',
    'MATCHING',
    'NARRATIVE',
    'TECHNICAL',
    'TOTAL',
    'TRADING',
    'VQSG'
];

export default function WikiPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openCategory, setOpenCategory] = useState<string | null>(''); // Default open ALL

    const { data: wikis, isLoading } = useQuery<WikiItem[]>({
        queryKey: ['wikis'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wiki`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch wikis');
            return res.json();
        }
    });

    const toggleCategory = (category: string) => {
        setOpenCategory(openCategory === category ? null : category);
    }

    const filteredWikis = wikis?.filter(wiki =>
        wiki.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wiki.whatIsIt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wiki.rangeDescription.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // Group wikis by category
    const groupedWikis = CATEGORIES.reduce((acc, category) => {
        if (category === 'ALL') {
            acc[category] = filteredWikis.sort((a, b) => a.fieldName.localeCompare(b.fieldName)); // Sort alphabetically for ALL
        } else {
            acc[category] = filteredWikis.filter(w => w.fieldCategory === category);
        }
        return acc;
    }, {} as Record<string, WikiItem[]>);

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 pb-20">
            {/* Header */}
            <div className="text-center space-y-4 pt-8">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4">
                    <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                    FlexBit Wiki
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Kamus lengkap istilah dan metrik yang digunakan di FlexBit Pro.
                </p>

                {/* Search */}
                <div className="max-w-md mx-auto relative mt-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Cari istilah..."
                        className="w-full pl-10 pr-4 cursor-pointer py-2 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Spinner />
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredWikis.length === 0 ? (
                        <div className="bg-card border border-border rounded-xl p-12 text-center">
                            <Search className="w-12 h-12 text-primary mb-4 mx-auto" />
                            <h3 className="text-lg font-bold mb-2">Wiki Tidak Ditemukan</h3>
                            <p className="text-muted-foreground">Silakan coba kata kunci lain.</p>
                        </div>
                    ) : (
                        CATEGORIES.map(category => {
                            const items = groupedWikis[category];
                            if (items.length === 0) return null;

                            const isOpen = openCategory === category || searchQuery.length > 0;

                            return (
                                <div key={category} className="border border-border rounded-xl bg-card overflow-hidden">
                                    <button
                                        onClick={() => toggleCategory(category)}
                                        className="w-full cursor-pointer flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                                            <h2 className="text-lg font-bold">{category}</h2>
                                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                                {items.length} items
                                            </span>
                                        </div>
                                        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                                    </button>

                                    {isOpen && (
                                        <div className="divide-y divide-border border-t border-border">
                                            {items.map(wiki => (
                                                <div key={wiki.id} className="p-4 md:p-6 hover:bg-secondary/20 transition-colors">
                                                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                                                        {/* Term & Definition */}
                                                        <div className="flex-1 space-y-2">
                                                            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                                                {wiki.fieldName}
                                                                {wiki.rangeLabel && (
                                                                    <span className="text-[10px] uppercase border border-primary/20 bg-primary/5 text-primary px-2 py-0.5 rounded">
                                                                        {wiki.rangeLabel} {wiki.rangeEmoji}
                                                                    </span>
                                                                )}
                                                            </h3>
                                                            <p className="text-sm text-foreground/80 leading-relaxed">
                                                                {wiki.whatIsIt}
                                                            </p>
                                                        </div>

                                                        {/* Scores & Insights */}
                                                        <div className="flex-1 space-y-4 md:border-l border-border md:pl-8">
                                                            {/* Score Range */}
                                                            <div>
                                                                {wiki.scoreMin !== null && wiki.scoreMax !== null && (
                                                                    <>
                                                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                                                                            Score Range
                                                                        </span>
                                                                        <div className="text-sm font-medium">
                                                                            <span>{wiki.scoreMin} - {wiki.scoreMax}</span>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {wiki.rangeDescription}
                                                                </p>
                                                            </div>

                                                            {/* Actionable Insight */}
                                                            <div className="bg-secondary/50 p-3 rounded-lg border border-border/50">
                                                                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1 flex items-center gap-1">
                                                                    💡 Insight
                                                                </span>
                                                                <p className="text-sm text-foreground/90 italic">
                                                                    "{wiki.actionableInsight}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
