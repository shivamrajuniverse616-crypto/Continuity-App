"use client";

import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";

import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, new GoogleAuthProvider());
            router.push("/dashboard");
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-grapefruit/20 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky/20 blur-[100px] rounded-full pointer-events-none"></div>

            <GlassCard className="w-full max-w-md bg-white/40 border-white/50 shadow-2xl">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    Welcome Back
                </h1>

                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/70 border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-500 focus:border-grapefruit focus:ring-1 focus:ring-grapefruit focus:outline-none transition-colors shadow-sm"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/70 border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-500 focus:border-grapefruit focus:ring-1 focus:ring-grapefruit focus:outline-none transition-colors shadow-sm"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-grapefruit to-coral text-white rounded-lg font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                        Sign In
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                    <div className="h-[1px] bg-gray-300 flex-1"></div>
                    <span className="text-gray-400 text-sm">Or</span>
                    <div className="h-[1px] bg-gray-300 flex-1"></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                </button>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-grapefruit hover:underline transition-colors font-medium">
                        Sign up
                    </Link>
                </p>
            </GlassCard>
        </div>
    );
}
