"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NexusLogoProps {
    className?: string;
    showText?: boolean;
    animated?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
}

export default function NexusLogo({ className, showText = true, animated = true, size = "md" }: NexusLogoProps) {

    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-24 h-24",
        xl: "w-32 h-32"
    };

    const textSizeClasses = {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-4xl",
        xl: "text-5xl"
    };

    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
                {/* Outer Ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-grapefruit/30"
                    animate={animated ? { rotate: 360 } : {}}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />

                {/* Middle Ring (Reverse) */}
                <motion.div
                    className="absolute inset-1 rounded-full border border-sky-400/30"
                    animate={animated ? { rotate: -360 } : {}}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />

                {/* Core Glow */}
                <motion.div
                    className="absolute inset-3 rounded-full bg-gradient-to-tr from-grapefruit to-sky-500 blur-sm opacity-60"
                    animate={animated ? { scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] } : {}}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Core Solid */}
                <div className="absolute inset-4 rounded-full bg-white shadow-inner" />

                {/* Nexus Icon (N) */}
                <div className="absolute inset-0 flex items-center justify-center pb-0.5">
                    <span className={cn(
                        "font-bold font-dm-serif bg-clip-text text-transparent bg-gradient-to-tr from-grapefruit to-sky-600 select-none",
                        size === 'sm' ? "text-lg" : size === 'md' ? "text-2xl" : size === 'lg' ? "text-4xl" : "text-5xl"
                    )}>
                        N
                    </span>
                </div>
            </div>

            {showText && (
                <div className="text-center">
                    <h1 className={cn("font-dm-serif font-bold text-gray-800 tracking-tight", textSizeClasses[size])}>
                        Nexus<span className="text-grapefruit">AI</span>
                    </h1>
                </div>
            )}
        </div>
    );
}
