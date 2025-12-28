"use client";

import { useState } from "react";
import NexusInterface from "./NexusInterface";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X } from "lucide-react";

export default function NexusChat() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Toggle Button (The Orb) */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-grapefruit to-coral shadow-lg shadow-grapefruit/40 flex items-center justify-center text-white"
            >
                {isOpen ? <X size={24} /> : <Bot size={28} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 z-50 w-full max-w-sm"
                    >
                        <NexusInterface className="h-[600px]" onClose={() => setIsOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
