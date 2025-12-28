"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PulseTracker from "@/components/dashboard/PulseTracker";
import TaskFlow from "@/components/dashboard/TaskFlow";
import Sequence from "@/components/dashboard/Sequence";
import Horizon from "@/components/dashboard/Horizon";
import HabitWidget from "@/components/dashboard/HabitWidget";
import HorizonWidget from "@/components/dashboard/HorizonWidget";
import NexusInterface from "@/components/dashboard/NexusInterface";
import { GlassCard } from "@/components/ui/GlassCard";
import NexusChat from "@/components/dashboard/NexusChat";
import { useDashboardStore } from "@/store/dashboardStore";
import ChronicleContainer from "@/components/chronicle/ChronicleContainer";
import { useUserStore } from "@/store/userStore";
import ProfileSettings from "@/components/dashboard/ProfileSettings";

export default function DashboardPage() {
    const { activeTab } = useDashboardStore();
    const { user } = useUserStore();

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold font-dm-serif text-white">
                        {activeTab === 'overview' ? 'Daily Overview' :
                            activeTab === 'pulse' ? 'Mood Tracker' :
                                activeTab === 'flow' ? 'Task Manager' :
                                    activeTab === 'sequence' ? 'Habit Tracker' :
                                        activeTab === 'horizon' ? 'Vision Board' :
                                            activeTab === 'nexus' ? 'Nexus AI' :
                                                activeTab === 'chronicle' ? 'The Chronicle' :
                                                    activeTab === 'profile' ? 'Profile & Settings' : 'Dashboard'}
                    </h1>
                    <p className="text-gray-200 font-inter">Welcome back to your flow.</p>
                </header>

                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column: Pulse & Habits */}
                        <div className="lg:col-span-4 space-y-6">
                            <PulseTracker />
                            <HabitWidget />
                        </div>

                        {/* Middle Column: Task Flow */}
                        <div className="lg:col-span-5">
                            <TaskFlow />
                        </div>

                        {/* Right Column: Vision/Horizon */}
                        <div className="lg:col-span-3">
                            <HorizonWidget />
                        </div>
                    </div>
                )}

                {activeTab === 'pulse' && (
                    <div className="max-w-2xl mx-auto">
                        <PulseTracker />
                        {/* Historical data graph placeholder would go here */}
                    </div>
                )}

                {activeTab === 'flow' && (
                    <div className="max-w-3xl mx-auto h-[70vh]">
                        <TaskFlow />
                    </div>
                )}

                {activeTab === 'sequence' && (
                    <div className="max-w-3xl mx-auto h-[70vh]">
                        <Sequence />
                    </div>
                )}

                {activeTab === 'horizon' && (
                    <div className="max-w-6xl mx-auto">
                        <Horizon />
                    </div>
                )}

                {activeTab === 'nexus' && (
                    <div className="max-w-4xl mx-auto h-[75vh]">
                        <NexusInterface className="h-full" />
                    </div>
                )}

                {activeTab === 'chronicle' && user && (
                    <div className="w-full h-full min-h-[80vh] flex items-center justify-center">
                        <div className="scale-[0.85] origin-top w-full"> {/* Scale down slightly to fit dashboard view if needed */}
                            <ChronicleContainer userId={user.uid} />
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <ProfileSettings />
                )}
            </div>
            {activeTab !== 'nexus' && activeTab !== 'chronicle' && activeTab !== 'profile' && <NexusChat />}
        </DashboardLayout>
    );
}
