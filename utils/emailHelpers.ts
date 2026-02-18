import { Email } from "@/types";

export function extractEmail(raw: string): string {
  if (!raw) return "";

  // Case 1: Name <email>
  const match = raw.match(/<(.+?)>/);
  if (match) return match[1];

  // Case 2: Direct email
  if (raw.includes("@")) return raw.trim();

  return "";
}

export function getInitials(email: string): string {
  if (!email) return "?";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function extractFirstLink(text: string): string | null {
  if (!text) return null;

  const hrefMatch = text.match(/href=["']([^"']+)["']/i);
  if (hrefMatch && hrefMatch[1] && hrefMatch[1].startsWith("http")) {
    let link = hrefMatch[1];
    const lower = link.toLowerCase();
    if (
      !lower.includes("unsubscribe") &&
      !lower.includes("tracking") &&
      !lower.includes("email-alert") &&
      !lower.includes("manage") &&
      link.length < 500
    ) {
      link = link.replace(/&amp;/g, "&");
      return link;
    }
  }

  const cleanText = text.replace(/<[^>]*>/g, " ");
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
  const matches = cleanText.match(urlRegex);

  if (!matches || matches.length === 0) return null;

  const validLinks = matches.filter((url) => {
    const lower = url.toLowerCase();
    return (
      !lower.includes("unsubscribe") &&
      !lower.includes("tracking") &&
      !lower.includes("pixel") &&
      !lower.includes("beacon") &&
      !lower.includes("email.") &&
      !lower.includes("manage") &&
      !lower.includes("email-alert") &&
      url.length < 500
    );
  });

  if (validLinks.length === 0) return null;

  let link = validLinks[0];
  link = link.replace(/[.,;:)\]]+$/, "");
  link = link.replace(/&amp;/g, "&");

  return link;
}

export function cleanEmailBody(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/unsubscribe[\s\S]*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getPriorityColor(score: number): string {
  if (score >= 80) return "#ff4d4d";
  if (score >= 50) return "#ffc107";
  return "#4caf50";
}

export function getCategoryColor(category: string): string {
  if (category === "Do Now") return "#EF4444";
  if (category === "Needs Decision") return "#8B5CF6";
  if (category === "Waiting") return "#3B82F6";
  if (category === "Low Energy") return "#10B981";
  return "#6B7280";
}

export function getUrgencyLevel(deadlineText: string | null): string {
  if (!deadlineText) return "None";
  if (deadlineText === "Today") return "🔥 Very High";
  if (deadlineText === "Tomorrow") return "⚠️ High";
  return "📌 Medium";
}

export function isFirstTimeSender(mail: Email, allEmails: Email[]): boolean {
  const sender = mail.from;
  const count = allEmails.filter((m) => m.from === sender).length;
  return count === 1;
}
