"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Check, Flame } from "lucide-react";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

interface Habit {
    id: string;
    title: string;
    type?: 'good' | 'bad';
    completedDates: Timestamp[];
    streak: number;
}

export default function HabitWidget() {
    const { user } = useUserStore();
    const [habits, setHabits] = useState<Habit[]>([]);

    useEffect(() => {
        if (!user) return;

        // Fetch all habits to show summary
        const q = query(collection(db, `users/${user.uid}/habits`), orderBy("createdAt", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Habit[];
            setHabits(data);
        });

        return () => unsubscribe();
    }, [user]);

    const isCompletedToday = (habit: Habit) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return habit.completedDates?.some(date => {
            const d = date.toDate();
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
        });
    };

    const pendingHabits = habits.filter(h => !isCompletedToday(h));
    const completedCount = habits.length - pendingHabits.length;

    return (
        <GlassCard className="p-6 h-64 flex flex-col relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 z-10">
                <h3 className="font-dm-serif text-xl text-gray-800">The Sequence</h3>
                <span className="text-xs font-bold text-gray-500 bg-white/50 px-2 py-1 rounded-full">
                    {completedCount}/{habits.length} Done
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 z-10 pr-1">
                {habits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p className="text-sm">No habits yet.</p>
                    </div>
                ) : (
                    habits.map((habit) => {
                        const completed = isCompletedToday(habit);
                        const isGood = habit.type !== 'bad'; // Default to good

                        return (
                            <div key={habit.id} className="flex items-center justify-between">
                                <div className="flex flex-col max-w-[70%]">
                                    <span className={cn(
                                        "text-sm font-medium truncate",
                                        completed ? "text-gray-400 line-through" : "text-gray-700"
                                    )}>
                                        {habit.title}
                                    </span>
                                    <span className={cn(
                                        "text-[9px] font-bold uppercase tracking-wider",
                                        isGood ? "text-green-500" : "text-red-500"
                                    )}>
                                        {isGood ? "Build" : "Break"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {habit.streak > 0 && (
                                        <div className="flex items-center text-[10px] font-bold text-orange-400">
                                            <Flame size={10} fill="currentColor" />
                                            {habit.streak}
                                        </div>
                                    )}
                                    <div className={cn(
                                        "w-4 h-4 rounded-full flex items-center justify-center border transition-colors",
                                        completed
                                            ? isGood ? "bg-green-500 border-green-500" : "bg-gray-600 border-gray-600"
                                            : "border-gray-300"
                                    )}>
                                        {completed && <Check size={10} className="text-white" strokeWidth={4} />}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Decorative background blur */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-400/10 rounded-full blur-2xl group-hover:bg-orange-400/20 transition-colors pointer-events-none" />
        </GlassCard>
    );
}
