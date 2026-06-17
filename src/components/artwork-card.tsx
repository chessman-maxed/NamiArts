"use client";

import React from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { getPreviewImageUrl } from "@/lib/image";

interface ArtworkCardProps {
  id: string;
  title: string;
  price: string | number;
  imageUrl: string;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ id, title, price, imageUrl }) => {
  // Format price to currency if it's numeric, or display as-is if it has text
  const formattedPrice = typeof price === "number" || !isNaN(Number(price))
    ? `₹${Number(price).toLocaleString()}`
    : price;

  return (
    <div className="group relative overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800/80 transition-all duration-500 hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(214,175,55,0.08)] flex flex-col">
      
      {/* Image Wrapper (Protected) */}
      <div 
        className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-950 select-none protected-image cursor-pointer"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Invisible protection shield overlay to prevent direct saving */}
        <div className="absolute inset-0 z-20" onContextMenu={(e) => e.preventDefault()} />
        
        {/* Watermark Overlay */}
        <div className="watermark-overlay" />
        <div className="watermark-text">NamiArts</div>

        {/* The Image itself */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getPreviewImageUrl(imageUrl)}
          alt={title}
          className="h-full w-full object-cover object-top transition-transform duration-750 ease-out group-hover:scale-105 pointer-events-none select-none"
          onDragStart={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
        />
        
        {/* Dark subtle shadow vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
      </div>

      {/* Card Info Details */}
      <div className="p-5 flex flex-col flex-grow bg-neutral-900/40 backdrop-blur-sm">
        <h3 className="font-display text-lg font-bold text-white tracking-wide truncate mb-1">
          {title}
        </h3>
        <p className="text-sm font-medium text-[#d4af37] mb-4">
          {formattedPrice}
        </p>
        
        <div className="mt-auto">
          <Link
            href={`/artwork/${id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-neutral-800/60 hover:bg-[#d4af37] text-white hover:text-black font-semibold text-sm transition-all duration-300 border border-neutral-700/50 hover:border-transparent"
          >
            <Eye className="w-4 h-4" />
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArtworkCard;
