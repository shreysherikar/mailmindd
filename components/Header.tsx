"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Header() {
  const [time, setTime] = useState("");

  // ✅ Fix hydration: Time loads only on client
  useEffect(() => {
    const updateTime = () => {
      const now = new Date().toLocaleString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      setTime(now);
    };

    updateTime(); // initial load
    const interval = setInterval(updateTime, 60000); // update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <header
      style={{
        width: "100%",
        padding: "18px 40px",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      {/* Glass Navbar */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 26px",
          borderRadius: "22px",
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.18)",
        }}
      >
        {/* ✅ Left Logo Clickable */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            textDecoration: "none",
          }}
        >
          {/* Logo Icon */}
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "18px",
              color: "white",
            }}
          >
            M
          </div>

          {/* Brand + Time */}
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 800,
                color: "white",
              }}
            >
              MailMind
            </h2>

            {/* ✅ Client-only time */}
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              {time}
            </p>
          </div>
        </Link>

        {/* ✅ Center Nav Links */}
        <nav
          style={{
            display: "flex",
            gap: "34px",
            fontWeight: 600,
          }}
        >
          {[
            { name: "Features", href: "/features" },
            { name: "How it Works", href: "/how-it-works" },
            { name: "Testimonials", href: "/testimonials" },
          ].map((item, index) => (
            <Link
              key={index}
              href={item.href}
              style={{
                textDecoration: "none",
                color: "rgba(255,255,255,0.85)",
                fontSize: "15px",
                transition: "0.3s ease",
                padding: "6px 10px",
                borderRadius: "10px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "white";
                e.currentTarget.style.boxShadow =
                  "0 0 12px rgba(255,255,255,0.6)";
                e.currentTarget.style.background =
                  "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* ✅ Right Button (Sliding Fill Transition) */}
        <button
          onClick={() => signIn("google")}
          style={{
            padding: "12px 26px",
            borderRadius: 16,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 15,
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
    </header>
  );
}
