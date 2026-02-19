"use client";

export default function LandingBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      {/* ===================================== */}
      {/* ✅ MAIN PREMIUM VIOLET GRADIENT BASE */}
      {/* ===================================== */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.55), transparent 55%),
            radial-gradient(circle at 80% 30%, rgba(236, 72, 153, 0.45), transparent 60%),
            radial-gradient(circle at 50% 90%, rgba(59, 130, 246, 0.25), transparent 70%),
            linear-gradient(to bottom, #1a0033, #3b0a73, #12001f)
          `,
        }}
      />

      {/* ===================================== */}
      {/* ✅ STRIKING DIAGONAL GLOW STREAK LINES */}
      {/* ===================================== */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Line 1 */}
        <div
          className="absolute w-[140%] h-[2px] rotate-[-12deg]
                     top-[55%] left-[-20%]
                     bg-gradient-to-r from-transparent via-purple-300/80 to-transparent
                     blur-[1px] opacity-70 animate-streak"
        />

        {/* Line 2 */}
        <div
          className="absolute w-[140%] h-[3px] rotate-[-10deg]
                     top-[70%] left-[-25%]
                     bg-gradient-to-r from-transparent via-pink-400/70 to-transparent
                     blur-[2px] opacity-60 animate-streakSlow"
        />

        {/* Line 3 (Soft faint trail) */}
        <div
          className="absolute w-[140%] h-[1px] rotate-[-14deg]
                     top-[78%] left-[-30%]
                     bg-gradient-to-r from-transparent via-blue-200/50 to-transparent
                     blur-[1px] opacity-40 animate-streakSlow"
        />
      </div>

      {/* ===================================== */}
      {/* ✅ BOTTOM WAVY GLOW CURVES */}
      {/* ===================================== */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[420px] opacity-60 animate-wavePulse"
        viewBox="0 0 1200 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient */}
          <linearGradient id="waveGradient" x1="0" y1="0" x2="1200" y2="0">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
            <stop offset="40%" stopColor="#c084fc" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#ec4899" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Wave Line 1 */}
        <path
          d="M0 260C250 150 450 360 650 240C850 120 1050 310 1200 210"
          stroke="url(#waveGradient)"
          strokeWidth="3"
          filter="url(#glow)"
        />

        {/* Wave Line 2 */}
        <path
          d="M0 320C280 200 500 380 720 270C900 160 1100 330 1200 250"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          filter="url(#glow)"
          opacity="0.7"
        />

        {/* Wave Line 3 */}
        <path
          d="M0 360C300 240 540 390 760 300C940 210 1120 340 1200 290"
          stroke="url(#waveGradient)"
          strokeWidth="1.5"
          filter="url(#glow)"
          opacity="0.45"
        />
      </svg>

      {/* ===================================== */}
      {/* ✅ FLOATING GLOW ORBS */}
      {/* ===================================== */}
      <div className="absolute top-24 left-20 w-[420px] h-[420px] bg-purple-500/30 blur-[160px] rounded-full animate-orb" />

      <div className="absolute top-10 right-32 w-[520px] h-[520px] bg-pink-500/25 blur-[180px] rounded-full animate-orbSlow" />

      <div className="absolute bottom-10 left-1/2 w-[650px] h-[650px] bg-indigo-500/20 blur-[220px] rounded-full animate-orb" />

      {/* ===================================== */}
      {/* ✅ FULL BACKGROUND ANIMATIONS */}
      {/* ===================================== */}
      <style>
        {`
          /* 🔥 Diagonal streak shimmer */
          @keyframes streakMove {
            0% {
              transform: translateX(-150px);
              opacity: 0.25;
            }
            50% {
              transform: translateX(150px);
              opacity: 0.85;
            }
            100% {
              transform: translateX(-150px);
              opacity: 0.25;
            }
          }

          .animate-streak {
            animation: streakMove 4s ease-in-out infinite;
          }

          .animate-streakSlow {
            animation: streakMove 7s ease-in-out infinite;
          }

          /* 🌊 Bottom wave pulse */
          @keyframes wavePulse {
            0% { opacity: 0.35; }
            50% { opacity: 0.75; }
            100% { opacity: 0.35; }
          }

          .animate-wavePulse {
            animation: wavePulse 6s ease-in-out infinite;
          }

          /* ✨ Floating Orbs Glow */
          @keyframes orbFloat {
            0% {
              transform: translateY(0px);
              opacity: 0.45;
            }
            50% {
              transform: translateY(-25px);
              opacity: 0.85;
            }
            100% {
              transform: translateY(0px);
              opacity: 0.45;
            }
          }

          .animate-orb {
            animation: orbFloat 7s ease-in-out infinite;
          }

          .animate-orbSlow {
            animation: orbFloat 11s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}
