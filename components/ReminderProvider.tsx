"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import ReminderPopup from "./calendar/ReminderPopup";

type CalendarEvent = {
  id: string;
  title: string;
  date: Date | string;
  time?: string;
  type: "deadline" | "meeting" | "appointment" | "reminder";
  emailId?: string;
  from?: string;
  description?: string;
  reminderMinutes?: number;
  status?: string;
};

const ReminderContext = createContext<any>(null);

export function useReminders() {
  return useContext(ReminderContext);
}

export default function ReminderProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [activeReminder, setActiveReminder] = useState<CalendarEvent | null>(null);
  const [shownReminders, setShownReminders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session) return;

    // Check for reminders every 30 seconds
    const interval = setInterval(() => {
      checkForReminders();
    }, 30000); // 30 seconds

    // Check immediately on mount
    checkForReminders();

    return () => clearInterval(interval);
  }, [session, shownReminders]);

  const checkForReminders = async () => {
    try {
      const res = await fetch("/api/calendar/events");
      const data = await res.json();
      
      if (!data.events || data.events.length === 0) return;

      const now = new Date();
      
      for (const event of data.events) {
        // Skip if already shown
        if (shownReminders.has(event.id)) continue;
        
        // Skip if dismissed
        if (event.status === "dismissed") continue;

        const eventDate = new Date(event.date);
        
        // If event has time, set it
        if (event.time) {
          const [hours, minutes] = event.time.split(":");
          eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          // If no time, set to 9 AM
          eventDate.setHours(9, 0, 0, 0);
        }

        // Calculate reminder time
        const reminderMinutes = event.reminderMinutes || 15;
        const reminderTime = new Date(eventDate.getTime() - reminderMinutes * 60000);

        // Check if it's time to show reminder
        if (now >= reminderTime && now < eventDate) {
          console.log("🔔 Showing reminder for:", event.title);
          setActiveReminder({
            ...event,
            date: eventDate,
          });
          setShownReminders(prev => new Set([...prev, event.id]));
          break; // Show one at a time
        }
      }
    } catch (error) {
      console.error("Failed to check reminders:", error);
    }
  };

  const handleDismissReminder = async () => {
    if (activeReminder) {
      // Mark as dismissed in backend
      try {
        await fetch(`/api/calendar/events?id=${activeReminder.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "dismissed" }),
        });
      } catch (error) {
        console.error("Failed to dismiss reminder:", error);
      }
    }
    setActiveReminder(null);
  };

  const handleSnoozeReminder = (minutes: number) => {
    if (activeReminder) {
      // Remove from shown reminders so it can show again
      setShownReminders(prev => {
        const newSet = new Set(prev);
        newSet.delete(activeReminder.id);
        return newSet;
      });

      // Show again after snooze time
      setTimeout(() => {
        setActiveReminder(activeReminder);
      }, minutes * 60000);
    }
    setActiveReminder(null);
  };

  const refreshReminders = () => {
    setShownReminders(new Set());
    checkForReminders();
  };

  return (
    <ReminderContext.Provider value={{ refreshReminders }}>
      {children}
      
      {/* Global Reminder Popup */}
      {activeReminder && (
        <ReminderPopup
          event={activeReminder}
          onDismiss={handleDismissReminder}
          onSnooze={handleSnoozeReminder}
        />
      )}
    </ReminderContext.Provider>
  );
}
