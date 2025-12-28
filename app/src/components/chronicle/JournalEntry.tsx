"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Save, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { useNexus } from '@/lib/nexusContext'; // Assuming context availability or I'll use direct props/swr for now if context isn't ready
import { VintageQuill, ClosedDiary, MidnightLamp, ThoughtBubble, MagicSparkle } from './Stickers';

// Voice Recognition Setup
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface JournalEntryProps {
    userId: string;
    onSaveComplete?: () => void;
    onBack?: () => void;
}

export default function JournalEntry({ userId, onSaveComplete, onBack }: JournalEntryProps) {
    const [content, setContent] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [nexusNote, setNexusNote] = useState<string | null>(null);
    const [showStickers, setShowStickers] = useState(false);
    const [activeStickers, setActiveStickers] = useState<React.ReactNode[]>([]);

    // Ink Colors
    const inkColors = [
        { name: 'Classic Brown', value: '#3E2723' },
        { name: 'Midnight Blue', value: '#1e3a8a' },
        { name: 'Forest Green', value: '#14532d' },
        { name: 'Berry Red', value: '#881337' },
        { name: 'Charcoal', value: '#1f2937' },
    ];
    const [currentInk, setCurrentInk] = useState(inkColors[0].value);

    // Check for browser support
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;

                recognitionRef.current.onresult = (event: any) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        }
                    }
                    if (finalTranscript) {
                        setContent(prev => prev + " " + finalTranscript);
                    }
                };
            }
        }
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const handleSave = async () => {
        if (!content.trim()) return;
        setIsSaving(true);

        try {
            // 1. Identify Logic/Keywords for Vision Board
            const lowerContent = content.toLowerCase();
            const isSuccess = lowerContent.includes("solved") || lowerContent.includes("completed") || lowerContent.includes("finished") || lowerContent.includes("won");

            if (isSuccess) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }

            // 2. Call Nexus Analysis API
            const analysisRes = await fetch('/api/journal/analyze', {
                method: 'POST',
                body: JSON.stringify({ content: content, mood: "Unknown" }), // Could pass mood if we had it
            });
            const analysisData = await analysisRes.json();
            const marginNote = analysisData.marginNote;

            // 3. Save to Firestore
            await addDoc(collection(db, 'journals'), {
                userId,
                content,
                inkColor: currentInk,
                nexus_comment: marginNote,
                tags: isSuccess ? ['achievement'] : [],
                createdAt: serverTimestamp(),
                // Add sticker logic if needed
            });

            setNexusNote(marginNote);

            // Animation pause
            setTimeout(() => {
                if (onSaveComplete) onSaveComplete();
                setIsSaving(false);
                setContent(""); // Reset or keep? Maybe reset.
            }, 3000);

        } catch (error) {
            console.error("Error saving journal:", error);
            setIsSaving(false);
        }
    };

    const addSticker = (stickerNode: React.ReactNode) => {
        // Just for visual flair in this session, normally would save position
        setActiveStickers([...activeStickers, stickerNode]);
        setShowStickers(false);
    };

    if (nexusNote) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-6"
            >
                <div className="text-4xl text-[#5D4037] mb-4 font-serif">Entry Saved</div>
                <div className="bg-yellow-50 p-6 rounded-lg shadow-inner border border-yellow-200 max-w-md transform rotate-[-1deg]">
                    <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-widest mb-2 opacity-70">Nexus Margin Note</h3>
                    <p className="font-handwriting text-2xl text-[#3E2723] leading-relaxed">
                        "{nexusNote}"
                    </p>
                </div>
                <button
                    onClick={() => setNexusNote(null)}
                    className="mt-8 text-sm text-gray-500 hover:text-gray-800 underline underline-offset-4"
                >
                    Write another entry
                </button>
            </motion.div>
        );
    }

    return (
        <div className="h-full flex flex-col relative font-handwriting">
            {/* Header / Tools */}
            <div className="flex items-center justify-between mb-4 border-b border-[#E0D8CC] pb-2">
                <div className="flex space-x-2 items-center">
                    <button
                        onClick={() => setShowStickers(!showStickers)}
                        className="p-2 text-[#8D6E63] hover:text-[#5D4037] hover:bg-[#F0EBE0] rounded-full transition-colors"
                        title="Add Sticker"
                    >
                        <Sparkles size={20} />
                    </button>

                    {/* Ink Color Palette */}
                    <div className="flex items-center space-x-1 ml-2 border-l border-[#E0D8CC] pl-3">
                        {inkColors.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => setCurrentInk(color.value)}
                                className={`w-5 h-5 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 ${currentInk === color.value ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''}`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>
                <div className="text-xs text-[#8D6E63] font-sans opacity-60">
                    {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* Sticker Picker Popover */}
            <AnimatePresence>
                {showStickers && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-12 left-0 z-50 bg-white p-4 rounded-xl shadow-xl border border-stone-200 flex gap-4"
                    >
                        <div onClick={() => addSticker(<VintageQuill />)}><VintageQuill /></div>
                        <div onClick={() => addSticker(<ClosedDiary />)}><ClosedDiary /></div>
                        <div onClick={() => addSticker(<MidnightLamp />)}><MidnightLamp /></div>
                        <div onClick={() => addSticker(<ThoughtBubble />)}><ThoughtBubble /></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Writing Area (Lines) */}
            <div className="relative flex-1 w-full overflow-y-auto custom-scrollbar">

                {/* Textarea */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Dear Chronicle... (or just speak your mind)"
                    className="w-full h-full bg-transparent resize-none outline-none text-2xl leading-[40px] font-handwriting p-1 pt-[0.4rem] relative z-10 placeholder:text-gray-400/50"
                    style={{
                        color: currentInk,
                        lineHeight: '40px',
                        backgroundImage: 'repeating-linear-gradient(transparent 0px, transparent 39px, #94a3b8 40px)', // Slate-400 for better visibility
                        backgroundAttachment: 'local'
                    }}
                    spellCheck={false}
                />

                {/* Placed Stickers */}
                {activeStickers.map((sticker, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute pointer-events-none"
                        style={{ top: `${Math.random() * 80}%`, left: `${Math.random() * 80}%` }}
                    >
                        {sticker}
                    </motion.div>
                ))}
            </div>

            {/* Footer / Actions */}
            <div className="mt-4 flex items-center justify-between">
                <button
                    onClick={toggleRecording}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-50 text-red-600 ring-2 ring-red-200 animate-pulse' : 'bg-transparent text-[#8D6E63] hover:bg-[#F0EBE0]'}`}
                >
                    {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                    <span className="text-sm font-medium">{isRecording ? "Listening..." : "Voice Note"}</span>
                </button>

                <div className="flex items-center space-x-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            disabled={isSaving}
                            className="px-4 py-2 text-[#8D6E63] hover:text-[#5D4037] hover:bg-[#F0EBE0] rounded-full text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={isSaving || !content.trim()}
                        className={`
                        flex items-center space-x-2 px-6 py-2 rounded-full font-serif
                        text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1
                        ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#5D4037] hover:bg-[#4E342E]'}
                    `}
                    >
                        {isSaving ? (
                            <span className="flex items-center"><span className="animate-spin mr-2">⏳</span> Saving...</span>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Save Entry</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
