import { create } from 'zustand';

interface DashboardState {
    activeTab: 'overview' | 'pulse' | 'flow' | 'sequence' | 'horizon' | 'chronicle' | 'nexus' | 'profile';
    setActiveTab: (tab: 'overview' | 'pulse' | 'flow' | 'sequence' | 'horizon' | 'chronicle' | 'nexus' | 'profile') => void;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    activeTab: 'overview',
    setActiveTab: (tab) => set({ activeTab: tab }),
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
