import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
    try {
        const { subject, snippet, from } = await req.json();

        const chat = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: `You are a spam detection AI. Analyze emails and determine if they are spam, promotional, or legitimate.

Consider:
- Suspicious sender patterns
- Promotional language
- Phishing indicators
- Urgency manipulation
- Too-good-to-be-true offers
- Legitimate business communications

Respond ONLY with valid JSON.`,
                },
                {
                    role: "user",
                    content: `
From: ${from}
Subject: ${subject}
Content: ${snippet}

Respond ONLY as JSON:
{
  "isSpam": boolean,
  "confidence": number (0-100),
  "reason": "brief explanation"
}`,
                },
            ],
        });

        const raw = chat.choices[0]?.message?.content || "";
        const match = raw.match(/\{[\s\S]*\}/);

        if (!match) {
            return NextResponse.json({
                result: { isSpam: false, confidence: 50, reason: "Unable to analyze" },
            });
        }

        const parsed = JSON.parse(match[0]);
        return NextResponse.json({ result: parsed });

    } catch (err: any) {
        console.log("Spam Detection API Error:", err.message);
        return NextResponse.json(
            { result: { isSpam: false, confidence: 0, reason: "Error" } },
            { status: 500 }
        );
    }
}
