"use client";

import React, { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        if ("scrollRestoration" in window.history) {
          window.history.scrollRestoration = "manual";
        }
        window.scrollTo(0, 0);
      }

      let hasBeenShown: string | null = null;
      try {
        hasBeenShown = sessionStorage.getItem("namiarts_intro_shown");
      } catch (e) {
        console.warn("sessionStorage unavailable:", e);
      }
      
      if (hasBeenShown === "true") {
        setVisible(false);
        return;
      }

      if (typeof document !== "undefined" && document.body) {
        document.body.style.overflow = "hidden";
      }

      // Smooth & fast timing (fade out after 700ms, hide after 1000ms)
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 700);

      const removeTimer = setTimeout(() => {
        setVisible(false);
        if (typeof document !== "undefined" && document.body) {
          document.body.style.overflow = "";
        }
        try {
          sessionStorage.setItem("namiarts_intro_shown", "true");
        } catch (e) {
          console.warn("sessionStorage setItem failed:", e);
        }
      }, 1000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
        if (typeof document !== "undefined" && document.body) {
          document.body.style.overflow = "";
        }
      };
    } catch (err) {
      console.error("LoadingScreen effect error:", err);
      setVisible(false);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#070707] flex flex-col items-center justify-center transition-opacity duration-300 ease-out select-none ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Soft Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative flex flex-col items-center">
        {/* Simple & Elegant Brand Logo Title */}
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-[0.25em] text-white pl-[0.25em]">
          NAMI<span className="text-[#d4af37]">ARTS</span>
        </h1>

        {/* Minimal Smooth Loader Pulse */}
        <div className="mt-6 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
