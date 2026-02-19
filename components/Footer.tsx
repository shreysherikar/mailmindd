"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full mt-20 px-8 pb-10">
      <div className="max-w-7xl mx-auto">

        {/* Glass Footer Box */}
        <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl px-10 py-10 shadow-xl">

          {/* Top Row */}
          <div className="flex flex-col md:flex-row justify-between gap-10">

            {/* Brand */}
            <div>
              <h2 className="text-2xl font-bold text-white">
                MailMind ✉︎
              </h2>
              <p className="mt-3 text-white/70 max-w-sm leading-relaxed">
                Your AI-powered inbox assistant to prioritize urgent emails,
                generate smart replies, and extract tasks instantly.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-10 text-sm">

              {/* Product */}
              <div>
                <h3 className="text-white font-semibold mb-3">
                  Product
                </h3>
                <ul className="space-y-2 text-white/70">
                  <li>
                    <Link href="/features" className="hover:text-white">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/how-it-works" className="hover:text-white">
                      How it Works
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:text-white">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-white font-semibold mb-3">
                  Company
                </h3>
                <ul className="space-y-2 text-white/70">
                  <li>
                    <Link href="/about" className="hover:text-white">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-white">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-white">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-white/10" />

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">

            <p>
              © {new Date().getFullYear()} MailMind. All rights reserved.
            </p>

            <p className="text-white/50">
              Built with ❤️ + AI for smarter productivity.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
