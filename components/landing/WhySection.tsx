export default function WhySection() {
  return (
    <section className="relative z-30 w-full py-1 px-8">
      <div className="max-w-6xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-4xl font-bold text-white">
          Why MailMind?
        </h2>

        <p className="mt-2 text-white/70 max-w-2xl mx-auto">
          Built to help students and professionals stay organized, stress-free,
          and always on top of important emails.
        </p>

        {/* Cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl p-8 shadow-xl hover:scale-[1.03] transition">
            <div className="text-4xl mb-4">✉︎</div>
            <h3 className="text-xl font-semibold text-white">
              AI Email Summaries
            </h3>
            <p className="mt-3 text-white/70 text-sm leading-relaxed">
              Instantly understand long emails in one glance without reading
              everything.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl p-8 shadow-xl hover:scale-[1.03] transition">
            <div className="text-4xl mb-4">☆</div>
            <h3 className="text-xl font-semibold text-white">
              Priority Scoring
            </h3>
            <p className="mt-3 text-white/70 text-sm leading-relaxed">
              Never miss deadlines, interviews, or urgent requests again.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl p-8 shadow-xl hover:scale-[1.03] transition">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-white">
              Task Extraction
            </h3>
            <p className="mt-3 text-white/70 text-sm leading-relaxed">
              MailMind converts emails into actionable tasks automatically.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
