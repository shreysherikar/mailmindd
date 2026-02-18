import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { subject, snippet } = await req.json();

    // ✅ Check if API key is configured
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY not configured, returning subject as fallback");
      return NextResponse.json({
        title: subject?.substring(0, 45) || "Read email",
      });
    }

    // ✅ Trim input to avoid token overload
    const safeSnippet = (snippet || "").slice(0, 500);

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a task extraction assistant. Generate a SHORT, actionable to-do title from emails.

CRITICAL RULES:
- Maximum 4-5 words
- Start with ACTION VERB (Submit, Pay, Review, Attend, Sign, Confirm, Apply, Schedule)
- Include SPECIFIC DETAILS (deadline, amount, company name)
- Remove ALL promotional language
- Focus ONLY on what user must DO
- If no clear action, say "Review: [topic]"

EXAMPLES:
"Submit Assignment 4 by 23:59 tonight" → "Submit Assignment 4 today"
"Interview at Google tomorrow at 3pm" → "Interview: Google 3pm"
"Payment of $500 due by Friday" → "Pay $500 by Friday"
"Please confirm your attendance" → "Confirm attendance"
"Sign and return contract" → "Sign contract"
"Review pull request #123" → "Review PR #123"
"Meeting scheduled for 3pm" → "Meeting at 3pm"
"Apply before Feb 28" → "Apply by Feb 28"
"URGENT: Deadline today" → "Urgent: Deadline today"

BAD EXAMPLES (Don't do this):
❌ "No action required"
❌ "Read and respond"
❌ "Check this out"
❌ "Register for GTC" (too vague)
❌ "Apply 50% Pro discount" (promotional)`,
        },
        {
          role: "user",
          content: `Subject: ${subject}\nContent: ${safeSnippet}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 25,
    });

    const title = chatCompletion.choices[0].message.content?.trim() || subject;

    // ✅ Ensure title is not too long
    const finalTitle = title.length > 50 ? title.substring(0, 47) + "..." : title;

    return NextResponse.json({ title: finalTitle });
  } catch (error: any) {
    console.error("TODO TITLE ERROR:", error);

    // ✅ Handle rate limits gracefully
    if (error?.status === 429) {
      const { subject } = await req.json();
      return NextResponse.json({
        title: subject?.substring(0, 45) || "Read email",
        rateLimited: true,
      });
    }

    // ✅ Fallback to subject if AI fails
    try {
      const body = await req.json();
      return NextResponse.json({
        title: body.subject?.substring(0, 45) || "Read email",
      });
    } catch {
      return NextResponse.json({
        title: "Read email",
      });
    }
  }
}
