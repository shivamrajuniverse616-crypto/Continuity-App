import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

interface Task {
    title: string;
    description?: string;
    completed: boolean;
    category: string;
    recurrence: string;
    time?: string;
}

interface Goal {
    title: string;
    id: string;
}

interface Mood {
    mood: number;
    note: string;
    timestamp: any;
}

interface Habit {
    title: string;
    streak: number;
    type?: 'good' | 'bad';
    completedDates: any[];
}

export async function buildNexusContext(userId: string): Promise<string> {
    try {
        // 1. Fetch Pending Tasks (Limit 20)
        const tasksQuery = query(
            collection(db, `users/${userId}/tasks`),
            where("completed", "==", false),
            orderBy("createdAt", "desc"),
            limit(20)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasks = tasksSnapshot.docs.map(d => d.data() as Task);

        // 2. Fetch Horizon Goals
        const goalsQuery = query(
            collection(db, `users/${userId}/goals`),
            orderBy("createdAt", "desc"),
            limit(5)
        );
        const goalsSnapshot = await getDocs(goalsQuery);
        const goals = goalsSnapshot.docs.map(d => d.data() as Goal);

        // 3. Fetch Latest Mood
        const moodQuery = query(
            collection(db, `users/${userId}/mood_logs`),
            orderBy("timestamp", "desc"),
            limit(1)
        );
        const moodSnapshot = await getDocs(moodQuery);
        const latestMood = moodSnapshot.empty ? null : moodSnapshot.docs[0].data() as Mood;

        // 4. Fetch Habits
        const habitsQuery = query(
            collection(db, `users/${userId}/habits`),
            orderBy("createdAt", "asc")
        );
        const habitsSnapshot = await getDocs(habitsQuery);
        const habits = habitsSnapshot.docs.map(d => d.data() as Habit);

        // 5. Format Context String
        let context = "USER CONTEXT DATA:\n\n";

        // Mood Context
        if (latestMood) {
            const moodLabels = ["Drained", "Sad", "Neutral", "Happy", "Energized"];
            const moodLabel = moodLabels[latestMood.mood - 1] || "Unknown";
            context += `CURRENT STATE: The user is feeling '${moodLabel}'${latestMood.note ? ` ("${latestMood.note}")` : ""}.\n\n`;
        } else {
            context += "CURRENT STATE: No recent mood logged.\n\n";
        }

        // Tasks Context
        if (tasks.length > 0) {
            context += "PENDING TASKS (Prioritize these):\n";
            tasks.forEach(t => {
                context += `- [${t.category.toUpperCase()}] ${t.title}${t.time ? ` (at ${t.time})` : ""} ${t.recurrence !== 'none' ? `(Repeats: ${t.recurrence})` : ""}\n`;
            });
            context += "\n";
        } else {
            context += "No pending tasks.\n\n";
        }

        // Habits Context
        if (habits.length > 0) {
            context += "HABIT TRACKING:\n";
            habits.forEach(h => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isDoneToday = h.completedDates?.some((d: any) => {
                    // Handle Firestore Timestamp or Date
                    const date = d.toDate ? d.toDate() : new Date(d);
                    date.setHours(0, 0, 0, 0);
                    return date.getTime() === today.getTime();
                });

                context += `- ${h.title}: ${isDoneToday ? "COMPLETED today" : "NOT DONE today"} (Streak: ${h.streak})\n`;
            });
            context += "\n";
        }

        // Goals Context
        if (goals.length > 0) {
            context += "LONG TERM VISION (HORIZON GOALS):\n";
            goals.forEach(g => {
                context += `- ${g.title}\n`;
            });
            context += "\n";
        } else {
            context += "No horizon goals set.\n\n";
        }

        return context;

    } catch (error) {
        console.error("Error building Nexus context:", error);
        return "Error fetching user context. Assume the user is busy.";
    }
}
