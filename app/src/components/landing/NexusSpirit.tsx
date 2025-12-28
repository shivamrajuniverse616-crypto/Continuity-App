"use client";

import { motion, useSpring, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import { nexusStore } from "@/lib/nexusState";

export default function NexusSpirit() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150, mass: 0.5 }; // Lightweight spring
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const [hoverState, setHoverState] = useState<"default" | "pulse" | "sequence" | "horizon">("default");

    useEffect(() => {
        const unsubscribe = nexusStore.subscribe(setHoverState);
        return () => { unsubscribe(); };
    }, []);

    useEffect(() => {
        let rafId: number;

        const handleMouseMove = (e: MouseEvent) => {
            // Update position immediately via RAF for smoothness
            rafId = requestAnimationFrame(() => {
                mouseX.set(e.clientX - 16);
                mouseY.set(e.clientY - 16);
            });
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(rafId);
        };
    }, [mouseX, mouseY]);

    const variants = {
        default: { backgroundColor: "rgba(255, 255, 255, 0.6)", scale: 1, boxShadow: "0 0 20px rgba(255,255,255,0.4)" },
        pulse: { backgroundColor: "rgba(255, 116, 119, 0.8)", scale: 1.5, boxShadow: "0 0 30px rgba(255, 116, 119, 0.6)" },
        sequence: { backgroundColor: "rgba(156, 246, 246, 0.8)", scale: 1.5, boxShadow: "0 0 30px rgba(156, 246, 246, 0.6)" },
        horizon: { backgroundColor: "rgba(230, 149, 151, 0.8)", scale: 1.5, boxShadow: "0 0 30px rgba(230, 149, 151, 0.6)" },
    };

    return (
        <motion.div
            style={{ x: springX, y: springY }}
            variants={variants}
            animate={hoverState}
            // Use hardware acceleration hint
            className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-50 mix-blend-screen will-change-transform"
        />
    );
}
