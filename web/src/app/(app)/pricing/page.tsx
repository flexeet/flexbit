"use client";

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

const TIERS = [
    {
        id: 'pioneer',
        name: 'Pioneer',
        price: 'Rp 199.000',
        period: 'Lifetime',
        features: [
            'VQSG Score + Narrative System',
            '900+ Stock Screener',
            'Daily Data Updates',
            'Community Access',
            'Diskon V4+ Harga Khusus'
        ],
        color: 'border-blue-500',
        btnColor: 'bg-blue-600 hover:bg-blue-700',
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

    // Load Midtrans Snap Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
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
                        window.location.href = `/payment/status?order_id=${result.order_id}`;
                    },
                    onPending: function (result: any) {
                        console.log('Payment pending', result);
                        window.location.href = `/payment/status?order_id=${result.order_id}`;
                    },
                    onError: function (result: any) {
                        console.log('Payment error', result);
                        alert('Payment failed. Please try again.');
                    },
                    onClose: function () {
                        setLoading(false);
                    }
                });
            } else {
                alert('Payment gateway not loaded properly. Please refresh.');
                setLoading(false);
            }
        },
        onError: () => {
            alert('Failed to initialize payment.');
            setLoading(false);
        }
    });

    const handleUpgrade = (tierId: string) => {
        setLoading(true);
        purchaseMutation.mutate(tierId);
    };

    return (
        <div className="font-sans max-w-7xl mx-auto py-10 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
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
                            onClick={() => !tier.disabled && handleUpgrade(tier.id)}
                            disabled={loading || user?.subscription?.tier === tier.id || tier.disabled}
                            className={`w-full py-3 rounded-lg font-bold text-white transition-opacity ${user?.subscription?.tier === tier.id
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
