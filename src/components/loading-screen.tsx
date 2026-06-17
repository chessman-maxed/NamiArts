"use client";

import React, { useEffect, useState } from "react";
import { Palette } from "lucide-react";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if the loader has already been shown in the current browser session
    const hasBeenShown = sessionStorage.getItem("namiarts_intro_shown");
    
    if (hasBeenShown === "true") {
      Promise.resolve().then(() => setVisible(false));
      return;
    }

    // Disable body scrolling during the intro animation
    document.body.style.overflow = "hidden";

    // Start fading out after 1.8 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1800);

    // Completely remove the loader from DOM after 2.5 seconds
    const removeTimer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
      sessionStorage.setItem("namiarts_intro_shown", "true");
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  const brandName = "NAMIARTS";

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#070707] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
        fadeOut ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
    >
      {/* Immersive ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      
      {/* Decorative Rotating Ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-dashed border-[#d4af37]/10 animate-spin-slow pointer-events-none" />

      {/* Main Container */}
      <div className="relative flex flex-col items-center select-none animate-float-logo">
        
        {/* Glowing palette icon */}
        <div className="mb-6 text-[#d4af37]/80 filter drop-shadow-[0_0_15px_rgba(214,175,55,0.4)] animate-pulse">
          <Palette className="w-10 h-10" />
        </div>

        {/* Brand Name with Staggered Letter Animations */}
        <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-[0.25em] text-white flex items-center justify-center pl-[0.25em]">
          {brandName.split("").map((letter, index) => (
            <span
              key={index}
              className="animate-letter inline-block"
              style={{
                animationDelay: `${index * 0.12}s`,
                textShadow: "0 0 20px rgba(255,255,255,0.1)",
              }}
            >
              {letter}
            </span>
          ))}
        </h1>

        {/* Golden Underline Sweep */}
        <div className="relative mt-5 w-48 sm:w-64 h-[1px]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent animate-line-sweep shadow-[0_0_8px_#d4af37]" />
        </div>

        {/* Subtitle / Loading Status */}
        <p 
          className="mt-8 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-neutral-500 animate-fade-in pl-[0.3em]"
          style={{ animationDelay: "1.0s", animationFillMode: "both" }}
        >
          Curating the Canvas
        </p>

      </div>
    </div>
  );
}
