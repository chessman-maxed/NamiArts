"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Alex_Brush } from "next/font/google";

const signature = Alex_Brush({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900/50 py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative flex items-end gap-1.5 group focus:outline-none py-1 select-none">
          {/* Artistic Signature Logo */}
          <span className={`${signature.className} text-3xl text-neutral-100 group-hover:text-white transition-colors duration-300 pb-0.5`}>
            Nami
          </span>
          <span className="font-display text-xs tracking-[0.25em] font-extrabold text-[#d4af37] pb-1">
            ARTS
          </span>
          
          {/* Artistic Brush Stroke Underline */}
          <svg 
            className="absolute -bottom-1.5 left-0 w-full h-1.5 text-[#d4af37]/75 group-hover:text-[#d4af37] group-hover:scale-x-105 transition-all duration-500 pointer-events-none origin-left" 
            viewBox="0 0 100 10" 
            preserveAspectRatio="none" 
            fill="currentColor"
          >
            <path d="M 1,5 C 20,2 35,8 60,4 C 80,1 90,6 99,3 C 90,7 75,3 55,7 C 35,10 15,4 1,5 Z" />
          </svg>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="text-sm font-medium tracking-wide text-neutral-300 hover:text-white transition-colors relative group py-1"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#d4af37] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/#gallery"
            className="text-sm font-medium tracking-wide text-neutral-300 hover:text-white transition-colors relative group py-1"
          >
            Gallery
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#d4af37] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/#about"
            className="text-sm font-medium tracking-wide text-neutral-300 hover:text-white transition-colors relative group py-1"
          >
            About
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#d4af37] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/stories"
            className="text-sm font-medium tracking-wide text-neutral-300 hover:text-white transition-colors relative group py-1"
          >
            Stories
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#d4af37] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/#contact"
            className="text-sm font-medium tracking-wide text-neutral-300 hover:text-white transition-colors relative group py-1"
          >
            Contact
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#d4af37] transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-neutral-300 hover:text-white transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`absolute top-full left-0 w-full bg-neutral-950/95 backdrop-blur-md border-b border-neutral-900/50 transition-all duration-300 ease-in-out md:hidden overflow-hidden shadow-2xl z-40 ${
          isOpen ? "max-h-80 opacity-100 py-6" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="flex flex-col space-y-4 px-6">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="text-base font-medium text-neutral-300 hover:text-[#d4af37] hover:pl-2 transition-all duration-350 ease-out"
          >
            Home
          </Link>
          <Link
            href="/#gallery"
            onClick={() => setIsOpen(false)}
            className="text-base font-medium text-neutral-300 hover:text-[#d4af37] hover:pl-2 transition-all duration-350 ease-out"
          >
            Gallery
          </Link>
          <Link
            href="/#about"
            onClick={() => setIsOpen(false)}
            className="text-base font-medium text-neutral-300 hover:text-[#d4af37] hover:pl-2 transition-all duration-350 ease-out"
          >
            About
          </Link>
          <Link
            href="/stories"
            onClick={() => setIsOpen(false)}
            className="text-base font-medium text-neutral-300 hover:text-[#d4af37] hover:pl-2 transition-all duration-350 ease-out"
          >
            Stories
          </Link>
          <Link
            href="/#contact"
            onClick={() => setIsOpen(false)}
            className="text-base font-medium text-neutral-300 hover:text-[#d4af37] hover:pl-2 transition-all duration-350 ease-out"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
