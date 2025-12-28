"use client";

import NexusInterface from "@/components/dashboard/NexusInterface";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function NexusPage() {
    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold font-dm-serif text-white">Nexus Core</h1>
                    <p className="text-gray-200 font-inter">Commune with the spirit of your productivity.</p>
                </div>
                <NexusInterface className="flex-1" />
            </div>
        </DashboardLayout>
    );
}
