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
              Please read our legal terms and conditions carefully before inquiring about or acquiring digital artworks from NamiArts.
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
                  <strong>NamiArts retains complete copyright and ownership</strong> over all digital illustrations, character designs, and concept art displayed or sold on this platform.
                </p>
                <p>
                  Purchasing an artwork grants the buyer a <strong>non-exclusive, non-commercial, personal-use license</strong> only. The purchase does NOT transfer the copyright, distribution, or reproduction rights to the client.
                </p>
                <p className="font-bold text-neutral-200">
                  NamiArts reserves the absolute right to continue showcasing, reselling, reproducing, or distributing the same artwork to other clients or platforms at any time.
                </p>
              </div>
            </div>

            {/* Section 2: Distribution & Illegal Sharing */}
            <div className="bg-neutral-900/30 border border-neutral-850 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                <AlertOctagon className="w-5 h-5 text-red-500/80" />
                2. Prohibition of Sharing & Distribution
              </h2>
              <div className="text-neutral-300 space-y-4 text-sm leading-relaxed font-sans">
                <p>
                  As a licensed buyer, you are <strong>strictly prohibited from distributing, sharing, reselling, copying, or transferring</strong> the high-resolution digital files to any other person, group, or third-party platform.
                </p>
                <p>
                  You are not permitted to share the files publicly or make them downloadable on torrents, file-hosting services, or public cloud directories.
                </p>
                <p className="border-l-2 border-red-500 pl-4 py-1 text-red-400 font-semibold bg-red-950/10 rounded-r-lg">
                  IMPORTANT: If any client is found sharing or distributing acquired artwork without explicit written permission, NamiArts will immediately initiate strict legal actions and copyright claims to the fullest extent of the law.
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
                  Any commission or customization requests violating these guidelines will be immediately rejected without review.
                </p>
              </div>
            </div>

            {/* Section 4: Limitation of Liability */}
            <div className="bg-neutral-900/30 border border-neutral-850 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-[#d4af37]" />
                4. Client Usage & Limitation of Liability
              </h2>
              <div className="text-neutral-300 space-y-4 text-sm leading-relaxed font-sans">
                <p>
                  <strong>NamiArts is not responsible or liable</strong> for how a client chooses to utilize, print, or apply the acquired digital images once the files are delivered.
                </p>
                <p>
                  The client assumes full responsibility and liability for their usage. If the client uses the images in any manner that causes legal disputes, damage, or violations of local regulations, NamiArts is completely absolved of any association or liability.
                </p>
              </div>
            </div>

            {/* Section 5: Customizations & Finality */}
            <div className="bg-neutral-900/30 border border-neutral-850 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-neutral-450" />
                5. Fees & Sales Policy
              </h2>
              <div className="text-neutral-300 space-y-4 text-sm leading-relaxed font-sans">
                <p>
                  All digital sales are final. Due to the reproducible nature of digital media files, we do not support returns, cancellations, or refunds once files are shared.
                </p>
                <p>
                  <strong>Customization:</strong> Standard price lists cover direct deliveries. If you request customization (edits to characters, canvas dimensions, or color scales), additional fees will apply depending on the design time required.
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
