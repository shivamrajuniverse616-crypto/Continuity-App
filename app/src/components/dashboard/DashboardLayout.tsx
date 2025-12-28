"use client";

import DynamicBackground from "@/components/landing/DynamicBackground";
import NexusSpirit from "@/components/landing/NexusSpirit";
import { GlassCard } from "../ui/GlassCard";
import { useDashboardStore } from "@/store/dashboardStore";
import {
    LayoutDashboard,
    Activity,
    CheckCircle2,
    Repeat,
    Compass,
    LogOut,
    Sparkles,
    Book
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { activeTab, setActiveTab, isSidebarOpen } = useDashboardStore();
    const { user, setUser } = useUserStore();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                router.push("/login");
            }
        });
        return () => unsubscribe();
    }, [setUser, router]);

    const handleSignOut = async () => {
        await auth.signOut();
        router.push("/");
    };

    const [timeOfDay, setTimeOfDay] = useState<'morning' | 'noon' | 'evening' | 'night'>('morning');
    const [themeOverride, setThemeOverride] = useState<string | null>(null);

    // 1. Calculate Time of Day
    useEffect(() => {
        const updateTime = () => {
            const hour = new Date().getHours();
            if (hour >= 6 && hour < 11) setTimeOfDay('morning');
            else if (hour >= 11 && hour < 16) setTimeOfDay('noon');
            else if (hour >= 16 && hour < 19) setTimeOfDay('evening');
            else setTimeOfDay('night');
        };
        updateTime();
        const interval = setInterval(updateTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    // 2. Fetch User Theme Preference (Real-time)
    useEffect(() => {
        if (!user) return;
        const resizeListener = onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
                const pref = doc.data().themePreference;
                if (pref && pref !== 'system') {
                    setThemeOverride(pref);
                } else {
                    setThemeOverride(null);
                }
            }
        });
        return () => resizeListener();
    }, [user]);

    const currentMode = (themeOverride as any) || timeOfDay;


    const navItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'pulse', icon: Activity, label: 'The Pulse' },
        { id: 'flow', icon: CheckCircle2, label: 'The Flow' },
        { id: 'sequence', icon: Repeat, label: 'The Sequence' },
        { id: 'horizon', icon: Compass, label: 'The Horizon' },
        { id: 'chronicle', icon: Book, label: 'The Chronicle' },
        { id: 'nexus', icon: Sparkles, label: 'Nexus AI' },
    ] as const;

    return (
        <div className="relative min-h-screen w-full overflow-hidden flex flex-col md:flex-row">
            <NexusSpirit />
            <DynamicBackground mode={currentMode} />

            {/* Desktop Sidebar Navigation (Hidden on Mobile) */}
            <GlassCard
                className={cn(
                    "hidden md:flex h-[96vh] my-[2vh] ml-[2vh] flex-col items-center py-8 gap-8 transition-all duration-300 z-50 fixed left-0 top-0",
                    isSidebarOpen ? "w-64 px-6 items-start" : "w-20 px-2 items-center"
                )}
            >
                <div className="flex items-center gap-3 mb-4 pl-1 min-h-[40px]">
                    {isSidebarOpen ? (
                        <img src="/logo.png" alt="Continuity" className="w-48 h-auto object-contain transition-all" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-grapefruit to-coral shrink-0 border-2 border-white/20"></div>
                    )}
                </div>

                <nav className="flex-1 flex flex-col gap-2 w-full">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "flex items-center gap-4 p-3 rounded-xl transition-all w-full group relative overflow-hidden",
                                activeTab === item.id
                                    ? "bg-grapefruit text-white shadow-md shadow-grapefruit/30"
                                    : "text-gray-600 hover:bg-white/40 hover:text-grapefruit"
                            )}
                        >
                            <item.icon size={24} strokeWidth={2} className={cn("shrink-0", activeTab === item.id ? "text-white" : "text-gray-500 group-hover:text-grapefruit transition-colors")} />
                            {isSidebarOpen && <span className="font-medium font-inter whitespace-nowrap">{item.label}</span>}

                            {/* Hover Glow */}
                            {activeTab !== item.id && (
                                <div className="absolute inset-0 bg-gradient-to-r from-grapefruit/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* User Profile & Sign Out - Desktop */}
                <div className="w-full pt-4 border-t border-gray-200/50 flex flex-col gap-2">
                    {isSidebarOpen && user && (
                        <button
                            onClick={() => setActiveTab('profile')}
                            className="text-sm text-left hover:bg-gray-50 p-2 rounded-lg transition-colors w-full group"
                        >
                            <p className="font-bold text-gray-700 truncate group-hover:text-grapefruit transition-colors">{user.displayName || "User"}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </button>
                    )}
                    <button
                        onClick={handleSignOut}
                        className={cn(
                            "flex items-center gap-4 p-3 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all w-full",
                            !isSidebarOpen && "justify-center"
                        )}
                    >
                        <LogOut size={24} />
                        {isSidebarOpen && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </GlassCard>

            {/* Mobile Bottom Navigation (Visible only on Mobile) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4">
                <GlassCard className="flex items-center justify-between px-6 py-4 shadow-xl border-white/40 bg-white/90 backdrop-blur-xl">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-xl transition-all",
                                activeTab === item.id ? "text-grapefruit bg-grapefruit/10" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                        </button>
                    ))}
                </GlassCard>
            </div>

            {/* Main Content Area */}
            <main className={cn(
                "flex-1 relative z-10 transition-all duration-300 p-4 pt-8 md:p-8 md:pt-10 min-h-screen overflow-y-auto pb-28 md:pb-8", // Added mobile bottom padding
                isSidebarOpen ? "md:ml-72" : "md:ml-24" // applied only on desktop
            )}>
                {children}
            </main>
        </div>
    );
}
