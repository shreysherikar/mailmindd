"use client";

import { useEffect } from "react";

interface ErrorToastProps {
  message: string;
  type?: "error" | "success" | "info" | "warning";
  onClose: () => void;
  duration?: number;
}

export default function ErrorToast({
  message,
  type = "error",
  onClose,
  duration = 5000,
}: ErrorToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    error: {
      bg: "#FEE2E2",
      border: "#EF4444",
      text: "#991B1B",
      icon: "❌",
    },
    success: {
      bg: "#D1FAE5",
      border: "#10B981",
      text: "#065F46",
      icon: "✅",
    },
    info: {
      bg: "#DBEAFE",
      border: "#3B82F6",
      text: "#1E40AF",
      icon: "ℹ️",
    },
    warning: {
      bg: "#FEF3C7",
      border: "#F59E0B",
      text: "#92400E",
      icon: "⚠️",
    },
  };

  const style = colors[type];

  return (
    <div
      style={{
        position: "fixed",
        top: 100,
        right: 24,
        zIndex: 999999,
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: 16,
        padding: "16px 20px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        maxWidth: 400,
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 24 }}>{style.icon}</span>
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              color: style.text,
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: style.text,
            padding: 0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}
