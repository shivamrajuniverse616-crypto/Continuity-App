"use client";
import React, { useState, useEffect } from 'react';
import BookLayout from './BookLayout';
import ChronicleIndex, { JournalEntryData } from './ChronicleIndex';
import JournalViewer from './JournalViewer';
import JournalEntry from './JournalEntry';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp, deleteDoc, doc } from 'firebase/firestore';

interface ChronicleContainerProps {
    userId: string;
}

type ViewMode = 'INDEX' | 'READ' | 'WRITE';

export default function ChronicleContainer({ userId }: ChronicleContainerProps) {
    const [mode, setMode] = useState<ViewMode>('INDEX');
    const [entries, setEntries] = useState<JournalEntryData[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch entries on mount
    useEffect(() => {
        if (!userId) return;

        const q = query(
            collection(db, 'journals'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedEntries = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as JournalEntryData[];

            setEntries(fetchedEntries);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching journal entries:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [userId]); // Removed mode dependency, rely on realtime updates

    const handleOpenEntry = (entry: JournalEntryData) => {
        setSelectedEntry(entry);
        setMode('READ');
    };

    const handleCreateNew = () => {
        setMode('WRITE');
    };

    const handleBackToIndex = () => {
        setMode('INDEX');
        setSelectedEntry(null);
    };

    const handleDeleteEntry = async (entryId: string) => {
        try {
            await deleteDoc(doc(db, 'journals', entryId));
            setMode('INDEX');
            setSelectedEntry(null);
        } catch (error) {
            console.error("Error deleting entry:", error);
            alert("Failed to delete entry. Please try again.");
        }
    };

    const handleSaveComplete = () => {
        setMode('INDEX');
        // Effect will trigger re-fetch
    };

    // Determine what to show on Left and Right pages

    // Default / Index Mode
    let leftContent = null;
    let rightContent = null;

    if (mode === 'INDEX') {
        // Left: Index List
        // Right: Perhaps a prompt or blank, or maybe Index spans both?
        // Let's make Index span the Left page, and Right page be "New Entry" prompt or empty.
        // Actually, better: Left = Index, Right = "Create New" prompt or decorative.

        leftContent = (
            <ChronicleIndex
                entries={entries}
                onOpenEntry={handleOpenEntry}
                onCreateNew={handleCreateNew}
            />
        );

        rightContent = (
            <div className="h-full flex flex-col justify-center items-center text-center p-8 border-4 border-double border-[#E0D8CC] rounded">
                <h3 className="text-2xl font-serif text-[#5D4037] mb-4">The Next Chapter</h3>
                <p className="text-[#8D6E63] italic mb-8">What story will you tell today?</p>
                <button
                    onClick={handleCreateNew}
                    className="px-8 py-3 bg-[#5D4037] text-white rounded-full hover:bg-[#4E342E] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-serif"
                >
                    Write Entry
                </button>
            </div>
        );
    } else if (mode === 'READ' && selectedEntry) {
        // Left: Index (Compact) or Metadata? 
        // Let's keep Index on Left for easy navigation, or maybe Metadata of the entry.
        // Let's put Entry Content on Right, and maybe Stickers/Metadata on Left.
        // Or simpler: Full viewer on Right, Left is decoration/Index.

        // Let's reuse Index on Left so user can switch entries easily?
        // Might be crowded. Let's make Left Page be the "Title Page" of the Entry or Index.
        leftContent = (
            <ChronicleIndex
                entries={entries}
                onOpenEntry={handleOpenEntry}
                onCreateNew={handleCreateNew}
            />
        );

        rightContent = (
            <JournalViewer
                entry={selectedEntry}
                onBack={handleBackToIndex}
                onDelete={handleDeleteEntry}
            />
        );
    } else if (mode === 'WRITE') {
        // Left: Inspirational quotes or Previous Entry? 
        // Right: The writable JournalEntry
        leftContent = (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70 p-8">
                <p className="font-handwriting text-2xl text-[#5D4037] leading-loose">
                    "Write it on your heart that every day is the best day in the year."
                    <br />
                    <span className="text-sm font-sans mt-4 block text-[#8D6E63] uppercase tracking-widest">- Ralph Waldo Emerson</span>
                </p>
            </div>
        );

        rightContent = (
            <JournalEntry
                userId={userId}
                onSaveComplete={handleSaveComplete}
                onBack={handleBackToIndex}
            />
        );
    }

    return (
        <BookLayout
            leftPageContent={leftContent}
            rightPageContent={rightContent}
        />
    );
}
