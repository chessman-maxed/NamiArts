"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/navbar";
import ArtworkCard from "@/components/artwork-card";
import { ART_CATEGORIES, CategoryItem } from "@/lib/categories";
import { ArrowLeft, Loader2, Search, X, Filter, Sparkles } from "lucide-react";

interface Artwork {
  id: string;
  title: string;
  price: string | number;
  imageUrl: string;
  category?: string;
  orientation?: "portrait" | "landscape";
  width?: number;
  height?: number;
  aspectRatio?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
}


function ArtworkGalleryContent() {
  const searchParams = useSearchParams();
  const initialCategorySlug = searchParams.get("category") || "all";

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(initialCategorySlug);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategorySlug(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    const q = query(collection(db, "artworks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const artList: Artwork[] = [];
        snapshot.forEach((doc) => {
          artList.push({ id: doc.id, ...doc.data() } as Artwork);
        });
        setArtworks(artList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching artworks:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Find active category metadata object if any
  const currentCategory: CategoryItem | undefined = ART_CATEGORIES.find(
    (cat) => cat.slug === selectedCategorySlug || cat.id === selectedCategorySlug
  );

  // Combine database artworks + category sample artworks for a rich gallery experience
  const getCategoryArtworks = () => {
    let combined: Artwork[] = [];

    if (selectedCategorySlug === "all") {
      // Gather all sample artworks across categories + db artworks
      combined = [...artworks];
      for (const cat of ART_CATEGORIES) {
        for (const sample of cat.sampleArtworks) {
          if (!combined.some((item) => item.id === sample.id)) {
            combined.push({
              ...sample,
              category: cat.slug,
            });
          }
        }
      }
    } else if (currentCategory) {
      // Get DB artworks matching this category
      const dbMatching = artworks.filter((art) => {
        if (!art.category) return false;
        const c = art.category.toLowerCase();
        return c.includes(currentCategory.id) || c.includes(currentCategory.slug) || currentCategory.title.toLowerCase().includes(c);
      });

      combined = [...dbMatching];
      for (const sample of currentCategory.sampleArtworks) {
        if (!combined.some((item) => item.id === sample.id)) {
          combined.push({
            ...sample,
            category: currentCategory.slug,
          });
        }
      }
    } else {
      combined = [...artworks];
    }

    // Apply text search filtering & derive fallback orientation if missing
    return combined
      .filter((art) => {
        if (!searchQuery) return true;
        return art.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
      })
      .map((art) => {
        let derivedOrientation = art.orientation;
        if (!derivedOrientation && art.width && art.height) {
          derivedOrientation = art.width > art.height ? "landscape" : "portrait";
        }
        return {
          ...art,
          orientation: derivedOrientation || "portrait",
        };
      });
  };


  // Calculate total artworks for each category pill & badge
  const getCategoryCount = (catIdOrSlug: string) => {
    if (catIdOrSlug === "all") {
      let total = artworks.length;
      for (const cat of ART_CATEGORIES) {
        for (const sample of cat.sampleArtworks) {
          if (!artworks.some((item) => item.id === sample.id)) {
            total++;
          }
        }
      }
      return total;
    }
    const catObj = ART_CATEGORIES.find((c) => c.slug === catIdOrSlug || c.id === catIdOrSlug);
    if (!catObj) return 0;
    const dbMatching = artworks.filter((art) => {
      if (!art.category) return false;
      const c = art.category.toLowerCase();
      return c.includes(catObj.id) || c.includes(catObj.slug) || catObj.title.toLowerCase().includes(c);
    });
    let count = dbMatching.length;
    for (const sample of catObj.sampleArtworks) {
      if (!dbMatching.some((item) => item.id === sample.id)) {
        count++;
      }
    }
    return count;
  };

  const displayList = getCategoryArtworks();

  return (
    <div className="min-h-screen bg-[#090604] text-neutral-100 flex flex-col select-none">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Dedicated Category Page Back Button & Header */}
        <div className="mb-8">
          <Link
            href="/#collections"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900/80 hover:bg-[#d4af37] text-white hover:text-black border border-neutral-800 hover:border-transparent text-xs font-semibold tracking-wider transition-all duration-300 shadow-md group mb-6"
          >
            <ArrowLeft className="w-4 h-4 text-[#d4af37] group-hover:text-black transition-colors" />
            <span>Back to Explore Collections</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-900">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold block">
                  {currentCategory ? `Category ${currentCategory.number}` : "Full Collection"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 shadow-xs">
                  {displayList.length} {displayList.length === 1 ? "Artwork" : "Artworks"} {searchQuery ? "Found" : "Available"}
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-wide">
                {currentCategory ? currentCategory.title : "All Art Collections"}
              </h1>
              <p className="text-neutral-400 text-sm mt-2 max-w-2xl font-sans leading-relaxed">
                {currentCategory ? currentCategory.description : "Browse all original artwork designs available for custom physical photo framing across every category."}
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search artwork in this category..."
                className="w-full bg-neutral-900/80 border border-neutral-800 focus:border-[#d4af37] rounded-full pl-10 pr-8 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all shadow-inner"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 select-none scrollbar-none">
          <button
            onClick={() => setSelectedCategorySlug("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer ${
              selectedCategorySlug === "all"
                ? "bg-[#d4af37] text-black font-bold shadow-lg"
                : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700"
            }`}
          >
            All Collections ({getCategoryCount("all")})
          </button>
          {ART_CATEGORIES.map((cat) => {
            const count = getCategoryCount(cat.id);
            const isSelected = selectedCategorySlug === cat.slug || selectedCategorySlug === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategorySlug(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#d4af37] text-black font-bold shadow-lg"
                    : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700"
                }`}
              >
                {cat.title} ({count})
              </button>
            );
          })}
        </div>

        {/* Artworks Display Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
            <p className="text-neutral-500 text-sm">Opening gallery vaults...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/30 border border-neutral-850 rounded-2xl max-w-md mx-auto px-6">
            <Filter className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-white mb-1">No Artworks Found</h3>
            <p className="text-neutral-400 text-sm mb-5">
              No artworks match your current search query in this category.
            </p>
            <button
              onClick={() => setSearchInput("")}
              className="px-5 py-2 rounded-full bg-neutral-800 hover:bg-[#d4af37] text-white hover:text-black font-semibold text-xs transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {displayList.map((art) => (
              <ArtworkCard
                key={art.id}
                id={art.id}
                title={art.title}
                price={art.price}
                imageUrl={art.imageUrl}
                orientation={art.orientation}
                width={art.width}
                height={art.height}
                aspectRatio={art.aspectRatio}
              />
            ))}
          </div>


        )}
      </main>

      <footer className="py-8 border-t border-neutral-900 text-center text-xs text-neutral-500 bg-neutral-950">
        <p>© 2026 NamiArts. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default function ArtworkGalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090604] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
        </div>
      }
    >
      <ArtworkGalleryContent />
    </Suspense>
  );
}
