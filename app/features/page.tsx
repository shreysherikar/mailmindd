"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function FeaturesPage() {
  const features = [
    {
      title: "AI Summary",
      desc: "Generates quick and clear summaries of long emails using AI.",
    },
    {
      title: "Why Important?",
      desc: "Explains why a mail matters so you never miss critical messages.",
    },
    {
      title: "Priority Scoring",
      desc: "AI assigns a score from 0–100 to rank urgent emails first.",
    },
    {
      title: "Task Extraction",
      desc: "Detects action items like meetings, payments, deadlines automatically.",
    },
    {
      title: "Burnout Dashboard",
      desc: "Detects stress signals and workload trends from inbox activity.",
    },
    {
      title: "AI Reply Generator",
      desc: "Creates professional replies instantly with editable text support.",
    },
    {
      title: "Snooze Emails",
      desc: "Temporarily hide emails and revisit them later without losing them.",
    },
    {
      title: "Starred Folder",
      desc: "Save important emails permanently for quick access anytime.",
    },

    // ✅ Extra Cards Added
    {
      title: "Smart Search",
      desc: "Search emails by meaning, not just keywords — powered by AI.",
    },
    {
      title: "Email Insights",
      desc: "Understand inbox patterns, workload peaks, and communication trends.",
    },
    {
      title: "Spam Shield",
      desc: "Automatically filters distractions so only important emails stay visible.",
    },
    {
      title: "Personal AI Assistant",
      desc: "MailMind adapts to your habits and becomes smarter over time.",
    },
  ];

  return (
    <div className="min-h-screen text-white">
      {/* ✅ Header */}
      <Header />

      {/* ✅ Main Section */}
      <main className="pt-44 pb-28 px-10">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#2E026D] via-[#5B21B6] to-[#A855F7]" />

        {/* Heading */}
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-extrabold tracking-tight">
            MailMind Features
          </h1>

          <p className="mt-5 text-lg text-white/75 max-w-2xl mx-auto">
            Explore what makes MailMind a next-gen AI email assistant built for
            calm, clarity, and productivity.
          </p>
        </div>

        {/* ✅ Feature Cards */}
        <div className="max-w-7xl mx-auto mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((item, index) => (
            <div key={index} className="flip-card">
              <div className="flip-inner">
                {/* Front */}
                <div className="flip-front">
                  <h2>{item.title}</h2>
                </div>

                {/* Back */}
                <div className="flip-back">
                  <p>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="max-w-4xl mx-auto mt-24 text-center">
          <button className="w-full py-5 rounded-2xl font-semibold text-lg bg-white/10 border border-white/20 backdrop-blur-xl hover:bg-white/20 transition">
            ✨ New Features Coming Soon…
          </button>
        </div>
      </main>

      {/* ✅ Footer */}
      <Footer />

      {/* ✅ Flip Card Animation */}
      <style>{`
        .flip-card {
          background: transparent;
          width: 100%;
          height: 190px;
          perspective: 1200px;
        }

        .flip-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.75s ease;
        }

        .flip-card:hover .flip-inner {
          transform: rotateY(180deg);
        }

.flip-front {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(18px);

  box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);

  font-size: 20px;
  font-weight: 800;
  color: white;
}



.flip-back {
  background: linear-gradient(
    145deg,
    rgba(0, 0, 0, 0.55),
    rgba(0, 0, 0, 0.35)
  );

  border: 1px solid rgba(255, 255, 255, 0.10);

  border-radius: 22px;

  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
}
  .flip-card:hover .flip-front {
  transform: translateY(-6px);
  box-shadow: 0 0 45px rgba(168, 85, 247, 0.45);
}

      `}</style>
    </div>
  );
}
