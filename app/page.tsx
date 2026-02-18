"use client";

import { useEffect, useState, Fragment } from "react";
import { signOut, useSession, signIn } from "next-auth/react";
import Link from "next/link";
import SplashScreen from "@/components/SplashScreen";
import CalendarView from "@/components/calendar/CalendarView";
import ReminderPopup from "@/components/calendar/ReminderPopup";
import TeamCollaboration from "@/components/team/TeamCollaboration";
import Sidebar from "@/components/Sidebar";
import ComposeModal from "@/components/ComposeModal";
import EmailDetail from "@/components/EmailDetail";
import WeeklyAnalysis from "@/components/WeeklyAnalysis";
import FocusMode from "@/components/FocusMode";
import { Email, WeeklyAnalysis as WeeklyAnalysisType, ActiveFolder, ActiveTab, ArchivedEmail, PriorityResult, CategoryResult, SpamResult, DeadlineResult, CalendarEvent, TeamMember, EmailAssignment, Attachment } from "@/types";
import { 
  extractEmail, 
  getInitials, 
  extractFirstLink, 
  cleanEmailBody,
  getPriorityColor,
  getCategoryColor,
  getUrgencyLevel,
  isFirstTimeSender as isFirstTimeSenderHelper
} from "@/utils/emailHelpers";




