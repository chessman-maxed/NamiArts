"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, Sparkles, Tag, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { DEFAULT_SCHEMES, SchemeItem } from "@/lib/schemes";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { gsap } from "@/lib/gsap-setup";

interface SchemesPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SchemesPopup({ isOpen, onClose }: SchemesPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const lightSweepRef = useRef<HTMLDivElement>(null);

  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time Firestore schemes listener
  useEffect(() => {
    const q = query(collection(db, "schemes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setSchemes([]);
        } else {
          const list: SchemeItem[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as SchemeItem);
          });
          setSchemes(list);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching schemes from Firestore:", error);
        setSchemes([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // GSAP 5-Phase Unfolding Opening & Retracting Closing Timeline
  useEffect(() => {
    if (!popupRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isOpen) {
      if (prefersReducedMotion) {
        gsap.set(popupRef.current, { opacity: 1, display: "block" });
        return;
      }

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.set(popupRef.current, {
          display: "block",
          transformOrigin: "top center",
        })
          .fromTo(
            popupRef.current,
            {
              opacity: 0,
              scaleY: 0.1,
              scaleX: 0.65,
              y: -8,
              clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
              boxShadow: "0 0 0px rgba(0,0,0,0)",
            },
            {
              opacity: 1,
              scaleY: 1,
              scaleX: 1,
              y: 0,
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.95)",
              duration: 0.85,
            }
          );

        if (lightSweepRef.current) {
          tl.fromTo(
            lightSweepRef.current,
            { xPercent: -100, opacity: 0 },
            { xPercent: 100, opacity: 1, duration: 0.75, ease: "power2.inOut" },
            "-=0.6"
          );
        }

        if (cardsContainerRef.current) {
          const children = Array.from(cardsContainerRef.current.children);
          tl.fromTo(
            children,
            { opacity: 0, y: 20, filter: "blur(4px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, stagger: 0.09 },
            "-=0.55"
          );
        }
      }, popupRef);

      return () => ctx.revert();
    } else {
      if (prefersReducedMotion) {
        gsap.set(popupRef.current, { opacity: 0, display: "none" });
        return;
      }

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            if (popupRef.current) {
              popupRef.current.style.display = "none";
            }
          },
        });

        if (cardsContainerRef.current) {
          const children = Array.from(cardsContainerRef.current.children);
          tl.to(children, {
            opacity: 0,
            y: -10,
            duration: 0.2,
            stagger: 0.03,
            ease: "power2.in",
          });
        }

        tl.to(
          popupRef.current,
          {
            opacity: 0,
            scaleY: 0.1,
            scaleX: 0.65,
            y: -6,
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 0.35,
            ease: "power3.in",
          },
          "-=0.1"
        );
      }, popupRef);

      return () => ctx.revert();
    }
  }, [isOpen]);

  // ESC Key and Outside Click to Close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        const schemeBtn = document.getElementById("navbar-scheme-btn");
        if (schemeBtn && schemeBtn.contains(e.target as Node)) {
          return;
        }
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Helper to format live remaining countdown time
  const getRemainingTimeText = (expiresAt?: string | null) => {
    if (!expiresAt) return null;
    const now = Date.now();
    const exp = new Date(expiresAt).getTime();
    const diff = exp - now;
    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  // Filter schemes: Active and Not Expired
  const activeSchemes = schemes.filter((s) => {
    if (s.active === false) return false;
    if (s.expiresAt) {
      const exp = new Date(s.expiresAt).getTime();
      if (exp <= Date.now()) return false; // Hide expired schemes
    }
    return true;
  });

  return (
    <div
      ref={popupRef}
      role="dialog"
      aria-modal="true"
      aria-label="Latest Schemes and Promotional Offers"
      style={{ display: "none" }}
      data-lenis-prevent
      data-lenis-prevent-touch
      data-lenis-prevent-wheel
      className="absolute top-full mt-3.5 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-[90vw] sm:w-[380px] md:w-[420px] z-[100] rounded-2xl bg-neutral-950/95 border border-[#d4af37]/50 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-xl select-none overflow-hidden origin-top"
    >
      {/* Top Golden Light Sweep Effect */}
      <div className="relative h-1 w-full bg-neutral-900 overflow-hidden">
        <div
          ref={lightSweepRef}
          className="absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"
        />
      </div>

      {/* Header */}
      <div className="p-5 pb-3 border-b border-neutral-900 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display text-base font-extrabold tracking-wider text-white uppercase flex items-center gap-1.5">
              LATEST SCHEMES
            </h3>
            <p className="text-[11px] text-neutral-400 font-sans">
              Exclusive offers & promotions from NamiArts
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close schemes panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Schemes List Container */}
      <div
        ref={cardsContainerRef}
        data-lenis-prevent
        data-lenis-prevent-touch
        data-lenis-prevent-wheel
        style={{ overscrollBehavior: "contain" }}
        className="p-4 sm:p-5 flex flex-col gap-3.5 max-h-[58vh] md:max-h-[52vh] overflow-y-auto custom-scrollbar touch-pan-y"
      >
        {loading ? (
          <div className="py-8 text-center text-xs text-neutral-500 flex flex-col items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d4af37] animate-spin" />
            Loading latest promotional schemes...
          </div>
        ) : activeSchemes.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-6 h-6 text-[#d4af37]" />
            <p className="font-bold text-white">No Active Schemes Right Now</p>
            <p className="text-[11px] text-neutral-500">Check back soon for new special promotional offers!</p>
          </div>
        ) : (
          activeSchemes.map((scheme) => {
            const timerText = getRemainingTimeText(scheme.expiresAt);
            return (
              <div
                key={scheme.id}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  scheme.highlight
                    ? "bg-amber-500/10 border-[#d4af37]/45 hover:border-[#d4af37]/75 shadow-[0_4px_20px_rgba(212,175,55,0.12)]"
                    : "bg-neutral-900/60 border-neutral-850 hover:border-neutral-750"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#d4af37]/15 border border-[#d4af37]/30 text-[10px] font-extrabold uppercase tracking-wider text-[#d4af37] flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {scheme.badge}
                  </span>
                  <span className="font-display text-xs font-black text-amber-400 tracking-wide">
                    {scheme.discount}
                  </span>
                </div>

                <h4 className="font-display text-sm font-bold text-white mb-1 tracking-wide">
                  {scheme.title}
                </h4>

                <p className="text-xs text-neutral-300 leading-relaxed mb-3 font-sans">
                  {scheme.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-850/60">
                  {timerText ? (
                    <span className="text-[10px] font-bold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/25 flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-pulse text-[#d4af37]" />
                      {timerText}
                    </span>
                  ) : scheme.validity ? (
                    <span className="text-[10px] text-neutral-450 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      {scheme.validity}
                    </span>
                  ) : (
                    <span />
                  )}

                  {scheme.ctaLink && (
                    <Link
                      href={scheme.ctaLink}
                      onClick={onClose}
                      className="text-xs font-bold text-[#d4af37] hover:text-white transition-colors flex items-center gap-1 group"
                    >
                      {scheme.ctaText || "Explore →"}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Disclaimer Tagline */}
      <div className="px-5 py-3 bg-neutral-950 border-t border-neutral-900 text-center">
        <p className="text-[10px] text-neutral-500 font-sans tracking-wide">
          ✦ Mention scheme during acquisition inquiry via WhatsApp or Email.
        </p>
      </div>
    </div>
  );
}
