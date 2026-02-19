"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Hero from "@/components/Hero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LandingBackground from "@/components/LandingBackground";
import DemoInboxSection from "@/components/landing/DemoInboxSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WhySection from "@/components/landing/WhySection";
import DemoVideoSection from "@/components/landing/DemoVideoSection";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (session) {
    return null; // Will redirect
  }

  return (
    <div className="relative min-h-screen">
      <LandingBackground />
      <Header />
      <Hero />
      <DemoInboxSection />
      <FeaturesSection />
      <WhySection />
      <DemoVideoSection />
      <Footer />
    </div>
  );
}
