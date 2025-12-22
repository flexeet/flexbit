"use client";

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Sheet({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const overlay = useRef<HTMLDivElement>(null);
    const wrapper = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    const onDismiss = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => {
            router.back();
        }, 300); // Match duration-300
    }, [router]);

    const onClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === overlay.current || e.target === wrapper.current) {
                if (onDismiss) onDismiss();
            }
        },
        [onDismiss, overlay, wrapper]
    );

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onDismiss();
        },
        [onDismiss]
    );

    useEffect(() => {
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onKeyDown]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        // Trigger generic open animation frame
        requestAnimationFrame(() => {
            setIsOpen(true);
        });
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return createPortal(
        <div
            ref={overlay}
            className={`fixed inset-0 z-50 flex justify-end transition-colors duration-300 ${isOpen ? 'bg-background/80 backdrop-blur-sm' : 'bg-transparent'
                }`}
            onClick={onClick}
        >
            <div
                className={`w-full md:w-[600px] lg:w-[800px] bg-background border-l border-border h-full shadow-2xl overflow-y-auto relative transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>,
        document.body
    );
}
