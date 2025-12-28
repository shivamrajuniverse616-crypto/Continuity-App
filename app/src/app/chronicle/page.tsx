"use client";
import React, { useState, useEffect } from 'react';
import BookLayout from '@/components/chronicle/BookLayout';
import JournalEntry from '@/components/chronicle/JournalEntry';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ChroniclePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                router.push('/login');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#5D4037] text-white font-serif animate-pulse">
                Opening the Chronicle...
            </div>
        );
    }

    if (!user) return null;

    return (
        <BookLayout>
            <JournalEntry userId={user.uid} />
        </BookLayout>
    );
}
