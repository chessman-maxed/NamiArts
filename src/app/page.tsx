"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/navbar";
import ArtworkCard from "@/components/artwork-card";
import ArtCollectionsSection from "@/components/art-collections-section";
import { Mail, MessageSquare, Sparkles, BookOpen } from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/animated-section";
import { motion } from "framer-motion";
import HeroBackground3D from "@/components/hero-background-3d";
import { gsap, ScrollTrigger } from "@/lib/gsap-setup";

interface Artwork {
  id: string;
  title: string;
  price: string | number;
  imageUrl: string;
  aspectRatio?: number;
  orientation?: "portrait" | "landscape";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
}


export default function Home() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);

  const heroSectionRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const aboutSectionRef = useRef<HTMLDivElement>(null);
  const aboutImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !aboutSectionRef.current || !aboutImageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        aboutImageRef.current,
        { scale: 1.15, filter: "brightness(0.7)" },
        {
          scale: 1,
          filter: "brightness(1)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: aboutSectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }, aboutSectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !heroSectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (heroImageRef.current) {
        tl.fromTo(
          heroImageRef.current,
          { opacity: 0, scale: 1.08 },
          { opacity: 1, scale: 1, duration: 1.3 }
        );
      }

      if (heroContentRef.current) {
        const children = Array.from(heroContentRef.current.children);
        tl.fromTo(
          children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.85, stagger: 0.12 },
          "-=0.9"
        );
      }

      if (heroImageRef.current && heroSectionRef.current) {
        gsap.to(heroImageRef.current, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }

      if (heroContentRef.current && heroSectionRef.current) {
        gsap.to(heroContentRef.current, {
          yPercent: -10,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }
    }, heroSectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      if (window.location.hash) {
        const id = window.location.hash.replace("#", "");
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, []);

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
  const whatsappMessage = encodeURIComponent("Hello! I am interested in inquiring about and ordering a framed photo artwork from NamiArts.");

  return (
    <>
      <Navbar />

      {/* Hero Section (White Background Theme) */}
      <section ref={heroSectionRef} className="relative w-full min-h-screen flex items-center overflow-hidden bg-white pt-24 pb-12 lg:py-0 select-none border-b border-neutral-200">
        {/* Three.js Subtle Gold Particle Canvas */}
        <HeroBackground3D />

        {/* Right Banner Image Layer (Cleanly fitted on white background) */}
        <div ref={heroImageRef} className="w-full lg:w-[54%] lg:absolute lg:right-6 lg:top-1/2 lg:-translate-y-1/2 z-10 flex items-center justify-center p-4 lg:p-0 pointer-events-none protected-image">
          <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-2xl">
            <div className="absolute inset-0 z-20" onContextMenu={(e) => e.preventDefault()} />
            <img
              src="/hero-banner.jpg"
              alt="Welcome To The World of NamiArts"
              className="w-full h-auto object-contain pointer-events-none select-none"
            />
          </div>
        </div>

        {/* Hero Content Container (Shifted to Left Edge) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 min-h-[75vh] flex items-center">
          
          {/* Left Side Content Column */}
          <div 
            ref={heroContentRef}
            className="w-full lg:max-w-[480px] flex flex-col items-start text-left pt-6 lg:pt-0"
          >
            <p className="font-sans text-xl sm:text-2xl font-semibold text-neutral-600 tracking-tight mb-1">
              Welcome to
            </p>
            
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-extrabold text-neutral-900 tracking-tight leading-[1.05] mb-5">
              NAMI<span className="text-[#c39e2e]">ARTS</span>
            </h1>

            {/* Decorative Gold Filigree Divider */}
            <div className="flex items-center gap-3 w-full max-w-md mb-6">
              <div className="h-[1.5px] flex-grow bg-gradient-to-r from-[#d4af37] via-[#d4af37]/60 to-transparent" />
              <div className="text-[#d4af37] text-sm tracking-[0.3em] font-serif select-none flex items-center justify-center">
                <svg className="w-6 h-6 text-[#d4af37]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C11.5 4 9.5 6 7 6C4.5 6 2.5 4 2 2C2.5 4 4.5 6 7 6C9.5 6 11.5 4 12 2ZM12 2C12.5 4 14.5 6 17 6C19.5 6 21.5 4 22 2C21.5 4 19.5 6 17 6C14.5 6 12.5 4 12 2ZM12 22C11.5 20 9.5 18 7 18C4.5 18 2.5 20 2 22C2.5 20 4.5 18 7 18C9.5 18 11.5 20 12 22ZM12 22C12.5 20 14.5 18 17 18C19.5 18 21.5 20 22 22C21.5 20 19.5 18 17 18C14.5 18 12.5 20 12 22Z" opacity="0.4"/>
                  <circle cx="12" cy="12" r="3" fill="#d4af37" />
                  <path d="M7 12c1.5-1 3.5-1 5 0M12 12c1.5 1 3.5 1 5 0" stroke="#d4af37" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
              <div className="h-[1.5px] flex-grow bg-gradient-to-l from-[#d4af37] via-[#d4af37]/60 to-transparent" />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 tracking-wide mb-4">
              Choose the Art. Choose the Frame. Make It Yours.
            </h2>

            <p className="text-sm sm:text-base text-neutral-700 max-w-lg mb-3 leading-relaxed font-sans font-medium">
              Explore our artwork collection, choose the artwork you love, select your preferred frame type and colour, and get it crafted as a beautiful physical photo frame.
            </p>

            <p className="text-xs text-amber-900 max-w-lg mb-8 leading-relaxed font-sans font-medium flex items-start gap-2 bg-amber-50 border border-amber-200 px-3.5 py-2.5 rounded-lg shadow-sm">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>Note: Custom artwork modifications can also be tailored to your specific needs upon request (additional customization charges apply).</span>
            </p>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <a
                href="#collections"
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-[#d4af37] hover:bg-[#b89528] text-black font-bold text-sm tracking-wide shadow-lg shadow-[#d4af37]/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Choose Artwork & Frame
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              <Link
                href="/stories"
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-neutral-900 hover:bg-black text-white font-semibold text-sm tracking-wide transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-md"
              >
                Read Free Stories
                <BookOpen className="w-4 h-4 text-[#d4af37]" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Infinite Moving Disclaimer Marquee */}
      <div className="relative flex overflow-x-hidden w-full py-3 bg-[#0a0a0a] border-y border-neutral-900 select-none z-20 shadow-[0_0_30px_rgba(214,175,55,0.02)]">
        <div className="animate-marquee-rtl flex whitespace-nowrap shrink-0 gap-10 text-neutral-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
          <span className="text-[#d4af37] px-2 py-0.5 rounded bg-[#d4af37]/10 text-[9px] font-extrabold self-center">Disclaimer</span>
          <span>If our art matches with someone else’s . then consider this as purely coincidental and unintentional as we don’t want to hurt sentiments of any person or community or any religion.</span>
          <span className="text-[#d4af37] self-center">✦</span>
          <span className="text-[#d4af37] px-2 py-0.5 rounded bg-[#d4af37]/10 text-[9px] font-extrabold self-center">Disclaimer</span>
          <span>If our art matches with someone else’s . then consider this as purely coincidental and unintentional as we don’t want to hurt sentiments of any person or community or any religion.</span>
          <span className="text-[#d4af37] self-center">✦</span>
        </div>
        <div className="animate-marquee-rtl flex whitespace-nowrap shrink-0 gap-10 text-neutral-400 text-[10px] md:text-xs font-bold uppercase tracking-widest" aria-hidden="true">
          <span className="text-[#d4af37] px-2 py-0.5 rounded bg-[#d4af37]/10 text-[9px] font-extrabold self-center">Disclaimer</span>
          <span>If our art matches with someone else’s . then consider this as purely coincidental and unintentional as we don’t want to hurt sentiments of any person or community or any religion.</span>
          <span className="text-[#d4af37] self-center">✦</span>
          <span className="text-[#d4af37] px-2 py-0.5 rounded bg-[#d4af37]/10 text-[9px] font-extrabold self-center">Disclaimer</span>
          <span>If our art matches with someone else’s . then consider this as purely coincidental and unintentional as we don’t want to hurt sentiments of any person or community or any religion.</span>
          <span className="text-[#d4af37] self-center">✦</span>
        </div>
      </div>

      {/* Explore Our Art Collections Section */}
      <AnimatedSection direction="up">
        <ArtCollectionsSection artworks={artworks} />
      </AnimatedSection>

      {/* Customer Journey 3-Step Process Section */}
      <section className="py-12 md:py-16 bg-[#0c0906] border-t border-neutral-900 select-none">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold mb-2 block">Simple 3-Step Ordering</span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col items-start relative group hover:border-[#d4af37]/40 transition-colors">
              <span className="font-display text-3xl font-black text-[#d4af37] mb-3">01</span>
              <h3 className="font-display text-lg font-bold text-white mb-2">Choose Your Artwork</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-sans">
                Browse the NamiArts collection and select the artwork design you want.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col items-start relative group hover:border-[#d4af37]/40 transition-colors">
              <span className="font-display text-3xl font-black text-[#d4af37] mb-3">02</span>
              <h3 className="font-display text-lg font-bold text-white mb-2">Choose Your Frame</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-sans">
                Select your preferred frame type, style, finish, and colour.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col items-start relative group hover:border-[#d4af37]/40 transition-colors">
              <span className="font-display text-3xl font-black text-[#d4af37] mb-3">03</span>
              <h3 className="font-display text-lg font-bold text-white mb-2">Get Your Frame</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-sans">
                Your selected artwork is crafted into a physical photo frame and delivered to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section with Scroll Animations */}
      <section ref={aboutSectionRef} id="about" className="py-16 md:py-24 border-t border-neutral-900 bg-neutral-950/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Visual container (Left side - 2 Portrait Images) */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4 md:gap-6 items-center">
            {/* Hero Girl portrait image (Left) */}
            <AnimatedSection direction="right" delay={0.1}>
              <div className="relative aspect-[9/16] w-full mx-auto rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/80 flex items-center justify-center group select-none protected-image shadow-xl shadow-black/50">
                <div className="absolute inset-0 z-20" onContextMenu={(e) => e.preventDefault()} />
                <div className="absolute inset-0 ambient-glow z-10 pointer-events-none" />
                <div
                  role="img"
                  aria-label="NamiArts Featured Portrait"
                  style={{ backgroundImage: "url('/hero-woman.png')", backgroundPosition: "center 15%" }}
                  className="h-full w-full bg-cover transition-transform duration-750 ease-out group-hover:scale-105 pointer-events-none select-none z-0"
                />
                <div className="absolute inset-0 border border-amber-500/10 group-hover:border-amber-500/20 transition-colors duration-500 rounded-2xl z-30" />
              </div>
            </AnimatedSection>

            {/* Existing portrait image (Right of left image) */}
            <AnimatedSection direction="right" delay={0.2}>
              <div className="relative aspect-[9/16] w-full mx-auto rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/80 flex items-center justify-center group select-none protected-image shadow-xl shadow-black/50">
                <div className="absolute inset-0 z-20" onContextMenu={(e) => e.preventDefault()} />
                <div className="absolute inset-0 ambient-glow z-10 pointer-events-none" />
                <div
                  ref={aboutImageRef}
                  role="img"
                  aria-label="NamiArts Studio"
                  style={{ backgroundImage: "url('/about_art.jpg')" }}
                  className="h-full w-full bg-cover bg-bottom transition-transform duration-750 ease-out group-hover:scale-105 pointer-events-none select-none z-0"
                />
                <div className="absolute inset-0 border border-amber-500/10 group-hover:border-amber-500/20 transition-colors duration-500 rounded-2xl z-30" />
              </div>
            </AnimatedSection>
          </div>

          {/* About description (Shifted to Right Side) */}
          <div className="lg:col-span-5 lg:pl-6">
            <AnimatedSection direction="left" delay={0.3}>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold mb-3">The Studio</span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-wide mb-6">
                  About NamiArts
                </h2>
                <p className="text-neutral-400 leading-relaxed font-sans mb-6">
                  NamiArts is a premium artwork and custom photo frame brand. We design original visual masterworks and craft them into high-quality physical photo frames tailored for collectors, homeowners, and art enthusiasts.
                </p>
                <p className="text-neutral-400 leading-relaxed font-sans mb-0">
                  Every artwork is created originally by us and rendered with ultra-high resolution precision. Choose your preferred frame style and colour, and we will craft a physical photo frame to elevate your space.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Section Transition Indicator between About and Contact */}
      <div className="relative w-full max-w-6xl mx-auto px-6 z-20 flex items-center justify-center -my-px pointer-events-none">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
        <div className="absolute px-4 py-1.5 rounded-full bg-neutral-950 border border-[#d4af37]/40 shadow-lg shadow-black/80 flex items-center gap-2 text-xs font-semibold text-[#d4af37] uppercase tracking-widest backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
          Contact & Inquiries
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
        </div>
      </div>

      {/* Contact Section with Staggered Scroll Animations */}
      <section id="contact" className="py-16 md:py-24 border-t border-neutral-900 bg-neutral-950/20 relative">
        <div className="absolute inset-0 ambient-glow z-0" />
        <div className="max-w-4xl mx-auto px-6 text-center z-10 relative">
          <AnimatedSection direction="up">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold mb-3">Order Photo Frames</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-wide mb-6">
              Inquire & Order Your Frame
            </h2>
            <p className="text-neutral-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Interested in ordering a physical photo frame of any of our showcased artworks? Get in touch directly via WhatsApp or Email to choose your frame options and coordinate payment and delivery.
            </p>
          </AnimatedSection>

          {/* Customization Callout Banner */}
          <AnimatedSection direction="up" delay={0.15}>
            <div className="max-w-xl mx-auto mb-6 p-6 rounded-2xl bg-amber-500/5 border border-[#d4af37]/25 backdrop-blur-sm text-center hover:border-[#d4af37]/50 transition-colors duration-300">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#d4af37] font-bold uppercase tracking-widest mb-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Custom Frame Options
              </span>
              <h3 className="font-display text-lg font-bold text-white mb-2">
                Frame Style & Color Customization
              </h3>
              <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                Choose from a variety of frame materials, borders, and color finishes. Custom size and artwork personalization requests can also be accommodated.
              </p>
            </div>
          </AnimatedSection>

          {/* Copyright Disclaimer Banner */}
          <AnimatedSection direction="up" delay={0.2}>
            <div className="max-w-xl mx-auto mb-6 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-855 text-center text-xs text-neutral-400 font-sans leading-relaxed">
              <strong className="text-neutral-200 block mb-1">Copyright License Disclaimer:</strong>
              <strong>Purchasing a physical photo frame from NamiArts grants physical ownership of the framed product. All original artwork copyrights, intellectual property, and commercial distribution rights remain exclusively with NamiArts.</strong>
            </div>
          </AnimatedSection>

          {/* Terms Agreement Checkbox */}
          <AnimatedSection direction="up" delay={0.25}>
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
          </AnimatedSection>

          <StaggerContainer className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-lg mx-auto">
            <StaggerItem className="w-full sm:w-1/2">
              {agreed ? (
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-white font-semibold border border-neutral-800 hover:border-neutral-700 transition-all duration-300"
                >
                  <Mail className="w-5 h-5 text-[#d4af37]" />
                  {contactEmail}
                </a>
              ) : (
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-neutral-900/20 text-neutral-500 font-bold border border-neutral-855/50 text-sm cursor-not-allowed"
                  title="Please agree to the terms and conditions first"
                >
                  <Mail className="w-5 h-5 text-neutral-600" />
                  {contactEmail}
                </button>
              )}
            </StaggerItem>

            <StaggerItem className="w-full sm:w-1/2">
              {agreed ? (
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(37,211,102,0.15)]"
                >
                  <MessageSquare className="w-5 h-5" />
                  WhatsApp Us
                </a>
              ) : (
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-[#25D366]/20 text-white/30 font-bold text-center text-sm cursor-not-allowed border border-neutral-800/50"
                  title="Please agree to the terms and conditions first"
                >
                  <MessageSquare className="w-5 h-5 text-white/20" />
                  WhatsApp Us
                </button>
              )}
            </StaggerItem>
          </StaggerContainer>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-neutral-900 text-center text-sm text-neutral-500 font-sans bg-neutral-950/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display text-base font-bold text-white tracking-widest">NAMI<span className="text-[#d4af37]">ARTS</span></p>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Link href="/#about" className="hover:text-[#d4af37] transition-colors duration-200 text-neutral-450 hover:underline">
              About Us
            </Link>
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
