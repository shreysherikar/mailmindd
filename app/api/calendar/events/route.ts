import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// Enhanced in-memory storage with better structure
let calendarEvents: any[] = [];
let eventReminders: any[] = []; // Track which reminders have been shown

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = (session as any).user?.email;
    const checkReminders = searchParams.get("checkReminders") === "true";

    // Filter events for this user
    const userEvents = calendarEvents.filter(e => e.userId === userId);

    // If checking for reminders, return upcoming events that need reminders
    if (checkReminders) {
      const now = new Date();
      const upcomingReminders = userEvents.filter(event => {
        const eventDate = new Date(event.date);
        if (event.time) {
          const [hours, minutes] = event.time.split(":");
          eventDate.setHours(parseInt(hours), parseInt(minutes));
        }
        
        const reminderTime = new Date(eventDate.getTime() - (event.reminderMinutes || 15) * 60000);
        const reminderKey = `${event.id}-${reminderTime.getTime()}`;
        
        // Check if reminder should be shown
        const shouldShow = now >= reminderTime && now < eventDate;
        const alreadyShown = eventReminders.includes(reminderKey);
        
        if (shouldShow && !alreadyShown) {
          eventReminders.push(reminderKey);
          return true;
        }
        return false;
      });
      
      return NextResponse.json({ reminders: upcomingReminders });
    }

    return NextResponse.json({ events: userEvents });
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
    const userId = (session as any).user?.email;

    const newEvent = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId,
      title: body.title,
      date: body.date,
      time: body.time || null,
      type: body.type || "reminder",
      emailId: body.emailId || null,
      from: body.from || null,
      description: body.description || "",
      reminderMinutes: body.reminderMinutes || 15,
      createdAt: new Date().toISOString(),
      status: "active", // active, snoozed, dismissed
    };

    calendarEvents.push(newEvent);

    return NextResponse.json({ event: newEvent, success: true });
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

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("id");
    const userId = (session as any).user?.email;
    const body = await req.json();

    const eventIndex = calendarEvents.findIndex(
      e => e.id === eventId && e.userId === userId
    );

    if (eventIndex === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Update event
    calendarEvents[eventIndex] = {
      ...calendarEvents[eventIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ event: calendarEvents[eventIndex], success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("id");
    const userId = (session as any).user?.email;

    calendarEvents = calendarEvents.filter(
      e => !(e.id === eventId && e.userId === userId)
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
