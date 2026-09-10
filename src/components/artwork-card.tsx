"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Eye, ShoppingBag } from "lucide-react";
import { getPreviewImageUrl } from "@/lib/image";
import { useCart } from "@/context/cart-context";
import { getCategoryBadgeBg } from "@/lib/categories";

interface ArtworkCardProps {
  id: string;
  title: string;
  price: string | number;
  imageUrl: string;
  category?: string;
  orientation?: "portrait" | "landscape" | "square";
  width?: number;
  height?: number;
  aspectRatio?: number;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = React.memo(({
  id,
  title,
  price,
  imageUrl,
  category,
  orientation,
  width,
  height,
  aspectRatio,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState({ transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)" });
  const { openFrameSelection } = useCart();
  const [detectedAspect, setDetectedAspect] = useState<number | undefined>(undefined);

  const categoryColor = getCategoryBadgeBg(category);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!aspectRatio && !width && !detectedAspect) {
      const { naturalWidth, naturalHeight } = e.currentTarget;
      if (naturalWidth && naturalHeight) {
        setDetectedAspect(naturalWidth / naturalHeight);
      }
    }
  };

  const computedAspect =
    aspectRatio ||
    (width && height ? width / height : undefined) ||
    detectedAspect;

  let aspectClass = "aspect-[3/4]";
  if (computedAspect) {
    if (computedAspect > 1.15) {
      aspectClass = "aspect-[16/9]";
    } else if (computedAspect >= 0.85 && computedAspect <= 1.15) {
      aspectClass = "aspect-square";
    } else {
      aspectClass = "aspect-[3/4]";
    }
  } else if (orientation === "landscape") {
    aspectClass = "aspect-[16/9]";
  } else if (orientation === "square") {
    aspectClass = "aspect-square";
  }

  const formattedPrice = typeof price === "number" || !isNaN(Number(price))
    ? `₹${Number(price).toLocaleString()}`
    : price;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only apply subtle 3D tilt on fine pointer/desktop
    if (window.matchMedia("(pointer: coarse)").matches || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -3; // Max 3deg tilt
    const rotateY = ((x - centerX) / centerX) * 3;

    setTransformStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`,
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openFrameSelection({
      id,
      title,
      price,
      imageUrl,
      orientation,
      width,
      height,
      aspectRatio: computedAspect,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={transformStyle}
      className="group relative overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800/80 transition-all duration-300 ease-out hover:border-amber-500/40 hover:shadow-[0_12px_35px_rgba(214,175,55,0.12)] flex flex-col transform-gpu"
    >
      {/* Outer Proportional Category-Colored Background Frame */}
      <div 
        style={{ backgroundColor: categoryColor }}
        className={`relative w-full ${aspectClass} p-1.5 sm:p-2 border-b border-neutral-800 flex items-center justify-center overflow-hidden group/frame shadow-inner`}
      >
        {/* Inner Dark Matte Frame Window */}
        <div 
          className="relative w-full h-full rounded-lg bg-neutral-950 border border-neutral-800/90 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] overflow-hidden select-none protected-image cursor-pointer flex items-center justify-center"
          onContextMenu={(e) => e.preventDefault()}
        >

          {/* Invisible protection shield overlay */}
          <Link 
            href={`/artwork/${id}`}
            className="absolute inset-0 z-20" 
            onContextMenu={(e) => e.preventDefault()}
            title="Click to view artwork & select frame"
          />
          
          {/* Watermark Overlay */}
          <div className="watermark-overlay" />
          <div className="watermark-text">NamiArts</div>

          {/* Quick Add To Cart Hover Button */}
          <button
            onClick={handleAddToCart}
            className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-neutral-950/80 backdrop-blur-md border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center opacity-100 sm:opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-[#d4af37] hover:text-black shadow-lg cursor-pointer"
            aria-label="Add to cart"
            title="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          {/* Hidden image element to trigger onLoad */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getPreviewImageUrl(imageUrl)}
            alt=""
            onLoad={handleImageLoad}
            className="absolute w-1 h-1 opacity-0 pointer-events-none"
            aria-hidden="true"
          />

          {/* The Image itself - bg-cover fills inner frame completely with zero side gap */}
          <div
            role="img"
            aria-label={title}
            style={{ backgroundImage: `url(${getPreviewImageUrl(imageUrl)})` }}
            className="h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover/frame:scale-105 pointer-events-none select-none"
          />

          {/* Dark subtle shadow vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent opacity-80 pointer-events-none" />
        </div>
      </div>


      {/* Card Info Details */}
      <div className="p-5 flex flex-col flex-grow bg-neutral-900/50 backdrop-blur-sm">
        <h3 className="font-display text-lg font-bold text-[#f5f5f5] tracking-wide truncate mb-1">
          {title}
        </h3>
        <p className="text-sm font-medium text-[#d4af37] mb-4">
          {formattedPrice}
        </p>
        
        <div className="mt-auto grid grid-cols-2 gap-2">
          <Link
            href={`/artwork/${id}`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-white font-semibold text-xs transition-all duration-300 border border-neutral-700/50"
          >
            <Eye className="w-3.5 h-3.5" />
            Details
          </Link>
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37] text-[#d4af37] hover:text-black font-extrabold text-xs transition-all duration-300 border border-[#d4af37]/40 hover:border-transparent cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add Cart
          </button>
        </div>
      </div>
    </div>
  );
});


ArtworkCard.displayName = "ArtworkCard";

export default ArtworkCard;
