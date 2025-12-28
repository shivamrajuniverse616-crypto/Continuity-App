"use client";

import { motion, AnimatePresence } from "framer-motion";

type ThemeMode = 'morning' | 'noon' | 'evening' | 'night' | 'default';

interface DynamicBackgroundProps {
    variant?: "default" | "dark"; // Kept for backward compatibility
    mode?: ThemeMode;
}

export default function DynamicBackground({ variant = "default", mode = "default" }: DynamicBackgroundProps) {

    // Configuration for each time of day
    const themes = {
        morning: {
            background: "linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 100%)", // Light Blue -> White
            sunPosition: { bottom: '10%', left: '10%', opacity: 1, scale: 0.8 },
            moonPosition: { top: '10%', right: '-20%', opacity: 0, scale: 0.5 },
            atmosphere: "radial-gradient(circle at 10% 90%, rgba(255, 200, 100, 0.4) 0%, rgba(255,255,255,0) 60%)" // Sunrise glow
        },
        noon: {
            background: "linear-gradient(to bottom, #4CA1AF 0%, #C4E0E5 100%)", // Bright Blue -> Cyan
            sunPosition: { top: '5%', left: '50%', x: '-50%', opacity: 1, scale: 1.2 },
            moonPosition: { top: '80%', right: '-20%', opacity: 0, scale: 0.5 },
            atmosphere: "radial-gradient(circle at 50% 0%, rgba(255, 255, 200, 0.5) 0%, rgba(255,255,255,0) 70%)" // Overhead glare
        },
        evening: {
            background: "linear-gradient(to bottom, #FF512F 0%, #F09819 100%)", // Orange -> Yellow
            sunPosition: { bottom: '10%', right: '10%', opacity: 1, scale: 0.9 },
            moonPosition: { top: '10%', left: '10%', opacity: 0.2, scale: 0.6 },
            atmosphere: "radial-gradient(circle at 90% 90%, rgba(255, 100, 50, 0.5) 0%, rgba(255,255,255,0) 60%)" // Sunset glow
        },
        night: {
            background: "linear-gradient(to bottom, #0F2027 0%, #203A43 50%, #2C5364 100%)", // Deep Space Blue
            sunPosition: { bottom: '-20%', left: '50%', opacity: 0, scale: 0.5 },
            moonPosition: { top: '15%', right: '15%', opacity: 1, scale: 1 },
            atmosphere: "radial-gradient(circle at 85% 15%, rgba(255, 255, 255, 0.15) 0%, rgba(255,255,255,0) 50%)" // Moon glow
        },
        default: {
            background: "linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)",
            sunPosition: { opacity: 0 },
            moonPosition: { opacity: 0 },
            atmosphere: "none"
        }
    };

    // Determine current theme based on props.
    // If 'dark' variant is passed (legacy), force night mode unless a specific mode is provided.
    const activeThemeKey = mode !== 'default' ? mode : (variant === 'dark' ? 'night' : 'morning');
    const currentTheme = themes[activeThemeKey];

    return (
        <motion.div
            className="fixed inset-0 z-0 overflow-hidden"
            initial={false}
            animate={{ background: currentTheme.background }}
            transition={{ duration: 2, ease: "easeInOut" }}
        >
            {/* Atmosphere Layer (Glows) */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ background: currentTheme.atmosphere }}
                transition={{ duration: 2 }}
            />

            {/* Celestial Bodies Container */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Sun */}
                <motion.div
                    className="absolute w-32 h-32 rounded-full blur-2xl"
                    style={{ background: 'radial-gradient(circle, #FFD700 0%, rgba(255,215,0,0) 70%)' }}
                    animate={currentTheme.sunPosition as any}
                    transition={{ duration: 3, type: "spring", stiffness: 50 }}
                />

                {/* Solid Sun Core (for visual clarity) */}
                <motion.div
                    className="absolute w-16 h-16 bg-yellow-100 rounded-full shadow-[0_0_40px_rgba(255,215,0,0.6)]"
                    animate={currentTheme.sunPosition as any}
                    transition={{ duration: 3, type: "spring", stiffness: 50 }}
                />

                {/* Moon */}
                <motion.div
                    className="absolute w-20 h-20 bg-gray-100/90 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    animate={currentTheme.moonPosition as any}
                    transition={{ duration: 3, type: "spring", stiffness: 40 }}
                >
                    {/* Craters */}
                    <div className="absolute top-4 left-5 w-3 h-3 bg-gray-200/50 rounded-full" />
                    <div className="absolute bottom-6 right-4 w-5 h-5 bg-gray-200/50 rounded-full" />
                </motion.div>

                {/* Stars (Only visible in Night mode) */}
                <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: activeThemeKey === 'night' ? 1 : 0 }}
                    transition={{ duration: 2 }}
                >
                    <div className="absolute top-10 left-1/4 w-1 h-1 bg-white rounded-full opacity-80" />
                    <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white rounded-full opacity-60" />
                    <div className="absolute bottom-1/2 left-10 w-1 h-1 bg-white rounded-full opacity-70" />
                    <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full opacity-90 animate-pulse" />
                    <div className="absolute top-1/2 left-1/3 w-0.5 h-0.5 bg-white rounded-full opacity-50" />
                </motion.div>
            </div>
        </motion.div>
    );
}
