"use client";

import React, { useEffect, useState } from "react";
import { Shield } from "lucide-react";

export default function ScreenshotProtection() {
  const [isProtected, setIsProtected] = useState(false);

  useEffect(() => {
    // Helper to activate protection screen
    const triggerProtection = () => {
      setIsProtected(true);
      // Auto-unlock after 3 seconds for transient keyboard-triggered protection
      const timer = setTimeout(() => {
        setIsProtected(false);
      }, 3000);
      return () => clearTimeout(timer);
    };

    // Helper to overwrite clipboard contents
    const clearClipboard = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("Screen Protection Active. Visual content protected by NamiArts.").catch(() => {});
      }
    };

    // 1. Prevent standard screenshot and print keys
    const handleKeyDown = (e: KeyboardEvent) => {
      const isPrintScreen = 
        e.key === "PrintScreen" || 
        e.key === "PrtScn" || 
        e.keyCode === 44 || 
        e.code === "PrintScreen";

      if (isPrintScreen) {
        e.preventDefault();
        clearClipboard();
        triggerProtection();
      }

      // Intercept print shortcuts Ctrl+P / Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        triggerProtection();
      }

      // Meta/Ctrl combinations (Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5, Win+Shift+S etc.)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5" || e.key === "s" || e.key === "S")) {
        triggerProtection();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const isPrintScreen = 
        e.key === "PrintScreen" || 
        e.key === "PrtScn" || 
        e.keyCode === 44 || 
        e.code === "PrintScreen";

      if (isPrintScreen) {
        clearClipboard();
        triggerProtection();
      }
    };

    // Prevent copy/cut events
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", "Screen Protection Active. Content protected by NamiArts.");
      }
    };

    // 2. Hide content on blur (loss of focus)
    const handleBlur = () => {
      setIsProtected(true);
    };

    const handleFocus = () => {
      setIsProtected(false);
    };

    // 3. Hide content on visibility change (tabs switcher, app switcher on mobile)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setIsProtected(true);
      } else {
        setIsProtected(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("copy", handleCopy);
    window.addEventListener("cut", handleCopy);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("cut", handleCopy);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (!isProtected) return null;

  return (
    <div className="fixed inset-0 z-[999999] bg-[#070707]/98 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6 select-none pointer-events-auto">
      <div className="max-w-md flex flex-col items-center gap-4 animate-float-logo">
        <div className="p-4 rounded-full bg-neutral-900 border border-neutral-800 text-[#d4af37] filter drop-shadow-[0_0_15px_rgba(214,175,55,0.25)]">
          <Shield className="w-10 h-10 animate-pulse" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white tracking-wider uppercase">
          Screen Protection Active
        </h2>
        <div className="w-12 h-[1px] bg-[#d4af37]" />
        <p className="text-neutral-400 text-sm font-sans leading-relaxed">
          Screenshot capturing is disabled to protect intellectual property and original artwork licensing.
        </p>
      </div>
    </div>
  );
}
