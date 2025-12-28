"use client";
import React from 'react';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { JournalEntryData } from './ChronicleIndex';
import { motion } from 'framer-motion';

interface JournalViewerProps {
    entry: JournalEntryData;
    onBack: () => void;
    onDelete?: (id: string) => void;
}

export default function JournalViewer({ entry, onBack, onDelete }: JournalViewerProps) {
    const formatDate = (timestamp: any) => {
        if (!timestamp) return "";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to tear out this page? This cannot be undone.")) {
            if (onDelete) onDelete(entry.id);
        }
    }

    return (
        <div className="flex flex-col h-full relative font-handwriting">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#E0D8CC]">
                <div className="flex gap-2">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 text-[#8D6E63] hover:text-[#5D4037] hover:bg-[#F0EBE0] px-2 py-1 rounded transition-colors text-sm font-sans"
                    >
                        <ArrowLeft size={16} /> <span className="font-serif">Back</span>
                    </button>
                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-1 text-red-400 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors text-sm"
                            title="Tear out page (Delete)"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
                <div className="text-sm text-[#8D6E63] font-serif italic opacity-80">
                    {formatDate(entry.createdAt)}
                </div>
            </div>

            {/* Content Area */}
            <div className="relative flex-1 w-full overflow-y-auto custom-scrollbar">

                {/* Paper Lines - generated via gradient for perfect alignment with line-height */}
                <div
                    className="absolute inset-x-0 top-0 min-h-full pointer-events-none opacity-20"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(transparent 0px, transparent 39px, #000 40px)', // Darker line but low opacity
                        backgroundAttachment: 'local' // Scroll with content if needed, though mostly container scrolls
                    }}
                />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative z-10 text-2xl leading-[40px] whitespace-pre-wrap p-1 pt-[0.4rem]"
                    style={{
                        lineHeight: '40px',
                        color: entry.inkColor || '#3E2723'
                    }} // Match gradient spacing
                >
                    {entry.content}
                </motion.div>

                {/* Nexus Note Display if exists */}
                {entry.nexus_comment && (
                    <div className="mt-8 ml-4 max-w-sm transform -rotate-1 relative group cursor-help">
                        {/* Sticky Note Effect */}
                        <div className="bg-[#FEF9C3] p-6 shadow-[2px_4px_8px_rgba(0,0,0,0.1)] transition-transform hover:scale-[1.01] relative overflow-hidden">
                            {/* Tape */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/40 rotate-1 backdrop-blur-[1px] shadow-sm transform skew-x-12" />

                            <p className="text-[10px] font-bold text-yellow-800/60 uppercase tracking-widest mb-3 font-sans">Nexus Margin Note</p>
                            <p className="font-handwriting text-xl text-[#422006] leading-relaxed">
                                "{entry.nexus_comment}"
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
