import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LandingBackground from "@/components/LandingBackground";

export default function HowItWorksPage() {
  return (
    <main className="relative min-h-screen text-white overflow-hidden">
      {/* ✅ Same Background as Home */}
      <LandingBackground />

      {/* ✅ Same Header */}
      <Header />

      {/* ================= PAGE CONTENT ================= */}
<section className="relative z-30 pt-[180px] pb-24 px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Title */}
          <h1 className="text-6xl font-extrabold tracking-tight">
            How MailMind Works
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            A simple workflow that turns email overload into calm, prioritized
            productivity — powered by AI.
          </p>
        </div>

        {/* ================= STEPS ================= */}
        <div className="max-w-6xl mx-auto mt-20 space-y-20">
          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <h2 className="text-3xl font-bold mb-4">
                1. Connect Your Inbox
              </h2>
              <p className="text-white/70 leading-relaxed">
                Sign in securely with Google OAuth. MailMind instantly connects
                to your inbox and prepares everything for smart prioritization.
              </p>
            </div>

            {/* Video Box */}
            <div className="rounded-3xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-xl shadow-2xl">
              <div className="aspect-video flex items-center justify-center text-white/50">
                🎥 Video Demo Placeholder
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Video */}
            <div className="rounded-3xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-xl shadow-2xl">
              <div className="aspect-video flex items-center justify-center text-white/50">
                🎥 AI Summary Demo Placeholder
              </div>
            </div>

            {/* Text */}
            <div>
              <h2 className="text-3xl font-bold mb-4">
                2. AI Understands Everything
              </h2>
              <p className="text-white/70 leading-relaxed">
                MailMind summarizes long email threads, detects urgency, and
                scores messages so you know what matters first.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <h2 className="text-3xl font-bold mb-4">
                3. Take Action Instantly
              </h2>
              <p className="text-white/70 leading-relaxed">
                Generate smart replies, extract tasks automatically, and turn
                your inbox into a productivity command center.
              </p>
            </div>

            {/* Video */}
            <div className="rounded-3xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-xl shadow-2xl">
              <div className="aspect-video flex items-center justify-center text-white/50">
                🎥 Task Extraction Demo Placeholder
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Same Footer */}
      <Footer />
    </main>
  );
}
