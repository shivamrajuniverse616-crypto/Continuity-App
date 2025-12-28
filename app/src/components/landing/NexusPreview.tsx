"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Bot, User } from "lucide-react";

export default function NexusPreview() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const chatVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.5, duration: 0.5 }
        })
    };

    return (
        <div ref={ref} className="w-full max-w-5xl mx-auto py-32 px-6 flex flex-col md:flex-row items-center gap-12">

            {/* Left: Mock Task List */}
            <GlassCard className="flex-1 w-full p-6 space-y-4 bg-white/30 border-white/40 transform rotate-[-2deg]">
                <div className="flex items-center justify-between border-b border-gray-200/30 pb-4">
                    <h3 className="font-dm-serif text-xl text-gray-800">My Tasks</h3>
                    <span className="text-xs bg-red-100 text-red-500 px-2 py-1 rounded-full">High Load</span>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 opacity-60">
                            <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
                            <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                        </div>
                    ))}
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-grapefruit rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">3 Chapters of Physics</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200/30">
                    <p className="text-xs text-gray-500">Current Mood: <span className="font-bold text-gray-700">Exhausted</span></p>
                </div>
            </GlassCard>

            {/* Right: Nexus Interaction */}
            <div className="flex-1 w-full space-y-6">
                <motion.div
                    custom={0}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={chatVariants}
                    className="flex items-start gap-4"
                >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg text-grapefruit">
                        <Bot size={24} />
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-sm">
                        <p className="text-sm text-gray-700 leading-relaxed font-inter">
                            Hey, I see you're drained. Let's tackle just <span className="font-bold text-grapefruit">1 chapter now</span> and move the rest to tomorrow morning when your Pulse is higher.
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    custom={1}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={chatVariants}
                    className="flex items-start gap-4 justify-end"
                >
                    <div className="bg-grapefruit text-white p-3 rounded-2xl rounded-tr-none shadow-md">
                        <p className="text-sm font-medium">Consistency &gt; Intensity.</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shadow-sm text-gray-500">
                        <User size={24} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
