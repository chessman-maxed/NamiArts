"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Check, ShieldCheck, ShoppingBag, Sparkles, Maximize2, Layers } from "lucide-react";
import { FrameSize, FrameColor, ArtworkSelectTarget } from "@/context/cart-context";
import { gsap } from "@/lib/gsap-setup";

interface FrameSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: ArtworkSelectTarget | null;
  onConfirm: (config: { size: FrameSize; color: FrameColor; price: number }) => void;
}

export const FrameSelectionModal: React.FC<FrameSelectionModalProps> = ({
  isOpen,
  onClose,
  artwork,
  onConfirm,
}) => {
  const [selectedSize, setSelectedSize] = useState<FrameSize | null>(null);
  const [selectedColor, setSelectedColor] = useState<FrameColor | null>(null);

  const previewFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedSize(null);
      setSelectedColor(null);
    }
  }, [isOpen, artwork]);

  // Smooth GSAP transition when size or color changes
  useEffect(() => {
    if (!previewFrameRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    gsap.fromTo(
      previewFrameRef.current,
      { scale: 0.96, opacity: 0.7 },
      { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" }
    );
  }, [selectedSize, selectedColor]);

  if (!isOpen || !artwork) return null;

  // Exact frame prices
  const getPrice = (size: FrameSize | null): number | null => {
    if (size === "A4") return 249;
    if (size === "A6") return 199;
    return null;
  };

  const currentPrice = getPrice(selectedSize);
  const deliveryCharge = 75;
  const grandTotal = currentPrice !== null ? currentPrice + deliveryCharge : null;

  const canContinue = selectedSize !== null && selectedColor !== null;

  const handleContinue = () => {
    if (!selectedSize || !selectedColor || currentPrice === null) return;
    onConfirm({
      size: selectedSize,
      color: selectedColor,
      price: currentPrice,
    });
  };

  // Determine real product frame image paths
  const activeColor = selectedColor === "White" ? "white" : "black";
  const activeSize = selectedSize === "A6" ? "a6" : "a4";
  
  const previewImagePath = `/frame-${activeSize}-${activeColor}.jpg`;
  const a4ThumbnailPath = `/frame-a4-${activeColor}.jpg`;
  const a6ThumbnailPath = `/frame-a6-${activeColor}.jpg`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-auto animate-scaleUp max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-900 flex items-center justify-between bg-neutral-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-white leading-tight">
                Frame Studio & Preview
              </h2>
              <p className="text-[11px] text-neutral-400">
                Inspect physical frame product specifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1">
          
          {/* Left Column: Real Physical Product Photo Image Preview */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[320px] sm:min-h-[380px] p-3 bg-neutral-900/40 border border-neutral-850 rounded-xl relative overflow-hidden">
            
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-850/40 via-neutral-950 to-neutral-950 pointer-events-none" />

            <div className="relative z-10 w-full flex flex-col items-center">
              
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#d4af37] mb-2.5">
                <Maximize2 className="w-3 h-3" />
                <span>
                  {selectedSize === "A6"
                    ? "Real A6 Tabletop Desk Frame Photo"
                    : "Real A4 Wall Gallery Frame Photo"}
                </span>
              </div>

              {/* Main Real Product Image Area */}
              <div
                ref={previewFrameRef}
                className="relative w-full flex flex-col items-center justify-center rounded-lg overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-950"
              >
                {/* Real Product Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImagePath}
                  alt={selectedSize === "A6" ? "A6 Tabletop Frame Product" : "A4 Wall Frame Product"}
                  className="w-full max-h-[320px] sm:max-h-[360px] object-cover object-center rounded-lg select-none"
                />
              </div>

              {/* Artwork Title & Frame Spec Status */}
              <div className="mt-3 text-center">
                <p className="font-display font-extrabold text-sm text-white truncate max-w-[260px]">
                  {artwork.title}
                </p>
                <p className="text-[11px] font-semibold text-[#d4af37] mt-0.5">
                  {selectedSize === "A6"
                    ? "A6 Tabletop Frame (Desk Stand)"
                    : selectedSize === "A4"
                    ? "A4 Wall Frame (Hanging Gallery)"
                    : "Choose Size"}{" "}
                  {selectedColor ? `• ${selectedColor} Finish` : "• Choose Colour"}
                </p>
              </div>

            </div>

          </div>

          {/* Right Column: Real Photo Frame Option Cards & Pricing */}
          <div className="lg:col-span-6 flex flex-col space-y-4">
            
            {/* Step 1: Real Product Thumbnail Size Selection Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
                  1. Select Frame Size <span className="text-red-400">*</span>
                </label>
                {selectedSize && (
                  <span className="text-[10px] text-[#d4af37] font-bold">Selected: {selectedSize}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                
                {/* A4 Option Visual Card with Real Product Thumbnail */}
                <button
                  type="button"
                  onClick={() => setSelectedSize("A4")}
                  className={`p-2.5 rounded-xl border text-left transition-all duration-300 cursor-pointer relative group flex flex-col justify-between ${
                    selectedSize === "A4"
                      ? "bg-[#d4af37]/15 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.25)] ring-1 ring-[#d4af37]"
                      : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    {/* Real Product Thumbnail for A4 Wall Frame */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a4ThumbnailPath}
                        alt="A4 Wall Frame"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    {selectedSize === "A4" && (
                      <span className="w-5 h-5 rounded-full bg-[#d4af37] text-black flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="font-display font-extrabold text-xs sm:text-sm text-white block">A4 Wall Frame</span>
                    <span className="text-xs text-[#d4af37] font-bold block mt-0.5">₹249</span>
                    <span className="text-[10px] text-neutral-400 block">21.0 x 29.7 cm (Wall)</span>
                  </div>
                </button>

                {/* A6 Option Visual Card with Real Product Thumbnail */}
                <button
                  type="button"
                  onClick={() => setSelectedSize("A6")}
                  className={`p-2.5 rounded-xl border text-left transition-all duration-300 cursor-pointer relative group flex flex-col justify-between ${
                    selectedSize === "A6"
                      ? "bg-[#d4af37]/15 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.25)] ring-1 ring-[#d4af37]"
                      : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    {/* Real Product Thumbnail for A6 Tabletop Frame */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a6ThumbnailPath}
                        alt="A6 Tabletop Frame"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    {selectedSize === "A6" && (
                      <span className="w-5 h-5 rounded-full bg-[#d4af37] text-black flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="font-display font-extrabold text-xs sm:text-sm text-white block">A6 Tabletop Frame</span>
                    <span className="text-xs text-[#d4af37] font-bold block mt-0.5">₹199</span>
                    <span className="text-[10px] text-neutral-400 block">10.5 x 14.8 cm (Desk Stand)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Visual Frame Colour Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                  2. Select Frame Colour <span className="text-red-400">*</span>
                </label>
                {selectedColor && (
                  <span className="text-[10px] text-[#d4af37] font-bold">Selected: {selectedColor}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Black Frame Button */}
                <button
                  type="button"
                  onClick={() => setSelectedColor("Black")}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-300 cursor-pointer ${
                    selectedColor === "Black"
                      ? "bg-[#d4af37]/15 border-[#d4af37] text-white shadow-[0_0_20px_rgba(212,175,55,0.25)] ring-1 ring-[#d4af37]"
                      : "bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-neutral-950 border-2 border-neutral-700 ring-1 ring-black inline-block shadow-inner" />
                    <div>
                      <span className="font-bold text-xs text-white block">Black Frame</span>
                      <span className="text-[10px] text-neutral-400 block">Satin Black Finish</span>
                    </div>
                  </div>
                  {selectedColor === "Black" && (
                    <span className="w-4 h-4 rounded-full bg-[#d4af37] text-black flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>

                {/* White Frame Button */}
                <button
                  type="button"
                  onClick={() => setSelectedColor("White")}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-300 cursor-pointer ${
                    selectedColor === "White"
                      ? "bg-[#d4af37]/15 border-[#d4af37] text-white shadow-[0_0_20px_rgba(212,175,55,0.25)] ring-1 ring-[#d4af37]"
                      : "bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-white border border-neutral-300 inline-block shadow-sm" />
                    <div>
                      <span className="font-bold text-xs text-white block">White Frame</span>
                      <span className="text-[10px] text-neutral-400 block">Clean White Finish</span>
                    </div>
                  </div>
                  {selectedColor === "White" && (
                    <span className="w-4 h-4 rounded-full bg-[#d4af37] text-black flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Pricing Summary Card */}
            <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-850 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Artwork + {selectedSize ? `${selectedSize} ` : ""}Frame:</span>
                <span className="font-semibold text-white">
                  {currentPrice !== null ? `₹${currentPrice}` : "--"}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Flat Delivery Charge:</span>
                <span className="font-semibold text-[#d4af37]">₹{deliveryCharge}</span>
              </div>
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between font-bold text-sm">
                <span className="text-neutral-200">Grand Total:</span>
                <span className="text-[#d4af37] font-display text-base">
                  {grandTotal !== null ? `₹${grandTotal}` : "Select size & colour"}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div>
              <button
                type="button"
                disabled={!canContinue}
                onClick={handleContinue}
                className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                  canContinue
                    ? "bg-[#d4af37] hover:bg-[#b5942d] text-black shadow-[0_4px_20px_rgba(212,175,55,0.3)] cursor-pointer"
                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-850"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {canContinue ? `Confirm Selection (₹${grandTotal})` : "Select Size & Colour to Proceed"}
              </button>
            </div>

            <p className="text-[10px] text-center text-neutral-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
              Handcrafted Physical Photo Frame • Protected Artwork Printing
            </p>

          </div>

        </div>
      </div>
    </div>
  );
};

export default FrameSelectionModal;
