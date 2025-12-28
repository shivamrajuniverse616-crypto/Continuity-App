"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Plus, Check, Trash2, Flame } from "lucide-react";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    Timestamp,
    arrayUnion,
    arrayRemove
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Habit {
    id: string;
    title: string;
    type: 'good' | 'bad';
    completedDates: Timestamp[];
    streak: number;
    createdAt: Timestamp;
}

export default function Sequence() {
    const { user } = useUserStore();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [newHabit, setNewHabit] = useState("");
    const [habitType, setHabitType] = useState<'good' | 'bad'>('good');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, `users/${user.uid}/habits`),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const habitsData = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Backwards compatibility for existing habits without type
                    type: data.type || 'good'
                };
            }) as Habit[];
            setHabits(habitsData);
        });

        return () => unsubscribe();
    }, [user]);

    const addHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabit.trim() || !user) return;

        try {
            await addDoc(collection(db, `users/${user.uid}/habits`), {
                title: newHabit,
                type: habitType,
                completedDates: [],
                streak: 0,
                createdAt: serverTimestamp(),
            });
            setNewHabit("");
            setIsAdding(false);
            setHabitType('good'); // Reset default
        } catch (error) {
            console.error("Error adding habit:", error);
        }
    };

    const toggleHabit = async (habit: Habit) => {
        if (!user) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already completed today
        const isCompletedToday = habit.completedDates.some(date => {
            const d = date.toDate();
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
        });

        const habitRef = doc(db, `users/${user.uid}/habits`, habit.id);

        try {
            if (isCompletedToday) {
                // Undo completion
                // Remove today's timestamp
                // simplistic streak calc: just decrement if > 0 (This is naive, ideally we recalculate from history, but for now simple)
                // For a robust app, we'd recalculate streak from the array.
                // Let's do a simple recalc:
                const newDates = habit.completedDates.filter(date => {
                    const d = date.toDate();
                    d.setHours(0, 0, 0, 0);
                    return d.getTime() !== today.getTime();
                });

                // Recalculate streak
                let currentStreak = 0;
                // Sort dates descending
                const sortedDates = [...newDates].sort((a, b) => b.toMillis() - a.toMillis());

                if (sortedDates.length > 0) {
                    // Check streak
                    let checkDate = new Date();
                    checkDate.setHours(0, 0, 0, 0);
                    // If not completed today, start checking from yesterday
                    checkDate.setDate(checkDate.getDate() - 1);

                    for (const date of sortedDates) {
                        const d = date.toDate();
                        d.setHours(0, 0, 0, 0);
                        if (d.getTime() === checkDate.getTime()) {
                            currentStreak++;
                            checkDate.setDate(checkDate.getDate() - 1);
                        } else if (d.getTime() < checkDate.getTime()) {
                            // gap found
                            break;
                        }
                    }
                }

                await updateDoc(habitRef, {
                    completedDates: newDates, // In firestore this needs to be the actual array or arrayRemove if we had the exact object
                    streak: currentStreak
                });

            } else {
                // Complete
                const newTimestamp = Timestamp.now();

                // Calculate new streak
                let newStreak = 1;
                const sortedDates = [...habit.completedDates].sort((a, b) => b.toMillis() - a.toMillis());

                if (sortedDates.length > 0) {
                    const lastDate = sortedDates[0].toDate();
                    lastDate.setHours(0, 0, 0, 0);

                    const yesterday = new Date();
                    yesterday.setHours(0, 0, 0, 0);
                    yesterday.setDate(yesterday.getDate() - 1);

                    if (lastDate.getTime() === yesterday.getTime()) {
                        // Continued streak
                        newStreak = habit.streak + 1;
                    }
                    // Else: Streak broken, starts at 1
                }

                await updateDoc(habitRef, {
                    completedDates: arrayUnion(newTimestamp),
                    streak: newStreak
                });
            }
        } catch (error) {
            console.error("Error toggling habit:", error);
        }
    };

    const deleteHabit = async (habitId: string) => {
        if (!user) return;
        if (!confirm("Are you sure you want to delete this habit?")) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/habits`, habitId));
        } catch (error) {
            console.error("Error deleting habit:", error);
        }
    };

    const isCompletedToday = (habit: Habit) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return habit.completedDates?.some(date => {
            const d = date.toDate();
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
        });
    };

    return (
        <GlassCard className="w-full h-full min-h-[500px] p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-dm-serif text-gray-900">The Sequence</h2>
                    <p className="text-gray-600 font-inter">Build your momentum.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-3 rounded-full bg-grapefruit text-white hover:bg-coral transition-colors shadow-lg shadow-grapefruit/30"
                >
                    <Plus size={24} className={cn("transition-transform duration-300", isAdding ? "rotate-45" : "")} />
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        onSubmit={addHabit}
                        className="overflow-hidden space-y-4"
                    >
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setHabitType('good')}
                                className={cn(
                                    "flex-1 py-2 rounded-lg font-medium transition-all text-sm",
                                    habitType === 'good' ? "bg-green-100 text-green-700 border border-green-200" : "bg-white/40 text-gray-500 hover:bg-white/60"
                                )}
                            >
                                Build Habit (Good)
                            </button>
                            <button
                                type="button"
                                onClick={() => setHabitType('bad')}
                                className={cn(
                                    "flex-1 py-2 rounded-lg font-medium transition-all text-sm",
                                    habitType === 'bad' ? "bg-red-100 text-red-700 border border-red-200" : "bg-white/40 text-gray-500 hover:bg-white/60"
                                )}
                            >
                                Break Habit (Bad)
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newHabit}
                                onChange={(e) => setNewHabit(e.target.value)}
                                placeholder={habitType === 'good' ? "e.g., Read 10 pages" : "e.g., No Junk Food"}
                                className="flex-1 bg-white/60 border border-white/50 rounded-xl p-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-grapefruit/50 shadow-inner"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="px-6 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2">
                {habits.length === 0 && !isAdding ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-60">
                        <RepeatIcon className="w-16 h-16 mb-4" />
                        <p className="font-dm-serif text-xl">No habits yet</p>
                        <p className="text-sm">Start a new sequence today.</p>
                    </div>
                ) : (
                    habits.map((habit) => {
                        const completed = isCompletedToday(habit);
                        const isGood = habit.type === 'good';

                        return (
                            <motion.div
                                key={habit.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "group flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                                    completed
                                        ? isGood ? "bg-green-50 border-green-200" : "bg-gray-100 border-gray-200"
                                        : "bg-white/40 border-white/50 hover:bg-white/60"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => toggleHabit(habit)}
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                            completed
                                                ? isGood
                                                    ? "bg-green-500 text-white shadow-md shadow-green-200 scale-110"
                                                    : "bg-gray-600 text-white shadow-md shadow-gray-300 scale-110"
                                                : "bg-white/50 border-2 border-gray-300 text-transparent hover:border-gray-400"
                                        )}
                                    >
                                        <Check size={16} strokeWidth={3} />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className={cn(
                                                "font-medium text-lg transition-all",
                                                completed ? "text-gray-500 line-through" : "text-gray-800"
                                            )}>
                                                {habit.title}
                                            </p>
                                            <span className={cn(
                                                "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                                                isGood ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {isGood ? "Build" : "Break"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold text-orange-500">
                                            <Flame size={12} fill={habit.streak > 0 ? "currentColor" : "none"} />
                                            <span>{habit.streak} Day Streak</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteHabit(habit.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </GlassCard>
    );
}

function RepeatIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m17 2 4 4-4 4" />
            <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
            <path d="m7 22-4-4 4-4" />
            <path d="M21 13v1a4 4 0 0 1-4 4H3" />
        </svg>
    )
}
