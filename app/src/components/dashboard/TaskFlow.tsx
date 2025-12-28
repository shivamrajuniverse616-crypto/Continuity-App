"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Plus, Check, Trash2, Book, Heart, Star, Repeat, Clock, Calendar, Briefcase, Coffee, Dumbbell, Code, Music, Home, Globe, Monitor, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

interface Task {
    id: string;
    title: string;
    description?: string;
    category: "study" | "health" | "personal" | "work";
    recurrence: "none" | "daily" | "weekly" | "monthly";
    time?: string;
    icon: string;
    completed: boolean;
    createdAt: any;
}

export default function TaskFlow() {
    const { user } = useUserStore();
    const [tasks, setTasks] = useState<Task[]>([]);

    // Form State
    const [newTask, setNewTask] = useState("");
    const [category, setCategory] = useState<Task["category"]>("personal");
    const [recurrence, setRecurrence] = useState<Task["recurrence"]>("none");
    const [time, setTime] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("Star");
    const [isExpanded, setIsExpanded] = useState(false); // To toggle detailed view

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, `users/${user.uid}/tasks`),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
        });

        return () => unsubscribe();
    }, [user]);

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim() || !user) return;

        await addDoc(collection(db, `users/${user.uid}/tasks`), {
            title: newTask,
            category,
            recurrence,
            time,
            icon: selectedIcon,
            completed: false,
            createdAt: new Date(),
        });

        setNewTask("");
        setTime("");
        setIsExpanded(false);
    };

    const toggleTask = async (id: string, currentStatus: boolean) => {
        if (!user) return;
        const taskRef = doc(db, `users/${user.uid}/tasks`, id);
        await updateDoc(taskRef, { completed: !currentStatus });
    };

    const deleteTask = async (id: string) => {
        if (!user) return;
        await deleteDoc(doc(db, `users/${user.uid}/tasks`, id));
    };



    return (
        <GlassCard className="w-full h-full p-6 flex flex-col gap-6 min-h-[500px]">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold font-dm-serif text-gray-900">The Flow</h2>
                    <p className="text-sm text-gray-600 font-inter">Streamline your actions.</p>
                </div>
                <div className="text-xs text-gray-600 font-bold px-3 py-1 bg-white/50 rounded-full border border-white/60">
                    {tasks.filter(t => !t.completed).length} Pending
                </div>
            </div>

            {/* Add Task Input */}
            <form onSubmit={addTask} className="space-y-4 relative z-10">
                <div className="relative group">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                        placeholder="What needs to be done?"
                        className="w-full bg-white/60 border border-white/50 rounded-xl p-4 pl-4 pr-12 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-grapefruit/50 shadow-inner transition-all"
                    />
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-grapefruit text-white rounded-lg shadow-md hover:bg-coral transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-white/30 rounded-xl p-4 space-y-4 overflow-hidden border border-white/40"
                        >
                            {/* Time & Recurrence Row */}
                            <div className="flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[120px]">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Time</label>
                                    <div className="relative">
                                        <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full bg-white/60 border border-transparent rounded-lg py-2 pl-9 pr-3 text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-grapefruit/30 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-[120px]">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Recurrence</label>
                                    <div className="relative">
                                        <Repeat size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select
                                            value={recurrence}
                                            onChange={(e) => setRecurrence(e.target.value as Task["recurrence"])}
                                            className="w-full bg-white/60 border border-transparent rounded-lg py-2 pl-9 pr-3 text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-grapefruit/30 transition-all outline-none appearance-none"
                                        >
                                            <option value="none">One-time</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Icon Picker */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Icon</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { id: "Star", icon: Star },
                                        { id: "Book", icon: Book },
                                        { id: "Code", icon: Code },
                                        { id: "Dumbbell", icon: Dumbbell },
                                        { id: "Briefcase", icon: Briefcase },
                                        { id: "Coffee", icon: Coffee },
                                        { id: "Music", icon: Music },
                                        { id: "Home", icon: Home },
                                        { id: "Zap", icon: Zap },
                                        { id: "Globe", icon: Globe },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setSelectedIcon(item.id)}
                                            className={cn(
                                                "p-2 rounded-lg transition-all",
                                                selectedIcon === item.id
                                                    ? "bg-grapefruit text-white shadow-md transform scale-110"
                                                    : "bg-white/40 text-gray-500 hover:bg-white/80 hover:scale-105"
                                            )}
                                        >
                                            <item.icon size={16} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {tasks.map((task) => {
                        const iconMap: any = { Star, Book, Code, Dumbbell, Briefcase, Coffee, Music, Home, Zap, Globe };
                        const TaskIcon = iconMap[task.icon] || Star;

                        return (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={cn(
                                    "group flex items-center justify-between p-3 rounded-xl border transition-all hover:bg-white/60",
                                    task.completed ? "bg-white/20 border-transparent opacity-60" : "bg-white/40 border-white/50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleTask(task.id, task.completed)}
                                        className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                            task.completed ? "bg-green-400 border-green-400 text-white" : "border-gray-400 text-transparent hover:border-green-400"
                                        )}
                                    >
                                        <Check size={14} strokeWidth={3} />
                                    </button>

                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-sm font-medium transition-all",
                                            task.completed ? "text-gray-500 line-through" : "text-gray-800"
                                        )}>
                                            {task.title}
                                        </span>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            {/* Icon & Time */}
                                            <div className="flex items-center gap-1 text-grapefruit">
                                                <TaskIcon size={12} />
                                                {task.time && <span>{task.time}</span>}
                                            </div>

                                            {/* Recurrence */}
                                            {task.recurrence !== 'none' && (
                                                <div className="flex items-center gap-1 text-teal-500">
                                                    <Repeat size={10} />
                                                    <span className="capitalize">{task.recurrence}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </motion.div>
                        );
                    })}
                    {tasks.length === 0 && (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            No tasks yet. Start your flow.
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </GlassCard>
    );
}
