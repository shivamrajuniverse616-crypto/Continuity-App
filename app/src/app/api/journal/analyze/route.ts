import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
        }

        const { content, mood } = await req.json();

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `You are 'Nexus', a digital spirit companion in a journaling app called 'The Chronicle'.
Your goal is to be supportive, observant, and concise.
Analyze the user's journal entry.
- If they are venting about stress/failure: Offer validation and a gentle reminder of their resilience.
- If they are celebrating a win (big or small): Offer a "High Five" and enthusiastic reinforcement.
- If they are neutral/reflective: Offer a deep, philosophical (but not cheesy) observation.

Your output must be a SINGLE sentence/short paragraph, formatted as a "Margin Note" (handwritten style comment).
Do not offer advice unless explicitly asked. Just be there with them.
Keep it under 30 words.
`
        });

        const prompt = `User's Mood: ${mood || "Unknown"}\n\nJournal Entry:\n"${content}"\n\nGenerate your margin note:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ marginNote: text });

    } catch (error) {
        console.error("Journal Analysis Error:", error);
        return NextResponse.json({ error: "Failed to analyze journal" }, { status: 500 });
    }
}
