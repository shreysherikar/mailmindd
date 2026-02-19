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

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900">
        <div className="text-white text-2xl font-bold animate-pulse">
          Loading MailMind...
        </div>
      </div>
    );
  }

  // Show landing page if not logged in
  if (status === "unauthenticated") {
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

  // Redirecting to dashboard
  return null;
}
