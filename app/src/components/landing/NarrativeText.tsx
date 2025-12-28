"use client";

import { motion } from "framer-motion";

interface NarrativeTextProps {
    text: string;
    delay?: number;
    className?: string;
}

export function NarrativeText({ text, delay = 0, className = "" }: NarrativeTextProps) {
    return (
        <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            className={`text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-teal-200 to-blue-400 bg-clip-text text-transparent drop-shadow-sm ${className}`}
        >
            {text}
        </motion.h2>
    );
}
