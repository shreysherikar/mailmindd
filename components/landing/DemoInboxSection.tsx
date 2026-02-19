"use client";

import { useEffect, useRef, useState } from "react";
import { TypeAnimation } from "react-type-animation";
import { Mail, Star, SendHorizontal } from "lucide-react";

export default function LiveInboxDemoSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [startTyping, setStartTyping] = useState(false);

  // ✅ Start typing only when user scrolls here
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartTyping(true);
        }
      },
      { threshold: 0.4 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white">
            Live Inbox Demo ✨
          </h2>
          <p className="text-white/70 mt-3 text-lg">
            Experience how MailMind generates AI-powered replies instantly.
          </p>
        </div>

        {/* Inbox Container */}
        <div className="relative bg-white/10 border border-white/15 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">
            <p className="text-white/70 tracking-widest text-sm flex items-center gap-2">
              <Mail size={18} /> SMART INBOX
            </p>

            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
            </div>
          </div>

          {/* Main Layout */}
          <div className="flex">
            {/* Sidebar */}
            <div className="w-[90px] flex flex-col items-center gap-6 py-8 border-r border-white/10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Mail className="text-white/70" />
              </div>

              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                <Star className="text-white/50" />
              </div>

              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                <SendHorizontal className="text-white/50" />
              </div>
            </div>

            {/* Inbox Content */}
            <div className="flex-1 p-8 space-y-8">
              {/* Email Card 1 */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Internship Recruiter
                    </h3>
                    <p className="text-white/50 text-sm">
                      Re: Interview Scheduling
                    </p>
                    <p className="text-white/60 mt-3">
                      Hi Saloni, we’d love to schedule your interview for the
                      Frontend Developer role...
                    </p>
                  </div>

                  <button className="px-4 py-2 rounded-full bg-orange-200/80 text-black text-sm font-semibold">
                    TO RESPOND
                  </button>
                </div>

                {/* Draft Reply Box */}
                <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-white/60 text-sm mb-3 tracking-wide">
                    ✨ AI DRAFT
                  </p>

                  {/* Typing Animation */}
                  {startTyping ? (
                    <TypeAnimation
                      sequence={[
                        "Thank you for reaching out. I’m excited about the opportunity and would be happy to confirm an interview slot. Please let me know the available timings, and I’ll coordinate accordingly.",
                        1200,
                      ]}
                      speed={65}
                      wrapper="p"
                      className="text-white/80 text-lg leading-relaxed"
                      cursor={false}
                    />
                  ) : (
                    <p className="text-white/40 text-lg">
                      Scroll down to watch AI generate a reply...
                    </p>
                  )}

                  {/* Send Button */}
                  <div className="flex justify-end mt-6">
                    <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold flex items-center gap-2 hover:bg-blue-700 transition">
                      <SendHorizontal size={18} />
                      Send
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Card 2 */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Project Team
                  </h3>
                  <p className="text-white/50 text-sm">
                    Hackathon submission deadline
                  </p>
                  <p className="text-white/60 mt-3">
                    Reminder: Final project submission is due tomorrow at 6 PM.
                  </p>
                </div>

                <span className="px-4 py-2 rounded-full bg-blue-200 text-black text-sm font-semibold">
                  IMPORTANT
                </span>
              </div>

              {/* Email Card 3 */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Finance Alerts
                  </h3>
                  <p className="text-white/50 text-sm">
                    Portfolio update available
                  </p>
                  <p className="text-white/60 mt-3">
                    Your investment portfolio summary is ready for review.
                  </p>
                </div>

                <span className="px-4 py-2 rounded-full bg-yellow-200 text-black text-sm font-semibold">
                  FYI
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
