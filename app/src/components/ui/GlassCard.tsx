import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "glass-panel rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md border border-white/60",
                "bg-white/80", // Much more solid for a cleaner look
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
