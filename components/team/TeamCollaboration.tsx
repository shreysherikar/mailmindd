"use client";

import { useState } from "react";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  activeTasksCount: number;
  responseRate: number;
  overdueCount?: number;
};

type AssignedEmail = {
  id: string;
  emailId: string;
  emailSubject: string;
  emailFrom: string;
  assignedTo: string;
  assignedBy: string;
  deadline?: string;
  status: "assigned" | "in-progress" | "waiting-on-client" | "completed";
  notes: Array<{ text: string; author: string; timestamp: string }>;
  priority: number;
  createdAt: string;
  sharedInboxId?: string;
};

type SharedInbox = {
  id: string;
  name: string;
  emailIds: string[];
};

type Props = {
  teamMembers: TeamMember[];
  assignedEmails: AssignedEmail[];
  sharedInboxes: SharedInbox[];
  followUps: any[];
  metrics: any;
  onAssignEmail: (emailId: string, memberId: string, deadline?: string, notes?: string, sharedInboxId?: string) => void;
  onUpdateStatus: (assignmentId: string, status: string) => void;
  onAddNote: (assignmentId: string, note: string) => void;
  onAddMember: (email: string) => void;
  onCreateInbox: (name: string) => void;
};

export default function TeamCollaboration({
  teamMembers,
  assignedEmails,
  sharedInboxes,
  followUps,
  metrics,
  onAssignEmail,
  onUpdateStatus,
  onAddNote,
  onAddMember,
  onCreateInbox,
}: Props) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "assignments" | "followups" | "inboxes" | "members">("dashboard");
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedInbox, setSelectedInbox] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned": return "#3B82F6";
      case "in-progress": return "#F59E0B";
      case "waiting-on-client": return "#8B5CF6";
      case "completed": return "#10B981";
      default: return "#6B7280";
    }
  };

  const getWorkloadLevel = (count: number) => {
    if (count > 10) return { level: "Overloaded", color: "#EF4444" };
    if (count > 5) return { level: "High", color: "#F59E0B" };
    if (count > 2) return { level: "Medium", color: "#3B82F6" };
    return { level: "Low", color: "#10B981" };
  };

  const getAISuggestions = () => {
    const suggestions = [];
    
    // Check for overloaded members
    const overloaded = teamMembers.filter(m => m.activeTasksCount > 8);
    const underloaded = teamMembers.filter(m => m.activeTasksCount < 3);
    
    if (overloaded.length > 0 && underloaded.length > 0) {
      suggestions.push({
        type: "redistribute",
        message: `${overloaded[0].name} has ${overloaded[0].activeTasksCount} tasks. Consider reassigning to ${underloaded[0].name} (${underloaded[0].activeTasksCount} tasks)`,
        action: "Redistribute",
      });
    }
    
    // Check for overdue tasks
    const overdue = assignedEmails.filter(a => {
      if (!a.deadline || a.status === "completed") return false;
      return new Date(a.deadline) < new Date();
    });
    
    if (overdue.length > 0) {
      suggestions.push({
        type: "overdue",
        message: `${overdue.length} task(s) are overdue. Review and update status or reassign.`,
        action: "View Overdue",
      });
    }
    
    // Check for waiting-on-client tasks
    const waiting = assignedEmails.filter(a => a.status === "waiting-on-client");
    if (waiting.length > 3) {
      suggestions.push({
        type: "follow-up",
        message: `${waiting.length} tasks waiting on client. Consider sending follow-up reminders.`,
        action: "Send Reminders",
      });
    }
    
    return suggestions;
  };

  const filteredAssignments = assignedEmails.filter(a => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (selectedInbox && a.sharedInboxId !== selectedInbox) return false;
    return true;
  });

  return (
    <div style={{ padding: 20, background: "white", borderRadius: 18, minHeight: "70vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
          👥 Team Command Centre
        </h2>
        <p style={{ fontSize: 14, color: "#6B7280" }}>
          Shared email intelligence workspace for your team
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "2px solid #E5E7EB" }}>
        {[
          { id: "dashboard", label: "📊 Dashboard" },
          { id: "assignments", label: "📋 Assignments" },
          { id: "followups", label: "🔔 Follow-Ups" },
          { id: "inboxes", label: "📬 Shared Inboxes" },
          { id: "members", label: "👥 Team Members" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "12px 20px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 14,
              color: activeTab === tab.id ? "#2563EB" : "#6B7280",
              borderBottom: activeTab === tab.id ? "3px solid #2563EB" : "none",
              marginBottom: -2,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div>
          {/* Metrics Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            <MetricCard
              title="Total Pending"
              value={metrics.totalPending || 0}
              icon="📧"
              color="#3B82F6"
            />
            <MetricCard
              title="Overdue Tasks"
              value={metrics.totalOverdue || 0}
              icon="⚠️"
              color="#EF4444"
            />
            <MetricCard
              title="Avg Response Rate"
              value={`${Math.round(metrics.avgResponseRate || 0)}%`}
              icon="⚡"
              color="#10B981"
            />
            <MetricCard
              title="Team Members"
              value={teamMembers.length}
              icon="👥"
              color="#8B5CF6"
            />
          </div>

          {/* AI Suggestions */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
              🤖 AI Workload Suggestions
            </h3>
            <div
              style={{
                padding: 20,
                borderRadius: 12,
                background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)",
                border: "1px solid #C7D2FE",
              }}
            >
              {getAISuggestions().length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 20, color: "#1E3A8A" }}>
                  {getAISuggestions().map((suggestion, i) => (
                    <li key={i} style={{ marginBottom: 8, fontSize: 14 }}>
                      <strong>{suggestion.message}</strong>
                      <button
                        style={{
                          marginLeft: 12,
                          padding: "4px 12px",
                          borderRadius: 6,
                          border: "none",
                          background: "#4F46E5",
                          color: "white",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {suggestion.action}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: "#1E3A8A", fontSize: 14 }}>
                  ✅ Workload is well balanced across the team. Great job!
                </div>
              )}
            </div>
          </div>

          {/* Workload Distribution */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
              📊 Workload Distribution
            </h3>
            {teamMembers.map(member => {
              const workload = getWorkloadLevel(member.activeTasksCount);
              const percentage = (member.activeTasksCount / Math.max(...teamMembers.map(m => m.activeTasksCount), 1)) * 100;
              
              return (
                <div
                  key={member.id}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg,#6D28D9,#2563EB)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: 800,
                        }}
                      >
                        {member.avatar || member.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>
                          {member.activeTasksCount} active • {member.responseRate}% response rate
                          {member.overdueCount && member.overdueCount > 0 && (
                            <span style={{ color: "#EF4444", marginLeft: 8 }}>
                              • {member.overdueCount} overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        background: workload.color,
                        color: "white",
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      {workload.level}
                    </div>
                  </div>
                  
                  {/* Workload Bar */}
                  <div style={{ width: "100%", height: 8, borderRadius: 999, background: "#E5E7EB" }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: workload.color,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === "assignments" && (
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #E5E7EB",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="all">All Status</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting-on-client">Waiting on Client</option>
              <option value="completed">Completed</option>
            </select>

            <input
              type="text"
              placeholder="🔍 Search assignments..."
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #E5E7EB",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>

          {/* Assignments List */}
          {filteredAssignments.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#6B7280" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>No assignments yet</div>
              <div style={{ fontSize: 14, marginTop: 8 }}>Assign emails to team members to get started</div>
            </div>
          ) : (
            filteredAssignments.map(assignment => {
              const assignee = teamMembers.find(m => m.id === assignment.assignedTo);
              const isOverdue = assignment.deadline && new Date(assignment.deadline) < new Date() && assignment.status !== "completed";
              
              return (
                <div
                  key={assignment.id}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: isOverdue ? "2px solid #EF4444" : "1px solid #E5E7EB",
                    marginBottom: 12,
                    background: selectedAssignment === assignment.id ? "#F9FAFB" : "white",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            background: getStatusColor(assignment.status),
                            color: "white",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {assignment.status.replace("-", " ").toUpperCase()}
                        </span>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            background: "#F3F4F6",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          Priority: {assignment.priority}
                        </span>
                        {isOverdue && (
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              background: "#FEE2E2",
                              color: "#EF4444",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            ⚠️ OVERDUE
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 4 }}>
                        {assignment.emailSubject}
                      </div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>
                        From: <strong>{assignment.emailFrom}</strong> • 
                        Assigned to: <strong>{assignee?.name}</strong>
                        {assignment.deadline && ` • Deadline: ${new Date(assignment.deadline).toLocaleDateString()}`}
                      </div>
                    </div>
                    <select
                      value={assignment.status}
                      onChange={(e) => onUpdateStatus(assignment.id, e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid #E5E7EB",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      <option value="assigned">Assigned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="waiting-on-client">Waiting on Client</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Internal Notes */}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #E5E7EB" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 8 }}>
                      💬 Internal Notes (Team Only)
                    </div>
                    {assignment.notes.map((note, i) => (
                      <div
                        key={i}
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          background: "#F9FAFB",
                          fontSize: 12,
                          color: "#374151",
                          marginBottom: 6,
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {note.author} • {new Date(note.timestamp).toLocaleString()}
                        </div>
                        <div>{note.text}</div>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <input
                        type="text"
                        placeholder="Add internal note (use @name to tag)"
                        value={selectedAssignment === assignment.id ? noteText : ""}
                        onChange={(e) => {
                          setSelectedAssignment(assignment.id);
                          setNoteText(e.target.value);
                        }}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "1px solid #E5E7EB",
                          fontSize: 12,
                          outline: "none",
                        }}
                      />
                      <button
                        onClick={() => {
                          if (noteText.trim()) {
                            onAddNote(assignment.id, noteText);
                            setNoteText("");
                          }
                        }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 8,
                          border: "none",
                          background: "#2563EB",
                          color: "white",
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Shared Inboxes Tab */}
      {activeTab === "inboxes" && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
              📬 Shared Team Inboxes
            </h3>
            <p style={{ fontSize: 13, color: "#6B7280" }}>
              Organize emails by team, project, or client for better collaboration
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {sharedInboxes.map(inbox => (
              <div
                key={inbox.id}
                style={{
                  padding: 20,
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  background: "white",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => {
                  setSelectedInbox(inbox.id);
                  setActiveTab("assignments");
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F9FAFB";
                  e.currentTarget.style.borderColor = "#4F46E5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 4 }}>
                  {inbox.name}
                </div>
                <div style={{ fontSize: 13, color: "#6B7280" }}>
                  {inbox.emailIds.length} emails
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Members Tab */}
      {activeTab === "members" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {teamMembers.map(member => {
            const workload = getWorkloadLevel(member.activeTasksCount);
            return (
              <div
                key={member.id}
                style={{
                  padding: 20,
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  background: "white",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#6D28D9,#2563EB)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 800,
                      fontSize: 20,
                    }}
                  >
                    {member.avatar || member.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>
                      {member.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280" }}>
                      {member.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#6B7280" }}>Active Tasks</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                    {member.activeTasksCount}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#6B7280" }}>Response Rate</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                    {member.responseRate}%
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#6B7280" }}>Workload</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: 6,
                      background: workload.color,
                      color: "white",
                    }}
                  >
                    {workload.level}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, color }: any) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 12,
        border: "1px solid #E5E7EB",
        background: "white",
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
        {title}
      </div>
    </div>
  );
}
