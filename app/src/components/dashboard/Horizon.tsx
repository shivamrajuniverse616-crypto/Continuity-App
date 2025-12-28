"use client";

import { useState, useEffect, useRef } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Plus, X, Image as ImageIcon, Trash2, Upload, Smile, Loader2 } from "lucide-react";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Sticker {
    id: string;
    content: string; // Emoji character or Image URL
    type: 'emoji' | 'image';
    x: number;
    y: number;
}

interface Goal {
    id: string;
    title: string;
    imageUrl: string;
    stickers?: Sticker[];
    createdAt: Timestamp;
}

const ROBOT_STICKERS = [
    { src: "/stickers/robot-reading.png", alt: "Reading" },
    { src: "/stickers/robot-growth.png", alt: "Growth" },
    { src: "/stickers/robot-vibe.png", alt: "Vibe" },
    { src: "/stickers/robot-idea.png", alt: "Idea" },
];

export default function Horizon() {
    const { user } = useUserStore();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'url' | 'upload'>('upload');
    const [selectedStickers, setSelectedStickers] = useState<Sticker[]>([]);

    // Used for sticker drag constraints
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, `users/${user.uid}/goals`),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const goalsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Goal[];
            setGoals(goalsData);
        });

        return () => unsubscribe();
    }, [user]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `vision-boards/${user.uid}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            setImageUrl(downloadURL);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const addSticker = (stickerSrc: string) => {
        const newSticker: Sticker = {
            id: Math.random().toString(36).substr(2, 9),
            content: stickerSrc,
            type: 'image',
            x: 50, // Centerish
            y: 50
        };
        setSelectedStickers([...selectedStickers, newSticker]);
    };

    const updateStickerPosition = (id: string, x: number, y: number) => {
        setSelectedStickers(prev => prev.map(s =>
            s.id === id ? { ...s, x, y } : s
        ));
    };

    const removeSticker = (id: string) => {
        setSelectedStickers(prev => prev.filter(s => s.id !== id));
    };

    const addGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !user) return;

        const finalImage = imageUrl.trim() || "https://images.unsplash.com/photo-1493612276216-9c5901955d43?q=80&w=1000&auto=format&fit=crop";

        try {
            await addDoc(collection(db, `users/${user.uid}/goals`), {
                title,
                imageUrl: finalImage,
                stickers: selectedStickers,
                createdAt: serverTimestamp(),
            });
            setTitle("");
            setImageUrl("");
            setSelectedStickers([]);
            setIsAdding(false);
        } catch (error) {
            console.error("Error adding goal:", error);
        }
    };

    const deleteGoal = async (id: string) => {
        if (!user || !confirm("Delete this vision?")) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/goals`, id));
        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    };

    return (
        <div className="w-full h-full flex flex-col gap-8 pb-20">
            <GlassCard className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold font-dm-serif text-gray-900">The Horizon</h2>
                    <p className="text-gray-600 font-inter mt-2">Visualize your future. Manifest your dreams.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="px-6 py-3 bg-grapefruit text-white rounded-xl font-bold hover:bg-coral transition-colors shadow-lg shadow-grapefruit/30 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Vision
                </button>
            </GlassCard>

            {/* Add Goal Modal */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-2xl my-8 z-[70]"
                        >
                            <GlassCard className="p-6 relative flex flex-col md:flex-row gap-6">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                                >
                                    <X size={24} />
                                </button>

                                {/* Left: Form */}
                                <div className="flex-1 space-y-4">
                                    <h3 className="text-2xl font-bold font-dm-serif text-gray-800">New Vision</h3>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">Goal Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Visit Japan"
                                            className="w-full bg-white/60 border border-white/50 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-grapefruit/50"
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">Image Source</label>
                                        <div className="flex gap-2 mb-2">
                                            <button
                                                onClick={() => setActiveTab('upload')}
                                                className={cn("flex-1 py-2 rounded-lg text-sm font-medium", activeTab === 'upload' ? "bg-grapefruit/10 text-grapefruit" : "bg-gray-100 text-gray-500")}
                                            >Upload</button>
                                            <button
                                                onClick={() => setActiveTab('url')}
                                                className={cn("flex-1 py-2 rounded-lg text-sm font-medium", activeTab === 'url' ? "bg-grapefruit/10 text-grapefruit" : "bg-gray-100 text-gray-500")}
                                            >URL</button>
                                        </div>

                                        {activeTab === 'upload' ? (
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    disabled={uploading}
                                                />
                                                {uploading ? (
                                                    <Loader2 className="animate-spin text-grapefruit mb-2" />
                                                ) : (
                                                    <Upload className="text-gray-400 mb-2" />
                                                )}
                                                <span className="text-sm text-gray-500">
                                                    {uploading ? "Uploading..." : "Click or drag to upload"}
                                                </span>
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                placeholder="https://..."
                                                className="w-full bg-white/60 border border-white/50 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-grapefruit/50"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-2">Add Robot Stickers</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {ROBOT_STICKERS.map(s => (
                                                <button
                                                    key={s.alt}
                                                    onClick={() => addSticker(s.src)}
                                                    className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-lg p-1 hover:scale-110 hover:shadow-md transition-all"
                                                >
                                                    <img src={s.src} alt={s.alt} className="w-full h-full object-contain" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={addGoal}
                                        disabled={!title || !imageUrl}
                                        className="w-full py-3 bg-grapefruit text-white rounded-xl font-bold hover:bg-coral transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                    >
                                        Manifest Vision
                                    </button>
                                </div>

                                {/* Right: Preview */}
                                <div className="w-full md:w-64 aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden relative shadow-inner group border border-gray-200/50">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}

                                    {/* Stickers Overlay */}
                                    {selectedStickers.map((sticker) => (
                                        <motion.div
                                            key={sticker.id}
                                            drag
                                            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                                            whileDrag={{ scale: 1.2 }}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            style={{
                                                position: 'absolute',
                                                left: `${sticker.x}%`,
                                                top: `${sticker.y}%`,
                                                cursor: 'grab',
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                            className="w-20 h-20 select-none z-20 pointer-events-auto"
                                        >
                                            <img draggable={false} src={sticker.content} alt="sticker" className="w-full h-full object-contain drop-shadow-md" />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeSticker(sticker.id); }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-sm"
                                            >
                                                ×
                                            </button>
                                        </motion.div>
                                    ))}

                                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
                                        <h4 className="text-white font-dm-serif text-xl">{title || "Your Vision"}</h4>
                                    </div>
                                </div>

                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal, index) => (
                    <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500"
                    >
                        <img
                            src={goal.imageUrl}
                            alt={goal.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Render Saved Stickers */}
                        {goal.stickers?.map(sticker => (
                            <div
                                key={sticker.id}
                                style={{
                                    position: 'absolute',
                                    left: `${sticker.x}%`,
                                    top: `${sticker.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                                className="w-20 h-20 select-none z-10 pointer-events-none"
                            >
                                <img src={sticker.content} alt="sticker" className="w-full h-full object-contain drop-shadow-md" />
                            </div>
                        ))}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                        <div className="absolute bottom-0 left-0 w-full p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <h3 className="text-2xl font-bold font-dm-serif text-shadow-sm">{goal.title}</h3>
                            <div className="w-12 h-1 bg-grapefruit mt-2 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                        </div>

                        <button
                            onClick={() => deleteGoal(goal.id)}
                            className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-red-500/80 transition-all opacity-0 group-hover:opacity-100 z-20"
                        >
                            <Trash2 size={16} />
                        </button>
                    </motion.div>
                ))}

                {/* Empty State / Add CTA */}
                {goals.length === 0 && !isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="aspect-[4/5] rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-grapefruit hover:border-grapefruit hover:bg-grapefruit/5 transition-all gap-4"
                    >
                        <Plus size={48} />
                        <span className="font-bold">Add your first vision</span>
                    </button>
                )}
            </div>
        </div>
    );
}
