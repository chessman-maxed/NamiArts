"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sparkles, ShoppingBag } from "lucide-react";
import { Alex_Brush } from "next/font/google";
import SchemesPopup from "@/components/schemes-popup";
import { useCart } from "@/context/cart-context";

const signature = Alex_Brush({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSchemesOpen, setIsSchemesOpen] = useState(false);
  const { totalItems, toggleCart } = useCart();

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
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900/50 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="w-full px-6 md:px-10 lg:px-14 flex items-center justify-between">
          {/* Logo & SCHEME Button Container */}
          <div className="flex items-center gap-3 sm:gap-5">
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

            {/* Relative Anchor Wrapper for SCHEME Button & Direct Child Popup */}
            <div className="relative inline-block">
              {/* SCHEME Glowing Highlight Button */}
              <button
                id="navbar-scheme-btn"
                onClick={() => setIsSchemesOpen((prev) => !prev)}
                className="relative group px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#d4af37] flex items-center gap-1.5 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer select-none border-amber-500/50 animate-scheme-glow hover:shadow-[0_0_25px_rgba(212,175,55,0.6)]"
                aria-label="View latest schemes and offers"
                title="Click to view latest schemes & offers"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
                <span>SCHEME</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]"></span>
                </span>
              </button>

              {/* Popup Anchored Directly Underneath SCHEME Button */}
              <SchemesPopup isOpen={isSchemesOpen} onClose={() => setIsSchemesOpen(false)} />
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-semibold tracking-wide text-[#d4af37] relative group py-1 flex flex-col items-center"
            >
              Home
              <span className="h-[2px] w-6 bg-[#d4af37] rounded-full mt-1"></span>
            </Link>
            <div className="relative group flex items-center gap-1 cursor-pointer py-1">
              <Link
                href="/#collections"
                className="text-sm font-medium tracking-wide text-neutral-300 hover:text-white transition-colors"
              >
                Artworks
              </Link>
              <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <Link
              href="/stories"
              className="text-sm font-medium tracking-wide text-neutral-300 hover:text-white transition-colors relative group py-1"
            >
              Stories
            </Link>
            <Link
              href="/#about"
              className="text-sm font-medium tracking-wide text-neutral-300 hover:text-white transition-colors relative group py-1"
            >
              About Us
            </Link>
            <Link
              href="/#contact"
              className="text-sm font-medium tracking-wide text-neutral-300 hover:text-white transition-colors relative group py-1"
            >
              Contact
            </Link>
            <Link
              href="/referral"
              className="text-sm font-medium tracking-wide text-[#d4af37] hover:text-[#e6c86e] transition-colors relative group py-1 flex items-center gap-1.5 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              Referral Program
            </Link>
          </div>

          {/* Right Side Icons: WhatsApp, Cart */}
          <div className="flex items-center space-x-3.5">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919699338301"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex w-9 h-9 rounded-full border border-neutral-700/70 hover:border-[#25D366] items-center justify-center text-neutral-300 hover:text-[#25D366] transition-all duration-300 bg-black/30"
              aria-label="WhatsApp"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
            </a>
            
            {/* Shopping Cart Trigger Button */}
            <button
              onClick={toggleCart}
              className="relative w-9 h-9 rounded-full border border-neutral-700/70 hover:border-[#d4af37] flex items-center justify-center text-neutral-300 hover:text-[#d4af37] transition-all duration-300 bg-black/30 group cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d4af37] text-black text-[10px] font-extrabold flex items-center justify-center shadow-md animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>
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
            isOpen ? "max-h-96 opacity-100 py-6" : "max-h-0 opacity-0 py-0"
          }`}
        >
          <div className="flex flex-col space-y-4 px-6">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsSchemesOpen(true);
              }}
              className="text-left text-base font-extrabold text-[#d4af37] flex items-center gap-2 py-1"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              SCHEMES & OFFERS
            </button>
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-neutral-300 hover:text-[#d4af37] hover:pl-2 transition-all duration-350 ease-out"
            >
              Home
            </Link>
            <Link
              href="/#collections"
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-neutral-300 hover:text-[#d4af37] hover:pl-2 transition-all duration-350 ease-out"
            >
              Art Collections
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
            <Link
              href="/referral"
              onClick={() => setIsOpen(false)}
              className="text-base font-semibold text-[#d4af37] hover:pl-2 transition-all duration-350 ease-out flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              Referral Program
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
