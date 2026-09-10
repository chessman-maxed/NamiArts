"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, Eye, ArrowUpRight } from "lucide-react";
import { getPreviewImageUrl } from "@/lib/image";
import { gsap, ScrollTrigger } from "@/lib/gsap-setup";

interface FeaturedSpotlightProps {
  artwork?: {
    id: string;
    title: string;
    price: string | number;
    imageUrl: string;
    orientation?: "portrait" | "landscape";
  } | null;
}

export default function FeaturedSpotlightSection({ artwork }: FeaturedSpotlightProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const displayArt = artwork || {
    id: "featured-masterpiece",
    title: "Celestial Maiden — Digital Masterpiece",
    price: "Inquire for Pricing",
    imageUrl: "/hero-woman.png",
    orientation: "portrait" as const,
  };


  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !sectionRef.current || !containerRef.current) return;

    const isMobile = window.innerWidth < 768;
    const ctx = gsap.context(() => {
      // Create pinned GSAP timeline on desktop/tablet for cinematic showcase
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: isMobile ? "+=60%" : "+=120%",
          pin: true,
          pinSpacing: true,
          scrub: 0.8,
        },
      });

      // 1. Image mask reveal & scale down into frame
      if (imageRef.current) {
        tl.fromTo(
          imageRef.current,
          { scale: 1.25, filter: "brightness(0.5) contrast(1.1)" },
          { scale: 1, filter: "brightness(1) contrast(1)", ease: "power2.out" }
        );
      }

      // 2. Badge & Text Stagger reveal
      if (badgeRef.current) {
        tl.fromTo(
          badgeRef.current,
          { opacity: 0, y: 30, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, ease: "power2.out" },
          "-=0.5"
        );
      }

      if (textRef.current) {
        const children = Array.from(textRef.current.children);
        tl.fromTo(
          children,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, stagger: 0.15, ease: "power2.out" },
          "-=0.4"
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const formattedPrice =
    typeof displayArt.price === "number" || !isNaN(Number(displayArt.price))
      ? `₹${Number(displayArt.price).toLocaleString()}`
      : displayArt.price;

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-[#070503] flex items-center justify-center overflow-hidden py-16 lg:py-24 border-t border-neutral-900 select-none"
    >
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/15 via-[#070503]/80 to-[#070503] pointer-events-none" />

      <div
        ref={containerRef}
        className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center z-10 relative"
      >
        {/* Left Side: Editorial Details */}
        <div ref={textRef} className="lg:col-span-6 flex flex-col items-start">
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold uppercase tracking-[0.25em] mb-6 shadow-[0_0_15px_rgba(212,175,55,0.15)]"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Spotlight Exhibition
          </div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
            {displayArt.title}
          </h2>

          <p className="text-neutral-300 font-sans text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
            An extraordinary masterwork crafted with ultra-high resolution rendering, dramatic lighting, and intricate artistic detail. Designed exclusively for discerning digital art collectors.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                Acquisition Price
              </span>
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#d4af37]">
                {formattedPrice}
              </span>
            </div>

            <Link
              href={displayArt.id !== "featured-masterpiece" ? `/artwork/${displayArt.id}` : "/#collections"}
              className="px-7 py-3.5 rounded-xl bg-[#d4af37] hover:bg-[#c39e2e] text-black font-bold text-sm tracking-wide shadow-[0_4px_25px_rgba(212,175,55,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              Exhibition View
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Side: Framed Artwork Visual */}
        <div className="lg:col-span-6 flex justify-center">
          <div className={`relative ${displayArt.orientation === "landscape" ? "aspect-[16/9] max-w-[560px]" : "aspect-[3/4] max-w-[420px]"} w-full rounded-2xl overflow-hidden bg-neutral-900 border border-[#d4af37]/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] protected-image group`}>
            <div className="absolute inset-0 z-20" onContextMenu={(e) => e.preventDefault()} />
            <div className="watermark-overlay" />
            <div className="watermark-text">NamiArts</div>

            <div
              ref={imageRef}
              role="img"
              aria-label={displayArt.title}
              style={{
                backgroundImage: `url('${getPreviewImageUrl(displayArt.imageUrl)}')`,
              }}
              className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
            />

            <div className="absolute inset-0 border-2 border-amber-500/10 group-hover:border-amber-500/30 transition-colors duration-500 rounded-2xl z-30 pointer-events-none" />
          </div>
        </div>

      </div>
    </section>
  );
}
