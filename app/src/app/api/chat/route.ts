import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
        }

        const { messages, context } = await req.json();

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `You are Nexus, an AI spirit living in the 'Continuity' application.
Your purpose is to help the user maintain flow, balance their energy, and achieve their goals.
You are calm, concise, and slightly mystical but grounded in productivity.
You prioritize "Consistency > Intensity".

Use the following context about the user's current life (Tasks and Vision) to guide your advice.
If the user asks "What should I do?", look at their tasks and suggest something small to start.
Refer to their Horizon goals to keep them motivated.

${context}
`
        });

        // Convert messages to Gemini format (history)
        // Gemini expects { role: "user" | "model", parts: [{ text: "..." }] }
        // Filter out the first message if it is from the assistant (the welcome message) because Gemini requires history to start with 'user'
        const rawHistory = messages.slice(0, -1);
        let validHistory = rawHistory;

        if (validHistory.length > 0 && validHistory[0].role === 'assistant') {
            validHistory = validHistory.slice(1);
        }

        const history = validHistory.map((m: any) => {
            const parts: any[] = [];

            if (m.content) {
                parts.push({ text: m.content });
            }

            if (m.image) {
                // Extract base64 data and mime type
                // Expected format: data:image/png;base64,iVBORw0KGgoAAA...
                const matches = m.image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    parts.push({
                        inlineData: {
                            mimeType: matches[1],
                            data: matches[2]
                        }
                    });
                }
            }

            return {
                role: m.role === 'user' ? 'user' : 'model',
                parts: parts
            };
        });

        const lastMessageContent = messages[messages.length - 1];
        const currentMessageParts: any[] = [];

        if (lastMessageContent.content) {
            currentMessageParts.push(lastMessageContent.content); // For text, we can just pass the string to sendMessage
        }

        // Wait, sendMessage expects (string | Part)[]
        // If we have image, we need to construct Part objects manually for everything, including text

        const finalParts: any[] = [];
        if (lastMessageContent.content) {
            finalParts.push(lastMessageContent.content);
        }

        if (lastMessageContent.image) {
            const matches = lastMessageContent.image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                finalParts.push({
                    inlineData: {
                        mimeType: matches[1],
                        data: matches[2]
                    }
                });
            }
        }

        const chat = model.startChat({
            history: history,
        });

        const result = await chat.sendMessage(finalParts);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ role: 'assistant', content: text });

    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
    }
}
