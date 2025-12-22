"use client";

import { type ReactNode, createContext, useRef, useContext } from 'react';
import { type StoreApi, useStore } from 'zustand';
import { type UIStore, createUIStore, defaultInitState } from '@/store/uiStore';

export const UIStoreContext = createContext<StoreApi<UIStore> | null>(null);

export interface UIStoreProviderProps {
    children: ReactNode;
}

export const UIStoreProvider = ({ children }: UIStoreProviderProps) => {
    const storeRef = useRef<StoreApi<UIStore> | null>(null);
    if (!storeRef.current) {
        storeRef.current = createUIStore(defaultInitState);
    }

    return (
        <UIStoreContext.Provider value={storeRef.current}>
            {children}
        </UIStoreContext.Provider>
    );
};

export const useUIStore = <T,>(selector: (store: UIStore) => T): T => {
    const uiStoreContext = useContext(UIStoreContext);

    if (!uiStoreContext) {
        throw new Error(`useUIStore must be used within UIStoreProvider`);
    }

    return useStore(uiStoreContext, selector);
};
