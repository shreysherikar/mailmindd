"use client";

import { Email } from "@/types";

interface FocusModeProps {
  todaysTasks: Email[];
  getPriorityScore: (mail: Email) => number;
  getPriorityColor: (score: number) => string;
  extractDeadline: (text: string, mailId?: string) => string | null;
  openMailAndGenerateAI: (id: string, mail: Email) => void;
  markDone: () => void;
  selectedMail: Email | null;
}

export default function FocusMode({
  todaysTasks,
  getPriorityScore,
  getPriorityColor,
  extractDeadline,
  openMailAndGenerateAI,
  markDone,
  selectedMail,
}: FocusModeProps) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        background: "#F8FAFF",
        padding: "32px 48px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            background: "linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 8,
          }}
        >
          🎯 Focus Mode
        </h1>
        <p style={{ fontSize: 16, color: "#6B7280" }}>
          Today's urgent tasks that need your attention
        </p>
      </div>

      {/* Task Count */}
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          border: "1px solid #E5E7EB",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 700, color: "#EF4444" }}>
          {todaysTasks.length}
        </div>
        <div style={{ fontSize: 16, color: "#6B7280", marginTop: 8 }}>
          {todaysTasks.length === 1 ? "task" : "tasks"} for today
        </div>
      </div>

      {/* Tasks List */}
      {todaysTasks.length === 0 ? (
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: 48,
            textAlign: "center",
            border: "1px solid #E5E7EB",
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
            All Clear!
          </h3>
          <p style={{ fontSize: 16, color: "#6B7280" }}>
            No urgent tasks for today. Great job staying on top of things!
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {todaysTasks.map((mail, index) => {
            const score = getPriorityScore(mail);
            const text = (mail.subject || "") + " " + (mail.snippet || "");
            const deadline = extractDeadline(text, mail.id);

            return (
              <div
                key={mail.id}
                onClick={() => openMailAndGenerateAI(mail.id, mail)}
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 24,
                  border:
                    selectedMail?.id === mail.id
                      ? "3px solid #6D28D9"
                      : "1px solid #E5E7EB",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow:
                    selectedMail?.id === mail.id
                      ? "0 8px 24px rgba(109, 40, 217, 0.2)"
                      : "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 20,
                  }}
                >
                  {/* Task Number */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #EF4444, #F59E0B)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 20,
                      color: "white",
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#111827",
                            marginBottom: 4,
                          }}
                        >
                          {mail.subject || "No Subject"}
                        </h3>
                        <p style={{ fontSize: 14, color: "#6B7280" }}>
                          From: {mail.from?.split("<")[0] || "Unknown"}
                        </p>
                      </div>

                      {/* Priority Badge */}
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          padding: "8px 16px",
                          borderRadius: 999,
                          background: getPriorityColor(score),
                          color: "white",
                        }}
                      >
                        ⚡ {score}
                      </span>
                    </div>

                    {/* Snippet */}
                    <p
                      style={{
                        fontSize: 14,
                        color: "#374151",
                        marginBottom: 16,
                        lineHeight: 1.6,
                      }}
                    >
                      {mail.snippet}
                    </p>

                    {/* Tags */}
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {deadline && (
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            padding: "6px 14px",
                            borderRadius: 999,
                            background:
                              deadline === "Today"
                                ? "#FEE2E2"
                                : "#FEF3C7",
                            color:
                              deadline === "Today" ? "#991B1B" : "#92400E",
                          }}
                        >
                          📅 {deadline}
                        </span>
                      )}

                      {selectedMail?.id === mail.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markDone();
                          }}
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            padding: "6px 14px",
                            borderRadius: 999,
                            background: "#10B981",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          ✅ Mark Done
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
