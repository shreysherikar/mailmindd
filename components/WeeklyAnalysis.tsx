"use client";

import { WeeklyAnalysis as WeeklyAnalysisType } from "@/types";

interface WeeklyAnalysisProps {
  analysis: WeeklyAnalysisType;
}

export default function WeeklyAnalysis({ analysis }: WeeklyAnalysisProps) {
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
            background: "linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 8,
          }}
        >
          📊 Weekly Analysis
        </h1>
        <p style={{ fontSize: 16, color: "#6B7280" }}>
          Your email insights for the last 7 days
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
          marginBottom: 32,
        }}
      >
        {/* Emails Received */}
        <div
          style={{
            background: "linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)",
            borderRadius: 20,
            padding: 28,
            color: "white",
            boxShadow: "0 8px 24px rgba(109, 40, 217, 0.25)",
          }}
        >
          <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 12 }}>
            📧 Emails Received
          </div>
          <div style={{ fontSize: 48, fontWeight: 700 }}>
            {analysis.weekEmails}
          </div>
          <div style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>
            Last 7 days
          </div>
        </div>

        {/* Tasks Completed */}
        <div
          style={{
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            borderRadius: 20,
            padding: 28,
            color: "white",
            boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)",
          }}
        >
          <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 12 }}>
            ✅ Tasks Completed
          </div>
          <div style={{ fontSize: 48, fontWeight: 700 }}>
            {analysis.tasksCompleted}
          </div>
          <div style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>
            From archive
          </div>
        </div>

        {/* Urgent Emails */}
        <div
          style={{
            background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
            borderRadius: 20,
            padding: 28,
            color: "white",
            boxShadow: "0 8px 24px rgba(239, 68, 68, 0.25)",
          }}
        >
          <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 12 }}>
            🔥 Urgent Emails
          </div>
          <div style={{ fontSize: 48, fontWeight: 700 }}>
            {analysis.urgentCount}
          </div>
          <div style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>
            High priority
          </div>
        </div>

        {/* Late Night */}
        <div
          style={{
            background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
            borderRadius: 20,
            padding: 28,
            color: "white",
            boxShadow: "0 8px 24px rgba(139, 92, 246, 0.25)",
          }}
        >
          <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 12 }}>
            🌙 Late Night Emails
          </div>
          <div style={{ fontSize: 48, fontWeight: 700 }}>
            {analysis.lateNightCount}
          </div>
          <div style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>
            After 10 PM
          </div>
        </div>
      </div>

      {/* Detailed Analysis Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 24,
          marginBottom: 32,
        }}
      >
        {/* Stress Level */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: 32,
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 20,
              color: "#111827",
            }}
          >
            😰 Stress Level
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: analysis.stressColor,
              }}
            >
              {analysis.stressLevel}
            </span>
            <span style={{ fontSize: 28, fontWeight: 600, color: "#111827" }}>
              {analysis.stressScore}/100
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 16,
              background: "#E5E7EB",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${analysis.stressScore}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${analysis.stressColor}, ${analysis.stressColor}dd)`,
                borderRadius: 8,
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <p
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginTop: 16,
              lineHeight: 1.6,
            }}
          >
            Based on urgent keywords, deadlines, and email timing patterns
          </p>
        </div>

        {/* Burnout Risk */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: 32,
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 20,
              color: "#111827",
            }}
          >
            🔥 Burnout Risk
          </h3>
          <div
            style={{
              display: "inline-block",
              padding: "16px 32px",
              borderRadius: 16,
              background: `${analysis.burnoutColor}15`,
              border: `3px solid ${analysis.burnoutColor}`,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: analysis.burnoutColor,
              }}
            >
              {analysis.burnoutRisk}
            </span>
          </div>
          <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>
            {analysis.lateNightCount > 5
              ? `⚠️ ${analysis.lateNightCount} late-night emails detected. Consider setting email boundaries after 9 PM.`
              : "✅ Good work-life balance maintained this week! Keep it up."}
          </p>
        </div>
      </div>

      {/* Productivity Rate */}
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 32,
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          marginBottom: 32,
        }}
      >
        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 20,
            color: "#111827",
          }}
        >
          📈 Productivity Rate
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 48, fontWeight: 700, color: "#6D28D9" }}>
            {analysis.productivityRate}%
          </span>
          <span style={{ fontSize: 18, color: "#6B7280" }}>
            {analysis.tasksCompleted} completed out of {analysis.weekEmails}{" "}
            received
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: 20,
            background: "#E5E7EB",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${analysis.productivityRate}%`,
              height: "100%",
              background: "linear-gradient(90deg, #6D28D9, #2563EB)",
              borderRadius: 10,
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <p
          style={{
            fontSize: 14,
            color: "#6B7280",
            marginTop: 16,
            lineHeight: 1.6,
          }}
        >
          {analysis.productivityRate >= 70
            ? "🎉 Excellent! You're staying on top of your emails."
            : analysis.productivityRate >= 40
            ? "👍 Good progress. Keep completing those tasks!"
            : "💪 Consider focusing on pending tasks to improve your productivity."}
        </p>
      </div>

      {/* Recommendations */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(109, 40, 217, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)",
          borderRadius: 20,
          padding: 32,
          border: "1px solid #E5E7EB",
        }}
      >
        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 20,
            color: "#111827",
          }}
        >
          💡 Personalized Recommendations
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
          }}
        >
          {analysis.recommendations.map((rec, idx) => (
            <div
              key={idx}
              style={{
                background: "white",
                padding: 20,
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 600,
                color: "#374151",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {rec}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
