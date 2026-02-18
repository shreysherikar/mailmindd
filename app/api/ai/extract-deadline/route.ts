import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
    try {
        const { subject, snippet } = await req.json();

        const chat = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: `You are a deadline extraction AI. Extract deadlines from emails and normalize them.

Today's date: ${new Date().toLocaleDateString()}

Return deadlines in one of these formats:
- "Today" - if due today
- "Tomorrow" - if due tomorrow  
- "DD MMM" - for specific dates (e.g., "21 Feb")
- "This Week" - if within 7 days
- null - if no deadline found

Respond ONLY with valid JSON.`,
                },
                {
                    role: "user",
                    content: `
Subject: ${subject}
Content: ${snippet}

Respond ONLY as JSON:
{
  "deadline": string | null,
  "urgency": "Very High" | "High" | "Medium" | "Low" | "None",
  "confidence": number (0-100)
}`,
                },
            ],
        });

        const raw = chat.choices[0]?.message?.content || "";
        const match = raw.match(/\{[\s\S]*\}/);

        if (!match) {
            return NextResponse.json({
                result: { deadline: null, urgency: "None", confidence: 0 },
            });
        }

        const parsed = JSON.parse(match[0]);
        return NextResponse.json({ result: parsed });

    } catch (err: any) {
        console.log("Deadline Extraction API Error:", err.message);
        return NextResponse.json(
            { result: { deadline: null, urgency: "None", confidence: 0 } },
            { status: 500 }
        );
    }
}