export default function Home() {
  const { data: session } = useSession();

  const [hoverFile, setHoverFile] = useState<Attachment | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  // 🕒 Current Date & Time
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);



  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  // 🔔 Notification Count
  const [newMailCount, setNewMailCount] = useState(0);
  // 🔔 Notification Dropdown
  const [showNotifications, setShowNotifications] = useState(false);

  // 🔔 Store New Emails List
  const [newMails, setNewMails] = useState<Email[]>([]);
  // ✅ Toolbar Feature States
  const [showCompose, setShowCompose] = useState(false);





  const [aiReply, setAiReply] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [editableReply, setEditableReply] = useState("");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiPriorityMap, setAiPriorityMap] = useState<Record<string, PriorityResult>>({});
  // ✅ NEW: Cache AI-generated to-do titles
  const [aiTodoTitles, setAiTodoTitles] = useState<Record<string, string>>({});
  // ✅ AI: Cache AI-generated categories
  const [aiCategoryMap, setAiCategoryMap] = useState<Record<string, CategoryResult>>({});
  // ✅ AI: Cache AI-generated spam detection
  const [aiSpamMap, setAiSpamMap] = useState<Record<string, SpamResult>>({});
  // ✅ AI: Cache AI-generated deadlines
  const [aiDeadlineMap, setAiDeadlineMap] = useState<Record<string, DeadlineResult>>({});
  
  // ✅ AI Progress Tracking
  const [aiProgress, setAiProgress] = useState({
    priority: { total: 0, completed: 0, status: 'idle' as 'idle' | 'loading' | 'done' },
    category: { total: 0, completed: 0, status: 'idle' as 'idle' | 'loading' | 'done' },
    spam: { total: 0, completed: 0, status: 'idle' as 'idle' | 'loading' | 'done' },
    deadline: { total: 0, completed: 0, status: 'idle' as 'idle' | 'loading' | 'done' },
  });
  const [showAiProgress, setShowAiProgress] = useState(false);
  
  // ⭐ Starred Emails
  const [starredIds, setStarredIds] = useState<string[]>([]);
  // ✅ Load Starred Emails from localStorage on startup
  useEffect(() => {
    const savedStarred = localStorage.getItem("starredIds");

    if (savedStarred) {
      setStarredIds(JSON.parse(savedStarred));
    }
  }, []);


  // ⏳ Snoozed Emails (hidden temporarily)
  const [snoozedIds, setSnoozedIds] = useState<string[]>([]);
  // ✅ Load Snoozed Emails from localStorage on startup
  useEffect(() => {
    const savedSnoozed = localStorage.getItem("snoozedIds");

    if (savedSnoozed) {
      setSnoozedIds(JSON.parse(savedSnoozed));
    }
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);


  // ✅ Done Emails (removed)
  const [doneIds, setDoneIds] = useState<string[]>([]);
  
  // ✅ NEW: Archive state (stores completed emails with timestamp)
  const [archivedEmails, setArchivedEmails] = useState<ArchivedEmail[]>([]);
  
  // ✅ ENHANCED: Advanced Sorting & Filtering (MUST be declared BEFORE useEffect that uses them)
  const [sortBy, setSortBy] = useState<"none" | "priority" | "deadline" | "date" | "sender">("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [deadlineFilter, setDeadlineFilter] = useState<"all" | "today" | "tomorrow" | "week" | "overdue">("all");
  
  // ✅ Load Saved Folders on Startup
  useEffect(() => {
    const savedStarred = JSON.parse(localStorage.getItem("starredIds") || "[]");
    const savedSnoozed = JSON.parse(localStorage.getItem("snoozedIds") || "[]");
    const savedDone = JSON.parse(localStorage.getItem("doneIds") || "[]");
    const savedArchive = JSON.parse(localStorage.getItem("archivedEmails") || "[]");
    
    // ✅ Load sort preferences
    const savedSortBy = localStorage.getItem("sortBy") as any || "none";
    const savedSortOrder = localStorage.getItem("sortOrder") as any || "desc";
    const savedDeadlineFilter = localStorage.getItem("deadlineFilter") as any || "all";

    setStarredIds(savedStarred);
    setSnoozedIds(savedSnoozed);
    setDoneIds(savedDone);
    setArchivedEmails(savedArchive);
    setSortBy(savedSortBy);
    setSortOrder(savedSortOrder);
    setDeadlineFilter(savedDeadlineFilter);
  }, []);
  
  // ✅ Save sort preferences when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("sortBy", sortBy);
      localStorage.setItem("sortOrder", sortOrder);
      localStorage.setItem("deadlineFilter", deadlineFilter);
    }
  }, [sortBy, sortOrder, deadlineFilter]);

  // ✅ Load Done Emails from localStorage on startup
  useEffect(() => {
    const savedDone = localStorage.getItem("doneIds");

    if (savedDone) {
      setDoneIds(JSON.parse(savedDone));
    }
  }, []);

  const [activeFolder, setActiveFolder] =
    useState<ActiveFolder>("inbox");





  // AI States
  const [aiSummary, setAiSummary] = useState("");
  const [aiReason, setAiReason] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const [emails, setEmails] = useState<Email[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedMail, setSelectedMail] = useState<Email | null>(null);


  const [summary, setSummary] = useState<string>("");
  const [summarizing, setSummarizing] = useState(false);

  const [tasks, setTasks] = useState<string[]>([]);
  // ✅ FIX 1: Default tab to "All Mails"
  const [activeTab, setActiveTab] = useState<ActiveTab>("All Mails");
  
  // ✅ To-Do List State
  const [showTodoView, setShowTodoView] = useState(false);
  
  // ✅ Weekly Analysis State
  const [showWeeklyAnalysis, setShowWeeklyAnalysis] = useState(false);
  
  // ✅ Focus Mode State
  const [showFocusMode, setShowFocusMode] = useState(false);
  
  // ✅ Calendar View State
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [activeReminder, setActiveReminder] = useState<CalendarEvent | null>(null);
  
  // ✅ Team View State
  const [showTeamView, setShowTeamView] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assignedEmails, setAssignedEmails] = useState<EmailAssignment[]>([]);

  // 🔍 Search Query
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Deadline + Urgency Inputs
  const [deadline, setDeadline] = useState<string | null>("");
  const [urgency, setUrgency] = useState("Normal");


  // ✅ Slides list (keep outside if)
  const slides = [
    "/login/slide1.png",
    "/login/slide2.png",
    "/login/slide3.png",
    "/login/slide4.png",
    "/login/slide5.png",
  ];

  // ✅ Slide state must be outside condition
  const [currentSlide, setCurrentSlide] = useState(0);
  // ⭐ Toggle Star
  function toggleStar() {
    if (!selectedMail) return;

    setStarredIds((prev) => {
      const updated = prev.includes(selectedMail.id)
        ? prev.filter((id) => id !== selectedMail.id)
        : [...prev, selectedMail.id];

      localStorage.setItem("starredIds", JSON.stringify(updated));
      return updated;
    });
  }


  // ⏳ Snooze Email (hide from inbox)
  function snoozeMail() {
    if (!selectedMail) return;

    setSnoozedIds((prev) => {
      const updated = [...prev, selectedMail.id];
      localStorage.setItem("snoozedIds", JSON.stringify(updated));
      return updated;
    });

    setSelectedMail(null);
  }

  // ✅ Mark Done (archive the email)
  function markDone() {
    if (!selectedMail) return;

    // Add to done IDs
    setDoneIds((prev) => {
      const updated = [...prev, selectedMail.id];
      localStorage.setItem("doneIds", JSON.stringify(updated));
      return updated;
    });

    // ✅ NEW: Save to archive with completion timestamp AND AI title
    setArchivedEmails((prev) => {
      const archivedEmail = {
        ...selectedMail,
        completedAt: new Date().toISOString(),
        completedDate: new Date().toLocaleString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        // ✅ Save the AI-generated to-do title if available
        todoTitle: aiTodoTitles[selectedMail.id] || undefined,
      };
      
      const updated = [archivedEmail, ...prev]; // Add to beginning
      localStorage.setItem("archivedEmails", JSON.stringify(updated));
      return updated;
    });

    setSelectedMail(null);
  }
  // =======================================
  function deleteSelectedMail() {
    if (!selectedMail) {
      alert("❌ Please select an email first");
      return;
    }

    alert("🗑 Delete feature will be connected to Gmail API next");

    // Later we will call Gmail API delete here
  }





  // ✅ Fade slideshow runs only when NOT logged in
  useEffect(() => {
    if (session) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        let next = Math.floor(Math.random() * slides.length);

        while (next === prev) {
          next = Math.floor(Math.random() * slides.length);
        }

        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [session]);


  const loadEmails = async () => {
    setLoading(true);

    const res = await fetch(
      `/api/gmail${nextPageToken ? `?pageToken=${nextPageToken}` : ""}`
    );

    const data = await res.json();

    setEmails((prev) => {
      const combined = [...prev, ...(data.emails || [])];

      // ✅ Remove duplicate emails using id
      const unique = Array.from(
        new Map(combined.map((mail) => [mail.id, mail])).values()
      );

      return unique;
    });

    setNextPageToken(data.nextPageToken || null);

    setLoading(false);
  };

  // ✅ FIXED: Combined function that fetches email AND generates AI
  const openMailAndGenerateAI = async (id: string, mailPreview: Email) => {
    // Reset AI states
    setAiSummary("");
    setAiReason("");
    setAiReply("");
    setLoadingAI(false);
    setDeadline(null);
    setUrgency("");


    // Fetch full email content
    const res = await fetch(`/api/gmail/message?id=${id}`);
    const fullEmailData = await res.json();

    // Show mail content
    setSelectedMail(fullEmailData);
    // ✅ Deadline Detection
    const combinedText =
      fullEmailData.subject + " " +
      fullEmailData.snippet + " " +
      fullEmailData.body;

    const detected = extractDeadline(combinedText);

    setDeadline(detected);
    setUrgency(getUrgencyLevel(detected));

  };

  async function generateReply() {
    if (!selectedMail) {
      alert("Please select an email first");
      return;
    }

    setLoadingReply(true);
    setAiReply("");

    try {
      const res = await fetch("/api/ai/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: selectedMail.subject,
          snippet: selectedMail.snippet || selectedMail.body || "",
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert("Error: " + data.error);
        setLoadingReply(false);
        return;
      }

      setAiReply(data.reply);
      setEditableReply(data.reply); // ✅ editable copy
    } catch (error) {
      alert("Failed to generate reply. Check console for details.");
    }

    setLoadingReply(false);
  }

  async function generateSummary(mail: Email) {
    setLoadingAI(true);
    const emailContent = cleanEmailBody(mail.body || mail.snippet || "");

    if (!emailContent) {
      setAiSummary("⚠️ No email content available.");
      setLoadingAI(false);
      return;
    }

    const res = await fetch("/api/ai/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: mail.subject,
        snippet: emailContent,
        from: mail.from,
        date: mail.date,
      }),
    });

    const data = await res.json();
    setAiSummary(data.summary || "No summary generated.");

    setLoadingAI(false);
  }

  // ✅ NEW: AI Priority function for individual emails
  async function generateAIPriorityForMail(mail: Email) {

    // ✅ Already generated → skip
    if (aiPriorityMap[mail.id]) return;

    const res = await fetch("/api/ai/priority", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: mail.subject,
        snippet: mail.snippet,
      }),
    });

    const data = await res.json();

    if (data.result?.score) {
      setAiPriorityMap((prev) => ({
        ...prev,
        [mail.id]: data.result,
      }));
      
      // Update progress
      setAiProgress(prev => ({
        ...prev,
        priority: { ...prev.priority, completed: prev.priority.completed + 1 }
      }));
    }
  }

  // ✅ NEW: Generate AI-powered to-do title
  async function generateAITodoTitle(mail: Email) {
    // Already generated → skip
    if (aiTodoTitles[mail.id]) return;

    try {
      const res = await fetch("/api/ai/todo-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: mail.subject,
          snippet: mail.snippet,
        }),
      });

      const data = await res.json();

      if (data.title) {
        setAiTodoTitles((prev) => ({
          ...prev,
          [mail.id]: data.title,
        }));

        // ✅ NEW: If this is an archived email, update it in archive
        if (activeFolder === "archive") {
          setArchivedEmails((prev) => {
            const updated = prev.map(archivedMail => 
              archivedMail.id === mail.id 
                ? { ...archivedMail, todoTitle: data.title }
                : archivedMail
            );
            localStorage.setItem("archivedEmails", JSON.stringify(updated));
            return updated;
          });
        }
      }
    } catch (error) {
      // Silent fail - AI title generation is optional
    }
  }

  // ✅ NEW: Batch generate AI titles for all visible to-dos
  async function generateAllTodoTitles(emails: Email[]) {
    const emailsNeedingTitles = emails.filter(mail => !aiTodoTitles[mail.id]);
    
    // Generate titles in parallel (max 5 at a time to avoid rate limits)
    const batchSize = 5;
    for (let i = 0; i < emailsNeedingTitles.length; i += batchSize) {
      const batch = emailsNeedingTitles.slice(i, i + batchSize);
      await Promise.all(batch.map(mail => generateAITodoTitle(mail)));
    }
  }

  // ✅ AI: Generate AI-powered category for email
  async function generateAICategoryForMail(mail: Email) {
    // Already generated → skip
    if (aiCategoryMap[mail.id]) return;

    try {
      const res = await fetch("/api/ai/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: mail.subject,
          snippet: mail.snippet,
        }),
      });

      const data = await res.json();

      if (data.result?.category) {
        setAiCategoryMap((prev) => ({
          ...prev,
          [mail.id]: data.result,
        }));
        
        // Update progress
        setAiProgress(prev => ({
          ...prev,
          category: { ...prev.category, completed: prev.category.completed + 1 }
        }));
      }
    } catch (error) {
      // Silent fail - AI category generation is optional
    }
  }

  // ✅ AI: Generate AI-powered spam detection for email
  async function generateAISpamDetection(mail: Email) {
    // Already generated → skip
    if (aiSpamMap[mail.id]) return;

    try {
      const res = await fetch("/api/ai/spam-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: mail.subject,
          snippet: mail.snippet,
          from: mail.from,
        }),
      });

      const data = await res.json();

      if (data.result) {
        setAiSpamMap((prev) => ({
          ...prev,
          [mail.id]: data.result,
        }));
        
        // Update progress
        setAiProgress(prev => ({
          ...prev,
          spam: { ...prev.spam, completed: prev.spam.completed + 1 }
        }));
      }
    } catch (error) {
      // Silent fail - AI spam detection is optional
    }
  }

  // ✅ AI: Generate AI-powered deadline extraction for email
  async function generateAIDeadline(mail: Email) {
    // Already generated → skip
    if (aiDeadlineMap[mail.id]) return;

    try {
      const res = await fetch("/api/ai/extract-deadline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: mail.subject,
          snippet: mail.snippet,
        }),
      });

      const data = await res.json();

      if (data.result) {
        setAiDeadlineMap((prev) => ({
          ...prev,
          [mail.id]: data.result,
        }));
        
        // Update progress
        setAiProgress(prev => ({
          ...prev,
          deadline: { ...prev.deadline, completed: prev.deadline.completed + 1 }
        }));
      }
    } catch (error) {
      // Silent fail - AI deadline extraction is optional
    }
  }

  // ✅ AI: Batch generate all AI data for visible emails
  async function generateAllAIData(emails: Email[]) {
    // ✅ FIX: Filter out emails that already have ALL AI data
    const emailsNeedingAI = emails.filter(mail => 
      !aiPriorityMap[mail.id] || 
      !aiCategoryMap[mail.id] || 
      !aiSpamMap[mail.id] || 
      !aiDeadlineMap[mail.id]
    ).slice(0, 20); // Process max 20 emails
    
    if (emailsNeedingAI.length === 0) return;
    
    // Initialize progress
    setShowAiProgress(true);
    setAiProgress({
      priority: { total: emailsNeedingAI.length, completed: 0, status: 'loading' },
      category: { total: emailsNeedingAI.length, completed: 0, status: 'loading' },
      spam: { total: emailsNeedingAI.length, completed: 0, status: 'loading' },
      deadline: { total: emailsNeedingAI.length, completed: 0, status: 'loading' },
    });
    
    // Generate all AI data in parallel (in batches of 5 to avoid overwhelming the API)
    const batchSize = 5;
    for (let i = 0; i < emailsNeedingAI.length; i += batchSize) {
      const batch = emailsNeedingAI.slice(i, i + batchSize);
      await Promise.all(batch.map(async (mail) => {
        await Promise.all([
          generateAIPriorityForMail(mail),
          generateAICategoryForMail(mail),
          generateAISpamDetection(mail),
          generateAIDeadline(mail),
        ]);
      }));
    }
    
    // Mark all as done
    setAiProgress(prev => ({
      priority: { ...prev.priority, status: 'done' },
      category: { ...prev.category, status: 'done' },
      spam: { ...prev.spam, status: 'done' },
      deadline: { ...prev.deadline, status: 'done' },
    }));
    
    // Hide progress after 2 seconds
    setTimeout(() => setShowAiProgress(false), 2000);
  }


  async function generateExplanation(mail: Email) {
    setLoadingAI(true);
    const res = await fetch("/api/ai/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: mail.subject || "",
        snippet: mail.snippet || mail.body || "",
        from: mail.from,
        date: mail.date,
      }),
    });
    const data = await res.json();
    setAiReason(data.explanation || "No explanation generated.");
    setLoadingAI(false);
  }

  const summarizeEmail = async () => {
    if (!selectedMail?.body && !selectedMail?.snippet) return;

    setSummarizing(true);
    setSummary("");

    const res = await fetch("/api/ai/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: selectedMail.body || selectedMail.snippet,
      }),
    });

    const data = await res.json();

    const formatted = data.summary
      .replace(/https?:\/\/\S+/g, "")
      .replace(/🔗\s*\[Link Removed\]/g, "")
      .replace(/📌\s*PURPOSE:/g, "\n📌 PURPOSE:")
      .replace(/📅\s*DATE:/g, "\n📅 DATE:")
      .replace(/🔗\s*LINK:/g, "\n🔗 LINK: IS ATTACH BELOW🔻")
      .replace(/📋\s*SUMMARY:/g, "\n📋 SUMMARY:")
      .replace(/\[see link below ↓\]/g, "")
      .replace(/Click the below/g, "See link below")
      .replace(/CLICK HERE FOR LINK:/g, "")
      .trim();

    setSummary(formatted);
    setSummarizing(false);
  };

  // ✅ ENHANCED: Extract smart, concise action items
  function extractTasks(text: string) {
    const lower = text.toLowerCase();
    const tasks: string[] = [];

    // Payment related
    if (lower.includes("payment due") || lower.includes("pay now") || lower.includes("invoice") || lower.includes("bill")) {
      tasks.push("💳 Make payment");
    }

    // Meeting related
    if (lower.includes("meeting") || lower.includes("zoom") || lower.includes("google meet")) {
      tasks.push("📅 Join meeting");
    }
    if (lower.includes("schedule") && lower.includes("meeting")) {
      tasks.push("📅 Schedule meeting");
    }
    if (lower.includes("rsvp") || lower.includes("confirm attendance")) {
      tasks.push("✅ Confirm attendance");
    }

    // Job/Career related
    if (lower.includes("interview")) {
      tasks.push("💼 Prepare for interview");
    }
    if (lower.includes("job application") || lower.includes("apply")) {
      tasks.push("📝 Submit application");
    }
    if (lower.includes("offer letter")) {
      tasks.push("📄 Review offer letter");
    }

    // Response required
    if (lower.includes("reply") || lower.includes("respond")) {
      tasks.push("💬 Send reply");
    }
    if (lower.includes("feedback") || lower.includes("review")) {
      tasks.push("� Provide feedback");
    }

    // Decision/Approval
    if (lower.includes("approval") || lower.includes("approve")) {
      tasks.push("✅ Approve request");
    }
    if (lower.includes("decision")) {
      tasks.push("🤔 Make decision");
    }

    // Documents
    if (lower.includes("sign") && (lower.includes("document") || lower.includes("contract"))) {
      tasks.push("✍️ Sign document");
    }
    if (lower.includes("submit") && lower.includes("document")) {
      tasks.push("📤 Submit document");
    }

    // Urgent
    if (lower.includes("urgent") || lower.includes("asap")) {
      tasks.push("🚨 Urgent action needed");
    }

    if (tasks.length === 0) tasks.push("📧 Read and respond");

    return tasks;
  }

  // ✅ Fallback: Simple title when AI is loading
  function getSimpleTodoTitle(mail: Email): string {
    const subject = mail.subject || "Read email";
    return subject.length > 45 ? subject.substring(0, 42) + "..." : subject;
  }
  
  function getUrgencyLevel(deadlineText: string | null) {
    if (!deadlineText) return "None";

    if (deadlineText === "Today") return "🔥 Very High";
    if (deadlineText === "Tomorrow") return "⚠️ High";

    return "📌 Medium";
  }


  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ✅ FIX 4: Load emails when session is available
  useEffect(() => {
    if (!session) return;

    // Show splash screen
    setShowSplash(true);

    // Hide splash after 1.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    // Load emails immediately (don't wait for splash)
    const fetchEmails = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/gmail`);
        const data = await res.json();

        setEmails(data.emails || []);
        setNextPageToken(data.nextPageToken || null);
        // 🔔 Notification Logic (New mails since last open)
        const lastSeen = localStorage.getItem("lastSeenTime");

        let count = 0;

        if (lastSeen) {
          const lastTime = new Date(lastSeen).getTime();

          count = (data.emails || []).filter((mail: Email) => {
            const mailTime = new Date(mail.date).getTime();
            return mailTime > lastTime;
          }).length;
        }

        // Set notification count
        setNewMailCount(count);

        // Update last seen time to NOW
        // 🔔 Notification Logic (New mails since last click)

        let freshMails: Email[] = [];

        if (lastSeen) {
          const lastTime = new Date(lastSeen).getTime();

          freshMails = (data.emails || []).filter((mail: Email) => {
            const mailTime = new Date(mail.date).getTime();
            return mailTime > lastTime;
          });
        } else {
          // First time user opens app
          freshMails = [];
        }

        // Save new mails + count
        setNewMails(freshMails);
        setNewMailCount(freshMails.length);


      } catch (error) {
        // Error loading emails - user will see empty inbox
      }

      setLoading(false);
    };

    fetchEmails();

    return () => clearTimeout(timer);
  }, [session]); // ✅ Only depends on session

  // ✅ Auto-generate AI titles when entering to-do view
  useEffect(() => {
    if (showTodoView && emails.length > 0) {
      // Filter to get actionable emails
      const actionableEmails = emails.filter(mail => {
        if (snoozedIds.includes(mail.id) || doneIds.includes(mail.id)) return false;
        return isActionableEmail(mail);
      });
      
      // Generate titles for first 10 emails immediately
      const topEmails = actionableEmails.slice(0, 10);
      generateAllTodoTitles(topEmails);
    }
  }, [showTodoView, emails.length]);

  // ✅ AI: Auto-generate AI data for emails when they load (ONCE)
  useEffect(() => {
    // ✅ Safety check: only run in browser with session
    if (typeof window === 'undefined' || !session || emails.length === 0) return;
    
    // ✅ FIX: Only process emails that don't have AI data yet
    const emailsNeedingAI = emails.slice(0, 20).filter(mail => 
      !aiPriorityMap[mail.id] || 
      !aiCategoryMap[mail.id] || 
      !aiSpamMap[mail.id] || 
      !aiDeadlineMap[mail.id]
    );
    
    // Only generate if there are emails needing AI data
    if (emailsNeedingAI.length > 0) {
      generateAllAIData(emailsNeedingAI);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emails.length, session]); // ✅ Depend on emails.length and session

  // ✅ NEW: Auto-generate AI titles for archived emails without titles
  useEffect(() => {
    if (activeFolder === "archive" && archivedEmails.length > 0) {
      // Find archived emails without AI titles
      const emailsNeedingTitles = archivedEmails.filter(mail => !mail.todoTitle);
      
      if (emailsNeedingTitles.length > 0) {
        // Generate titles for first 10 archived emails
        const topEmails = emailsNeedingTitles.slice(0, 10);
        topEmails.forEach(mail => generateAITodoTitle(mail));
      }
    }
  }, [activeFolder, archivedEmails.length]);

  const refreshInbox = async () => {
    setEmails([]); // clear old emails
    setNextPageToken(null); // reset pagination
    await loadEmails(); // fetch fresh inbox
  };
  // ✅ AI-POWERED: Get priority score from AI or cache
  function getPriorityScore(mail: Email) {
    // Check if AI score exists in cache
    if (aiPriorityMap[mail.id]?.score) {
      return aiPriorityMap[mail.id].score;
    }
    
    // Fallback to basic score while AI is loading
    return 50; // Default medium priority
  }

  function getPriorityColor(score: number) {
    if (score >= 80) return "#ff4d4d";
    if (score >= 50) return "#ffc107";
    return "#4caf50";
  }
  
  // ✅ AI-POWERED: Get email category from AI or cache
  // ✅ AI-POWERED: Get email category from AI or cache
  function getEmailCategory(mail: Email) {
    // Check if AI category exists in cache
    if (aiCategoryMap[mail.id]?.category) {
      return aiCategoryMap[mail.id].category;
    }
    
    // Trigger AI generation if not in cache
    if (!aiCategoryMap[mail.id]) {
      generateAICategoryForMail(mail);
    }
    
    // Fallback while AI is loading
    return "Low Energy";
  }
  
  function getCategoryColor(category: string) {
    if (category === "Do Now") return "#EF4444"; // 🔥 Red
    if (category === "Needs Decision") return "#8B5CF6"; // 🟣 Purple
    if (category === "Waiting") return "#3B82F6"; // 🔵 Blue
    if (category === "Low Energy") return "#10B981"; // 🟢 Green

    return "#6B7280"; // Default Gray
  }
  
  // ✅ AI-POWERED: Check if email is spam using AI
  function isSpamEmail(mail: Email) {
    // Check if AI spam detection exists in cache
    if (aiSpamMap[mail.id]) {
      return aiSpamMap[mail.id].isSpam;
    }
    
    // Trigger AI generation if not in cache
    if (!aiSpamMap[mail.id]) {
      generateAISpamDetection(mail);
    }
    
    // Fallback: don't mark as spam while AI is loading
    return false;
  }
  
  // ✅ AI-POWERED: Extract deadline using AI
  function extractDeadline(text: string, mailId?: string) {
    // If mailId provided, check AI cache
    if (mailId && aiDeadlineMap[mailId]?.deadline) {
      return aiDeadlineMap[mailId].deadline;
    }
    
    // Trigger AI generation if mailId provided and not in cache
    if (mailId && !aiDeadlineMap[mailId]) {
      // Find the mail object to pass to the AI function
      const mail = emails.find(m => m.id === mailId);
      if (mail) {
        generateAIDeadline(mail);
      }
    }
    
    // Fallback: basic regex extraction while AI is loading
    if (!text) return null;
    const lower = text.toLowerCase();
    if (lower.includes("tomorrow")) return "Tomorrow";
    if (lower.includes("today")) return "Today";
    
    const match = text.match(/\b(\d{1,2})\s?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i);
    if (match) return match[0];
    
    return null;
  }

  function getBurnoutStats(emails: Email[]) {
    let stressScore = 0;

    emails.forEach((mail) => {
      const text =
        (mail.subject || "").toLowerCase() +
        " " +
        (mail.snippet || "").toLowerCase();

      if (
        text.includes("urgent") ||
        text.includes("deadline") ||
        text.includes("asap") ||
        text.includes("immediately")
      ) {
        stressScore += 15;
      }

      if (getPriorityScore(mail) > 70) {
        stressScore += 10;
      }

      if (mail.date) {
        const dateObj = new Date(mail.date);
        const hour = dateObj.getHours();

        if (hour >= 23 || hour <= 5) {
          stressScore += 20;
        }
      }
    });

    if (stressScore > 100) stressScore = 100;

    let stressLevel = "Low";
    if (stressScore > 70) stressLevel = "High";
    else if (stressScore > 40) stressLevel = "Medium";

    let workloadTrend = emails.length > 15 ? "Increasing 📈" : "Stable ✅";

    let recommendation =
      stressLevel === "High"
        ? "Delegate or Snooze low-priority emails"
        : "You are managing well";

    return {
      stressScore,
      stressLevel,
      workloadTrend,
      recommendation,
    };
  }

  // ✅ NEW: Get weekly analysis
  function getWeeklyAnalysis() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter emails from last 7 days
    const weekEmails = emails.filter((mail) => {
      const mailDate = new Date(mail.date);
      return mailDate >= weekAgo && mailDate <= now;
    });

    // Calculate stress metrics
    let stressScore = 0;
    let urgentCount = 0;
    let lateNightCount = 0;
    let highPriorityCount = 0;

    weekEmails.forEach((mail) => {
      const text = (mail.subject || "").toLowerCase() + " " + (mail.snippet || "").toLowerCase();
      const priority = getPriorityScore(mail);

      // Urgent emails
      if (text.includes("urgent") || text.includes("asap") || text.includes("immediately") || text.includes("deadline")) {
        urgentCount++;
        stressScore += 15;
      }

      // High priority
      if (priority > 70) {
        highPriorityCount++;
        stressScore += 10;
      }

      // Late night emails
      if (mail.date) {
        const hour = new Date(mail.date).getHours();
        if (hour >= 22 || hour <= 6) {
          lateNightCount++;
          stressScore += 12;
        }
      }
    });

    // Cap stress score
    stressScore = Math.min(stressScore, 100);

    // Tasks completed (from archive)
    const weekCompleted = archivedEmails.filter((mail) => {
      if (!mail.completedAt) return false;
      const completedDate = new Date(mail.completedAt);
      return completedDate >= weekAgo && completedDate <= now;
    });

    // Productivity score (completed vs received)
    const productivityRate = weekEmails.length > 0 
      ? Math.round((weekCompleted.length / weekEmails.length) * 100)
      : 0;

    // Stress level
    let stressLevel = "😌 Low";
    let stressColor = "#10B981";
    if (stressScore > 70) {
      stressLevel = "🔥 High";
      stressColor = "#EF4444";
    } else if (stressScore > 40) {
      stressLevel = "⚠️ Medium";
      stressColor = "#F59E0B";
    }

    // Burnout risk
    let burnoutRisk = "Low Risk";
    let burnoutColor = "#10B981";
    if (lateNightCount > 10 || urgentCount > 15) {
      burnoutRisk = "High Risk";
      burnoutColor = "#EF4444";
    } else if (lateNightCount > 5 || urgentCount > 8) {
      burnoutRisk = "Medium Risk";
      burnoutColor = "#F59E0B";
    }

    // Recommendations
    let recommendations = [];
    if (stressScore > 70) {
      recommendations.push("Take breaks between emails");
      recommendations.push("Delegate low-priority tasks");
    }
    if (lateNightCount > 5) {
      recommendations.push("Set email boundaries after 9 PM");
    }
    if (productivityRate < 30) {
      recommendations.push("Focus on completing pending tasks");
    }
    if (recommendations.length === 0) {
      recommendations.push("Great work! Keep it up 🎉");
    }

    return {
      weekEmails: weekEmails.length,
      tasksCompleted: weekCompleted.length,
      urgentCount,
      highPriorityCount,
      lateNightCount,
      stressScore,
      stressLevel,
      stressColor,
      burnoutRisk,
      burnoutColor,
      productivityRate,
      recommendations,
    };
  }

  // ✅ NEW: Get today's urgent tasks for Focus Mode
  function getTodaysTasks() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Filter actionable emails
    const actionableEmails = emails.filter((mail) => {
      // Skip snoozed and done
      if (snoozedIds.includes(mail.id) || doneIds.includes(mail.id)) return false;
      
      // Must be actionable
      if (!isActionableEmail(mail)) return false;
      
      // ✅ Skip reply emails (Re:, Fwd:, etc.)
      const subject = (mail.subject || "").toLowerCase();
      if (subject.startsWith("re:") || subject.startsWith("fwd:") || subject.startsWith("fw:")) {
        return false;
      }
      
      return true;
    });

    // Filter for today's tasks ONLY
    const todaysTasks = actionableEmails.filter((mail) => {
      const text = (mail.subject || "").toLowerCase() + " " + (mail.snippet || "").toLowerCase();
      
      // ✅ CRITICAL: Exclude anything with "tomorrow" or future dates
      if (text.includes("tomorrow") || text.includes("next week") || text.includes("next month") || text.includes("later")) {
        return false;
      }
      
      // ✅ Exclude specific future date patterns
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tomorrowDate = tomorrow.getDate();
      const tomorrowMonth = tomorrow.toLocaleString('en-US', { month: 'short' }).toLowerCase();
      
      // Don't show if it mentions tomorrow's date
      if (text.includes(`${tomorrowDate} ${tomorrowMonth}`) || text.includes(`${tomorrowMonth} ${tomorrowDate}`)) {
        return false;
      }
      
      // ✅ STRICT: Only "today" or "tonight" keywords
      if (text.includes(" today") || text.includes("today ") || text.includes("tonight") || text.includes("by today") || text.includes("due today")) {
        return true;
      }
      
      // ✅ Check for "asap" or "urgent" or "immediately" (these are for today)
      if (text.includes("asap") || text.includes("urgent") || text.includes("immediately") || text.includes("right now")) {
        return true;
      }
      
      // ✅ Check for today's specific date mentioned
      const today = now.getDate();
      const todayMonth = now.toLocaleString('en-US', { month: 'short' }).toLowerCase();
      const todayMonthFull = now.toLocaleString('en-US', { month: 'long' }).toLowerCase();
      
      // Match patterns like "by 18 Feb", "due Feb 18", "18th February"
      const datePatterns = [
        `${today} ${todayMonth}`,
        `${todayMonth} ${today}`,
        `${today} ${todayMonthFull}`,
        `${todayMonthFull} ${today}`,
        `by ${today}`,
        `due ${today}`,
      ];
      
      if (datePatterns.some(pattern => text.includes(pattern))) {
        // Double check it doesn't also mention tomorrow
        if (!text.includes("tomorrow")) {
          return true;
        }
      }
      
      return false;
    });

    // ✅ Group by thread and keep only the first email from each thread
    const seenThreads = new Set();
    const uniqueTasks = todaysTasks.filter((mail) => {
      // Create a thread identifier based on subject (remove Re:, Fwd:, etc.)
      const cleanSubject = (mail.subject || "")
        .replace(/^(re:|fwd?:|fw:)\s*/gi, "")
        .trim()
        .toLowerCase();
      
      // If we've seen this thread, skip it
      if (seenThreads.has(cleanSubject)) {
        return false;
      }
      
      // Mark this thread as seen
      seenThreads.add(cleanSubject);
      return true;
    });

    // Sort by priority
    return uniqueTasks.sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
  }

  // ✅ NEW: Check if email is actionable (for to-do list)
  function isActionableEmail(mail: Email) {
    // Filter out spam and promotional emails
    if (isSpamEmail(mail)) return false;
    
    const subject = (mail.subject || "").toLowerCase();
    const snippet = (mail.snippet || "").toLowerCase();
    const from = (mail.from || "").toLowerCase();
    const text = subject + " " + snippet;
    
    // ✅ STRICT: Filter out promotional content
    const promotionalKeywords = [
      "newsletter",
      "unsubscribe",
      "promotional",
      "marketing",
      "advertisement",
      "sale",
      "discount",
      "offer expires",
      "limited time",
      "shop now",
      "buy now",
      "% off",
      "save now",
      "deal",
      "coupon",
      "free trial",
      "upgrade now",
      "premium",
      "pro plan",
      "enroll now",
      "register now",
      "sign up",
      "webinar",
      "watch now",
      "learn more",
      "get started",
      "join now",
    ];
    
    for (let keyword of promotionalKeywords) {
      if (text.includes(keyword)) return false;
    }
    
    // ✅ Filter out automated notifications that don't need action
    if (from.includes("noreply") || from.includes("no-reply") || from.includes("notification")) {
      // Only allow if it has urgent keywords
      const urgentKeywords = ["deadline", "due", "submit", "urgent", "action required", "confirm", "approve"];
      const hasUrgent = urgentKeywords.some(keyword => text.includes(keyword));
      if (!hasUrgent) return false;
    }
    
    // ✅ POSITIVE: Check if email requires action
    const actionKeywords = [
      "job",
      "interview",
      "application",
      "meeting",
      "deadline",
      "urgent",
      "payment",
      "invoice",
      "bill",
      "confirm",
      "rsvp",
      "respond",
      "reply",
      "action required",
      "decision",
      "approval",
      "review",
      "feedback",
      "schedule",
      "appointment",
      "submit",
      "due",
      "sign",
      "contract",
      "document",
    ];
    
    for (let keyword of actionKeywords) {
      if (text.includes(keyword)) return true;
    }
    
    // ✅ If it's from a person (not automated), it's likely actionable
    if (!from.includes("noreply") && !from.includes("no-reply") && !from.includes("@notifications")) {
      // But not if it's clearly promotional
      if (text.includes("team") && (text.includes("update") || text.includes("feature"))) {
        return false; // Product update emails
      }
      return true;
    }
    
    return false;
  }

  function isFirstTimeSender(mail: Email, allEmails: Email[]) {
    const sender = mail.from;
    const count = allEmails.filter((m) => m.from === sender).length;
    return count === 1;
  }

  function extractFirstLink(text: string) {
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

  function cleanEmailBody(text: string) {
    return text
      .replace(/<[^>]*>/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/unsubscribe[\s\S]*/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // ✅ Action Button Style
  const actionBtn = {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    background: "white",
    cursor: "pointer",
    fontWeight: 600,
  };

  if (!session) {

    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #A78BFA 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "60px",
          overflow: "hidden",
        }}
      >
        <div

        >

          {/* ✅ TOP HEADER ROW */}
          <div
            style={{
              position: "absolute",
              top: 25,
              left: 45,
              right: 45,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* ✅ Left: Logo + Name */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src="/logo.png"
                alt="MailMind Logo"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  objectFit: "contain",
                }}
              />

              <h2
                style={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: 22,
                  margin: 0,
                }}
              >
                MailMind
              </h2>
            </div>
            {/* 🕒 Center Date & Time */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "8px 18px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                color: "rgba(255,255,255,0.9)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >

              {/* 🕒 Center Date & Time */}
              {mounted && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "8px 18px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(10px)",
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentTime.toLocaleString("en-IN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}


            </div>


            {/* ✅ Right: Features Button */}
            <Link href="/features" className="features-btn">
              Features →
            </Link>
          </div>



          {/* Brand Name */}

        </div>


        {/* ✅ Left Text Section */}
        <div style={{ maxWidth: "520px", color: "white" }}>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            Where email <br /> meets <br /> intelligence
          </h1>

          <p style={{ marginTop: 20, fontSize: 18, opacity: 0.9 }}>
            MailMind helps you summarize, prioritize and reply smarter —
            powered by AI.
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 20, marginTop: 40 }}>
            <button
              onClick={() => signIn("google")}
              style={{
                padding: "14px 28px",
                borderRadius: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 16,
                border: "none",
                position: "relative",
                overflow: "hidden",
                background: "white",
                color: "#2563EB",
              }}
              onMouseEnter={(e) => {
                const span = e.currentTarget.querySelector(
                  ".fill"
                ) as HTMLElement;
                span.style.transform = "translateX(0)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                const span = e.currentTarget.querySelector(
                  ".fill"
                ) as HTMLElement;
                span.style.transform = "translateX(-100%)";
                e.currentTarget.style.color = "#2563EB";
              }}
            >
              {/* Fill Background */}
              <span
                className="fill"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(135deg,#2563EB,#0EA5E9)",
                  transform: "translateX(-100%)",
                  transition: "all 0.4s ease",
                  zIndex: 0,
                }}
              ></span>

              {/* Button Text */}
              <span style={{ position: "relative", zIndex: 1 }}>
                Sign in with Google →
              </span>
            </button>
          </div>
        </div>

        {/* ✅ Right Flashcard Image Animation */}
        <div
          style={{
            width: "520px",
            height: "360px",
            borderRadius: 24,
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}
        >
          <img
            key={currentSlide}
            src={slides[currentSlide]}
            alt="slide"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              animation: "fadeSlide 3.5s ease-in-out",

            }}
          />
        </div>

        {/* ✅ Animation CSS */}
        <style>
          {`
    @keyframes fadeSlide {
      0% {
        opacity: 0;
        transform: scale(0.98);
      }
      20% {
        opacity: 1;
        transform: scale(1);
      }
      80% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(1.02);
      }
    }
  `}
        </style>

      </div>
    );
  }

  // ✅ FIX 3: Proper filtering with BOTH activeTab AND activeFolder
  const filteredEmails = emails.filter((mail) => {
    // ✅ To-Do View Filter
    if (showTodoView) {
      // Only show actionable emails (no spam/promotional)
      if (!isActionableEmail(mail)) return false;
      
      // Hide snoozed and done emails
      if (snoozedIds.includes(mail.id)) return false;
      if (doneIds.includes(mail.id)) return false;
      
      // Apply search filter if active
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const subjectMatch = mail.subject?.toLowerCase().includes(query);
        const snippetMatch = mail.snippet?.toLowerCase().includes(query);
        const fromMatch = mail.from?.toLowerCase().includes(query);
        if (!subjectMatch && !snippetMatch && !fromMatch) {
          return false;
        }
      }
      
      return true;
    }
    
    // ✅ NEW: Archive View - show archived emails
    if (activeFolder === "archive") {
      return false; // We'll display archivedEmails separately
    }
    
    // Folder filtering first
    if (activeFolder === "starred") return starredIds.includes(mail.id);
    if (activeFolder === "snoozed") return snoozedIds.includes(mail.id);
    if (activeFolder === "done") return doneIds.includes(mail.id);
    if (activeFolder === "drafts")
      return mail.label?.includes("DRAFT");


    // Inbox normal view hides snoozed/done
    if (activeFolder === "inbox") {
      if (snoozedIds.includes(mail.id)) return false;
      if (doneIds.includes(mail.id)) return false;
    }
    // 🔍 SEARCH FILTER (ADD HERE)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();

      const subjectMatch = mail.subject?.toLowerCase().includes(query);
      const snippetMatch = mail.snippet?.toLowerCase().includes(query);
      const fromMatch = mail.from?.toLowerCase().includes(query);

      if (!subjectMatch && !snippetMatch && !fromMatch) {
        return false;
      }
    }


    // Tab category filtering
    if (activeTab === "All Mails") return true;

    return getEmailCategory(mail) === activeTab;
  });

  // ✅ ENHANCED: Advanced sorting function
  function sortEmails(emails: Email[]) {
    if (sortBy === "none") return emails;
    
    return [...emails].sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case "priority": {
          const priorityA = getPriorityScore(a);
          const priorityB = getPriorityScore(b);
          compareValue = priorityB - priorityA;
          break;
        }
        
        case "deadline": {
          const textA = (a.subject || "") + " " + (a.snippet || "");
          const textB = (b.subject || "") + " " + (b.snippet || "");
          const deadlineA = extractDeadline(textA);
          const deadlineB = extractDeadline(textB);
          
          const getDeadlineWeight = (deadline: string | null) => {
            if (!deadline) return 0;
            if (deadline === "Today") return 1000;
            if (deadline === "Tomorrow") return 500;
            return 100;
          };
          
          const weightA = getDeadlineWeight(deadlineA);
          const weightB = getDeadlineWeight(deadlineB);
          
          // Combine with priority for better sorting
          const priorityA = getPriorityScore(a);
          const priorityB = getPriorityScore(b);
          
          compareValue = (weightB + priorityB) - (weightA + priorityA);
          break;
        }
        
        case "date": {
          const dateA = new Date(a.date || 0).getTime();
          const dateB = new Date(b.date || 0).getTime();
          compareValue = dateB - dateA;
          break;
        }
        
        case "sender": {
          const senderA = (a.from || "").toLowerCase();
          const senderB = (b.from || "").toLowerCase();
          compareValue = senderA.localeCompare(senderB);
          break;
        }
      }
      
      return sortOrder === "desc" ? compareValue : -compareValue;
    });
  }

  // ✅ ENHANCED: Filter emails by deadline
  function filterByDeadline(emails: Email[]) {
    if (deadlineFilter === "all") return emails;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return emails.filter((mail) => {
      const text = (mail.subject || "") + " " + (mail.snippet || "");
      const deadline = extractDeadline(text);
      
      switch (deadlineFilter) {
        case "today":
          return deadline === "Today";
        
        case "tomorrow":
          return deadline === "Tomorrow";
        
        case "week": {
          if (!deadline || deadline === "Today" || deadline === "Tomorrow") return false;
          // Check if deadline mentions this week
          const lowerText = text.toLowerCase();
          return lowerText.includes("this week") || lowerText.includes("by friday") || deadline !== null;
        }
        
        case "overdue": {
          // Emails with past dates or urgent keywords
          const lowerText = text.toLowerCase();
          return lowerText.includes("overdue") || lowerText.includes("past due") || lowerText.includes("late");
        }
        
        default:
          return true;
      }
    });
  }

  // ✅ Get emails to display (regular or archived)
  let displayEmails = activeFolder === "archive" ? archivedEmails : filteredEmails;
  
  // ✅ Apply deadline filter
  if (deadlineFilter !== "all" && !showTodoView && !showWeeklyAnalysis && !showFocusMode) {
    displayEmails = filterByDeadline(displayEmails);
  }
  
  // ✅ Apply sorting
  if (sortBy !== "none" && !showTodoView && !showWeeklyAnalysis && !showFocusMode) {
    displayEmails = sortEmails(displayEmails);
  }

  const burnout = getBurnoutStats(displayEmails);

  if (session && showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* ✅ Glass Outer Frame */}
      <div className="flex flex-col h-full m-4 rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/30 shadow-xl overflow-hidden">

        {/* Premium Header with Gradient */}
        {/* ✅ TOP NAVBAR (Exact Reference Style) */}
        <div
          className="
               h-16 px-6 flex items-center justify-between
                bg-gradient-to-r from-[#3b4ba3] to-[#5876d6]
                text-white shadow-md"
        >



          {/* Left: Logo + Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-2xl hover:opacity-80"
            >
              ☰
            </button>

            <h1 className="text-xl font-bold tracking-wide">
              MailMind
            </h1>
          </div>


          {/* 🔍 Search Bar */}
          <div className="hidden md:flex items-center bg-white/20 px-4 py-2 rounded-xl w-[320px]">
            <input
              type="text"
              placeholder="Search mails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-white placeholder-white/70 w-full text-sm"
            />
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-4">
            {/* Notification */}
            <div style={{ position: "relative" }}>
              {/* 🔔 Bell Button */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-xl hover:opacity-80"
              >
                🔔

                {/* Badge Count */}
                {newMailCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      background: "red",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "3px 7px",
                      borderRadius: "999px",
                    }}
                  >
                    {newMailCount}
                  </span>
                )}
              </button>

              {/* 🔥 Notification Dropdown */}
              {showNotifications && (
                <div
                  style={{
                    position: "absolute",
                    top: "55px",
                    right: 0,
                    width: "320px",
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "18px",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                    border: "1px solid rgba(255,255,255,0.4)",
                    zIndex: 9999,
                    padding: "16px",
                  }}
                >
                  <h3 style={{ fontWeight: 700, marginBottom: 12 }}>
                    🔔 New Emails
                  </h3>

                  {/* If no new mails */}
                  {newMails.length === 0 && (
                    <p style={{ fontSize: 13, color: "#666" }}>
                      No new notifications 🎉
                    </p>
                  )}

                  {/* Show new mails */}
                  {newMails.slice(0, 5).map((mail) => (
                    <div
                      key={mail.id}
                      style={{
                        padding: "10px",
                        borderRadius: "12px",
                        marginBottom: "8px",
                        background: "#F3F4F6",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        openMailAndGenerateAI(mail.id, mail);
                        setShowNotifications(false);
                      }}
                    >
                      <p style={{ fontWeight: 700, fontSize: 13 }}>
                        {mail.subject}
                      </p>
                      <p style={{ fontSize: 12, color: "#555" }}>
                        {mail.snippet?.substring(0, 50)}...
                      </p>
                    </div>
                  ))}

                  {/* Mark All Seen Button */}
                  {newMailCount > 0 && (
                    <button
                      onClick={() => {
                        // Reset count only when user clicks
                        setNewMailCount(0);
                        setNewMails([]);
                        localStorage.setItem(
                          "lastSeenTime",
                          new Date().toISOString()
                        );
                        setShowNotifications(false);
                      }}
                      style={{
                        marginTop: 10,
                        width: "100%",
                        padding: "10px",
                        borderRadius: "12px",
                        border: "none",
                        background: "linear-gradient(135deg,#2563EB,#0EA5E9)",
                        color: "white",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Mark all as seen ✅
                    </button>
                  )}
                </div>
              )}
            </div>




            {/* ✅ PROFILE DROPDOWN */}
            <div style={{ position: "relative" }}>

              {/* Profile Circle */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfile(!showProfile);
                }}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {session.user?.email?.[0].toUpperCase()}
              </div>

              {/* Dropdown Card */}
              {showProfile && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: "55px",
                    right: 0,
                    width: "260px",
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "18px",
                    padding: "18px",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                    border: "1px solid rgba(255,255,255,0.4)",
                    zIndex: 9999,
                  }}
                >
                  {/* Gmail Email */}
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                    Signed in as
                  </p>

                  <p
                    style={{
                      fontSize: 13,
                      color: "#444",
                      marginBottom: 14,
                      wordBreak: "break-word",
                    }}
                  >
                    {session.user?.email}
                  </p>

                  {/* Divider */}
                  <div
                    style={{
                      height: 1,
                      background: "#E5E7EB",
                      marginBottom: 12,
                    }}
                  />

                  {/* Logout */}
                  <button
                    onClick={() => signOut()}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(135deg,#EF4444,#DC2626)",
                      color: "white",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>


          </div>
        </div>


        {/* Sidebar Component */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeFolder={activeFolder}
          setActiveFolder={setActiveFolder}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showTodoView={showTodoView}
          setShowTodoView={setShowTodoView}
          showWeeklyAnalysis={showWeeklyAnalysis}
          setShowWeeklyAnalysis={setShowWeeklyAnalysis}
          showFocusMode={showFocusMode}
          setShowFocusMode={setShowFocusMode}
          setShowCompose={setShowCompose}
        />

        {/* AI Progress Indicator */}
        {showAiProgress && (
          <div
            style={{
              position: "fixed",
              top: 100,
              right: 20,
              width: 320,
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(20px)",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 12px 40px rgba(109, 40, 217, 0.25)",
              border: "2px solid #6D28D9",
              zIndex: 10000,
              animation: "slideIn 0.3s ease-out",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 20,
                background: "linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              🧠 AI Analyzing Emails...
            </h3>

            {/* Priority */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  {aiProgress.priority.status === 'done' ? '✅' : '⏳'} Analyzing priority...
                </span>
                <span style={{ fontSize: 13, color: "#6B7280" }}>
                  {aiProgress.priority.completed}/{aiProgress.priority.total}
                </span>
              </div>
              <div style={{ width: "100%", height: 6, background: "#E5E7EB", borderRadius: 999, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(aiProgress.priority.completed / aiProgress.priority.total) * 100}%`,
                    height: "100%",
                    background: aiProgress.priority.status === 'done' ? "#10B981" : "linear-gradient(90deg, #6D28D9, #2563EB)",
                    borderRadius: 999,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Category */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  {aiProgress.category.status === 'done' ? '✅' : '⏳'} Categorizing emails...
                </span>
                <span style={{ fontSize: 13, color: "#6B7280" }}>
                  {aiProgress.category.completed}/{aiProgress.category.total}
                </span>
              </div>
              <div style={{ width: "100%", height: 6, background: "#E5E7EB", borderRadius: 999, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(aiProgress.category.completed / aiProgress.category.total) * 100}%`,
                    height: "100%",
                    background: aiProgress.category.status === 'done' ? "#10B981" : "linear-gradient(90deg, #8B5CF6, #6D28D9)",
                    borderRadius: 999,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Spam Detection */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  {aiProgress.spam.status === 'done' ? '✅' : '⏳'} Detecting spam...
                </span>
                <span style={{ fontSize: 13, color: "#6B7280" }}>
                  {aiProgress.spam.completed}/{aiProgress.spam.total}
                </span>
              </div>
              <div style={{ width: "100%", height: 6, background: "#E5E7EB", borderRadius: 999, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(aiProgress.spam.completed / aiProgress.spam.total) * 100}%`,
                    height: "100%",
                    background: aiProgress.spam.status === 'done' ? "#10B981" : "linear-gradient(90deg, #EF4444, #F59E0B)",
                    borderRadius: 999,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Deadline Extraction */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  {aiProgress.deadline.status === 'done' ? '✅' : '⏳'} Extracting deadlines...
                </span>
                <span style={{ fontSize: 13, color: "#6B7280" }}>
                  {aiProgress.deadline.completed}/{aiProgress.deadline.total}
                </span>
              </div>
              <div style={{ width: "100%", height: 6, background: "#E5E7EB", borderRadius: 999, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(aiProgress.deadline.completed / aiProgress.deadline.total) * 100}%`,
                    height: "100%",
                    background: aiProgress.deadline.status === 'done' ? "#10B981" : "linear-gradient(90deg, #0EA5E9, #2563EB)",
                    borderRadius: 999,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Powered by Groq */}
            <div
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid #E5E7EB",
                textAlign: "center",
                fontSize: 12,
                color: "#9CA3AF",
                fontWeight: 600,
              }}
            >
              Powered by Groq Llama 3.1 8B ⚡
            </div>
          </div>
        )}

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* ✅ FULL-SCREEN WEEKLY ANALYSIS */}
          {showWeeklyAnalysis ? (
            <WeeklyAnalysis analysis={getWeeklyAnalysis()} />
          ) : showFocusMode ? (
            <FocusMode
              todaysTasks={getTodaysTasks()}
              getPriorityScore={getPriorityScore}
              getPriorityColor={getPriorityColor}
              extractDeadline={extractDeadline}
              openMailAndGenerateAI={openMailAndGenerateAI}
              markDone={markDone}
              selectedMail={selectedMail}
              getEmailCategory={getEmailCategory}
              getCategoryColor={getCategoryColor}
              aiTodoTitles={aiTodoTitles}
              getSimpleTodoTitle={getSimpleTodoTitle}
              generateAITodoTitle={generateAITodoTitle}
              setShowFocusMode={setShowFocusMode}
              setActiveFolder={setActiveFolder}
            />
          ) : showCalendarView ? (
            <div style={{ 
              flex: 1, 
              overflowY: "auto", 
              background: "#F8FAFF",
              padding: "32px 48px"
            }}>
              <div>
                {/* Header */}
                <div style={{ 
                  marginBottom: 32,
                  textAlign: "center"
                }}>
                  <h1 style={{ 
                    fontSize: 42, 
                    fontWeight: 700, 
                    background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: 8
                  }}>
                    📅 Calendar & Events
                  </h1>
                  <p style={{ fontSize: 18, color: "#6B7280", marginBottom: 20 }}>
                    Track deadlines, meetings, and appointments from your emails
                  </p>
                </div>

                {/* Calendar Component */}
                <CalendarView
                  events={calendarEvents}
                  onAddEvent={async (event) => {
                    try {
                      const res = await fetch("/api/calendar/events", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(event),
                      });
                      const data = await res.json();
                      setCalendarEvents([...calendarEvents, { ...data.event, date: new Date(data.event.date) }]);
                    } catch (error) {
                      // Failed to add event
                    }
                  }}
                  onDeleteEvent={async (id) => {
                    try {
                      await fetch(`/api/calendar/events?id=${id}`, { method: "DELETE" });
                      setCalendarEvents(calendarEvents.filter(e => e.id !== id));
                    } catch (error) {
                      // Failed to delete event
                    }
                  }}
                  onEventClick={(event) => {
                    if (event.emailId) {
                      // Find and open the email
                      const mail = emails.find(m => m.id === event.emailId);
                      if (mail) {
                        openMailAndGenerateAI(mail.id, mail);
                        setShowCalendarView(false);
                        setActiveFolder("inbox");
                      }
                    }
                  }}
                />

                {/* Reminder Popup */}
                {activeReminder && (
                  <ReminderPopup
                    event={activeReminder}
                    onDismiss={() => setActiveReminder(null)}
                    onSnooze={(minutes) => {
                      setTimeout(() => setActiveReminder(activeReminder), minutes * 60000);
                      setActiveReminder(null);
                    }}
                  />
                )}
              </div>
            </div>
          ) : showTeamView ? (
            <div style={{ 
              flex: 1, 
              overflowY: "auto", 
              background: "#F8FAFF",
              padding: "32px 48px"
            }}>
              <div>
                {/* Header */}
                <div style={{ 
                  marginBottom: 32,
                  textAlign: "center"
                }}>
                  <h1 style={{ 
                    fontSize: 42, 
                    fontWeight: 700, 
                    background: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: 8
                  }}>
                    👥 Team Collaboration
                  </h1>
                  <p style={{ fontSize: 18, color: "#6B7280", marginBottom: 20 }}>
                    Assign emails, track workload, and collaborate with your team
                  </p>
                </div>

                {/* Team Component */}
                <TeamCollaboration
                  teamMembers={teamMembers.length > 0 ? teamMembers : [
                    { id: "1", name: "You", email: session?.user?.email || "", activeTasksCount: 0, responseRate: 100 },
                    { id: "2", name: "Team Member 1", email: "member1@example.com", activeTasksCount: 0, responseRate: 95 },
                    { id: "3", name: "Team Member 2", email: "member2@example.com", activeTasksCount: 0, responseRate: 90 },
                  ]}
                  assignedEmails={assignedEmails}
                  onAssignEmail={async (emailId, memberId, deadline, notes) => {
                    try {
                      const res = await fetch("/api/team/assignments", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          emailId,
                          assignedTo: memberId,
                          deadline,
                          notes,
                          priority: 50,
                        }),
                      });
                      const data = await res.json();
                      setAssignedEmails([...assignedEmails, data.assignment]);
                      alert("✅ Email assigned successfully!");
                    } catch (error) {
                      alert("❌ Failed to assign email");
                    }
                  }}
                  onUpdateStatus={async (emailId, status) => {
                    try {
                      await fetch("/api/team/assignments", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ emailId, status }),
                      });
                      setAssignedEmails(assignedEmails.map(a => 
                        a.emailId === emailId ? { ...a, status: status as EmailAssignment["status"] } : a
                      ));
                    } catch (error) {
                      // Failed to update status
                    }
                  }}
                  onAddNote={async (emailId, note) => {
                    try {
                      await fetch("/api/team/assignments/notes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ emailId, note }),
                      });
                      setAssignedEmails(assignedEmails.map(a => 
                        a.emailId === emailId ? { ...a, notes: [...a.notes, note] } : a
                      ));
                    } catch (error) {
                      // Failed to add note
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Email List Sidebar - ✅ PREMIUM COMPACT DESIGN */}
              <div
                style={{
                  width: "35%",
                  borderRight: "1px solid #E5E7EB",
                  overflowY: "auto",
                  background: "#F8FAFF",
                }}
              >
                {/* ✅ TO-DO LIST HEADER */}
                {showTodoView && (
                  <div
                    style={{
                      padding: "16px",
                      background: "linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)",
                      color: "white",
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                      ✅ To-Do List
                    </h2>
                    <p style={{ margin: "6px 0 0 0", fontSize: 13, opacity: 0.9 }}>
                      {displayEmails.length} actionable email{displayEmails.length !== 1 ? 's' : ''} • No spam or promotional
                    </p>
                  </div>
                )}

            {/* ✅ NEW: ARCHIVE HEADER */}
            {activeFolder === "archive" && (
              <div
                style={{
                  padding: "16px",
                  background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                  color: "white",
                  borderBottom: "2px solid #E5E7EB",
                }}
              >
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  📦 Archive
                </h2>
                <p style={{ margin: "6px 0 0 0", fontSize: 13, opacity: 0.9 }}>
                  {displayEmails.length} completed email{displayEmails.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* ✅ CATEGORY TABS FOR TO-DO VIEW */}
            {showTodoView && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "12px",
                  background: "white",
                  borderBottom: "1px solid #E5E7EB",
                  overflowX: "auto",
                }}
              >
                {["All", "Do Now", "Needs Decision", "Waiting", "Low Energy"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab((tab === "All" ? "All Mails" : tab) as ActiveTab)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      background: (tab === "All" && activeTab === "All Mails") || activeTab === tab
                        ? "linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)"
                        : "#F3F4F6",
                      color: (tab === "All" && activeTab === "All Mails") || activeTab === tab
                        ? "white"
                        : "#374151",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}


            {/* ✅ WEEKLY ANALYSIS VIEW */}
            {showWeeklyAnalysis ? (
              <div style={{ padding: "24px", overflowY: "auto" }}>
                {(() => {
                  const analysis = getWeeklyAnalysis();
                  
                  return (
                    <div>
                      {/* Stats Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
                        {/* Emails Received */}
                        <div style={{
                          background: "linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)",
                          borderRadius: 16,
                          padding: 20,
                          color: "white",
                          boxShadow: "0 4px 12px rgba(109, 40, 217, 0.25)",
                        }}>
                          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>📧 Emails Received</div>
                          <div style={{ fontSize: 32, fontWeight: 700 }}>{analysis.weekEmails}</div>
                          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Last 7 days</div>
                        </div>

                        {/* Tasks Completed */}
                        <div style={{
                          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                          borderRadius: 16,
                          padding: 20,
                          color: "white",
                          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                        }}>
                          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>✅ Tasks Completed</div>
                          <div style={{ fontSize: 32, fontWeight: 700 }}>{analysis.tasksCompleted}</div>
                          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>From archive</div>
                        </div>

                        {/* Urgent Emails */}
                        <div style={{
                          background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                          borderRadius: 16,
                          padding: 20,
                          color: "white",
                          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
                        }}>
                          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>🔥 Urgent Emails</div>
                          <div style={{ fontSize: 32, fontWeight: 700 }}>{analysis.urgentCount}</div>
                          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>High priority</div>
                        </div>

                        {/* Late Night */}
                        <div style={{
                          background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                          borderRadius: 16,
                          padding: 20,
                          color: "white",
                          boxShadow: "0 4px 12px rgba(139, 92, 246, 0.25)",
                        }}>
                          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>🌙 Late Night Emails</div>
                          <div style={{ fontSize: 32, fontWeight: 700 }}>{analysis.lateNightCount}</div>
                          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>After 10 PM</div>
                        </div>
                      </div>

                      {/* Detailed Analysis Cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
                        {/* Stress Level */}
                        <div style={{
                          background: "white",
                          borderRadius: 16,
                          padding: 24,
                          border: "1px solid #E5E7EB",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#111827" }}>
                            😰 Stress Level
                          </h3>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <span style={{ fontSize: 24, fontWeight: 700, color: analysis.stressColor }}>
                              {analysis.stressLevel}
                            </span>
                            <span style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>
                              {analysis.stressScore}/100
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div style={{
                            width: "100%",
                            height: 12,
                            background: "#E5E7EB",
                            borderRadius: 6,
                            overflow: "hidden",
                          }}>
                            <div style={{
                              width: `${analysis.stressScore}%`,
                              height: "100%",
                              background: `linear-gradient(90deg, ${analysis.stressColor}, ${analysis.stressColor}dd)`,
                              borderRadius: 6,
                              transition: "width 0.5s ease",
                            }} />
                          </div>
                          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 12 }}>
                            Based on urgent keywords, deadlines, and email timing
                          </p>
                        </div>

                        {/* Burnout Risk */}
                        <div style={{
                          background: "white",
                          borderRadius: 16,
                          padding: 24,
                          border: "1px solid #E5E7EB",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#111827" }}>
                            🔥 Burnout Risk
                          </h3>
                          <div style={{
                            display: "inline-block",
                            padding: "12px 24px",
                            borderRadius: 12,
                            background: `${analysis.burnoutColor}15`,
                            border: `2px solid ${analysis.burnoutColor}`,
                          }}>
                            <span style={{ fontSize: 20, fontWeight: 700, color: analysis.burnoutColor }}>
                              {analysis.burnoutRisk}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 16 }}>
                            {analysis.lateNightCount > 5 
                              ? `${analysis.lateNightCount} late-night emails detected. Consider setting boundaries.`
                              : "Good work-life balance maintained this week!"}
                          </p>
                        </div>
                      </div>

                      {/* Productivity Rate - Full Width */}
                      <div style={{
                        background: "white",
                        borderRadius: 16,
                        padding: 24,
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        marginBottom: 24,
                      }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#111827" }}>
                          📈 Productivity Rate
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                          <span style={{ fontSize: 32, fontWeight: 700, color: "#6D28D9" }}>
                            {analysis.productivityRate}%
                          </span>
                          <span style={{ fontSize: 16, color: "#6B7280" }}>
                            {analysis.tasksCompleted} completed out of {analysis.weekEmails} received
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div style={{
                          width: "100%",
                          height: 16,
                          background: "#E5E7EB",
                          borderRadius: 8,
                          overflow: "hidden",
                        }}>
                          <div style={{
                            width: `${analysis.productivityRate}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, #6D28D9, #2563EB)",
                            borderRadius: 8,
                            transition: "width 0.5s ease",
                          }} />
                        </div>
                        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 12 }}>
                          {analysis.productivityRate >= 70 
                            ? "Excellent! You're staying on top of your emails."
                            : analysis.productivityRate >= 40
                            ? "Good progress. Keep completing those tasks!"
                            : "Consider focusing on completing pending tasks."}
                        </p>
                      </div>

                      {/* Recommendations */}
                      <div style={{
                        background: "linear-gradient(135deg, rgba(109, 40, 217, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)",
                        borderRadius: 16,
                        padding: 24,
                        border: "1px solid #E5E7EB",
                      }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#111827" }}>
                          💡 Personalized Recommendations
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {analysis.recommendations.map((rec, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: "white",
                                padding: 16,
                                borderRadius: 12,
                                borderLeft: "4px solid #6D28D9",
                                fontSize: 14,
                                color: "#374151",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              }}
                            >
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* ✅ PREMIUM COMPACT EMAIL CARDS */
              displayEmails.map((mail, index) => {
              const score = getPriorityScore(mail);
              const category = getEmailCategory(mail);
              const tasks = showTodoView ? extractTasks(mail.snippet || mail.body || "") : [];
              
              // ✅ Extract deadline for display
              const text = (mail.subject || "") + " " + (mail.snippet || "");
              const deadline = extractDeadline(text);
              
              // ✅ Title logic for different views
              let todoTitle = "";
              let isAIGenerated = false;
              
              if (activeFolder === "archive") {
                // Archive: Use saved title OR newly generated title OR fallback
                todoTitle = mail.todoTitle || aiTodoTitles[mail.id] || getSimpleTodoTitle(mail);
                isAIGenerated = !!(mail.todoTitle || aiTodoTitles[mail.id]);
              } else if (showTodoView) {
                // To-Do: Use AI title or fallback
                todoTitle = aiTodoTitles[mail.id] || getSimpleTodoTitle(mail);
                isAIGenerated = !!aiTodoTitles[mail.id];
              }


              return (
                <div
                  key={mail.id + "_" + index}
                  onClick={() => {
                    openMailAndGenerateAI(mail.id, mail);
                    generateAIPriorityForMail(mail);
                    // ✅ Generate AI title for archive or to-do
                    if (showTodoView || activeFolder === "archive") {
                      generateAITodoTitle(mail);
                    }
                  }}
                  style={{
                    padding: 14,
                    marginBottom: 8,
                    marginLeft: 12,
                    marginRight: 12,
                    cursor: "pointer",
                    background: selectedMail?.id === mail.id
                      ? "linear-gradient(135deg, rgba(109, 40, 217, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)"
                      : "white",
                    borderRadius: 12,
                    border: selectedMail?.id === mail.id ? "2px solid #6D28D9" : "1px solid #E5E7EB",
                    transition: "all 0.2s ease",
                    boxShadow: selectedMail?.id === mail.id ? "0 4px 12px rgba(109, 40, 217, 0.15)" : "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                  onMouseOver={(e) => {
                    if (selectedMail?.id !== mail.id) {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedMail?.id !== mail.id) {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                    }
                  }}
                >
                  {/* ✅ TOP ROW: Avatar + Subject + Badges */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    {/* ✅ AVATAR */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: "linear-gradient(135deg, #111827 0%, #2563EB 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 14,
                        flexShrink: 0,
                        border: "2px solid white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {getInitials(mail.from)}
                    </div>

                    {/* ✅ CONTENT AREA */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* ✅ TO-DO VIEW or ARCHIVE: Show concise title, NORMAL VIEW: Show subject */}
                      <div style={{
                        fontWeight: 700,
                        color: isAIGenerated ? "#6D28D9" : "#111827",
                        fontSize: (showTodoView || activeFolder === "archive") ? 15 : 14,
                        marginBottom: 4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {(showTodoView || activeFolder === "archive") 
                          ? (todoTitle || mail.subject || "(No Subject)")  // ✅ Always show something
                          : (mail.subject || "(No Subject)")
                        }
                      </div>

                      {/* ✅ COMPACT SINGLE LINE SNIPPET */}
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: "#6B7280",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {(showTodoView || activeFolder === "archive") ? `From: ${mail.from?.split('<')[0].trim() || mail.from}` : mail.snippet}
                      </p>

                      {/* Date + Badges Row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }}>


                        {/* Date */}
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                          {activeFolder === "archive" && mail.completedDate 
                            ? `Completed: ${mail.completedDate}` 
                            : mail.date}
                        </span>

                        {/* ✅ NEW: Deadline Badge */}
                        {deadline && (
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 8,
                              fontSize: 10,
                              fontWeight: 700,
                              background: deadline === "Today" 
                                ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)"
                                : deadline === "Tomorrow" 
                                ? "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)"
                                : "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                              color: "white",
                            }}
                          >
                            📅 {deadline}
                          </span>
                        )}

                        {/* ✅ NEW: Completed Badge for Archive */}
                        {activeFolder === "archive" && (
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 8,
                              fontSize: 10,
                              fontWeight: 700,
                              background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                              color: "white",
                            }}
                          >
                            ✅ Done
                          </span>
                        )}

                        {/* AI Badge */}
                        {isAIGenerated && (
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 8,
                              fontSize: 10,
                              fontWeight: 700,
                              background: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)",
                              color: "white",
                            }}
                          >
                            ✨ AI
                          </span>
                        )}

                        {/* First Time Sender Badge */}
                        {isFirstTimeSender(mail, emails) && (
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 8,
                              fontSize: 10,
                              fontWeight: 700,
                              background: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
                              color: "white",
                            }}
                          >
                            🆕 New
                          </span>
                        )}

                        {/* Spam Badge */}
                        {isSpamEmail(mail) && (
                          <span
                            style={{
                              backgroundColor: "#dc2626",
                              color: "white",
                              padding: "2px 8px",
                              borderRadius: 8,
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            🚫 SPAM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ✅ PRIORITY BADGE - COMPACT VERSION */}
                  <div

                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      marginTop: "8px",
                      background: `linear-gradient(135deg, ${getCategoryColor(category)}, #00000020)`,
                      color: "white",
                    }}
                  >
                    {category} • {score}

                  </div>
                  
                  {/* ✅ TO-DO VIEW: Show Action Items */}
                  {showTodoView && tasks.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #E5E7EB" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {tasks.slice(0, 3).map((task, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 11,
                              padding: "4px 8px",
                              background: "#F3F4F6",
                              borderRadius: 6,
                              color: "#374151",
                              fontWeight: 600,
                            }}
                          >
                            {task}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Priority Reason - Compact */}
                  {aiPriorityMap[mail.id] && (
                    <p style={{
                      fontSize: 11,
                      color: "#6B7280",
                      marginTop: 4,
                      marginBottom: 0,
                      lineHeight: 1.4
                    }}>
                      {aiPriorityMap[mail.id].reason}
                    </p>
                  )}
                </div>
              );
            })
            )}

            {nextPageToken && (
              <button
                onClick={loadEmails}
                disabled={loading}
                style={{
                  width: "calc(100% - 24px)",
                  margin: "12px",
                  padding: 12,
                  background: loading ? "#E5E7EB" : "linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 8px rgba(109, 40, 217, 0.2)",
                }}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            )}
          </div>

          {/* Email Detail Panel */}
          <div
            style={{
              flex: 1,
              padding: 18,
              background: "#F8FAFF",
              overflowY: "scroll",
            }}
          >
            {showWeeklyAnalysis ? (
              <div style={{
                textAlign: "center",
                paddingTop: 60,
                color: "#6B7280"
              }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
                  📊 Weekly Analysis
                </h2>
                <p style={{ marginTop: 12 }}>View your weekly email statistics and insights on the left panel</p>
              </div>
            ) : !selectedMail ? (
              <div style={{
                textAlign: "center",
                paddingTop: 60,
                color: "#6B7280"
              }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
                  📩 Select an email to view
                </h2>
                <p style={{ marginTop: 12 }}>Choose an email from the list to see details and AI insights</p>
              </div>
            ) : (
              <Fragment>
                {/* Email Header - ✅ STICKY WITH QUICK ACTIONS */}
                <div style={{
                  marginBottom: 24,
                  padding: 12,
                  background: "white",
                  borderRadius: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  border: "1px solid #E5E7EB",
                }}>
                  <h2 style={{ fontSize: 16, fontWeight: 100, color: "#111827", margin: 0 }}>
                    {selectedMail.subject}
                  </h2>
                  <p style={{ color: "#6B7280", marginTop: 12, marginBottom: 6 }}>
                    <strong style={{ color: "#111827" }}>From:</strong> {selectedMail.from}
                  </p>
                  <p style={{ color: "#6B7280", margin: 0 }}>
                    <strong style={{ color: "#111827" }}>Date:</strong> {selectedMail.date}
                  </p>

                  <div style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 12,
                    alignItems: "center",
                    flexWrap: "wrap"
                  }}>

                    <button
                      onClick={toggleStar}
                      style={{
                        padding: "6px 10px",
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        cursor: "pointer",
                        background: starredIds.includes(selectedMail.id)
                          ? "#FEF9C3"
                          : "white",
                      }}
                    >
                      ⭐ Star
                    </button>

                    <button
                      onClick={snoozeMail}
                      style={{
                        padding: "6px 10px",
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        cursor: "pointer",
                        background: "white",
                      }}
                    >
                      ⏳ Snooze
                    </button>

                    <button
                      onClick={markDone}
                      style={{
                        padding: "6px 10px",
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        cursor: "pointer",
                        background: "#DCFCE7",
                      }}
                    >
                      ✅ Done
                    </button>
                    {/* 🗑️ Delete */}
                    <button
                      onClick={deleteSelectedMail}
                      title="Delete Email"
                      style={{
                        padding: "6px 10px",
                        fontSize: 14,
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        cursor: "pointer",
                        background: "#FEE2E2",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {/* ✅ DEADLINE DETECTOR CARD */}
                {deadline && (
                  <div
                    style={{
                      background: "linear-gradient(135deg, #FEF9C3 0%, #FDE68A 100%)",
                      padding: 10,
                      borderRadius: 10,
                      marginBottom: 0,
                      border: "1px solid #FACC15",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    <h3 style={{ margin: 0, fontWeight: 800, color: "#92400E" }}>
                      ⏰ Deadline Alert
                    </h3>

                    <p style={{ marginTop: 8, fontSize: 14, color: "#78350F" }}>
                      📅 <strong>Deadline:</strong> {deadline}
                    </p>

                    <p style={{ marginTop: 4, fontSize: 14, color: "#78350F" }}>
                      ⚠️ <strong>Urgency:</strong> {urgency}
                    </p>
                  </div>
                )}

                {/* ✅ STEP 4A - GRID FOR AI SUMMARY + WHY IMPORTANT */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 18,
                    marginBottom: 22,
                  }}
                >
                  {/* AI Summary Card */}
                  <div style={{
                    background: "linear-gradient(135deg, rgba(109, 40, 217, 0.03) 0%, rgba(37, 99, 235, 0.03) 100%)",
                    padding: 16,
                    borderRadius: 16,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    border: "1px solid #E5E7EB"
                  }}>
                    <h3 style={{ fontSize: 15, marginBottom: 14, fontWeight: 700, color: "#111827" }}>
                      ✨ AI Summary
                    </h3>
                    <button
                      onClick={() => generateSummary(selectedMail)}
                      style={{
                        padding: "10px 18px",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 600,
                        marginBottom: 14,
                        boxShadow: "0 4px 12px rgba(109, 40, 217, 0.25)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(109, 40, 217, 0.35)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(109, 40, 217, 0.25)";
                      }}
                    >
                      Generate Summary
                    </button>

                    <div
                      style={{
                        lineHeight: 1.8,
                        whiteSpace: "pre-wrap",
                        background: "white",
                        padding: 18,
                        borderRadius: 12,
                        fontSize: 14,
                        color: "#374151",
                        border: "1px solid #E5E7EB"
                      }}
                    >
                      {loadingAI ? "🔄 Generating AI summary..." : aiSummary || "Click button to generate summary"}
                    </div>
                  </div>

                  {/* Why Important Card */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, rgba(109, 40, 217, 0.03) 0%, rgba(14, 165, 233, 0.03) 100%)",
                      padding: 24,
                      borderRadius: 16,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      border: "1px solid #E5E7EB"
                    }}
                  >
                    <h3 style={{ fontSize: 18, marginBottom: 14, fontWeight: 700, color: "#111827" }}>
                      📌 Why Important?
                    </h3>
                    <button
                      onClick={() => generateExplanation(selectedMail)}
                      style={{
                        padding: "10px 18px",
                        background: "linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)",
                        color: "white",
                        borderRadius: 10,
                        border: "none",
                        cursor: "pointer",
                        marginBottom: 14,
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(109, 40, 217, 0.25)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(109, 40, 217, 0.35)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(109, 40, 217, 0.25)";
                      }}
                    >
                      Explain Importance
                    </button>

                    <div
                      style={{
                        lineHeight: 1.8,
                        whiteSpace: "pre-wrap",
                        background: "white",
                        padding: 18,
                        borderRadius: 12,
                        fontSize: 14,
                        color: "#374151",
                        border: "1px solid #E5E7EB"
                      }}
                    >
                      {aiReason || "Click button to explain importance"}
                    </div>
                  </div>
                </div>

                {/* ✅ STEP 4B - GRID FOR TASKS + BURNOUT */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 18,
                    marginBottom: 22,
                  }}
                >
                  {/* Tasks Extracted */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, rgba(14, 165, 233, 0.03) 0%, rgba(37, 99, 235, 0.03) 100%)",
                      padding: 24,
                      borderRadius: 16,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      border: "1px solid #E5E7EB"
                    }}
                  >
                    <h3 style={{ fontSize: 18, marginBottom: 14, fontWeight: 700, color: "#111827" }}>
                      ✅ Tasks Extracted
                    </h3>
                    {extractTasks(selectedMail?.snippet || selectedMail?.body || "").map((task, i) => (
                      <p key={i} style={{ marginBottom: 8, color: "#374151", fontSize: 14 }}>
                        • {task}
                      </p>
                    ))}
                  </div>

                  {/* Burnout Dashboard */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, rgba(109, 40, 217, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)",
                      padding: 24,
                      borderRadius: 16,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      border: "1px solid #E5E7EB"
                    }}
                  >
                    <h3 style={{ fontSize: 18, marginBottom: 14, fontWeight: 700, color: "#111827" }}>
                      🔥 Burnout Dashboard
                    </h3>
                    <p style={{ marginBottom: 8, color: "#374151", fontSize: 14 }}>
                      <strong style={{ color: "#111827" }}>Stress Level:</strong> {burnout.stressLevel}
                    </p>
                    <p style={{ marginBottom: 8, color: "#374151", fontSize: 14 }}>
                      <strong style={{ color: "#111827" }}>Workload Trend:</strong> {burnout.workloadTrend}
                    </p>
                    <p style={{ fontSize: 13, color: "#6B7280", marginTop: 12 }}>
                      <strong style={{ color: "#111827" }}>Recommendation:</strong> {burnout.recommendation}
                    </p>
                  </div>
                </div>

                {/* AI Reply Generator - ✅ FULL WIDTH */}
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)",
                    padding: 24,
                    borderRadius: 16,
                    marginBottom: 20,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    border: "1px solid #E5E7EB",
                    maxWidth: "100%",
                  }}
                >
                  <h3 style={{ fontSize: 18, marginBottom: 14, fontWeight: 700, color: "#111827" }}>
                    💬 AI Reply Generator
                  </h3>

                  <button
                    onClick={generateReply}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 600,
                      boxShadow: "0 4px 12px rgba(14, 165, 233, 0.25)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(14, 165, 233, 0.35)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(14, 165, 233, 0.25)";
                    }}
                  >
                    {loadingReply ? "Generating..." : "Generate Reply"}
                  </button>

                  {/* Show Generated Reply */}
                  {aiReply && (
                    <div
                      style={{
                        marginTop: 14,
                        padding: 18,
                        background: "white",
                        borderRadius: 12,
                        border: "1px solid #E5E7EB",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.7,
                        fontSize: 14,
                        color: "#374151"
                      }}
                    >
                      {aiReply}
                    </div>
                  )}

                  {/* ✍ Editable Reply + Copy + Send Section */}
                  {aiReply && (
                    <div
                      style={{
                        marginTop: 18,
                        padding: 18,
                        background: "white",
                        borderRadius: 12,
                        border: "1px solid #E5E7EB",
                      }}
                    >
                      <h4 style={{ fontWeight: 700, marginBottom: 10, color: "#111827" }}>
                        ✍ Edit Reply Before Sending
                      </h4>

                      {/* Editable Textarea */}
                      <textarea
                        value={editableReply}
                        onChange={(e) => setEditableReply(e.target.value)}
                        rows={6}
                        style={{
                          width: "100%",
                          padding: 14,
                          borderRadius: 10,
                          border: "1px solid #E5E7EB",
                          fontSize: 14,
                          resize: "none",
                          fontFamily: "inherit",
                          color: "#374151"
                        }}
                      />

                      {/* Buttons Row */}
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          marginTop: 14,
                        }}
                      >
                        {/* 📋 Copy Button */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(editableReply);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          style={{
                            padding: "10px 16px",
                            borderRadius: 10,
                            border: "none",
                            cursor: "pointer",
                            background: copied ? "#10b981" : "linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)",
                            color: "white",
                            fontWeight: 600,
                            transition: "all 0.3s ease",
                            boxShadow: "0 4px 12px rgba(109, 40, 217, 0.25)",
                          }}
                        >
                          {copied ? "✅ Copied!" : "📋 Copy"}
                        </button>

                        {/* ✉ Send Button */}
                        <button
                          onClick={async () => {
                            if (!selectedMail) return alert("Select email first");

                            const recipient = extractEmail(selectedMail.from);

                            if (!recipient) {
                              alert("❌ Cannot reply: No valid recipient email found");
                              return;
                            }

                            const res = await fetch("/api/gmail/reply", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                to: recipient,
                                subject: selectedMail.subject,
                                body: editableReply,
                                threadId: selectedMail.threadId,
                                originalMessageId: selectedMail.messageId,
                              }),
                            });

                            const data = await res.json();

                            if (data.success) {
                              alert("✅ Reply Sent Successfully!");
                            } else {
                              alert("❌ Error: " + data.error);
                            }
                          }}
                          style={{
                            padding: "10px 16px",
                            borderRadius: 10,
                            border: "none",
                            cursor: "pointer",
                            background: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
                            color: "white",
                            fontWeight: 600,
                            transition: "all 0.3s ease",
                            boxShadow: "0 4px 12px rgba(14, 165, 233, 0.25)",
                          }}
                        >
                          ✉ Reply Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Link Section */}
                {extractFirstLink(selectedMail?.body || selectedMail?.snippet || "") && (
                  <div style={{
                    marginBottom: 20,
                    padding: 20,
                    background: "linear-gradient(135deg, rgba(109, 40, 217, 0.05) 0%, rgba(14, 165, 233, 0.05) 100%)",
                    borderRadius: 16,
                    border: "1px solid #E5E7EB"
                  }}>
                    <a
                      href={extractFirstLink(selectedMail?.body || selectedMail?.snippet || "") || "#"}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-block",
                        padding: "12px 24px",
                        background: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 700,
                        boxShadow: "0 4px 12px rgba(14, 165, 233, 0.25)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(14, 165, 233, 0.35)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(14, 165, 233, 0.25)";
                      }}
                    >
                      🔗 CLICK HERE FOR LINK
                    </a>
                  </div>
                )}

                {/* Related Emails */}
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(14, 165, 233, 0.03) 0%, rgba(109, 40, 217, 0.03) 100%)",
                    padding: 24,
                    borderRadius: 16,
                    marginBottom: 20,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    border: "1px solid #E5E7EB"
                  }}
                >
                  <h3 style={{ fontSize: 18, marginBottom: 14, fontWeight: 700, color: "#111827" }}>
                    📌 Related Emails
                  </h3>
                  {emails
                    .filter((m) => m.subject?.includes(selectedMail.subject.split(" ")[0]))
                    .slice(0, 3)
                    .map((m) => (
                      <p key={m.id} style={{ marginBottom: 8, color: "#374151", fontSize: 14 }}>
                        • {m.subject}
                      </p>
                    ))}
                </div>

                {/* Full Email Content */}
                <div
                  style={{
                    background: "white",
                    padding: 24,
                    borderRadius: 16,
                    marginBottom: 20,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    border: "1px solid #E5E7EB"
                  }}
                >
                  <h3 style={{ fontSize: 18, marginBottom: 14, fontWeight: 700, color: "#111827" }}>
                    📩 Full Email Content
                  </h3>

                  <iframe
                    srcDoc={`<base target="_blank" />${selectedMail?.body || "<p>No content available</p>"}`}
                    style={{
                      width: "100%",
                      height: "650px",
                      border: "1px solid #E5E7EB",
                      borderRadius: 12,
                      background: "white",
                    }}
                  />
                </div>

                {/* 📎 Attachments Section */}
                {selectedMail?.attachments && selectedMail.attachments.length > 0 && (
                  <div
                    style={{
                      marginTop: 20,
                      padding: 24,
                      borderRadius: 16,
                      background: "linear-gradient(135deg, rgba(109, 40, 217, 0.03) 0%, rgba(14, 165, 233, 0.03) 100%)",
                      border: "1px solid #E5E7EB"
                    }}
                  >
                    <h3 style={{ fontWeight: 700, marginBottom: 14, color: "#111827", fontSize: 18 }}>
                      📎 Attachments
                    </h3>

                    {selectedMail.attachments && selectedMail.attachments.map((file: Attachment) => (
                      <div
                        key={file.attachmentId}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: 16,
                          background: "white",
                          borderRadius: 12,
                          border: "1px solid #E5E7EB",
                          marginBottom: 12,
                        }}
                      >
                        {/* File Name */}
                        <div>
                          <div style={{ fontWeight: 600, color: "#111827" }}>📎 {file.filename}</div>
                          <p style={{ fontSize: 12, color: "#6B7280", margin: "4px 0 0 0" }}>{file.mimeType}</p>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: "flex", gap: 10 }}>
                          {/* 👁 Preview */}
                          <button
                            onClick={() => setHoverFile(file)}
                            style={{
                              background: "linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)",
                              color: "white",
                              border: "none",
                              padding: "8px 14px",
                              borderRadius: 8,
                              cursor: "pointer",
                              fontWeight: 600,
                              boxShadow: "0 2px 8px rgba(109, 40, 217, 0.25)",
                              transition: "all 0.3s ease",
                            }}
                          >
                            👁 Preview
                          </button>

                          {/* ⬇ Download */}
                          <a
                            href={`/api/gmail/attachment?id=${selectedMail.id}&att=${file.attachmentId}&mime=${file.mimeType}`}
                            target="_blank"
                            style={{
                              background: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
                              color: "white",
                              padding: "8px 14px",
                              borderRadius: 8,
                              textDecoration: "none",
                              fontWeight: 600,
                              boxShadow: "0 2px 8px rgba(14, 165, 233, 0.25)",
                              transition: "all 0.3s ease",
                              display: "inline-block",
                            }}
                          >
                            ⬇ Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ✅ Center Preview Modal */}
                {hoverFile && (
                  <div
                    onClick={() => setHoverFile(null)}
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      background: "rgba(17, 24, 39, 0.7)",
                      backdropFilter: "blur(8px)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 9999,
                    }}
                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: "560px",
                        height: "480px",
                        background: "white",
                        borderRadius: 20,
                        padding: 24,
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                      }}
                    >
                      <button
                        onClick={() => setHoverFile(null)}
                        style={{
                          float: "right",
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: 10,
                          padding: "8px 14px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        ✖ Close
                      </button>

                      <h3 style={{ fontWeight: 700, marginBottom: 16, color: "#111827" }}>
                        👁 Preview: {hoverFile.filename}
                      </h3>

                      {hoverFile.mimeType.startsWith("image/") && (
                        <img
                          src={`/api/gmail/attachment?id=${selectedMail.id}&att=${hoverFile.attachmentId}&mime=${hoverFile.mimeType}`}
                          alt="preview"
                          style={{
                            width: "100%",
                            height: "360px",
                            objectFit: "contain",
                            borderRadius: 12,
                          }}
                        />
                      )}

                      {hoverFile.mimeType === "application/pdf" && (
                        <iframe
                          src={`/api/gmail/attachment?id=${selectedMail.id}&att=${hoverFile.attachmentId}&mime=${hoverFile.mimeType}`}
                          style={{
                            width: "100%",
                            height: "360px",
                            border: "none",
                            borderRadius: 12,
                          }}
                        />
                      )}

                      {!hoverFile.mimeType.startsWith("image/") &&
                        hoverFile.mimeType !== "application/pdf" && (
                          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 20, textAlign: "center" }}>
                            Preview not available for this file type.
                          </p>
                        )}
                    </div>
                  </div>
                )}
              </Fragment>
            )}
          </div>
            </>
          )}
        </div>
      </div>
      
      {/* Compose Modal Component */}
      <ComposeModal
        showCompose={showCompose}
        setShowCompose={setShowCompose}
      />
    </div>

  );
}
