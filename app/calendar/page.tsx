"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CalendarView from "@/components/calendar/CalendarView";
import ReminderPopup from "@/components/calendar/ReminderPopup";

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: "deadline" | "meeting" | "appointment" | "reminder";
  emailId?: string;
  from?: string;
  description?: string;
  reminderMinutes?: number;
  status?: string;
};

export default function CalendarPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activeReminder, setActiveReminder] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    type: "reminder" as any,
    description: "",
    reminderMinutes: 15,
  });

  useEffect(() => {
    if (!session) {
      router.push("/");
      return;
    }
    loadEvents();
    startReminderCheck();
    autoExtractFromEmails();
  }, [session]);

  const loadEvents = async () => {
    try {
      const res = await fetch("/api/calendar/events");
      const data = await res.json();
      setEvents(data.events.map((e: any) => ({ ...e, date: new Date(e.date) })));
    } catch (error) {
      console.error("Failed to load events:", error);
    }
    setLoading(false);
  };

  // Auto-extract events from all emails in inbox
  const autoExtractFromEmails = async () => {
    setExtracting(true);
    try {
      // Get all emails from inbox
      const emailsRes = await fetch("/api/gmail");
      const emailsData = await emailsRes.json();
      const emails = emailsData.emails || [];

      console.log(`🔍 Scanning ${emails.length} emails for events...`);

      // Extract events from each email (batch process)
      let totalExtracted = 0;
      for (const email of emails.slice(0, 20)) { // Process first 20 emails
        try {
          const extractRes = await fetch("/api/calendar/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subject: email.subject,
              body: email.body || email.snippet,
              snippet: email.snippet,
              emailId: email.id,
              from: email.from,
            }),
          });

          const extractData = await extractRes.json();
          if (extractData.events && extractData.events.length > 0) {
            // Auto-save extracted events
            for (const event of extractData.events) {
              await saveCalendarEvent(event, false); // Don't reload after each
            }
            totalExtracted += extractData.events.length;
          }
        } catch (err) {
          console.error(`Failed to extract from email ${email.id}:`, err);
        }
      }

      if (totalExtracted > 0) {
        console.log(`✅ Auto-extracted ${totalExtracted} events`);
        await loadEvents(); // Reload all events
      }
    } catch (error) {
      console.error("Auto-extraction failed:", error);
    }
    setExtracting(false);
  };

  const startReminderCheck = () => {
    // Check for reminders every minute
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/calendar/events?checkReminders=true");
        const data = await res.json();
        if (data.reminders && data.reminders.length > 0) {
          setActiveReminder(data.reminders[0]); // Show first reminder
        }
      } catch (error) {
        console.error("Reminder check failed:", error);
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  };

  const saveCalendarEvent = async (event: any, reload = true) => {
    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      const data = await res.json();
      if (reload) {
        await loadEvents();
      }
      return data.event;
    } catch (error) {
      console.error("Failed to save event:", error);
      return null;
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      alert("Please fill in title and date");
      return;
    }

    await saveCalendarEvent({
      ...newEvent,
      reminderMinutes: parseInt(newEvent.reminderMinutes as any) || 15,
    });

    setShowAddModal(false);
    setNewEvent({
      title: "",
      date: "",
      time: "",
      type: "reminder",
      description: "",
      reminderMinutes: 15,
    });
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await fetch(`/api/calendar/events?id=${id}`, { method: "DELETE" });
      await loadEvents();
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.emailId) {
      router.push(`/?emailId=${event.emailId}`);
    }
  };

  const handleDismissReminder = () => {
    setActiveReminder(null);
  };

  const handleSnoozeReminder = async (minutes: number) => {
    if (activeReminder) {
      // Update event to snooze
      await fetch(`/api/calendar/events?id=${activeReminder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "snoozed" }),
      });

      // Show reminder again after snooze time
      setTimeout(() => {
        setActiveReminder(activeReminder);
      }, minutes * 60000);

      setActiveReminder(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#F9FAFB" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <div style={{ fontSize: 18, color: "#6B7280" }}>Loading calendar...</div>
        </div>
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
              📅 Smart Calendar
            </h1>
            <p style={{ fontSize: 14, color: "#6B7280" }}>
              AI automatically extracts events from your emails • {events.length} events tracked
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {extracting && (
              <div style={{ padding: "12px 20px", borderRadius: 12, background: "#EEF2FF", color: "#4F46E5", fontWeight: 600, fontSize: 14 }}>
                🔍 Scanning emails...
              </div>
            )}
            <button
              onClick={() => setShowAddModal(true)}
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
              + Add Event
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
              ← Back to Inbox
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <CalendarView
          events={events}
          onAddEvent={saveCalendarEvent}
          onDeleteEvent={handleDeleteEvent}
          onEventClick={handleEventClick}
        />
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
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
            maxWidth: 500,
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Add New Event</h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>
                Event Title *
              </label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Team meeting, Project deadline..."
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
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
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>
                  Time
                </label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
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
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>
                  Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    fontSize: 14,
                    outline: "none",
                  }}
                >
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="appointment">Appointment</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>
                  Remind me (minutes before)
                </label>
                <select
                  value={newEvent.reminderMinutes}
                  onChange={(e) => setNewEvent({ ...newEvent, reminderMinutes: parseInt(e.target.value) })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    fontSize: 14,
                    outline: "none",
                  }}
                >
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="1440">1 day</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>
                Description
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Add details about this event..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  fontSize: 14,
                  outline: "none",
                  resize: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleAddEvent}
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
                Add Event
              </button>
              <button
                onClick={() => setShowAddModal(false)}
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
      )}

      {/* Reminder Popup */}
      {activeReminder && (
        <ReminderPopup
          event={activeReminder}
          onDismiss={handleDismissReminder}
          onSnooze={handleSnoozeReminder}
        />
      )}
    </div>
  );
}
