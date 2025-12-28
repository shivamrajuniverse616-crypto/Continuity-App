"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { GlassCard } from "../ui/GlassCard";
import Link from "next/link";
import { ArrowRight, Leaf, Wind, CloudSun, Heart } from "lucide-react";

import DynamicBackground from "./DynamicBackground";
import NexusSpirit from "./NexusSpirit";
import NexusPreview from "./NexusPreview";
import { nexusStore } from "@/lib/nexusState";

const FadeInSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
};

export default function HeroSection() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

    return (
        <div ref={containerRef} className="relative w-full">
            <NexusSpirit />
            <DynamicBackground />

            {/* Section 1: The Hook (Morning) */}
            <div className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20">
                <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="max-w-5xl text-center space-y-8 z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.0, ease: "easeOut" }}
                    >
                        <p className="text-xl md:text-2xl font-dm-serif text-gray-600 mb-4 tracking-wide italic">
                            The only cheat code is consistency.
                        </p>
                        <h1 className="text-7xl md:text-[9rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-grapefruit to-coral drop-shadow-sm font-dm-serif tracking-tighter leading-[0.9]">
                            Continuity
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-gray-700/80 max-w-2xl mx-auto font-inter leading-relaxed">
                            Most planners fail because they track tasks, not the human behind them.
                            Bridge the gap between your daily grind and your distant dreams.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="pt-8"
                    >
                        <Link href="/login">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-10 py-5 bg-grapefruit text-white font-bold text-xl rounded-full shadow-[0_10px_30px_rgba(255,116,119,0.4)] hover:shadow-[0_20px_40px_rgba(255,116,119,0.6)] transition-all overflow-hidden font-dm-serif tracking-wide"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Enter the Flow <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-coral to-grapefruit opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </motion.button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* Section 2: The Problem (Afternoon/Transition) */}
            <div className="relative min-h-[80vh] flex items-center justify-center px-6 py-20 z-10">
                <div className="max-w-3xl text-center space-y-12">
                    <FadeInSection>
                        <h2 className="text-4xl md:text-6xl font-black font-dm-serif text-gray-800">
                            Stop the <span className="text-grapefruit">Burnout</span> before it starts.
                        </h2>
                    </FadeInSection>
                    <FadeInSection delay={0.2}>
                        <p className="text-xl md:text-2xl text-gray-600 font-inter leading-relaxed">
                            Productivity isn't just about doing more; it's about knowing when to rest.
                            <br /><br />
                            <strong className="text-gray-800">Nexus</strong> monitors your Pulse to suggest lighter loads on heavy days.
                        </p>
                    </FadeInSection>
                </div>
            </div>

            {/* Section 3: The Solution (Cards) (Golden Hour) */}
            <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 z-10">
                <FadeInSection>
                    <h2 className="text-3xl md:text-5xl font-black font-dm-serif text-gray-800 text-center mb-16">
                        Your Operating System
                    </h2>
                </FadeInSection>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto px-4">
                    {/* The Pulse */}
                    <FadeInSection delay={0.1}>
                        <div
                            data-nexus="pulse"
                            onMouseEnter={() => nexusStore.setState("pulse")}
                            onMouseLeave={() => nexusStore.setState("default")}
                            className="transform transition-transform duration-300 hover:scale-[1.02]"
                        >
                            <GlassCard className="flex flex-col h-full p-8 gap-6 group hover:shadow-[0_0_40px_rgba(255,116,119,0.3)] bg-white/40 border-white/60">
                                <div className="p-4 rounded-full bg-grapefruit/10 text-grapefruit w-fit group-hover:scale-110 transition-transform duration-500">
                                    <Heart size={36} strokeWidth={2} className="group-hover:fill-grapefruit/20 transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 font-dm-serif mb-2">The Pulse</h3>
                                    <p className="text-sm text-gray-600 font-inter leading-relaxed">
                                        Your emotional health is your engine. Track your vibe daily to optimize your output.
                                    </p>
                                </div>
                            </GlassCard>
                        </div>
                    </FadeInSection>

                    {/* The Sequence */}
                    <FadeInSection delay={0.3}>
                        <div
                            data-nexus="sequence"
                            onMouseEnter={() => nexusStore.setState("sequence")}
                            onMouseLeave={() => nexusStore.setState("default")}
                            className="transform transition-transform duration-300 hover:scale-[1.02]"
                        >
                            <GlassCard className="flex flex-col h-full p-8 gap-6 group hover:shadow-[0_0_40px_rgba(156,246,246,0.4)] bg-white/40 border-white/60">
                                <div className="p-4 rounded-full bg-cyan/20 text-teal-600 w-fit group-hover:scale-110 transition-transform duration-500">
                                    <Leaf size={36} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 font-dm-serif mb-2">The Sequence</h3>
                                    <p className="text-sm text-gray-600 font-inter leading-relaxed">
                                        Build the "Chain of Excellence." Identify "Dead Cycles" before they break your momentum.
                                    </p>
                                </div>
                            </GlassCard>
                        </div>
                    </FadeInSection>

                    {/* The Horizon */}
                    <FadeInSection delay={0.5}>
                        <div
                            data-nexus="horizon"
                            onMouseEnter={() => nexusStore.setState("horizon")}
                            onMouseLeave={() => nexusStore.setState("default")}
                            className="transform transition-transform duration-300 hover:scale-[1.02]"
                        >
                            <GlassCard className="flex flex-col h-full p-8 gap-6 group hover:shadow-[0_0_40px_rgba(230,149,151,0.3)] bg-white/40 border-white/60">
                                <div className="p-4 rounded-full bg-coral/10 text-coral w-fit group-hover:scale-110 transition-transform duration-500">
                                    <Wind size={36} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 font-dm-serif mb-2">The Horizon</h3>
                                    <p className="text-sm text-gray-600 font-inter leading-relaxed">
                                        Your vision board isn’t a gallery; it’s a destination. Connect daily tasks to lifelong dreams.
                                    </p>
                                </div>
                            </GlassCard>
                        </div>
                    </FadeInSection>
                </div>
            </div>

            {/* Section 4: Live Demo (Night) */}
            <div className="relative min-h-screen flex flex-col items-center justify-center bg-transparent z-10">
                <FadeInSection>
                    <h2 className="text-3xl md:text-5xl font-black font-dm-serif text-white text-center mb-8 drop-shadow-md">
                        Nexus is Aware.
                    </h2>
                </FadeInSection>
                <NexusPreview />
            </div>

            {/* Footer */}
            <div className="py-10 text-center text-white/40 text-sm font-inter relative z-10">
                <p>© 2025 Continuity. Crafted with intention.</p>
            </div>

        </div>
    );
}
