"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { doc, setDoc } from "firebase/firestore";
import OnboardingModal from "@/components/auth/OnboardingModal";
import { Eye, EyeOff } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { setUser } = useUserStore();
    const router = useRouter();

    const handleGoogleSignup = async () => {
        try {
            const result = await signInWithPopup(auth, new GoogleAuthProvider());
            setUser(result.user);
            setShowOnboarding(true);
        } catch (error) {
            console.error("Signup failed", error);
        }
    };

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName: name });

            await setDoc(doc(db, "users", result.user.uid), {
                email,
                name,
                createdAt: new Date(),
            });

            setUser(result.user);
            setShowOnboarding(true);
        } catch (error) {
            console.error("Signup failed", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-grapefruit/20 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan/20 blur-[100px] rounded-full"></div>

            {showOnboarding && <OnboardingModal />}

            <GlassCard className="w-full max-w-md bg-white/40 border-white/50 shadow-2xl relative z-20">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    Join Continuity
                </h1>

                <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/70 border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-500 focus:border-grapefruit focus:ring-1 focus:ring-grapefruit focus:outline-none transition-colors shadow-sm"
                            placeholder="Your Name"
                            required
                        />
                    </div>
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
                        Create Account
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                    <div className="h-[1px] bg-gray-300 flex-1"></div>
                    <span className="text-gray-400 text-sm">Or</span>
                    <div className="h-[1px] bg-gray-300 flex-1"></div>
                </div>

                <button
                    onClick={handleGoogleSignup}
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
                    Already have an account?{" "}
                    <Link href="/login" className="text-grapefruit hover:underline transition-colors font-medium">
                        Sign in
                    </Link>
                </p>
            </GlassCard>
        </div>
    );
}
