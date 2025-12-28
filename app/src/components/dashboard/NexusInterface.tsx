"use client";

import { useState, useRef, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { buildNexusContext } from "@/lib/nexusContext";
import { GlassCard } from "../ui/GlassCard";
import NexusLogo from "../ui/NexusLogo";
import { Bot, Send, User, Loader2, ImagePlus, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
    image?: string;
}

interface NexusInterfaceProps {
    className?: string;
    onClose?: () => void;
}

export default function NexusInterface({ className, onClose }: NexusInterfaceProps) {
    const { user } = useUserStore();
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "I am here. How is your flow today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, selectedImage]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !selectedImage) || !user || loading) return;

        const newMessage: Message = {
            role: "user",
            content: input,
            image: selectedImage || undefined
        };

        setMessages(prev => [...prev, newMessage]);
        setInput("");
        setSelectedImage(null); // Clear image after sending
        setLoading(true);

        try {
            const context = await buildNexusContext(user.uid);

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, newMessage],
                    context
                })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, { role: "assistant", content: data.content }]);

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "I sense a disturbance. I cannot speak right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className={cn("flex flex-col shadow-2xl bg-white/90 backdrop-blur-xl border-white/60 overflow-hidden", className)}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-grapefruit/5 to-transparent">
                <div className="flex items-center gap-3">
                    <NexusLogo size="sm" showText={false} animated={true} />
                    <div>
                        <h3 className="font-dm-serif text-xl text-gray-800 leading-none">Nexus</h3>
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1.5 mt-0.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Online & Ready
                        </span>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                )}
            </div>



            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex gap-4 group",
                            m.role === 'user' ? "flex-row-reverse" : "flex-row"
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1",
                            m.role === 'user' ? "bg-gray-100 text-gray-500" : "bg-transparent"
                        )}>
                            {m.role === 'user' ? <User size={14} /> : <NexusLogo size="sm" showText={false} animated={false} />}
                        </div>

                        <div className={cn(
                            "flex flex-col gap-2 max-w-[85%]",
                            m.role === 'user' ? "items-end" : "items-start"
                        )}>
                            {m.image && (
                                <div className="p-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                    <img src={m.image} alt="Uploaded" className="max-w-xs rounded-xl" />
                                </div>
                            )}
                            {m.content && (
                                <div className={cn(
                                    "px-4 py-3 text-sm leading-relaxed shadow-sm relative",
                                    m.role === 'user'
                                        ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl rounded-tr-sm"
                                        : "bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-tl-sm"
                                )}>
                                    <ReactMarkdown
                                        components={{
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                            strong: ({ node, ...props }: any) => <span className="font-bold text-grapefruit-dark" {...props} />,
                                            ul: ({ node, ...props }: any) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                                            li: ({ node, ...props }: any) => <li className="marker:text-grapefruit/70 pl-1" {...props} />
                                        }}
                                    >
                                        {m.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                            <span className="text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-4">
                        <div className="shrink-0 mt-1">
                            <NexusLogo size="sm" showText={false} animated={true} />
                        </div>
                        <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-grapefruit/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-grapefruit/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-grapefruit/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-white/50 space-y-3">
                {/* Image Preview */}
                {selectedImage && (
                    <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <img src={selectedImage} alt="Preview" className="h-10 w-10 object-cover rounded-lg" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">Image Attached</p>
                            <p className="text-[10px] text-gray-400">Ready to send</p>
                        </div>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-red-400"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSend} className="relative flex items-end gap-2">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "p-3 rounded-xl transition-all shadow-sm border",
                            selectedImage
                                ? "bg-grapefruit/10 text-grapefruit border-grapefruit/20"
                                : "bg-white text-gray-400 border-gray-200 hover:text-grapefruit hover:border-grapefruit/30"
                        )}
                        title="Upload Image"
                    >
                        <ImagePlus size={20} />
                    </button>

                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder="Type your message..."
                            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-grapefruit/20 focus:border-grapefruit/30 transition-all resize-none min-h-[46px] max-h-32"
                            style={{ height: '46px' }} // Initial height
                        />
                        <button
                            type="submit"
                            disabled={(!input.trim() && !selectedImage) || loading}
                            className="absolute right-1.5 bottom-1.5 p-2 bg-gradient-to-r from-grapefruit to-coral text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-grapefruit/30 transition-all transform active:scale-95"
                        >
                            <Send size={16} fill="currentColor" className="opacity-90" />
                        </button>
                    </div>
                </form>
            </div>
        </GlassCard>
    );
}
