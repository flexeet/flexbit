import { createStore } from 'zustand/vanilla';

export type UIState = {
    isSidebarOpen: boolean;
};

export type UIActions = {
    toggleSidebar: () => void;
    closeSidebar: () => void;
    openSidebar: () => void;
};

export type UIStore = UIState & UIActions;

export const defaultInitState: UIState = {
    isSidebarOpen: false,
};

export const createUIStore = (initState: UIState = defaultInitState) => {
    return createStore<UIStore>()((set) => ({
        ...initState,
        toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
        closeSidebar: () => set({ isSidebarOpen: false }),
        openSidebar: () => set({ isSidebarOpen: true }),
    }));
};
