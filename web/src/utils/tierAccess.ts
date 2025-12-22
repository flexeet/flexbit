export type SubscriptionTier = 'free' | 'pioneer' | 'early_adopter' | 'growth' | 'pro';

// Helper to reliably check permissions
export function canAccessStockDetail(tier?: string): boolean {
    const t = (tier || 'free').toLowerCase() as SubscriptionTier;
    return ['pioneer', 'early_adopter', 'growth', 'pro'].includes(t);
}

export function getMaxStocksDisplay(tier?: string): number {
    const t = (tier || 'free').toLowerCase() as SubscriptionTier;
    if (t === 'free') return 5;
    return Infinity; // Unlimited
}

export function canUseWatchlist(tier?: string): boolean {
    const t = (tier || 'free').toLowerCase() as SubscriptionTier;
    return ['growth', 'pro'].includes(t);
}

export function canExportData(tier?: string): boolean {
    const t = (tier || 'free').toLowerCase() as SubscriptionTier;
    return ['growth', 'pro'].includes(t);
}

export function getTierLabel(tier?: string): string {
    const t = (tier || 'free').toLowerCase();
    switch (t) {
        case 'early_adopter': return 'Early Adopter';
        case 'pioneer': return 'Pioneer';
        case 'growth': return 'Growth';
        case 'pro': return 'Pro';
        default: return 'Free Plan';
    }
}
