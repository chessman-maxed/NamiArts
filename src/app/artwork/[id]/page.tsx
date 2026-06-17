"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/navbar";
import { Mail, MessageSquare, ArrowLeft, Loader2, Shield, Sparkles } from "lucide-react";
import { getPreviewImageUrl } from "@/lib/image";

interface Artwork {
  id: string;
  title: string;
  price: string | number;
  imageUrl: string;
  aspectRatio?: number;
}

export default function ArtworkDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [detectedAspect, setDetectedAspect] = useState<number | undefined>(undefined);
  const [agreed, setAgreed] = useState(false);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!artwork?.aspectRatio && !detectedAspect) {
      const { naturalWidth, naturalHeight } = e.currentTarget;
      if (naturalWidth && naturalHeight) {
        setDetectedAspect(naturalWidth / naturalHeight);
      }
    }
  };

  const aspect = artwork?.aspectRatio || detectedAspect;

  useEffect(() => {
    if (!id) return;

    const fetchArtwork = async () => {
      try {
        const docRef = doc(db, "artworks", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setArtwork({ id: docSnap.id, ...docSnap.data() } as Artwork);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching artwork details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex-grow flex items-center justify-center bg-neutral-950">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
            <p className="text-neutral-400 text-sm">Retrieving artwork records...</p>
          </div>
        </div>
      </>
    );
  }

  if (!artwork) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex-grow flex items-center justify-center bg-neutral-950 text-center px-6">
          <div className="max-w-md bg-neutral-900 border border-neutral-850 rounded-2xl p-8">
            <Shield className="w-12 h-12 text-red-500/70 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-white mb-2">Artwork Not Found</h2>
            <p className="text-neutral-400 text-sm mb-6">
              The artwork you are looking for does not exist or has been removed from the gallery.
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors border border-neutral-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Gallery
            </button>
          </div>
        </div>
      </>
    );
  }

  // Format price
  const formattedPrice = typeof artwork.price === "number" || !isNaN(Number(artwork.price))
    ? `₹${Number(artwork.price).toLocaleString()}`
    : artwork.price;

  // Contact templates
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "nameearts@gmail.com";
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919699338301";
  
  // Replace non-ASCII currency symbol (₹) with 'INR' for mailto compatibility to prevent native OS mail client launch failures
  const emailPriceText = typeof artwork.price === "number" || !isNaN(Number(artwork.price))
    ? `INR ${Number(artwork.price).toLocaleString()}`
    : String(artwork.price).replace("₹", "INR ");

  const emailSubject = encodeURIComponent(`Inquiry about Artwork: ${artwork.title}`);
  const emailBody = encodeURIComponent(
    `Hello,\n\nI am interested in purchasing your artwork titled "${artwork.title}" for ${emailPriceText}.\n\nPlease let me know how to proceed.\n\nThank you.`
  );
  
  const whatsappMessage = encodeURIComponent(`Hello, I am interested in purchasing ${artwork.title}.`);

  return (
    <>
      <Navbar />

      <main className="min-h-screen flex-grow pt-24 md:pt-28 pb-16 md:pb-20 bg-neutral-950 relative flex flex-col justify-center">
        <div className="absolute inset-0 ambient-glow z-0 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
          {/* Back button */}
          <button
            onClick={() => router.push("/#gallery")}
            className="group inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6 md:mb-8 transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Gallery
          </button>

          {/* Core Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Protected Image Preview */}
            <div className="lg:col-span-7">
              <div 
                className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 select-none protected-image flex items-center justify-center cursor-default w-full max-h-[60vh] lg:max-h-[75vh]"
                style={{ aspectRatio: aspect ? `${aspect}` : "4/3" }}
                onContextMenu={(e) => e.preventDefault()}
              >
                {/* Shield layer to block right clicks and dragging */}
                <div className="absolute inset-0 z-20" onContextMenu={(e) => e.preventDefault()} />
                
                {/* Watermark layers */}
                <div className="watermark-overlay" />
                <div className="watermark-text">NamiArts</div>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPreviewImageUrl(artwork.imageUrl)}
                  alt={artwork.title}
                  onLoad={handleImageLoad}
                  className="h-full w-full object-contain pointer-events-none select-none z-10"
                  onDragStart={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
              <p className="text-[10px] text-neutral-600 mt-3 text-center flex items-center justify-center gap-1.5 font-sans">
                <Shield className="w-3.5 h-3.5" />
                Protected Preview. Copying is discouraged.
              </p>
            </div>

            {/* Right Column: Metadata details & Purchasing */}
            <div className="lg:col-span-5 flex flex-col">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white tracking-wide mb-3">
                {artwork.title}
              </h1>
              
              <div className="text-xl md:text-2xl font-semibold text-[#d4af37] mb-6 font-display">
                {formattedPrice}
              </div>
              
              <div className="h-px bg-neutral-900 mb-6" />



              {/* Purchase Inquiry Container */}
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="font-display text-lg font-bold text-white mb-2">Purchase Inquiries</h3>
                <p className="text-neutral-400 text-sm mb-4 leading-relaxed">
                  Interested in purchasing this artwork? Click below to send a direct inquiry via WhatsApp or Email. We will arrange secure payment and original digital file delivery.
                </p>

                {/* Customization Callout */}
                <div className="mb-4 p-4 bg-amber-500/5 border border-[#d4af37]/20 rounded-xl text-left">
                  <div className="flex items-center gap-2 text-[#d4af37] font-semibold text-xs uppercase tracking-wider mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Artwork Customization
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    Any artwork displayed here can be personalized and tailored to suit your needs (such as edits to color palettes, dimensions, or details) before final file delivery. Note: Custom editing requests will incur a slightly higher charge than the standard price listed.
                  </p>
                </div>

                {/* Copyright Disclaimer */}
                <div className="mb-6 p-4 bg-neutral-950/50 border border-neutral-850 rounded-xl text-left text-xs text-neutral-400 font-sans leading-relaxed">
                  <strong className="text-neutral-200 block mb-1">Copyright License Disclaimer:</strong>
                  <strong>Purchasing this artwork does NOT transfer its copyright to the buyer. NamiArts retains full ownership, intellectual property rights, and copyright of the artwork, and reserves the right to sell, reproduce, or distribute the same image to other clients.</strong>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="mb-6 p-4 bg-neutral-950/70 border border-neutral-850 rounded-xl flex items-start gap-3 select-none text-left">
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

                <div className="flex flex-col gap-4">
                  {/* WhatsApp button */}
                  {agreed ? (
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold transition-all duration-300 shadow-[0_4px_15px_rgba(37,211,102,0.1)] text-center text-sm"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Inquire via WhatsApp
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-[#25D366]/20 text-white/30 font-bold text-center text-sm cursor-not-allowed border border-neutral-800/50"
                      title="Please agree to the terms and conditions first"
                    >
                      <MessageSquare className="w-5 h-5 text-white/20" />
                      Inquire via WhatsApp
                    </button>
                  )}

                  {/* Email button */}
                  {agreed ? (
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}&su=${emailSubject}&body=${emailBody}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white font-bold border border-neutral-700 transition-colors text-sm"
                    >
                      <Mail className="w-5 h-5 text-[#d4af37]" />
                      Inquire via Email
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-neutral-800/20 text-neutral-500 font-bold border border-neutral-850/50 text-sm cursor-not-allowed"
                      title="Please agree to the terms and conditions first"
                    >
                      <Mail className="w-5 h-5 text-neutral-600" />
                      Inquire via Email
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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
