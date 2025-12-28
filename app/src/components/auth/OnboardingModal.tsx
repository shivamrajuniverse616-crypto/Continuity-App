"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { useUserStore } from "@/store/userStore";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function OnboardingModal() {
    const { user, setOnboardingComplete } = useUserStore();
    const [goal, setGoal] = useState("");
    const [step, setStep] = useState(1);
    const router = useRouter();

    const handleComplete = async () => {
        if (!user) return;
        try {
            await setDoc(doc(db, "users", user.uid), {
                primaryGoal: goal,
                onboardingComplete: true,
            }, { merge: true });

            setOnboardingComplete(true);
            router.push("/dashboard"); // Future route
        } catch (error) {
            console.error("Error saving goal:", error);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full max-w-md"
                >
                    <GlassCard className="border-teal-500/30 shadow-teal-500/20">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-blue-400 mb-4">
                            Welcome to Continuity
                        </h2>

                        {step === 1 && (
                            <div className="space-y-4">
                                <p className="text-gray-300">Let's prime the Nexus. What is your single biggest goal right now?</p>
                                <input
                                    type="text"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    placeholder="e.g. Crack JEE, Build a Startup, Run a Marathon"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-teal-400 transition-colors"
                                />
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!goal.trim()}
                                    className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 text-center">
                                <p className="text-xl text-white">Target Locked: <span className="text-teal-300 font-bold">{goal}</span></p>
                                <p className="text-sm text-gray-400">The system is calibrating your path.</p>
                                <button
                                    onClick={handleComplete}
                                    className="w-full py-3 bg-white text-void-black rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Enter Dashboard
                                </button>
                            </div>
                        )}
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
