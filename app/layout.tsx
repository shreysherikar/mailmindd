"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import ReminderProvider from "@/components/ReminderProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[var(--bg)] text-[var(--text)]">
        <SessionProvider>
          <ReminderProvider>
            {children}
          </ReminderProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
