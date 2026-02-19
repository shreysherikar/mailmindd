export default function FeaturesSection() {
  const features = [
    {
      title: "AI Email Summaries",
      desc: "Instantly understand long emails in one glance.",
      icon: "📩",
    },
    {
      title: "Priority Scoring",
      desc: "Never miss deadlines, interviews, or urgent requests.",
      icon: "⭐",
    },
    {
      title: "Task Extraction",
      desc: "MailMind converts emails into tasks automatically.",
      icon: "✅",
    },
  ];

  return (
    <section className="mt-32 px-8 text-center">
      {/* Heading */}
      <h2 className="text-4xl font-bold text-white mb-6">
        Why MailMind?
      </h2>

      {/* Subheading */}
      <p className="text-white/70 max-w-2xl mx-auto mb-14 text-lg">
        Your inbox becomes a productivity dashboard — not a stress machine.
      </p>

      {/* Cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="
              p-8 rounded-3xl
              bg-white/10 border border-white/20
              backdrop-blur-xl shadow-xl
              hover:scale-105 transition
            "
          >
            {/* Icon */}
            <div className="text-5xl mb-4">{f.icon}</div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-white mb-3">
              {f.title}
            </h3>

            {/* Description */}
            <p className="text-white/70 text-sm leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
