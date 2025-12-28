"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Book, Plus } from 'lucide-react';

export interface JournalEntryData {
    id: string;
    userId: string;
    content: string;
    createdAt: any; // Firestore Timestamp
    tags?: string[];
    inkColor?: string;
    nexus_comment?: string;
}

interface ChronicleIndexProps {
    entries: JournalEntryData[];
    onOpenEntry: (entry: JournalEntryData) => void;
    onCreateNew: () => void;
}

export default function ChronicleIndex({ entries, onOpenEntry, onCreateNew }: ChronicleIndexProps) {

    // Sort entries by date desc (if not already sorted)
    // Actually, usually passed sorted.

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex flex-col h-full relative">
            <div className="flex justify-between items-center mb-6 border-b border-[#E0D8CC] pb-2">
                <h2 className="text-2xl font-serif text-[#5D4037] flex items-center gap-2">
                    <Book className="w-5 h-5" /> Index
                </h2>
                <button
                    onClick={onCreateNew}
                    className="flex items-center gap-1 text-sm bg-[#5D4037] text-white px-3 py-1 rounded-full hover:bg-[#4E342E] transition-colors"
                >
                    <Plus size={16} /> New Entry
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {entries.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <p className="font-handwriting text-xl">The pages are empty...</p>
                        <p className="text-sm mt-2">Start your first chapter today.</p>
                    </div>
                ) : (
                    entries.map((entry, index) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onOpenEntry(entry)}
                            className="group cursor-pointer p-4 rounded-lg bg-white/50 hover:bg-white border border-transparent hover:border-[#E0D8CC] hover:shadow-sm transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                            </div>

                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-bold text-[#5D4037] text-sm flex items-center gap-2">
                                    Chapter {entries.length - index}
                                </span>
                                <span className="text-xs text-[#8D6E63] font-mono flex items-center gap-1">
                                    <Calendar size={10} /> {formatDate(entry.createdAt)}
                                </span>
                            </div>

                            <p className="font-handwriting text-lg text-[#3E2723] line-clamp-2 leading-tight opacity-90">
                                {entry.content}
                            </p>

                            {entry.nexus_comment && (
                                <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-1.5 rounded border border-yellow-100 italic">
                                    "{entry.nexus_comment.slice(0, 50)}{entry.nexus_comment.length > 50 ? '...' : ''}"
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            <div className="mt-4 text-center text-xs text-[#8D6E63]/60 italic">
                {entries.length} memories captured.
            </div>
        </div>
    );
}
