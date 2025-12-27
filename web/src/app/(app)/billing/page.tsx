"use client";

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { Banknote } from 'lucide-react';

const fetchHistory = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/history`, {
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
};

export default function BillingHistoryPage() {
    const { data: history, isLoading } = useQuery({
        queryKey: ['billing-history'],
        queryFn: fetchHistory
    });

    // Load Snap
    useEffect(() => {
        const script = document.createElement('script');
        script.src = process.env.NODE_ENV === 'production' ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); }
    }, []);

    const resumePayment = (token: string, orderId: string) => {
        if ((window as any).snap) {
            (window as any).snap.pay(token, {
                onSuccess: function (result: any) {
                    window.location.href = `/payment/status?order_id=${orderId}`;
                },
                onPending: function (result: any) {
                    return;
                    // window.location.href = `/payment/status?order_id=${orderId}`;
                },
                onError: function (result: any) {
                    return;
                    // window.location.href = `/payment/status?order_id=${orderId}`;
                },
                onClose: function () {
                    return;
                    // Do nothing
                }
            });
        } else {
            alert('Payment gateway not loaded.');
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="space-y-6 font-sans">
            <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <Banknote className="h-6 w-6 text-primary" />
                    Billing History
                </h1>
                <p className="text-muted-foreground text-sm">Your transaction history</p>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/50 text-muted-foreground text-xs uppercase font-semibold">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Item</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {history?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No transaction history found.
                                    </td>
                                </tr>
                            ) : (
                                history?.map((tx: any) => (
                                    <tr key={tx._id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {format(new Date(tx.createdAt), 'dd MMM yyyy, HH:mm')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono">{tx.orderId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium uppercase">{tx.tier.replace('_', ' ')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            Rp {tx.amount.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${tx.status === 'success' ? 'bg-green-500/10 text-green-500' :
                                                tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-red-500/10 text-red-500'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {tx.status === 'pending' && (
                                                <button
                                                    onClick={() => resumePayment(tx.snapToken, tx.orderId)}
                                                    className="px-3 py-1 cursor-pointer rounded bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
                                                >
                                                    Resume
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
