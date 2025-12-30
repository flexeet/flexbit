"use client";

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTheme } from 'next-themes';

const TIERS = [
    {
        id: 'pioneer',
        name: 'Pioneer',
        price: 'Rp 199.000', // 199000
        period: 'Lifetime',
        features: [
            'VQSG Score + Narrative System',
            '900+ Stock Screener',
            'Daily Data Updates',
            'Community Access',
            'Diskon V4+ Harga Khusus'
        ],
        color: 'border-primary',
        btnColor: 'bg-primary/90 hover:bg-primary',
        disabled: false
    },
    {
        id: 'early_adopter',
        name: 'Early Adopter',
        price: 'Rp 599.000',
        period: 'Lifetime',
        features: [
            'VQSG Score + Narrative System',
            '900+ Stock Screener',
            'Daily Data Updates',
            'Community Access',
            'Diskon V4+ 50%'
        ],
        color: 'border-purple-500',
        btnColor: 'bg-purple-600 hover:bg-purple-700',
        disabled: true
    },
    {
        id: 'growth',
        name: 'Growth',
        price: 'Rp 999.000',
        period: '/ year',
        features: [
            'VQSG Score + Narrative System',
            '900+ Stock Screener',
            'Daily Data Updates',
            'Community Access',
            'Include FlexBit V4',
            'Priority Support (1 Tahun)',
            'Watchlist Alerts',
            'Export Data (CSV)'
        ],
        popular: true,
        color: 'border-green-500',
        btnColor: 'bg-green-600 hover:bg-green-700',
        disabled: true
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 'Rp 1.999.000',
        period: '/ year',
        features: [
            'VQSG Score + Narrative System',
            '900+ Stock Screener',
            'Daily Data Updates',
            'Community Access',
            'Include FlexBit V4',
            'Priority Support VIP',
            'Watchlist Alerts',
            'Export Data (CSV)'
        ],
        color: 'border-orange-500',
        btnColor: 'bg-orange-600 hover:bg-orange-700',
        disabled: true
    }
];

export default function PricingPage() {
    const { data: user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    // Load Midtrans Snap Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = process.env.NODE_ENV === 'production' ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const purchaseMutation = useMutation({
        mutationFn: async (tier: string) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier }),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Payment initialization failed');
            return res.json();
        },
        onSuccess: (data) => {
            // Open Snap Popup
            if ((window as any).snap) {
                (window as any).snap.pay(data.token, {
                    onSuccess: function (result: any) {
                        console.log('Payment success', result);
                        window.location.href = process.env.NODE_ENV === 'production' ? `/dashboard` : `/payment/status?order_id=${result.order_id}`;
                    },
                    onPending: function (result: any) {
                        console.log('Payment pending', result);
                        window.location.href = process.env.NODE_ENV === 'production' ? `/dashboard` : `/payment/status?order_id=${result.order_id}`;
                    },
                    onError: function (result: any) {
                        console.log('Payment error', result);
                        toast.error('Payment failed. Please try again.');
                    },
                    onClose: function () {
                        setLoading(false);
                    }
                });
            } else {
                toast.error('Payment gateway not loaded properly. Please refresh.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: theme.theme == "light" ? "light" : "dark",
                });
                setLoading(false);
            }
        },
        onError: () => {
            toast.error('Failed to initialize payment.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: theme.theme == "light" ? "light" : "dark",
            });
            setLoading(false);
        }
    });

    // Fetch Payment History to check for pending transactions
    const { data: history } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/history`, {
                credentials: 'include'
            });
            if (!res.ok) return [];
            return res.json();
        }
    });

    // Use useQuery instead of useMutation for fetching data
    const { data: transactions } = useQuery({
        queryKey: ['billing-history'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/history`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch history');
            return res.json();
        }
    });

    const pendingTransaction = transactions?.find((tx: any) => tx.status === 'pending');

    const handleUpgrade = (tierId: string) => {
        if (pendingTransaction) {
            toast.error('You have a pending transaction. Please complete or cancel it in the Billing page before making a new purchase.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: theme.theme == "light" ? "light" : "dark",
            });
            router.push('/billing');
            return;
        }
        setLoading(true);
        purchaseMutation.mutate(tierId);
    };

    return (
        <div className="font-sans max-w-7xl mx-auto py-10 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 text-primary">Choose Your Plan</h1>
                <p className="text-muted-foreground text-lg">Unlock the full potential of FlexBit Pro V3.5</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {TIERS.map((tier) => (
                    <div
                        key={tier.id}
                        className={`bg-card border-2 relative rounded-2xl p-6 shadow-lg flex flex-col transition-transform ${tier.disabled ? 'grayscale border-muted opacity-80 cursor-not-allowed' : `${tier.color} hover:-translate-y-1`
                            }`}
                    >
                        {tier.popular && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                POPULAR
                            </div>
                        )}
                        <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                        <div className="mb-6">
                            <span className="text-3xl font-bold">{tier.price}</span>
                            <span className="text-muted-foreground text-sm"> {tier.period}</span>
                        </div>

                        <ul className="space-y-3 mb-8 flex-1">
                            {tier.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="text-green-500 font-bold">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleUpgrade(tier.id)}
                            disabled={tier.disabled || loading || user?.subscription?.tier === tier.id}
                            className={`w-full ${tier.disabled || loading || user?.subscription?.tier === tier.id ? 'cursor-not-allowed' : 'cursor-pointer'} py-3 rounded-lg font-bold text-white transition-opacity ${user?.subscription?.tier === tier.id
                                ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                                : loading
                                    ? 'opacity-70 cursor-wait bg-secondary'
                                    : tier.disabled
                                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                        : tier.btnColor
                                }`}
                        >
                            {user?.subscription?.tier === tier.id ? 'Current Plan' : tier.disabled ? 'Coming Soon' : loading ? 'Processing...' : 'Upgrade Now'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
