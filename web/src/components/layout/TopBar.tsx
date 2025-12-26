"use client";

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import Link from 'next/link';
import { useUIStore } from '@/providers/StoreProvider';
import { LogOutIcon, Menu, SearchIcon, UserIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

const TopBar = () => {
    const { data: user } = useAuth();
    const toggleSidebar = useUIStore((state) => state.toggleSidebar);
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // 500ms debounce
    const debouncedSearch = useDebounce(search, 500);
    const searchRef = useRef<HTMLDivElement>(null);

    // Fetch on debounced change
    useEffect(() => {
        if (debouncedSearch) {
            setIsSearching(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks?keyword=${debouncedSearch}&limit=5`)
                .then(res => res.json())
                .then(data => {
                    setResults(data.stocks || []);
                    setShowResults(true);
                })
                .catch(err => console.error("Search error", err))
                .finally(() => setIsSearching(false));
        } else {
            setResults([]);
            setShowResults(false);
        }
    }, [debouncedSearch]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/screener?keyword=${search}`);
            setShowResults(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const initials = user?.fullName ? user.fullName.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase() : 'A';

    // Mock Date for "Last update"
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const formattedDate = yesterday.toLocaleDateString('en-GB', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 md:px-6 fixed top-0 right-0 left-0 md:left-64 z-30 transition-all font-sans">
            {/* Mobile Toggle */}
            <button onClick={toggleSidebar} className="md:hidden mr-4 text-muted-foreground">
                <Menu className="w-6 h-6" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl relative" ref={searchRef}>
                <form onSubmit={handleSearch} className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <SearchIcon className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search stocks (e.g. BBCA, GOTO)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => { if (results.length > 0) setShowResults(true); }}
                        className="w-full cursor-pointer bg-secondary/50 hover:bg-secondary focus:bg-secondary border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-0 transition-colors outline-none"
                    />
                    {isSearching && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">
                            Loading...
                        </span>
                    )}
                </form>

                {/* Dropdown Results */}
                {showResults && results.length > 0 && (
                    <div className="absolute top-12 left-0 right-0 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="max-h-80 overflow-y-auto">
                            {results.map((stock) => (
                                <Link
                                    key={stock.ticker}
                                    href={`/stocks/${stock.ticker}`}
                                    onClick={() => { setShowResults(false); setSearch(''); }}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
                                >
                                    <div>
                                        <div className="font-bold text-sm text-primary">{stock.ticker}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{stock.companyName}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono text-sm">{stock.technical.lastPrice.toLocaleString('id-ID')}</div>
                                        <div className={`text-[10px] ${stock.technical.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {stock.technical.priceChangePercent > 0 ? '+' : ''}{stock.technical.priceChangePercent.toFixed(2)}%
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="p-2 bg-secondary/10 text-center border-t border-border">
                            <button onClick={handleSearch} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                View all results
                            </button>
                        </div>
                    </div>
                )}
            </div>


            {/* Profile & Meta */}
            <div className="flex items-center gap-4 relative">
                <ThemeToggle />

                <div className="text-right hidden sm:block">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Last update</div>
                    <div className="text-xs font-medium text-muted-foreground">{formattedDate}, 18:00 WIB</div>
                </div>

                <div className="relative">
                    <div
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-green-500/20 cursor-pointer hover:scale-105 transition-transform"
                    >
                        {initials}
                    </div>

                    {isProfileOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsProfileOpen(false)}
                            ></div>
                            <div className="absolute right-0 top-12 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-3 border-b border-border">
                                    <div className="font-bold text-sm truncate">{user?.fullName || 'User'}</div>
                                    <div className="text-xs text-muted-foreground truncate">{user?.email || 'user@flexbit.com'}</div>
                                </div>
                                <div className="p-1">
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <UserIcon className="w-4 h-4 text-primary" />
                                        <span>Profile</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-sm cursor-pointer hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <LogOutIcon className="w-4 h-4 text-red-500" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopBar;

