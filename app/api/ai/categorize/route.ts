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
                    content: `You are an email categorization AI. Categorize emails into exactly one of these categories:
- "Do Now": Urgent, time-sensitive, requires immediate action
- "Needs Decision": Requires your input, approval, or choice
- "Waiting": Updates, newsletters, FYI items that can wait
- "Low Energy": Low priority, can be handled later

Respond ONLY with valid JSON.`,
                },
                {
                    role: "user",
                    content: `
Email Subject: ${subject}
Email Snippet: ${snippet}

Respond ONLY as JSON:
{
  "category": "Do Now" | "Needs Decision" | "Waiting" | "Low Energy",
  "confidence": number (0-100)
}`,
                },
            ],
        });

        const raw = chat.choices[0]?.message?.content || "";
        const match = raw.match(/\{[\s\S]*\}/);

        if (!match) {
            return NextResponse.json({
                result: { category: "Low Energy", confidence: 50 },
            });
        }

        const parsed = JSON.parse(match[0]);
        return NextResponse.json({ result: parsed });

    } catch (err: any) {
        console.log("Categorize API Error:", err.message);
        return NextResponse.json(
            { result: { category: "Low Energy", confidence: 0 } },
            { status: 500 }
        );
    }
}
