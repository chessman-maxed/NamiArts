"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Shield, ArrowLeft, Scale, AlertOctagon, EyeOff, UserCheck } from "lucide-react";

export default function LegalPage() {
  const router = useRouter();

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-24 md:pt-28 pb-16 md:pb-20 bg-neutral-950 relative flex flex-col justify-center">
        <div className="absolute inset-0 ambient-glow z-0 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 w-full">
          {/* Back button */}
          <button
            onClick={() => router.push("/")}
            className="group inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6 md:mb-8 transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </button>

          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/10 border border-[#d4af37]/20 text-[#d4af37] mb-4">
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white tracking-wide mb-4">
              Terms of Service & Licensing
            </h1>
            <p className="text-neutral-400 text-sm font-sans">
              Please read our legal terms and conditions carefully before inquiring about or ordering photo frames from NamiArts.
            </p>
          </div>

          {/* Legal Sections */}
          <div className="space-y-8">
            
            {/* Section 1: Copyright & Ownership */}
            <div className="bg-neutral-900/30 border border-neutral-850 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-[#d4af37]" />
                1. Copyright & Intellectual Property
              </h2>
              <div className="text-neutral-300 space-y-4 text-sm leading-relaxed font-sans">
                <p>
                  <strong>NamiArts retains complete copyright and ownership</strong> over all visual artwork designs, character illustrations, and concept art showcased on this platform.
                </p>
                <p>
                  Purchasing a physical photo frame grants the client physical ownership of the framed product. The purchase does NOT transfer any copyright, commercial reproduction, or distribution rights to the client.
                </p>
                <p className="font-bold text-neutral-200">
                  NamiArts reserves the absolute right to continue showcasing, reproducing, or selling framed physical artwork designs to other clients at any time.
                </p>
              </div>
            </div>

            {/* Section 2: Distribution & Reproduction */}
            <div className="bg-neutral-900/30 border border-neutral-850 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                <AlertOctagon className="w-5 h-5 text-red-500/80" />
                2. Prohibition of Commercial Reproduction
              </h2>
              <div className="text-neutral-300 space-y-4 text-sm leading-relaxed font-sans">
                <p>
                  Clients are <strong>strictly prohibited from scanning, copying, reproducing, or commercializing</strong> NamiArts artwork designs in any form.
                </p>
                <p>
                  Framed artworks are provided exclusively for personal display in homes, offices, studios, or personal spaces.
                </p>
                <p className="border-l-2 border-red-500 pl-4 py-1 text-red-400 font-semibold bg-red-950/10 rounded-r-lg">
                  IMPORTANT: If any client is found commercially reproducing or distributing NamiArts artwork designs without explicit written authorization, NamiArts will initiate strict legal actions.
                </p>
              </div>
            </div>

            {/* Section 3: Appropriate Content Policy */}
            <div className="bg-neutral-900/30 border border-neutral-850 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                <EyeOff className="w-5 h-5 text-amber-500/80" />
                3. Appropriate Content & Request Policy
              </h2>
              <div className="text-neutral-300 space-y-4 text-sm leading-relaxed font-sans">
                <p>
                  NamiArts is dedicated to maintaining a clean, professional, and ethical artistic environment.
                </p>
                <p className="font-semibold text-neutral-200">
                  We strictly refuse to create, modify, or accept requests for:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Adult content, pornography, or sexually explicit (NSFW) imagery.</li>
                  <li>Hate speech, extreme violence, offensive slurs, or discriminatory material.</li>
                  <li>Any illegal or copyrighted materials without proper ownership credentials.</li>
                </ul>
                <p>
                  Any commission or customization requests violating these guidelines will be immediately rejected.
                </p>
              </div>
            </div>

            {/* Section 4: Limitation of Liability */}
            <div className="bg-neutral-900/30 border border-neutral-850 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-[#d4af37]" />
                4. Delivery & Order Policy
              </h2>
              <div className="text-neutral-300 space-y-4 text-sm leading-relaxed font-sans">
                <p>
                  <strong>NamiArts ensures high quality framing and packaging</strong> for all physical photo frame orders. Delivery details and tracking are coordinated upon order confirmation.
                </p>
                <p>
                  Clients are encouraged to verify frame specifications, sizes, and color choices prior to final dispatch.
                </p>
              </div>
            </div>

            {/* Section 5: Customizations & Finality */}
            <div className="bg-neutral-900/30 border border-neutral-850 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-neutral-450" />
                5. Customization & Pricing
              </h2>
              <div className="text-neutral-300 space-y-4 text-sm leading-relaxed font-sans">
                <p>
                  Custom frame sizing, color finishes, and personalized artwork adjustments are available upon request during inquiry.
                </p>
                <p>
                  <strong>Customization:</strong> Standard frame prices apply to catalog selections. Custom framing finishes or artwork edits will be quoted based on complexity.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-neutral-900 text-center text-sm text-neutral-500 font-sans bg-neutral-950/40 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display text-base font-bold text-white tracking-widest">NAMI<span className="text-[#d4af37]">ARTS</span></p>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Link href="/" className="hover:text-[#d4af37] transition-colors duration-200 text-neutral-450 hover:underline">
              Home
            </Link>
            <p>© 2026 NamiArts. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
