"use client";

import { ActiveFolder, ActiveTab } from "@/types";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeFolder: ActiveFolder;
  setActiveFolder: (folder: ActiveFolder) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  showTodoView: boolean;
  setShowTodoView: (show: boolean) => void;
  showWeeklyAnalysis: boolean;
  setShowWeeklyAnalysis: (show: boolean) => void;
  showFocusMode: boolean;
  setShowFocusMode: (show: boolean) => void;
  setShowCompose: (show: boolean) => void;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeFolder,
  setActiveFolder,
  activeTab,
  setActiveTab,
  showTodoView,
  setShowTodoView,
  showWeeklyAnalysis,
  setShowWeeklyAnalysis,
  showFocusMode,
  setShowFocusMode,
  setShowCompose,
}: SidebarProps) {
  if (!sidebarOpen) return null;

  const handleFolderClick = (key: string) => {
    if (key === "todo") {
      setShowTodoView(true);
      setShowWeeklyAnalysis(false);
      setShowFocusMode(false);
      setActiveFolder("inbox");
    } else if (key === "weekly") {
      setShowWeeklyAnalysis(true);
      setShowTodoView(false);
      setShowFocusMode(false);
      setActiveFolder("inbox");
    } else if (key === "focus") {
      setShowFocusMode(true);
      setShowTodoView(false);
      setShowWeeklyAnalysis(false);
      setActiveFolder("inbox");
    } else {
      setShowTodoView(false);
      setShowWeeklyAnalysis(false);
      setShowFocusMode(false);
      setActiveFolder(key as ActiveFolder);
    }
    setSidebarOpen(false);
  };

  const isActive = (key: string) => {
    if (key === "todo") return showTodoView;
    if (key === "weekly") return showWeeklyAnalysis;
    if (key === "focus") return showFocusMode;
    return (
      key === activeFolder &&
      !showTodoView &&
      !showWeeklyAnalysis &&
      !showFocusMode
    );
  };

  const folders = [
    { key: "inbox", label: "📥 Inbox" },
    { key: "starred", label: "⭐ Starred" },
    { key: "todo", label: "✅ To-Do List" },
    { key: "archive", label: "📦 Archive" },
    { key: "focus", label: "🎯 Focus Mode" },
    { key: "weekly", label: "📊 Weekly Analysis" },
  ];

  const otherFolders = [
    { key: "snoozed", label: "⏳ Snoozed" },
    { key: "done", label: "✅ Done" },
  ];

  const categories: ActiveTab[] = [
    "All Mails",
    "Do Now",
    "Waiting",
    "Needs Decision",
    "Low Energy",
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 80,
        left: 0,
        width: 240,
        height: "calc(100vh - 80px)",
        background: "white",
        borderRight: "1px solid #E5E7EB",
        padding: 16,
        zIndex: 9999,
        boxShadow: "4px 0px 20px rgba(0,0,0,0.15)",
        overflowY: "auto",
      }}
    >
      <h3
        style={{
          fontSize: 14,
          marginBottom: 12,
          fontWeight: 700,
          color: "#111827",
        }}
      >
        📌 Dashboard
      </h3>

      {/* Compose Button */}
      <button
        onClick={() => {
          setShowCompose(true);
          setSidebarOpen(false);
        }}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 12,
          border: "none",
          marginTop: 14,
          background: "linear-gradient(135deg,#2563EB,#0EA5E9)",
          color: "white",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        ✍ Compose Mail
      </button>

      {/* Drafts Button */}
      <button
        onClick={() => {
          setActiveFolder("drafts");
          setSidebarOpen(false);
        }}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 12,
          border: "1px solid #E5E7EB",
          marginTop: 10,
          background: "white",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        📝 Drafts
      </button>

      {/* Main Folders */}
      {folders.map((item) => (
        <div
          key={item.key}
          onClick={() => handleFolderClick(item.key)}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
            marginBottom: 8,
            background: isActive(item.key) ? "#DBEAFE" : "transparent",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            if (!isActive(item.key)) {
              e.currentTarget.style.background = "#F3F4F6";
            }
          }}
          onMouseOut={(e) => {
            if (!isActive(item.key)) {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          {item.label}
        </div>
      ))}

      {/* Other Folders */}
      {otherFolders.map((item) => (
        <div
          key={item.key}
          onClick={() => {
            setActiveFolder(item.key as ActiveFolder);
            setSidebarOpen(false);
          }}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
            marginBottom: 8,
            background: activeFolder === item.key ? "#DBEAFE" : "transparent",
          }}
        >
          {item.label}
        </div>
      ))}

      {/* Categories Section */}
      <hr style={{ margin: "16px 0", borderColor: "#E5E7EB" }} />

      <div style={{ marginTop: 10 }}>
        <h3
          style={{
            fontSize: 13,
            marginBottom: 10,
            fontWeight: 700,
            color: "#111827",
          }}
        >
          📌 Categories
        </h3>

        {categories.map((tab) => (
          <div
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSidebarOpen(false);
            }}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 600,
              marginBottom: 8,
              background: activeTab === tab ? "#EDE9FE" : "transparent",
              color: activeTab === tab ? "#6D28D9" : "#111827",
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Close Button */}
      <button
        onClick={() => setSidebarOpen(false)}
        style={{
          marginTop: 20,
          width: "100%",
          padding: "10px",
          borderRadius: 10,
          border: "none",
          background: "#EF4444",
          color: "white",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        Close Menu
      </button>
    </div>
  );
}
