"use client";

import { Email } from "@/types";
import { useState } from "react";
import ErrorToast from "./ErrorToast";

interface EmailDetailProps {
  selectedMail: Email | null;
  aiSummary: string;
  aiReason: string;
  loadingAI: boolean;
  generateSummary: (mail: Email) => void;
  generateExplanation: (mail: Email) => void;
  toggleStar: () => void;
  snoozeMail: () => void;
  markDone: () => void;
  deleteSelectedMail: () => void;
  starredIds: string[];
  extractFirstLink: (text: string) => string | null;
  extractEmail: (raw: string) => string;
  getInitials: (email: string) => string;
}

export default function EmailDetail({
  selectedMail,
  aiSummary,
  aiReason,
  loadingAI,
  generateSummary,
  generateExplanation,
  toggleStar,
  snoozeMail,
  markDone,
  deleteSelectedMail,
  starredIds,
  extractFirstLink,
  extractEmail,
  getInitials,
}: EmailDetailProps) {
  const [aiReply, setAiReply] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [editableReply, setEditableReply] = useState("");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success" | "info" | "warning";
  } | null>(null);

  if (!selectedMail) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F9FAFB",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#6B7280" }}>
            Select an email to view
          </h3>
        </div>
      </div>
    );
  }

  const generateReply = async () => {
    setLoadingReply(true);
    setAiReply("");

    try {
      const res = await fetch("/api/ai/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedMail.subject,
          snippet: selectedMail.snippet || selectedMail.body || "",
        }),
      });

      const data = await res.json();

      if (data.error) {
        setToast({
          message: data.error,
          type: "error",
        });
        setLoadingReply(false);
        return;
      }

      setAiReply(data.reply);
      setEditableReply(data.reply);
      setToast({
        message: "Reply generated successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        message: "Failed to generate reply. Please try again.",
        type: "error",
      });
    }

    setLoadingReply(false);
  };

  const sendReply = async () => {
    if (!editableReply.trim()) {
      setToast({
        message: "Reply cannot be empty",
        type: "error",
      });
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/gmail/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: selectedMail.id,
          replyText: editableReply,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setToast({
          message: "Reply sent successfully!",
          type: "success",
        });
        setAiReply("");
        setEditableReply("");
      } else {
        setToast({
          message: data.error || "Failed to send reply",
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        message: "Failed to send reply. Please try again.",
        type: "error",
      });
    }

    setSending(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editableReply);
    setCopied(true);
    setToast({
      message: "Reply copied to clipboard!",
      type: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const senderEmail = extractEmail(selectedMail.from);
  const initials = getInitials(senderEmail);
  const link = extractFirstLink(selectedMail.body || "");

  return (
    <>
      {toast && (
        <ErrorToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #E5E7EB",
          background: "#F9FAFB",
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 12,
            color: "#111827",
          }}
        >
          {selectedMail.subject || "No Subject"}
        </h2>

        {/* Sender Info */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#6D28D9,#2563EB)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 16,
              color: "white",
            }}
          >
            {initials}
          </div>

          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
              {selectedMail.from?.split("<")[0] || "Unknown Sender"}
            </p>
            <p style={{ fontSize: 13, color: "#6B7280" }}>{senderEmail}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={toggleStar}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              background: starredIds.includes(selectedMail.id)
                ? "#FEF3C7"
                : "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {starredIds.includes(selectedMail.id) ? "⭐ Starred" : "☆ Star"}
          </button>

          <button
            onClick={snoozeMail}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ⏳ Snooze
          </button>

          <button
            onClick={markDone}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ✅ Done
          </button>

          <button
            onClick={deleteSelectedMail}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            🗑 Delete
          </button>
        </div>
      </div>

      {/* Email Body */}
      <div style={{ padding: 24, flex: 1 }}>
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: "#374151",
            marginBottom: 24,
          }}
          dangerouslySetInnerHTML={{
            __html: selectedMail.body || selectedMail.snippet || "",
          }}
        />

        {/* Link */}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 20px",
              borderRadius: 12,
              background: "linear-gradient(135deg,#2563EB,#0EA5E9)",
              color: "white",
              fontWeight: 700,
              textDecoration: "none",
              marginBottom: 24,
            }}
          >
            🔗 Open Link
          </a>
        )}

        {/* AI Actions */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => generateSummary(selectedMail)}
            disabled={loadingAI}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: loadingAI ? "#9CA3AF" : "#6D28D9",
              color: "white",
              fontWeight: 600,
              cursor: loadingAI ? "not-allowed" : "pointer",
            }}
          >
            {loadingAI ? "Loading..." : "📝 Summarize"}
          </button>

          <button
            onClick={() => generateExplanation(selectedMail)}
            disabled={loadingAI}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: loadingAI ? "#9CA3AF" : "#2563EB",
              color: "white",
              fontWeight: 600,
              cursor: loadingAI ? "not-allowed" : "pointer",
            }}
          >
            {loadingAI ? "Loading..." : "💡 Explain"}
          </button>

          <button
            onClick={generateReply}
            disabled={loadingReply}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: loadingReply ? "#9CA3AF" : "#10B981",
              color: "white",
              fontWeight: 600,
              cursor: loadingReply ? "not-allowed" : "pointer",
            }}
          >
            {loadingReply ? "Generating..." : "✍ Generate Reply"}
          </button>
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <div
            style={{
              background: "#EEF2FF",
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
              border: "1px solid #C7D2FE",
            }}
          >
            <h4 style={{ fontWeight: 700, marginBottom: 8, color: "#4338CA" }}>
              📝 AI Summary
            </h4>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#374151" }}>
              {aiSummary}
            </p>
          </div>
        )}

        {/* AI Explanation */}
        {aiReason && (
          <div
            style={{
              background: "#DBEAFE",
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
              border: "1px solid #93C5FD",
            }}
          >
            <h4 style={{ fontWeight: 700, marginBottom: 8, color: "#1E40AF" }}>
              💡 Why This Matters
            </h4>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#374151" }}>
              {aiReason}
            </p>
          </div>
        )}

        {/* AI Reply */}
        {aiReply && (
          <div
            style={{
              background: "#D1FAE5",
              padding: 16,
              borderRadius: 12,
              border: "1px solid #6EE7B7",
            }}
          >
            <h4 style={{ fontWeight: 700, marginBottom: 12, color: "#065F46" }}>
              ✍ AI Generated Reply
            </h4>

            <textarea
              value={editableReply}
              onChange={(e) => setEditableReply(e.target.value)}
              rows={8}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #6EE7B7",
                fontSize: 14,
                marginBottom: 12,
                resize: "vertical",
              }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={sendReply}
                disabled={sending}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: sending ? "#9CA3AF" : "#10B981",
                  color: "white",
                  fontWeight: 700,
                  cursor: sending ? "not-allowed" : "pointer",
                }}
              >
                {sending ? "Sending..." : "📤 Send Reply"}
              </button>

              <button
                onClick={copyToClipboard}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1px solid #6EE7B7",
                  background: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
