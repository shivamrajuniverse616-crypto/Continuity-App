import React from 'react';
import { Feather, Book, LampDesk, Cloud, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// Wrapper for the sticker look (White border, shadow, slight rotation)
const Sticker = ({ children, className, rotation = 0 }: { children: React.ReactNode, className?: string, rotation?: number }) => {
    return (
        <div
            className={cn(
                "relative inline-flex items-center justify-center p-2 bg-white rounded-lg shadow-md border-2 border-white/80 transition-transform hover:scale-105 hover:rotate-0 duration-300 cursor-pointer overflow-hidden",
                className
            )}
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export const VintageQuill = () => (
    <Sticker rotation={-5} className="bg-amber-50">
        <Feather className="w-8 h-8 text-amber-900" strokeWidth={1.5} />
    </Sticker>
);

export const ClosedDiary = () => (
    <Sticker rotation={3} className="bg-rose-50">
        <Book className="w-8 h-8 text-rose-900" strokeWidth={1.5} />
    </Sticker>
);

export const MidnightLamp = () => (
    <Sticker rotation={-2} className="bg-emerald-50">
        <LampDesk className="w-8 h-8 text-emerald-900" strokeWidth={1.5} />
    </Sticker>
);

export const ThoughtBubble = () => (
    <Sticker rotation={6} className="bg-sky-50 rounded-full">
        <Cloud className="w-8 h-8 text-sky-600 fill-sky-100" strokeWidth={1.5} />
    </Sticker>
);

export const MagicSparkle = () => (
    <Sticker rotation={-10} className="bg-purple-50 rounded-full p-1.5">
        <Sparkles className="w-5 h-5 text-purple-600" strokeWidth={1.5} />
    </Sticker>
);
