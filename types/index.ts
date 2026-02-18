// TypeScript interfaces for MailMind

export interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  body?: string;
  date: string;
  label?: string[];
  attachments?: Attachment[];
  threadId?: string;
  messageId?: string;
  todoTitle?: string;
  completedDate?: string;
}

export interface Attachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
}

export interface PriorityResult {
  score: number;
  reason: string;
}

export interface CategoryResult {
  category: "Do Now" | "Needs Decision" | "Waiting" | "Low Energy";
  confidence: number;
}

export interface SpamResult {
  isSpam: boolean;
  confidence: number;
  reason: string;
}

export interface DeadlineResult {
  deadline: string | null;
  urgency: string;
  confidence: number;
}

export interface ArchivedEmail extends Email {
  completedAt: string;
  completedDate: string;
  todoTitle?: string;
}

export interface WeeklyAnalysis {
  weekEmails: number;
  tasksCompleted: number;
  urgentCount: number;
  highPriorityCount: number;
  lateNightCount: number;
  stressScore: number;
  stressLevel: string;
  stressColor: string;
  burnoutRisk: string;
  burnoutColor: string;
  productivityRate: number;
  recommendations: string[];
}

export interface BurnoutStats {
  stressScore: number;
  stressLevel: string;
  workloadTrend: string;
  recommendation: string;
}

export type SortBy = "none" | "priority" | "deadline" | "date" | "sender";
export type SortOrder = "asc" | "desc";
export type DeadlineFilter = "all" | "today" | "tomorrow" | "week" | "overdue";
export type ActiveFolder = "inbox" | "starred" | "snoozed" | "done" | "drafts" | "archive";
export type ActiveTab = "All Mails" | "Do Now" | "Waiting" | "Needs Decision" | "Low Energy";

export interface Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
}

// AI Cache Maps
export interface AIPriorityMap {
  [emailId: string]: PriorityResult;
}

export interface AICategoryMap {
  [emailId: string]: CategoryResult;
}

export interface AISpamMap {
  [emailId: string]: SpamResult;
}

export interface AIDeadlineMap {
  [emailId: string]: DeadlineResult;
}

export interface AITodoTitleMap {
  [emailId: string]: string;
}

// API Response Types
export interface GmailAPIResponse {
  emails: Email[];
  nextPageToken: string | null;
}

export interface AIAPIResponse {
  result?: PriorityResult | CategoryResult | SpamResult | DeadlineResult;
  reply?: string;
  summary?: string;
  explanation?: string;
  title?: string;
  error?: string;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
}

export interface ReplyEmailRequest {
  threadId: string;
  replyText: string;
}

export interface APIError {
  error: string;
  message?: string;
  statusCode?: number;
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: "deadline" | "meeting" | "appointment" | "reminder";
  description?: string;
  emailId?: string;
  reminderMinutes?: number;
}

// Team Collaboration Types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  activeTasksCount: number;
  responseRate: number;
}

export interface EmailAssignment {
  id: string;
  emailId: string;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
  deadline?: string;
  status: "assigned" | "in-progress" | "waiting-on-client" | "completed";
  priority: number;
  notes: string[];
}
