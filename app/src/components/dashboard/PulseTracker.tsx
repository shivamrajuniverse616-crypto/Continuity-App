"use client";

import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { CloudRain, CloudDrizzle, CloudSun, Sun, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addDoc, collection, serverTimestamp, query, orderBy, limit, onSnapshot, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserStore } from "@/store/userStore";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const moods = [
    { level: 1, icon: CloudRain, color: "text-indigo-400", bg: "bg-indigo-400/20", label: "Drained" },
    { level: 2, icon: CloudDrizzle, color: "text-blue-400", bg: "bg-blue-400/20", label: "Sad" },
    { level: 3, icon: CloudSun, color: "text-teal-400", bg: "bg-teal-400/20", label: "Neutral" },
    { level: 4, icon: Sun, color: "text-orange-400", bg: "bg-orange-400/20", label: "Happy" },
    { level: 5, icon: Sparkles, color: "text-yellow-400", bg: "bg-yellow-400/20", label: "Energized" },
];

export default function PulseTracker() {
    const { user } = useUserStore();
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Track if the current state matches the database (to avoid showing "Log" button if unchanged)
    const [isSynced, setIsSynced] = useState(false);

    // Fetch latest mood on mount
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, `users/${user.uid}/mood_logs`),
            orderBy("timestamp", "desc"),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                setSelectedMood(data.mood);
                setNote(data.note || "");
                setIsSynced(true);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const handleMoodSelect = async (level: number) => {
        setSelectedMood(level);
        setIsSynced(false); // User changed selection, allow update
    };

    const submitMood = async () => {
        if (!user || !selectedMood) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, `users/${user.uid}/mood_logs`), {
                mood: selectedMood,
                note,
                timestamp: serverTimestamp(),
            });
            // Don't clear note, let it persist as "Current Status"
            setIsSynced(true);
        } catch (error) {
            console.error("Error logging mood:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <GlassCard className="w-full p-6 flex flex-col items-center gap-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-dm-serif text-gray-900">The Pulse</h2>
                <p className="text-sm text-gray-600 font-inter">How is your spirit feeling right now?</p>
            </div>

            <div className="flex justify-between w-full max-w-sm gap-2">
                {moods.map((m) => (
                    <button
                        key={m.level}
                        onClick={() => handleMoodSelect(m.level)}
                        className="group relative flex flex-col items-center gap-2"
                    >
                        <motion.div
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-4 rounded-full transition-all duration-300 ${selectedMood === m.level ? `${m.bg} shadow-lg ring-2 ring-offset-2 ring-offset-white/10 ring-${m.color.split('-')[1]}-300` : "hover:bg-white/50 bg-white/20"
                                }`}
                        >
                            <m.icon size={28} className={`${m.color}`} />
                        </motion.div>
                        <span className={`text-xs font-medium transition-colors ${selectedMood === m.level ? "text-gray-800" : "text-gray-400"}`}>
                            {m.label}
                        </span>
                    </button>
                ))}
            </div>

            <AnimatePresence>
                {selectedMood && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full space-y-4"
                    >
                        <textarea
                            value={note}
                            onChange={(e) => {
                                setNote(e.target.value);
                                setIsSynced(false);
                            }}
                            placeholder="What's on your mind? (Optional)"
                            className="w-full bg-white/40 border border-white/50 rounded-lg p-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-grapefruit/50 resize-none h-20"
                        />
                        <button
                            onClick={submitMood}
                            disabled={isSubmitting || isSynced}
                            className={cn(
                                "w-full py-2 rounded-lg font-bold shadow-md transition-all flex items-center justify-center",
                                isSynced
                                    ? "bg-green-500/20 text-green-600 cursor-default"
                                    : "bg-grapefruit text-white hover:shadow-lg hover:bg-coral"
                            )}
                        >
                            {isSubmitting ? "Logging..." : isSynced ? "Logged" : "Update Pulse"}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
}
