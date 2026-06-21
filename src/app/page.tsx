"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/navbar";
import ArtworkCard from "@/components/artwork-card";
import { Mail, MessageSquare, Palette, ShieldAlert, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface Artwork {
  id: string;
  title: string;
  price: string | number;
  imageUrl: string;
  aspectRatio?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
}

export default function Home() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllArtworks, setShowAllArtworks] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "artworks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const artList: Artwork[] = [];
      snapshot.forEach((doc) => {
        artList.push({ id: doc.id, ...doc.data() } as Artwork);
      });
      setArtworks(artList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching artworks:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "nameearts@gmail.com";
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919699338301";
  const whatsappMessage = encodeURIComponent("Hello! I am interested in inquiring about and purchasing digital artwork from NamiArts.");

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute inset-0 ambient-glow z-0" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center z-10 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-850 text-[#d4af37] text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Palette className="w-3.5 h-3.5" />
            Digital Art Studio & Gallery
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Elevating Imagination <br />
            Into <span className="shimmer-text">Digital Reality</span>
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Welcome to NamiArts. Discover premium digital artworks, character concepts, and immersive illustrations crafted with luxury aesthetic.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#gallery"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#d4af37] hover:bg-[#b8901c] text-black font-semibold tracking-wide shadow-[0_4px_20px_rgba(214,175,55,0.25)] transition-all duration-300 transform hover:-translate-y-0.5 text-center"
            >
              Explore the Gallery
            </a>
            <a
              href="#contact"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent hover:bg-neutral-900 text-white font-semibold tracking-wide border border-neutral-800 hover:border-neutral-700 transition-all duration-300 transform hover:-translate-y-0.5 text-center"
            >
              Inquire to Buy
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 z-10">
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">Scroll</span>
          <div className="w-1 h-8 bg-neutral-800 rounded-full overflow-hidden">
            <div className="w-full h-1/2 bg-[#d4af37] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Infinite Moving Disclaimer Marquee */}
      <div className="relative flex overflow-x-hidden w-full py-3 bg-[#0a0a0a] border-y border-neutral-900 select-none z-20 shadow-[0_0_30px_rgba(214,175,55,0.02)]">
        <div className="animate-marquee-ltr flex whitespace-nowrap shrink-0 gap-10 text-neutral-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
          <span className="text-[#d4af37] px-2 py-0.5 rounded bg-[#d4af37]/10 text-[9px] font-extrabold self-center">Disclaimer</span>
          <span>If our art matches with someone else’s . then consider this as purely coincidental and unintentional as we don’t want to hurt sentiments of any person or community or any religion.</span>
          <span className="text-[#d4af37] self-center">✦</span>
          <span className="text-[#d4af37] px-2 py-0.5 rounded bg-[#d4af37]/10 text-[9px] font-extrabold self-center">Disclaimer</span>
          <span>If our art matches with someone else’s . then consider this as purely coincidental and unintentional as we don’t want to hurt sentiments of any person or community or any religion.</span>
          <span className="text-[#d4af37] self-center">✦</span>
        </div>
        <div className="animate-marquee-ltr flex whitespace-nowrap shrink-0 gap-10 text-neutral-400 text-[10px] md:text-xs font-bold uppercase tracking-widest" aria-hidden="true">
          <span className="text-[#d4af37] px-2 py-0.5 rounded bg-[#d4af37]/10 text-[9px] font-extrabold self-center">Disclaimer</span>
          <span>If our art matches with someone else’s . then consider this as purely coincidental and unintentional as we don’t want to hurt sentiments of any person or community or any religion.</span>
          <span className="text-[#d4af37] self-center">✦</span>
          <span className="text-[#d4af37] px-2 py-0.5 rounded bg-[#d4af37]/10 text-[9px] font-extrabold self-center">Disclaimer</span>
          <span>If our art matches with someone else’s . then consider this as purely coincidental and unintentional as we don’t want to hurt sentiments of any person or community or any religion.</span>
          <span className="text-[#d4af37] self-center">✦</span>
        </div>
      </div>

      <section id="about" className="py-16 md:py-24 border-t border-neutral-900 bg-neutral-950/20 relative">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Visual container (Left side) */}
          <div className="relative aspect-[9/16] w-full max-w-[360px] lg:max-w-[400px] mx-auto rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/80 flex items-center justify-center group select-none protected-image">
            {/* Invisible protection shield overlay to prevent direct saving */}
            <div className="absolute inset-0 z-20" onContextMenu={(e) => e.preventDefault()} />
            
            <div className="absolute inset-0 ambient-glow z-10 pointer-events-none" />
            
            {/* Secure visible image container using background-image */}
            <div
              role="img"
              aria-label="NamiArts Studio"
              style={{ backgroundImage: "url('/about_art.jpg')" }}
              className="h-full w-full bg-cover bg-bottom transition-transform duration-750 ease-out group-hover:scale-105 pointer-events-none select-none z-0"
            />
            {/* Subtle glow border */}
            <div className="absolute inset-0 border border-amber-500/10 group-hover:border-amber-500/20 transition-colors duration-500 rounded-2xl z-30" />
          </div>

          {/* About description (Right side) */}
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold mb-3">The Studio</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-wide mb-6">
              About NamiArts
            </h2>
            <p className="text-neutral-400 leading-relaxed font-sans mb-6">
              NamiArts is a premium digital art studio and creative brand. With a deep passion for digital media, character concept art, and high-fidelity rendering, NamiArts focuses on blending artistic expression with high technical precision.
            </p>
            <p className="text-neutral-400 leading-relaxed font-sans mb-0">
              Every digital piece is made originally by us, then enhanced and curated using AI to deliver the highest resolution masterwork. We design immersive visual identities and custom artwork tailored for collectors, gamers, and enthusiasts looking to possess premium digital media.
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic Artwork Gallery Section */}
      <section id="gallery" className="py-16 md:py-24 border-t border-neutral-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold mb-3">Portfolio</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-wide mb-4">
              Curated Masterpieces
            </h2>
            <p className="text-neutral-400">
              Browse original digital drawings and character art. Click any artwork to view high-resolution previews and buying details.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-neutral-800 border-t-[#d4af37] rounded-full animate-spin" />
              <p className="text-neutral-500 text-sm">Opening the gallery vaults...</p>
            </div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-16 bg-neutral-900/10 border border-neutral-800/80 rounded-2xl max-w-md mx-auto px-6">
              <ShieldAlert className="w-10 h-10 text-neutral-600 mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-white mb-2">Gallery is Empty</h3>
              <p className="text-neutral-400 text-sm">
                No artworks are currently listed. Please check back later as the gallery updates dynamically!
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {(showAllArtworks ? artworks : artworks.slice(0, 6)).map((art) => (
                  <ArtworkCard
                    key={art.id}
                    id={art.id}
                    title={art.title}
                    price={art.price}
                    imageUrl={art.imageUrl}
                  />
                ))}
              </div>

              {artworks.length > 6 && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setShowAllArtworks(!showAllArtworks)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#d4af37]/35 bg-neutral-900/60 hover:bg-[#d4af37] text-white hover:text-black font-semibold text-xs tracking-wider uppercase transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-md"
                  >
                    {showAllArtworks ? (
                      <>
                        Show Less
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        View More Artworks
                        <ChevronDown className="w-4 h-4 animate-bounce" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 border-t border-neutral-900 bg-neutral-950/20 relative">
        <div className="absolute inset-0 ambient-glow z-0" />
        <div className="max-w-4xl mx-auto px-6 text-center z-10 relative">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold mb-3">Acquisitions</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-wide mb-6">
            Inquire About Purchasing
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Interested in owning any of our showcased digital artworks? Get in touch directly via WhatsApp or Email to coordinate secure payment and digital transfer.
          </p>

          {/* Customization Callout Banner */}
          <div className="max-w-xl mx-auto mb-6 p-6 rounded-2xl bg-amber-500/5 border border-[#d4af37]/25 backdrop-blur-sm text-center">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#d4af37] font-bold uppercase tracking-widest mb-2">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Tailored Custom Artworks
            </span>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              Personalized Art Customization
            </h3>
            <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
              Any artwork displayed in our gallery can be custom-tailored to suit your personal style, character details, or color preferences. Customizations will incur a slightly higher charge than the standard price based on the complexity.
            </p>
          </div>

          {/* Copyright Disclaimer Banner */}
          <div className="max-w-xl mx-auto mb-6 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-855 text-center text-xs text-neutral-400 font-sans leading-relaxed">
            <strong className="text-neutral-200 block mb-1">Copyright License Disclaimer:</strong>
            <strong>Purchasing any digital artwork from NamiArts grants a personal-use license only. All copyrights, intellectual property, and commercial distribution rights remain exclusively with NamiArts, and we reserve the right to showcase, reproduce, or resell the same artwork to other clients.</strong>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="max-w-xl mx-auto mb-12 p-4 bg-neutral-950/70 border border-neutral-850 rounded-xl flex items-start gap-3 select-none text-left">
            <input
              id="terms-agreement-checkbox"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-5 w-5 min-w-[20px] rounded border-neutral-700 bg-neutral-900 text-[#d4af37] focus:ring-[#d4af37] focus:ring-offset-neutral-955 accent-[#d4af37] cursor-pointer"
            />
            <label htmlFor="terms-agreement-checkbox" className="text-xs font-bold text-neutral-350 leading-snug uppercase tracking-wider cursor-pointer">
              By checking this box you agree to all of our{" "}
              <Link href="/legal" target="_blank" rel="noopener noreferrer" className="text-[#d4af37] hover:underline normal-case font-extrabold">
                Terms & Conditions
              </Link>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-lg mx-auto">
            {agreed ? (
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-1/2 flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-white font-semibold border border-neutral-800 hover:border-neutral-700 transition-all duration-300"
              >
                <Mail className="w-5 h-5 text-[#d4af37]" />
                {contactEmail}
              </a>
            ) : (
              <button
                disabled
                className="w-full sm:w-1/2 flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-neutral-900/20 text-neutral-500 font-bold border border-neutral-855/50 text-sm cursor-not-allowed"
                title="Please agree to the terms and conditions first"
              >
                <Mail className="w-5 h-5 text-neutral-600" />
                {contactEmail}
              </button>
            )}

            {agreed ? (
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-1/2 flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(37,211,102,0.15)]"
              >
                <MessageSquare className="w-5 h-5" />
                WhatsApp Us
              </a>
            ) : (
              <button
                disabled
                className="w-full sm:w-1/2 flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-[#25D366]/20 text-white/30 font-bold text-center text-sm cursor-not-allowed border border-neutral-800/50"
                title="Please agree to the terms and conditions first"
              >
                <MessageSquare className="w-5 h-5 text-white/20" />
                WhatsApp Us
              </button>
            )}
          </div>


        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-neutral-900 text-center text-sm text-neutral-500 font-sans bg-neutral-950/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display text-base font-bold text-white tracking-widest">NAMI<span className="text-[#d4af37]">ARTS</span></p>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Link href="/legal" className="hover:text-[#d4af37] transition-colors duration-200 text-neutral-450 hover:underline">
              Terms & Legal
            </Link>
            <p>© 2026 NamiArts. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
