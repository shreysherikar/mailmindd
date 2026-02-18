import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// Enhanced in-memory storage (replace with database in production)
let teamAssignments: any[] = [];
let teams: any[] = []; // User-created teams
let teamMembers: any[] = []; // All team members across all teams
let sharedInboxes: any[] = []; // Shared inboxes per team
let followUps: any[] = []; // Follow-up tracking

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const teamId = searchParams.get("teamId");
    const userEmail = (session as any).user?.email;

    // Get user's teams
    if (action === "teams") {
      const userTeams = teams.filter(t => 
        t.createdBy === userEmail || t.members.some((m: any) => m.email === userEmail)
      );
      return NextResponse.json({ teams: userTeams });
    }

    // Get shared inboxes for a team
    if (action === "inboxes") {
      const teamInboxes = sharedInboxes.filter(i => i.teamId === teamId);
      return NextResponse.json({ inboxes: teamInboxes });
    }

    // Get follow-ups
    if (action === "followups") {
      const teamFollowUps = followUps.filter(f => f.teamId === teamId);
      return NextResponse.json({ followUps: teamFollowUps });
    }

    // Get team data
    if (!teamId) {
      return NextResponse.json({ error: "Team ID required" }, { status: 400 });
    }

    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Get assignments for this team
    const teamAssignmentsFiltered = teamAssignments.filter(a => a.teamId === teamId);
    const activeAssignments = teamAssignmentsFiltered.filter(a => a.status !== "completed");
    const overdueAssignments = teamAssignmentsFiltered.filter(a => {
      if (!a.deadline || a.status === "completed") return false;
      return new Date(a.deadline) < new Date();
    });

    // Update member task counts
    const teamMembersWithCounts = team.members.map((member: any) => ({
      ...member,
      activeTasksCount: activeAssignments.filter(a => a.assignedTo === member.email).length,
      overdueCount: overdueAssignments.filter(a => a.assignedTo === member.email).length,
    }));

    return NextResponse.json({
      team,
      assignments: teamAssignmentsFiltered,
      members: teamMembersWithCounts,
      metrics: {
        totalPending: activeAssignments.length,
        totalOverdue: overdueAssignments.length,
        avgResponseRate: teamMembersWithCounts.reduce((sum: number, m: any) => sum + (m.responseRate || 85), 0) / teamMembersWithCounts.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action;

    // Create new team
    if (action === "createTeam") {
      const { teamName, memberEmails } = body;
      const userEmail = (session as any).user?.email;
      const userName = (session as any).user?.name || userEmail;

      const newTeam = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: teamName,
        createdBy: userEmail,
        createdAt: new Date().toISOString(),
        members: [
          {
            email: userEmail,
            name: userName,
            role: "owner",
            joinedAt: new Date().toISOString(),
            responseRate: 100,
          },
          ...memberEmails.map((email: string) => ({
            email,
            name: email.split("@")[0],
            role: "member",
            joinedAt: new Date().toISOString(),
            responseRate: 85,
          })),
        ],
      };

      teams.push(newTeam);
      return NextResponse.json({ team: newTeam, success: true });
    }

    // Create assignment
    const { teamId, emailId, assignedTo, deadline, notes, priority, emailSubject, emailFrom, sharedInboxId } = body;

    // Add to shared inbox if specified
    if (sharedInboxId) {
      const inbox = sharedInboxes.find(i => i.id === sharedInboxId);
      if (inbox && !inbox.emailIds.includes(emailId)) {
        inbox.emailIds.push(emailId);
      }
    }

    const assignment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      teamId,
      emailId,
      emailSubject: emailSubject || "No Subject",
      emailFrom: emailFrom || "Unknown",
      assignedTo,
      assignedBy: (session as any).user?.email,
      deadline,
      status: "assigned",
      notes: notes ? [{ 
        text: notes, 
        author: (session as any).user?.email,
        authorName: (session as any).user?.name || (session as any).user?.email,
        timestamp: new Date().toISOString() 
      }] : [],
      priority: priority || 50,
      createdAt: new Date().toISOString(),
      sharedInboxId: sharedInboxId || null,
    };

    teamAssignments.push(assignment);

    // Create follow-up if needed
    if (assignment.status === "waiting-on-client") {
      followUps.push({
        id: Date.now().toString(),
        teamId,
        assignmentId: assignment.id,
        emailId,
        assignedTo,
        dueDate: deadline,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ assignment, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { emailId, assignmentId, status, note } = body;

    const assignment = teamAssignments.find(a => 
      assignmentId ? a.id === assignmentId : a.emailId === emailId
    );

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const oldStatus = assignment.status;

    // Update status
    if (status) {
      assignment.status = status;
      assignment.updatedAt = new Date().toISOString();
      assignment.updatedBy = (session as any).user?.email;

      // Update follow-up status
      if (status === "waiting-on-client") {
        const existingFollowUp = followUps.find(f => f.assignmentId === assignment.id);
        if (!existingFollowUp) {
          followUps.push({
            id: Date.now().toString(),
            teamId: assignment.teamId,
            assignmentId: assignment.id,
            emailId: assignment.emailId,
            assignedTo: assignment.assignedTo,
            dueDate: assignment.deadline,
            status: "pending",
            createdAt: new Date().toISOString(),
          });
        }
      } else if (status === "completed") {
        // Mark follow-up as completed
        const followUp = followUps.find(f => f.assignmentId === assignment.id);
        if (followUp) {
          followUp.status = "completed";
          followUp.completedAt = new Date().toISOString();
        }
      }
    }

    // Add note
    if (note) {
      assignment.notes.push({
        text: note,
        author: (session as any).user?.email,
        authorName: (session as any).user?.name || (session as any).user?.email,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ assignment, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add member or inbox endpoint
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, teamId, memberEmail, inboxName } = body;

    if (action === "addMember") {
      const team = teams.find(t => t.id === teamId);
      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      // Check if member already exists
      if (team.members.some((m: any) => m.email === memberEmail)) {
        return NextResponse.json({ error: "Member already in team" }, { status: 400 });
      }

      const newMember = {
        email: memberEmail,
        name: memberEmail.split("@")[0],
        role: "member",
        joinedAt: new Date().toISOString(),
        responseRate: 85,
      };

      team.members.push(newMember);
      return NextResponse.json({ member: newMember, success: true });
    }

    if (action === "addInbox") {
      const newInbox = {
        id: Date.now().toString(),
        teamId,
        name: inboxName,
        emailIds: [],
        createdAt: new Date().toISOString(),
      };
      sharedInboxes.push(newInbox);
      return NextResponse.json({ inbox: newInbox, success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
