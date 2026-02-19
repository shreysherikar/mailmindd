"use client";

export default function DemoVideoSection() {
  return (
    <section className="w-full py-16 px-8 relative z-30">
      <div className="max-w-6xl mx-auto text-center">
        {/* Heading */}
        <h2 className="mt-0 text-4xl font-extrabold text-white">
          See MailMind in Action
        </h2>

        {/* Subtitle */}
        <p className="mt-2 text-lg text-white/70 max-w-2xl mx-auto">
          Watch how MailMind instantly detects urgent emails, generates smart
          replies, and turns messages into actionable tasks — all powered by AI.
        </p>

        {/* Video Box Placeholder */}
        <div className="mt-14 flex justify-center">
          <div
            className="
              w-full max-w-4xl 
              h-[480px] 
              rounded-3xl 
              border border-white/20 
              bg-white/5 
              backdrop-blur-xl 
              shadow-2xl 
              overflow-hidden
              flex items-center justify-center
            "
          >
            {/* Placeholder Text */}
            <p className="text-white/60 text-lg font-medium">
              🎥 Demo Video Coming Soon...
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
