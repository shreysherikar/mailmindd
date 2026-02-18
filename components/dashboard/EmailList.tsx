"use client";

import { Email, SortBy, SortOrder, DeadlineFilter, ActiveTab } from "@/types";

interface EmailListProps {
  emails: Email[];
  filteredEmails: Email[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedMail: Email | null;
  openMailAndGenerateAI: (id: string, mail: Email) => void;
  generateAIPriorityForMail: (mail: Email) => void;
  getPriorityScore: (mail: Email) => number;
  getPriorityColor: (score: number) => string;
  isSpamEmail: (mail: Email) => boolean;
  isFirstTimeSender: (mail: Email, allEmails: Email[]) => boolean;
  nextPageToken: string | null;
  loadEmails: () => void;
  loading: boolean;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  deadlineFilter: DeadlineFilter;
  setDeadlineFilter: (filter: DeadlineFilter) => void;
  extractDeadline: (text: string, mailId?: string) => string | null;
}

export default function EmailList({
  emails,
  filteredEmails,
  activeTab,
  setActiveTab,
  selectedMail,
  openMailAndGenerateAI,
  generateAIPriorityForMail,
  getPriorityScore,
  getPriorityColor,
  isSpamEmail,
  isFirstTimeSender,
  nextPageToken,
  loadEmails,
  loading,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  deadlineFilter,
  setDeadlineFilter,
  extractDeadline,
}: EmailListProps) {

    return (
        <div
            style={{
                width: "35%",
                borderRight: "1px solid #E5E7EB",
                overflowY: "auto",
                background: "white",
            }}
        >
            {/* Tabs */}
            <div
                style={{
                    padding: 15,
                    borderBottom: "1px solid #E5E7EB",
                    background: "#F8FAFF",
                }}
            >
                {/* Category Tabs */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {["All Mails", "Do Now", "Waiting", "Needs Decision", "Low Energy"].map(
                        (tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: 10,
                                    border: "none",
                                    cursor: "pointer",
                                    background:
                                        activeTab === tab
                                            ? "linear-gradient(135deg,#6D28D9,#2563EB)"
                                            : "#E5E7EB",
                                    color: activeTab === tab ? "white" : "#111827",
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}
                            >
                                {tab}
                            </button>
                        )
                    )}
                </div>
                
                {/* Sort By Tabs */}
                <div style={{ marginBottom: 12, paddingTop: 12, borderTop: "1px solid #E5E7EB" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        ⚡ Sort By
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {[
                            { value: "none", label: "None", icon: "📋" },
                            { value: "priority", label: "Priority", icon: "⚡" },
                            { value: "deadline", label: "Deadline", icon: "📅" },
                            { value: "date", label: "Date", icon: "🕒" },
                            { value: "sender", label: "Sender", icon: "👤" }
                        ].map((sort) => (
                            <button
                                key={sort.value}
                                onClick={() => setSortBy(sort.value as any)}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    border: sortBy === sort.value ? "2px solid #6D28D9" : "1px solid #E5E7EB",
                                    cursor: "pointer",
                                    background: sortBy === sort.value ? "#EEF2FF" : "white",
                                    color: sortBy === sort.value ? "#6D28D9" : "#6B7280",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {sort.icon} {sort.label}
                            </button>
                        ))}
                        
                        {/* Sort Order Toggle - Only show when sorting is active */}
                        {sortBy !== "none" && (
                            <button
                                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    border: "2px solid #10B981",
                                    background: "#ECFDF5",
                                    color: "#10B981",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    marginLeft: 4,
                                }}
                                title={sortOrder === "desc" ? "Descending" : "Ascending"}
                            >
                                {sortOrder === "desc" ? "↓ High→Low" : "↑ Low→High"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter By Deadline Tabs */}
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        🔍 Filter By Deadline
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {[
                            { value: "all", label: "All Emails", icon: "📧" },
                            { value: "today", label: "Today", icon: "🔥" },
                            { value: "tomorrow", label: "Tomorrow", icon: "⚠️" },
                            { value: "week", label: "This Week", icon: "📅" },
                            { value: "overdue", label: "Overdue", icon: "⏰" }
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setDeadlineFilter(filter.value as any)}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    border: deadlineFilter === filter.value ? "2px solid #F59E0B" : "1px solid #E5E7EB",
                                    cursor: "pointer",
                                    background: deadlineFilter === filter.value ? "#FEF3C7" : "white",
                                    color: deadlineFilter === filter.value ? "#92400E" : "#6B7280",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {filter.icon} {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Active Indicator */}
                {(sortBy !== "none" || deadlineFilter !== "all") && (
                    <div style={{ 
                        marginTop: 12, 
                        padding: "8px 12px", 
                        background: "linear-gradient(135deg, rgba(109, 40, 217, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)",
                        borderRadius: 10,
                        fontSize: 11,
                        color: "#6D28D9",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "space-between",
                        border: "1px solid rgba(109, 40, 217, 0.2)"
                    }}>
                        <span>
                            ✨ Active: 
                            {sortBy !== "none" && ` Sorted by ${sortBy} (${sortOrder === "desc" ? "High→Low" : "Low→High"})`}
                            {sortBy !== "none" && deadlineFilter !== "all" && " • "}
                            {deadlineFilter !== "all" && ` Showing ${deadlineFilter} emails`}
                        </span>
                        <button
                            onClick={() => {
                                setSortBy("none");
                                setDeadlineFilter("all");
                            }}
                            style={{
                                background: "#6D28D9",
                                border: "none",
                                color: "white",
                                cursor: "pointer",
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "4px 10px",
                                borderRadius: 6,
                                transition: "all 0.2s ease"
                            }}
                        >
                            ✕ Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Email Items */}
            <div style={{ 
                padding: "10px 12px", 
                background: "#F3F4F6", 
                fontSize: 12, 
                fontWeight: 600, 
                color: "#6B7280",
                borderBottom: "1px solid #E5E7EB"
            }}>
                {filteredEmails.length} {filteredEmails.length === 1 ? "email" : "emails"}
                {sortBy !== "none" && ` • Sorted by ${sortBy}`}
            </div>
            
            {filteredEmails.map((mail: any, index: number) => {
                const score = getPriorityScore(mail);
                const text = (mail.subject || "") + " " + (mail.snippet || "");
                const deadline = extractDeadline(text, mail.id);

                return (
                    <div
                        key={mail.id + "_" + index}
                        onClick={() => {
                            openMailAndGenerateAI(mail.id, mail);
                            generateAIPriorityForMail(mail);
                        }}
                        style={{
                            margin: "10px",
                            padding: "14px 16px",
                            borderRadius: 18,
                            cursor: "pointer",
                            display: "flex",
                            gap: 14,
                            alignItems: "flex-start",
                            background:
                                selectedMail?.id === mail.id
                                    ? "rgba(99,102,241,0.12)"
                                    : "white",
                            boxShadow:
                                selectedMail?.id === mail.id
                                    ? "0 8px 20px rgba(99,102,241,0.25)"
                                    : "0 2px 10px rgba(0,0,0,0.06)",
                            transition: "all 0.25s ease",
                        }}
                    >
                        {/* Avatar */}
                        <div
                            style={{
                                width: 46,
                                height: 46,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg,#6D28D9,#2563EB)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: 16,
                                color: "white",
                                flexShrink: 0,
                            }}
                        >
                            {mail.from?.charAt(0)?.toUpperCase() || "M"}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                            {/* Sender */}
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#111827",
                                }}
                            >
                                {mail.from?.split("<")[0] || "Unknown Sender"}
                            </p>

                            {/* Subject */}
                            <h4
                                style={{
                                    margin: "4px 0",
                                    fontSize: 15,
                                    fontWeight: 800,
                                    color: "#1F2937",
                                }}
                            >
                                {mail.subject || "No Subject"}
                            </h4>

                            {/* Snippet */}
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 13,
                                    color: "#6B7280",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "250px",
                                }}
                            >
                                {mail.snippet}
                            </p>

                            {/* Tags */}
                            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        padding: "4px 10px",
                                        borderRadius: 999,
                                        background: getPriorityColor(score),
                                        color: "white",
                                    }}
                                >
                                    ⚡ {score}
                                </span>

                                {deadline && (
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            padding: "4px 10px",
                                            borderRadius: 999,
                                            background: deadline === "Today" 
                                                ? "#EF4444" 
                                                : deadline === "Tomorrow" 
                                                ? "#F59E0B" 
                                                : "#8B5CF6",
                                            color: "white",
                                        }}
                                    >
                                        📅 {deadline}
                                    </span>
                                )}

                                {isSpamEmail(mail) && (
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            padding: "4px 10px",
                                            borderRadius: 999,
                                            background: "#DC2626",
                                            color: "white",
                                        }}
                                    >
                                        🚫 Spam
                                    </span>
                                )}

                                {isFirstTimeSender(mail, emails) && (
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            padding: "4px 10px",
                                            borderRadius: 999,
                                            background: "#2563EB",
                                            color: "white",
                                        }}
                                    >
                                        🆕 New
                                    </span>
                                )}
                            </div>

                            {/* Meter */}
                            <div
                                style={{
                                    marginTop: 10,
                                    height: 6,
                                    width: "100%",
                                    borderRadius: 999,
                                    background: "#E5E7EB",
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${score}%`,
                                        borderRadius: 999,
                                        background: getPriorityColor(score),
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Load More */}
            {nextPageToken && (
                <button
                    onClick={loadEmails}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: 14,
                        background: loading ? "#E5E7EB" : "#2563EB",
                        color: "white",
                        border: "none",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    {loading ? "Loading..." : "Load More"}
                </button>
            )}
        </div>
    );
}
