"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';

interface BookLayoutProps {
    leftPageContent?: React.ReactNode;
    rightPageContent?: React.ReactNode;
    children?: React.ReactNode; // Keep for backward compatibility or as alias for rightPage
}

export default function BookLayout({ leftPageContent, rightPageContent, children }: BookLayoutProps) {
    const [isNightMode, setIsNightMode] = useState(false);

    const actualRightContent = rightPageContent || children;

    return (
        <div className={cn(
            "min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-1000",
            isNightMode ? "bg-slate-900" : "bg-[#5D4037]" // Wood color vs Night
        )}>
            {/* Background Texture (Wood grain hint) */}
            <div className={cn(
                "absolute inset-0 opacity-20 pointer-events-none",
                isNightMode ? "bg-none" : "bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"
            )} />

            {/* Night Mode Toggle */}
            <button
                onClick={() => setIsNightMode(!isNightMode)}
                className="absolute top-6 right-6 p-3 rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/30 transition-all z-50"
            >
                {isNightMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>

            {/* The Book */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full max-w-5xl md:aspect-[3/2] flex flex-col md:flex-row shadow-2xl perspective-1000 h-[85vh] md:h-auto"
            >
                {/* Book Cover / Spine background */}
                <div className="absolute inset-0 bg-[#3E2723] rounded-sm transform translate-y-2 translate-x-2" />

                {/* Left Page */}
                <div className="hidden md:block flex-1 bg-[#FDFBF7] rounded-l-md shadow-inner relative overflow-hidden border-r border-[#E5E0D8]">
                    {/* Paper Texture */}
                    <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
                    {/* Page Content */}
                    <div className="relative z-10 h-full p-8 md:p-12 overflow-y-auto custom-scrollbar font-handwriting text-[#3E2723]">
                        {leftPageContent ? (
                            leftPageContent
                        ) : (
                            <div className="h-full flex flex-col justify-center items-center text-center opacity-60">
                                <h2 className="text-3xl mb-4 font-serif text-[#5D4037]">The Chronicle</h2>
                                <p className="italic text-lg text-[#8D6E63]">"Capture the day before it fades."</p>
                            </div>
                        )}
                    </div>
                    {/* Page Curl Shadow */}
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />
                </div>

                {/* Right Page (Active Area) */}
                <div className="flex-1 bg-[#FDFBF7] rounded-md md:rounded-l-none md:rounded-r-md shadow-inner relative overflow-hidden w-full">
                    {/* Paper Texture */}
                    <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

                    {/* Page Content */}
                    <div className="relative z-10 h-full p-8 md:p-12 overflow-y-auto custom-scrollbar font-handwriting text-[#3E2723]">
                        {actualRightContent}
                    </div>

                    {/* Page Curl Shadow at spine */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
                </div>

                {/* Center Spine */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-4 -ml-2 bg-gradient-to-r from-black/10 via-transparent to-black/10 z-20 pointer-events-none" />

            </motion.div>
        </div>
    );
}

