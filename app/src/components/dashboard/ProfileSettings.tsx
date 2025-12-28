"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { GlassCard } from "../ui/GlassCard"; // Assuming generic UI component exists
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, Calendar, Bell, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfileSettings() {
    const { user } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [displayName, setDisplayName] = useState("");
    const [dob, setDob] = useState("");
    const [notifications, setNotifications] = useState({
        dailyFocus: true,
        moodCheck: true
    });
    const [themePreference, setThemePreference] = useState("system");

    useEffect(() => {
        if (!user) return;
        setDisplayName(user.displayName || "");

        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.dateOfBirth) setDob(data.dateOfBirth);
                    if (data.notificationSettings) setNotifications(data.notificationSettings);
                    if (data.themePreference) setThemePreference(data.themePreference);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);

        try {
            await setDoc(doc(db, "users", user.uid), {
                displayName,
                dateOfBirth: dob,
                notificationSettings: notifications,
                themePreference
            }, { merge: true });
            // Update local user store if we had a method for it, but Firebase Auth update is complex client-side
            // for simple custom fields, Firestore is enough.
            // Ideally we'd also update updateProfile(user, { displayName }) but let's stick to Firestore for custom data first.
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <header>
                <h2 className="text-3xl font-dm-serif text-white">Profile & Settings</h2>
                <p className="text-gray-200">Manage your personal information and preferences.</p>
            </header>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Personal Info Card */}
                <GlassCard className="p-6 space-y-6 bg-white/90">
                    <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                        <div className="p-2 bg-grapefruit/10 text-grapefruit rounded-lg">
                            <User size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900">Personal Details</h3>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-800">Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full p-3 rounded-xl bg-white border border-gray-300 focus:ring-2 focus:ring-grapefruit/20 focus:border-grapefruit/40 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                                placeholder="Your Name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-800">Email Address</label>
                            <input
                                type="email"
                                value={user?.email || ""}
                                disabled
                                className="w-full p-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-600 cursor-not-allowed font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-800">Date of Birth</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    className="w-full p-3 pl-10 rounded-xl bg-white border border-gray-300 focus:ring-2 focus:ring-grapefruit/20 focus:border-grapefruit/40 outline-none transition-all text-gray-900 font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Notifications Card */}
                <GlassCard className="p-6 space-y-6 bg-white/90">
                    <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                        <div className="p-2 bg-grapefruit/10 text-grapefruit rounded-lg">
                            <Bell size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                            <div>
                                <p className="font-bold text-gray-800">Daily Focus Reminder</p>
                                <p className="text-sm text-gray-600 font-medium">Get a notification to plan your day in the morning.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.dailyFocus}
                                    onChange={(e) => setNotifications({ ...notifications, dailyFocus: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-grapefruit"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                            <div>
                                <p className="font-bold text-gray-800">Mood Check-in</p>
                                <p className="text-sm text-gray-600 font-medium">Reminders to log your pulse during the day.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.moodCheck}
                                    onChange={(e) => setNotifications({ ...notifications, moodCheck: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-grapefruit"></div>
                            </label>
                        </div>
                    </div>
                </GlassCard>

                {/* Theme Preference Card */}
                <GlassCard className="p-6 space-y-6 bg-white/90">
                    <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                        <div className="p-2 bg-grapefruit/10 text-grapefruit rounded-lg">
                            <span className="text-xl">🎨</span>
                        </div>
                        <h3 className="font-bold text-gray-900">Theme Preference</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {['system', 'morning', 'noon', 'evening', 'night'].map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setThemePreference(mode)}
                                className={cn(
                                    "p-3 rounded-xl border transition-all text-sm font-medium capitalize",
                                    themePreference === mode
                                        ? "bg-grapefruit text-white border-grapefruit shadow-md shadow-grapefruit/20"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-grapefruit/50 hover:text-grapefruit"
                                )}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </GlassCard>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all",
                            isSaving ? "bg-gray-400 cursor-wait" : "bg-grapefruit hover:bg-coral hover:shadow-grapefruit/30 transform active:scale-95"
                        )}
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
