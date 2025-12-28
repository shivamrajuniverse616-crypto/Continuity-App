import { create } from "zustand";
import { User } from "firebase/auth";

interface UserState {
    user: User | null;
    isLoading: boolean;
    isOnboardingComplete: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setOnboardingComplete: (complete: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    isLoading: true,
    isOnboardingComplete: false,
    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
    setOnboardingComplete: (isOnboardingComplete) => set({ isOnboardingComplete }),
}));
