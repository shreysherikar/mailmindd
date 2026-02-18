"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TeamCollaboration from "@/components/team/TeamCollaboration";

export default function TeamPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [assignedEmails, setAssignedEmails] = useState<any[]>([]);
  const [sharedInboxes, setSharedInboxes] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmailForAssign, setSelectedEmailForAssign] = useState<any>(null);
  const [emails, setEmails] = useState<any[]>([]);
  
  // Create team form
  const [teamName, setTeamName] = useState("");
  const [memberEmails, setMemberEmails] = useState<string[]>([""]);

  useEffect(() => {
    if (!session) {
      router.push("/");
      return;
    }
    loadUserTeams();
    loadEmails();
  }, [session]);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamData(selectedTeam.id);
    }
  }, [selectedTeam]);

  const loadUserTeams = async () => {
    try {
      const res = await fetch("/api/team/assignments?action=teams");
      const data = await res.json();
      setTeams(data.teams || []);
      
      if (data.teams && data.teams.length > 0) {
        setSelectedTeam(data.teams[0]);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to load teams:", error);
      setLoading(false);
    }
  };

  const loadTeamData = async (teamId: string) => {
    try {
      const res = await fetch(`/api/team/assignments?teamId=${teamId}`);
      const data = await res.json();
      
      setTeamMembers(data.members || []);
      setAssignedEmails(data.assignments || []);
      setMetrics(data.metrics || {});

      // Load shared inboxes
      const inboxRes = await fetch(`/api/team/assignments?action=inboxes&teamId=${teamId}`);
      const inboxData = await inboxRes.json();
      setSharedInboxes(inboxData.inboxes || []);

      // Load follow-ups
      const followUpRes = await fetch(`/api/team/assignments?action=followups&teamId=${teamId}`);
      const followUpData = await followUpRes.json();
      setFollowUps(followUpData.followUps || []);
    } catch (error) {
      console.error("Failed to load team data:", error);
    }
    setLoading(false);
  };

  const loadEmails = async () => {
    try {
      const res = await fetch("/api/gmail");
      const data = await res.json();
      setEmails(data.emails || []);
    } catch (error) {
      console.error("Failed to load emails:", error);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert("Please enter a team name");
      return;
    }

    const validEmails = memberEmails.filter(email => 
      email.trim() && email.includes("@")
    );

    if (validEmails.length === 0) {
      alert("Please add at least one team member email");
      return;
    }

    try {
      const res = await fetch("/api/team/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createTeam",
          teamName,
          memberEmails: validEmails,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setTeams([...teams, data.team]);
        setSelectedTeam(data.team);
        setShowCreateTeam(false);
        setTeamName("");
        setMemberEmails([""]);
        alert(`✅ Team "${teamName}" created successfully!`);
      }
    } catch (error) {
      console.error("Failed to create team:", error);
      alert("Failed to create team");
    }
  };

  const handleAssignEmail = async (
    emailId: string,
    memberId: string,
    deadline?: string,
    notes?: string,
    sharedInboxId?: string
  ) => {
    if (!selectedTeam) return;

    try {
      const email = emails.find(e => e.id === emailId);
      
      const res = await fetch("/api/team/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          emailId,
          assignedTo: memberId,
          deadline,
          notes,
          priority: 50,
          emailSubject: email?.subject || "No Subject",
          emailFrom: email?.from || "Unknown",
          sharedInboxId,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setAssignedEmails([...assignedEmails, data.assignment]);
        await loadTeamData(selectedTeam.id);
        setShowAssignModal(false);
        setSelectedEmailForAssign(null);
      }
    } catch (error) {
      console.error("Failed to assign email:", error);
    }
  };

  const handleUpdateStatus = async (assignmentId: string, status: string) => {
    try {
      const res = await fetch("/api/team/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, status }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setAssignedEmails(
          assignedEmails.map(a => (a.id === assignmentId ? data.assignment : a))
        );
        await loadTeamData(selectedTeam.id);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleAddNote = async (assignmentId: string, note: string) => {
    try {
      const res = await fetch("/api/team/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, note }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setAssignedEmails(
          assignedEmails.map(a => (a.id === assignmentId ? data.assignment : a))
        );
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleAddMember = async (email: string) => {
    if (!selectedTeam) return;

    try {
      const res = await fetch("/api/team/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addMember",
          teamId: selectedTeam.id,
          memberEmail: email,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        await loadTeamData(selectedTeam.id);
        alert(`✅ ${email} added to team!`);
      }
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  const handleCreateInbox = async (inboxName: string) => {
    if (!selectedTeam) return;

    try {
      const res = await fetch("/api/team/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addInbox",
          teamId: selectedTeam.id,
          inboxName,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setSharedInboxes([...sharedInboxes, data.inbox]);
        alert(`✅ Inbox "${inboxName}" created!`);
      }
    } catch (error) {
      console.error("Failed to create inbox:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#F9FAFB" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <div style={{ fontSize: 18, color: "#6B7280" }}>Loading team data...</div>
        </div>
      </div>
    );
  }

  // No teams - show create team screen
  if (teams.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 600, width: "100%", background: "white", borderRadius: 18, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>👥</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111827", marginBottom: 12 }}>
            Create Your First Team
          </h1>
          <p style={{ fontSize: 16, color: "#6B7280", marginBottom: 30 }}>
            Collaborate with your team members on emails. Assign tasks, track progress, and never miss a follow-up.
          </p>
          <button
            onClick={() => setShowCreateTeam(true)}
            style={{
              padding: "16px 32px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#6D28D9,#2563EB)",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            + Create Team
          </button>
          <button
            onClick={() => router.push("/")}
            style={{
              marginLeft: 12,
              padding: "16px 32px",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            ← Back to Inbox
          </button>
        </div>

        {/* Create Team Modal */}
        {showCreateTeam && (
          <CreateTeamModal
            teamName={teamName}
            setTeamName={setTeamName}
            memberEmails={memberEmails}
            setMemberEmails={setMemberEmails}
            onSubmit={handleCreateTeam}
            onCancel={() => setShowCreateTeam(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: 20 }}>
      {/* Header */}
      <div style={{ maxWidth: 1400, margin: "0 auto", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
              👥 Team Collaboration
            </h1>
            <p style={{ fontSize: 14, color: "#6B7280" }}>
              {selectedTeam?.name} • {assignedEmails.length} active assignments • {teamMembers.length} members
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {/* Team Selector */}
            <select
              value={selectedTeam?.id || ""}
              onChange={(e) => {
                const team = teams.find(t => t.id === e.target.value);
                setSelectedTeam(team);
              }}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                background: "white",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>

            <button
              onClick={() => setShowCreateTeam(true)}
              style={{
                padding: "12px 24px",
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                background: "white",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              + New Team
            </button>

            <button
              onClick={() => setShowAssignModal(true)}
              style={{
                padding: "12px 24px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg,#6D28D9,#2563EB)",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              + Assign Email
            </button>

            <button
              onClick={() => router.push("/")}
              style={{
                padding: "12px 24px",
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                background: "white",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Team Collaboration Component */}
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <TeamCollaboration
          teamMembers={teamMembers}
          assignedEmails={assignedEmails}
          sharedInboxes={sharedInboxes}
          followUps={followUps}
          metrics={metrics}
          onAssignEmail={handleAssignEmail}
          onUpdateStatus={handleUpdateStatus}
          onAddNote={handleAddNote}
          onAddMember={handleAddMember}
          onCreateInbox={handleCreateInbox}
        />
      </div>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <CreateTeamModal
          teamName={teamName}
          setTeamName={setTeamName}
          memberEmails={memberEmails}
          setMemberEmails={setMemberEmails}
          onSubmit={handleCreateTeam}
          onCancel={() => setShowCreateTeam(false)}
        />
      )}

      {/* Assign Email Modal */}
      {showAssignModal && (
        <AssignEmailModal
          emails={emails}
          teamMembers={teamMembers}
          sharedInboxes={sharedInboxes}
          onAssign={handleAssignEmail}
          onCancel={() => setShowAssignModal(false)}
        />
      )}
    </div>
  );
}

// Create Team Modal Component
function CreateTeamModal({ teamName, setTeamName, memberEmails, setMemberEmails, onSubmit, onCancel }: any) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}>
      <div style={{
        background: "white",
        borderRadius: 18,
        padding: 30,
        width: "90%",
        maxWidth: 600,
        maxHeight: "80vh",
        overflowY: "auto",
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Create New Team</h2>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 8 }}>
            Team Name *
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g., Sales Team, Project Alpha"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 8 }}>
            Team Members (Email Addresses) *
          </label>
          {memberEmails.map((email, index) => (
            <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  const newEmails = [...memberEmails];
                  newEmails[index] = e.target.value;
                  setMemberEmails(newEmails);
                }}
                placeholder="teammate@example.com"
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              {memberEmails.length > 1 && (
                <button
                  onClick={() => setMemberEmails(memberEmails.filter((_: any, i: number) => i !== index))}
                  style={{
                    padding: "12px",
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setMemberEmails([...memberEmails, ""])}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            + Add Another Member
          </button>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onSubmit}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg,#6D28D9,#2563EB)",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Create Team
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Assign Email Modal Component
function AssignEmailModal({ emails, teamMembers, sharedInboxes, onAssign, onCancel }: any) {
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedInbox, setSelectedInbox] = useState("");

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}>
      <div style={{
        background: "white",
        borderRadius: 18,
        padding: 30,
        width: "90%",
        maxWidth: 700,
        maxHeight: "80vh",
        overflowY: "auto",
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Assign Email to Team</h2>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 8 }}>
            Select Email *
          </label>
          <select
            value={selectedEmail?.id || ""}
            onChange={(e) => {
              const email = emails.find((em: any) => em.id === e.target.value);
              setSelectedEmail(email);
            }}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              fontSize: 14,
              outline: "none",
            }}
          >
            <option value="">Choose an email...</option>
            {emails.slice(0, 30).map((email: any) => (
              <option key={email.id} value={email.id}>
                {email.subject || "No Subject"} - from {email.from?.split("<")[0] || "Unknown"}
              </option>
            ))}
          </select>
        </div>

        {selectedEmail && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 8 }}>
                Assign To *
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                {teamMembers.map((member: any) => (
                  <button
                    key={member.email}
                    onClick={() => {
                      onAssign(selectedEmail.id, member.email, deadline || undefined, notes || undefined, selectedInbox || undefined);
                    }}
                    style={{
                      padding: "16px",
                      borderRadius: 12,
                      border: "1px solid #E5E7EB",
                      background: "white",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#EEF2FF";
                      e.currentTarget.style.borderColor = "#4F46E5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.borderColor = "#E5E7EB";
                    }}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#6D28D9,#2563EB)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 800,
                      margin: "0 auto 8px",
                    }}>
                      {member.name?.charAt(0) || member.email.charAt(0)}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                      {member.name || member.email.split("@")[0]}
                    </div>
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
                      {member.activeTasksCount || 0} tasks
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>
                  Shared Inbox (Optional)
                </label>
                <select
                  value={selectedInbox}
                  onChange={(e) => setSelectedInbox(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    fontSize: 13,
                    outline: "none",
                  }}
                >
                  <option value="">None</option>
                  {sharedInboxes.map((inbox: any) => (
                    <option key={inbox.id} value={inbox.id}>{inbox.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for the team member..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  fontSize: 13,
                  outline: "none",
                  resize: "none",
                }}
              />
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
