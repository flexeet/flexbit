"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';

function StatusContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('order_id');
    const [status, setStatus] = useState('Verifying payment...');

    useEffect(() => {
        if (!orderId) {
            router.push('/dashboard');
            return;
        }

        verify(orderId);
    }, [orderId]);

    const verify = async (oid: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: oid }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.status === 'success') {
                setStatus('Payment Successful! Updating your account...');
                // Wait a bit then redirect
                setTimeout(() => router.push('/dashboard'), 2000);
            } else if (data.status === 'pending') {
                setStatus('Payment is pending. Please complete the payment.');
                setTimeout(() => router.push('/dashboard'), 3000);
            } else {
                setStatus(`Status: ${data.message || 'Verification failed'}`);
                setTimeout(() => router.push('/dashboard'), 3000);
            }
        } catch (e) {
            console.error(e);
            setStatus('Verification failed. Please check Dashboard.');
            setTimeout(() => router.push('/dashboard'), 3000);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="p-8 bg-card border rounded-xl shadow-lg text-center max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Payment Status</h2>
                <div className="text-lg mb-4">{status}</div>
                <div className="animate-pulse text-muted-foreground text-sm">Please wait...</div>
            </div>
        </div>
    );
}



export default function PaymentStatusPage() {
    if (process.env.NODE_ENV === 'production') {
        notFound();
    }

    return (
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
            <StatusContent />
        </Suspense>
    );
}
