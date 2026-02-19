"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  /* ✅ Slideshow Images */
  const slides = [
    "/login/slide1.png",
    "/login/slide2.png",
    "/login/slide3.png",
    "/login/slide4.png",
    "/login/slide5.png",
  ];

  /* ✅ Brand Values */
  const values = ["Privacy-first", "Human calm", "AI clarity", "No chaos", "Trust"];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);

  /* ✅ Auto Slide Rotation */
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(slideInterval);
  }, []);

  /* ✅ Auto Value Rotation */
  useEffect(() => {
    const valueInterval = setInterval(() => {
      setCurrentValue((prev) => (prev + 1) % values.length);
    }, 2200);

    return () => clearInterval(valueInterval);
  }, []);

  return (
    <section className="relative z-30 w-full pt-44 pb-12 px-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        {/* ================= LEFT CONTENT ================= */}
        <div>
          {/* Headline */}
          <h1 className="text-[64px] font-extrabold tracking-tight text-white leading-[1.05]">
            Inbox chaos,
            <br />
            <span className="text-blue-200">made calm.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-7 text-lg text-white/70 max-w-xl leading-relaxed">
            MailMind helps you stay focused by summarizing, prioritizing,
            and turning emails into action — instantly.
          </p>

          {/* Rotating Values */}
          <div className="mt-10 flex items-center gap-3 text-base text-white/60">
            <span className="opacity-70">Built for</span>

            <span
              key={currentValue}
              className="text-white font-semibold animate-valueDrop"
            >
              {values[currentValue]}
            </span>
          </div>
        </div>

        {/* ================= RIGHT IMAGE ================= */}
        <div className="relative flex justify-center">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-purple-500/25 blur-[160px] rounded-full" />

          {/* Glass Frame */}
          <div className="relative w-[580px] h-[390px] rounded-[32px] overflow-hidden border border-white/15 bg-white/5 backdrop-blur-2xl shadow-[0_0_80px_rgba(168,85,247,0.25)]">
            <img
              key={currentSlide}
              src={slides[currentSlide]}
              alt="MailMind Preview"
              className="w-full h-full object-cover absolute animate-slideFade"
            />
          </div>
        </div>
      </div>

      {/* ================= ANIMATIONS ================= */}
      <style>
        {`
          /* ✅ Smooth Slide Fade */
          @keyframes slideFade {
            0% {
              opacity: 0;
              transform: scale(1.02);
            }
            20% {
              opacity: 1;
              transform: scale(1);
            }
            80% {
              opacity: 1;
              transform: scale(1);
            }
            100% {
              opacity: 0;
              transform: scale(0.98);
            }
          }

          .animate-slideFade {
            animation: slideFade 4s ease-in-out;
          }

          /* ✅ Value Drop Animation */
          @keyframes valueDrop {
            0% {
              opacity: 0;
              transform: translateY(-12px);
            }
            60% {
              opacity: 1;
              transform: translateY(0px);
            }
            100% {
              opacity: 1;
            }
          }

          .animate-valueDrop {
            animation: valueDrop 0.7s ease;
          }
        `}
      </style>
    </section>
  );
}
