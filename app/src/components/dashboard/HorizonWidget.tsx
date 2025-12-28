"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { collection, query, limit, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserStore } from "@/store/userStore";
import { Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Goal {
    id: string;
    title: string;
    imageUrl: string;
}

export default function HorizonWidget() {
    const { user } = useUserStore();
    const [goal, setGoal] = useState<Goal | null>(null);

    useEffect(() => {
        if (!user) return;

        // Ideally fetch all and pick random, or just fetch one.
        // For inspiration, let's fetch a few and rotate, or just pick the latest for now.
        // Let's just listen to the goals collection and pick a random one on mount/update.
        const q = query(collection(db, `users/${user.uid}/goals`));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const docs = snapshot.docs;
                const randomDoc = docs[Math.floor(Math.random() * docs.length)];
                setGoal({ id: randomDoc.id, ...randomDoc.data() } as Goal);
            } else {
                setGoal(null);
            }
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <GlassCard className="p-0 h-full min-h-[400px] flex flex-col relative overflow-hidden group">
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                <h2 className="text-2xl font-bold font-dm-serif text-gray-900">The Horizon</h2>
            </div>

            <AnimatePresence mode="wait">
                {goal ? (
                    <motion.div
                        key={goal.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative w-full h-full"
                    >
                        <img
                            src={goal.imageUrl}
                            alt={goal.title}
                            className="w-full h-full object-cover transition-transform duration-10000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                        <div className="absolute bottom-8 left-6 right-6 z-20">
                            <p className="text-gray-300 text-xs uppercase tracking-widest mb-2 font-bold">Focus</p>
                            <h3 className="text-3xl font-bold text-white font-dm-serif leading-tight">
                                {goal.title}
                            </h3>
                        </div>
                    </motion.div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-white/60 text-center">
                        <Compass className="w-16 h-16 mb-4 text-gray-400" />
                        <h3 className="font-dm-serif text-3xl mb-2 text-gray-800">Vision Board</h3>
                        <p className="text-sm font-medium text-gray-600 max-w-[200px] leading-relaxed">Add goals to The Horizon to verify your dreams.</p>
                    </div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
}
