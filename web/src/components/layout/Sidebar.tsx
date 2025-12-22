import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { X } from 'lucide-react';
import { useUIStore } from '@/providers/StoreProvider';
import { canUseWatchlist } from '@/utils/tierAccess';
import Image from 'next/image';
import { useTheme } from 'next-themes';

const Sidebar = () => {
    const pathname = usePathname();
    const { data: user } = useAuth();
    const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
    const closeSidebar = useUIStore((state) => state.closeSidebar);
    const isActive = (path: string) => pathname === path;
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks/stats`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Failed to fetch sidebar stats", err));
    }, []);

    // Format Number Helper
    const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n;

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={closeSidebar}
                />
            )}

            <aside className={`w-64 h-screen bg-card border-r border-border fixed left-0 top-0 flex flex-col z-50 font-sans transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Brand */}
                <div className="h-16 flex items-center justify-between px-6 mb-4">
                    <div className="flex items-center gap-2">
                        {/* <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">F</div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                            FlexBit Pro <span className="text-xs text-blue-500">V3.5</span>
                        </span> */}
                        {mounted && (
                            <Image
                                src={resolvedTheme === 'light' ? "/logo-dark.png" : "/logo-white.png"}
                                alt="FlexBit Pro"
                                width={120}
                                height={32}
                                className="h-12 w-auto object-contain"
                                priority
                            />
                        )}
                    </div>
                    {/* Close Button Mobile */}
                    <button onClick={closeSidebar} className="md:hidden text-muted-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-6 overflow-y-auto">
                    {/* Main Views */}
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">MAIN VIEWS</div>
                        <div className="space-y-1">
                            <Link href="/dashboard" onClick={closeSidebar} className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
                                <div className="flex items-center gap-3">
                                    <span>🏠</span> Dashboard
                                </div>
                            </Link>
                            {user?.role === 'admin' && (
                                <Link href="/users" onClick={closeSidebar} className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/users') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
                                    <div className="flex items-center gap-3">
                                        <span>👥</span> Users
                                    </div>
                                </Link>
                            )}
                            <Link href="/narrative" onClick={closeSidebar} className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/narrative') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
                                <div className="flex items-center gap-3">
                                    <span>🎯</span> Narrative View
                                </div>
                                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">NEW</span>
                            </Link>
                            <Link href="/vqsg" onClick={closeSidebar} className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/vqsg') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
                                <div className="flex items-center gap-3">
                                    <span>📊</span> VQSG Analysis
                                </div>
                            </Link>
                            <Link href="/signals" onClick={closeSidebar} className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/signals') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
                                <div className="flex items-center gap-3">
                                    <span>📈</span> FlexTech Signal
                                </div>
                            </Link>

                            {canUseWatchlist(user?.subscription?.tier) && (
                                <Link href="/watchlist" onClick={closeSidebar} className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/watchlist') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
                                    <div className="flex items-center gap-3">
                                        <span>⭐</span> Watchlist
                                    </div>
                                </Link>
                            )}

                            <Link href="/billing" onClick={closeSidebar} className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/billing') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
                                <div className="flex items-center gap-3">
                                    <span>💳</span> Billing History
                                </div>
                            </Link>

                            {user?.subscription?.tier === 'free' && (
                                <Link href="/pricing" onClick={closeSidebar} className="flex justify-between items-center px-3 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-orange-500 border border-yellow-500/20 hover:from-yellow-500/20 hover:to-orange-500/20 transition-all mt-2">
                                    <div className="flex items-center gap-3">
                                        <span>🚀</span> Upgrade Plan
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* By Timing */}
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">BY TIMING</div>
                        <div className="space-y-1">
                            <Link href="/screener?timing=Momentum" onClick={closeSidebar} className="flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
                                <div className="flex items-center gap-3">⬆️ Momentum Bagus</div>
                                <span className="bg-green-500/10 text-green-500 text-xs px-2 rounded-full">{stats ? fmt(stats.timing.momentum) : '-'}</span>
                            </Link>
                            <Link href="/screener?timing=Zona Akumulasi" onClick={closeSidebar} className="flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
                                <div className="flex items-center gap-3">↔️ Zona Akumulasi</div>
                                <span className="bg-blue-500/10 text-blue-500 text-xs px-2 rounded-full">{stats ? fmt(stats.timing.accumulation) : '-'}</span>
                            </Link>
                            <Link href="/screener?timing=Stabilisasi" onClick={closeSidebar} className="flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
                                <div className="flex items-center gap-3">⏳ Tunggu Stabilisasi</div>
                                <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 rounded-full">{stats ? fmt(stats.timing.stabilization) : '-'}</span>
                            </Link>
                            <Link href="/screener?timing=Hindari" onClick={closeSidebar} className="flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
                                <div className="flex items-center gap-3">🚫 Hindari Dulu</div>
                                <span className="bg-red-500/10 text-red-500 text-xs px-2 rounded-full">{stats ? fmt(stats.timing.avoid) : '-'}</span>
                            </Link>
                        </div>
                    </div>

                    {/* By Conflict */}
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">BY CONFLICT</div>
                        <div className="space-y-1">
                            <Link href="/screener?conflict=true" onClick={closeSidebar} className="flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
                                <div className="flex items-center gap-3">⚠️ Ada Konflik</div>
                                <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 rounded-full">{stats ? fmt(stats.conflict.hasConflict) : '-'}</span>
                            </Link>
                            <Link href="/screener?conflict=false" onClick={closeSidebar} className="flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
                                <div className="flex items-center gap-3">✅ Selaras</div>
                                <span className="bg-green-500/10 text-green-500 text-xs px-2 rounded-full">{stats ? fmt(stats.conflict.aligned) : '-'}</span>
                            </Link>
                        </div>
                    </div>

                    {/* More */}
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">MORE</div>
                        <div className="space-y-1">
                            <Link href="/faq" onClick={closeSidebar} className="flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
                                <div className="flex items-center gap-3">❓ FAQ</div>
                            </Link>
                        </div>
                    </div>
                </nav>
            </aside >
        </>
    );
};

export default Sidebar;
