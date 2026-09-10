"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ART_CATEGORIES, CategoryItem } from "@/lib/categories";
import { getPreviewImageUrl } from "@/lib/image";
import { ArrowRight, Award, Download, Heart, BookOpen } from "lucide-react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AnimatedSection } from "@/components/animated-section";

interface ArtworkData {
  id: string;
  title: string;
  price: string | number;
  imageUrl: string;
  category?: string;
  orientation?: "portrait" | "landscape";
  width?: number;
  height?: number;
  aspectRatio?: number;
}



interface StoryData {
  id: string;
  title: string;
  content?: string;
  imageUrl: string;
  imageUrls?: string[];
}

interface ArtCollectionsSectionProps {
  artworks?: ArtworkData[];
}

export default function ArtCollectionsSection({ artworks = [] }: ArtCollectionsSectionProps) {
  const [stories, setStories] = useState<StoryData[]>([]);

  // Fetch published stories from Firestore "stories" collection
  useEffect(() => {
    const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const storyList: StoryData[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          storyList.push({
            id: doc.id,
            title: data.title || "Untitled Story",
            content: data.content || "",
            imageUrl: data.imageUrl || "",
            imageUrls: data.imageUrls || (data.imageUrl ? [data.imageUrl] : []),
          });
        });
        setStories(storyList);
      },
      (error) => {
        console.error("Error fetching stories for collections section:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Helper to get matching real artworks for a given category
  const getCategoryArtworks = (cat: CategoryItem) => {
    if (!artworks || artworks.length === 0) {
      return [];
    }

    // Find matching real artworks from Firestore props by category field or title
    const matching = artworks.filter((art) => {
      if (!art.category) return false;
      const c = art.category.toLowerCase();
      return c.includes(cat.id) || c.includes(cat.slug) || cat.title.toLowerCase().includes(c);
    });

    return matching.slice(0, 4).map((art) => {
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


  return (
    <section id="collections" className="w-full bg-[#F8F7F4] text-[#1A1A1A] py-12 md:py-20 border-t border-[#E5E3DC] select-none overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Heading with Decorative Gold Filigree */}
        <div className="flex flex-col items-center justify-center text-center mb-12 md:mb-16">
          <div className="flex items-center gap-3 sm:gap-5 w-full max-w-xl justify-center mb-2">
            <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
            <span className="text-[#D4AF37] text-sm tracking-widest flex items-center gap-1.5 select-none font-serif">
              ✦ ───
            </span>
            <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-[0.2em] text-[#1A1A1A] uppercase">
              EXPLORE OUR ART COLLECTIONS
            </h2>
            <span className="text-[#D4AF37] text-sm tracking-widest flex items-center gap-1.5 select-none font-serif">
              ─── ✦
            </span>
            <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
          </div>
        </div>

        {/* Categories Rows List */}
        <div className="flex flex-col space-y-10 md:space-y-12">
          {ART_CATEGORIES.map((cat) => {
            const isSpecialRow = cat.id === "stories";

            if (isSpecialRow) {
              // Special Illustrated Stories Layout Row - Powered by actual Firestore Stories
              const featuredStory = stories.length > 0 ? stories[0] : null;

              return (
                <AnimatedSection key={cat.id} direction="up" delay={0.05}>
                  <div className="pt-8 border-t border-[#E5E3DC] flex flex-col gap-6">
                    {/* Category Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 shadow-md"
                          style={{ backgroundColor: cat.badgeBg }}
                        >
                          <cat.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                            {cat.number}. {cat.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#555555] font-sans mt-0.5">
                            {cat.description}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/stories"
                        style={{
                          color: cat.accentColor,
                          borderColor: cat.borderColor,
                        }}
                        className="hidden sm:inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border bg-white hover:bg-neutral-50 text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 shadow-sm hover:shadow transform hover:-translate-y-0.5"
                      >
                        View All Stories
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Featured Story Showcase Box */}
                    {featuredStory ? (
                      <div className="w-full bg-[#EBF4F2] border border-[#B2DFDB] rounded-2xl p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-sm">
                        {/* Featured Story Cover Banner */}
                        <div className="lg:col-span-4 h-56 sm:h-64 rounded-xl overflow-hidden relative protected-image shadow-md bg-gray-200">
                          <div
                            role="img"
                            aria-label={featuredStory.title}
                            style={{
                              backgroundImage: `url('${getPreviewImageUrl(
                                featuredStory.imageUrl || (featuredStory.imageUrls && featuredStory.imageUrls[0]) || ""
                              )}')`,
                            }}
                            className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-bold truncate">
                            Featured Illustrated Story
                          </div>
                        </div>

                        {/* Story Page Panels Preview */}
                        <div className="lg:col-span-4 grid grid-cols-2 gap-2 h-56 sm:h-64">
                          {(featuredStory.imageUrls && featuredStory.imageUrls.length > 0
                            ? featuredStory.imageUrls.slice(0, 4)
                            : [featuredStory.imageUrl]
                          ).map((img, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg overflow-hidden border border-white/60 shadow-sm relative protected-image bg-gray-200"
                            >
                              <div
                                role="img"
                                aria-label={`Page ${idx + 1}`}
                                style={{ backgroundImage: `url('${getPreviewImageUrl(img)}')` }}
                                className="w-full h-full bg-cover bg-center transition-all duration-300 hover:scale-105"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Story Details & Read Action */}
                        <div className="lg:col-span-4 flex flex-col justify-center items-start lg:pl-4 space-y-3">
                          <div>
                            <h4 className="font-serif text-2xl sm:text-3xl font-bold text-[#004D40] line-clamp-1">
                              {featuredStory.title}
                            </h4>
                            <p className="text-xs uppercase tracking-wider font-semibold text-[#00796B] mt-1">
                              Illustrated Story • Manga Format
                            </p>
                          </div>

                          <p className="text-sm text-[#37474F] font-sans leading-relaxed line-clamp-3">
                            {featuredStory.content || "Experience our original illustrated story chapter."}
                          </p>

                          <Link
                            href="/stories"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00695C] hover:bg-[#004D40] text-white font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mt-2"
                          >
                            Read Story
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full bg-[#EBF4F2] border border-[#B2DFDB] rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
                        <BookOpen className="w-8 h-8 text-[#00695C]" />
                        <h4 className="font-serif text-lg font-bold text-[#004D40]">No Stories Added Yet</h4>
                        <p className="text-xs text-[#00796B] max-w-md">
                          Check back soon as new illustrated manga stories and concept lore are published!
                        </p>
                        <Link
                          href="/stories"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00695C] text-white text-xs font-semibold hover:bg-[#004D40] transition-colors mt-2"
                        >
                          Explore Stories Page
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </AnimatedSection>
              );
            }

            // Normal Category Horizontal Row
            const categoryArtworks = getCategoryArtworks(cat);

            return (
              <AnimatedSection key={cat.id} direction="up" delay={0.05}>
                <div className="pt-8 border-t border-[#E5E3DC] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* 1. Category Info Column (Desktop: 3 cols) */}
                <div className="lg:col-span-3 flex lg:flex-col items-start gap-4">
                  {/* Category Badge Icon */}
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shrink-0 shadow-md"
                    style={{ backgroundColor: cat.badgeBg }}
                  >
                    <cat.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>

                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
                      {cat.number}. {cat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#555555] font-sans mt-1 leading-snug">
                      {cat.description.includes("(") ? (
                        <>
                          {cat.description.split("(")[0]}
                          <strong className="font-bold text-[#1A1A1A]">
                            ({cat.description.split("(")[1]}
                          </strong>
                        </>
                      ) : (
                        cat.description
                      )}
                    </p>

                  </div>
                </div>

                {/* 2. Artwork Previews Grid (Desktop: 7 cols - 4 cards) */}
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 items-center">
                  {categoryArtworks.length === 0 ? (
                    <div className="col-span-2 sm:col-span-4 py-6 px-4 border border-dashed border-[#D4D2CA] rounded-xl text-center bg-white/40">
                      <p className="text-xs text-[#777777] font-sans">No artworks uploaded in this category yet.</p>
                    </div>
                  ) : (
                    categoryArtworks.map((art) => {
                      const aspectClass = art.orientation === "landscape" ? "aspect-[16/9]" : "aspect-[3/4]";
                      return (
                        <Link
                          key={art.id}
                          href={`/artwork/${art.id}`}
                          style={{ backgroundColor: cat.badgeBg }}
                          className="group relative flex flex-col rounded-xl overflow-hidden p-1.5 border border-white/20 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 select-none protected-image w-full"
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          {/* Proportional Category-Colored Background Frame */}
                          <div className={`relative ${aspectClass} w-full overflow-hidden rounded-lg bg-neutral-950 border border-neutral-850 flex items-center justify-center`}>
                            <div
                              role="img"
                              aria-label={art.title}
                              style={{
                                backgroundImage: `url('${getPreviewImageUrl(art.imageUrl)}')`,
                              }}
                              className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                            />
                            <div className="watermark-overlay opacity-30" />
                            <div className="watermark-text text-[10px]">NamiArts</div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>


                {/* 3. View All Button Column (Desktop: 2 cols) */}
                <div className="lg:col-span-2 flex justify-end">
                  <Link
                    href={`/artwork?category=${cat.slug}`}
                    style={{
                      color: cat.accentColor,
                      borderColor: cat.borderColor,
                    }}
                    className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border bg-white hover:bg-neutral-50 text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 shadow-sm hover:shadow transform hover:-translate-y-0.5"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* Bottom Feature Highlights Bar (Matching Reference Image) */}
        <div className="mt-16 pt-10 border-t border-[#E5E3DC] grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-5 rounded-xl bg-white/70 border border-[#E5E3DC] shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FFF8E7] border border-[#F3E5AB] flex items-center justify-center text-[#D4AF37] shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-serif text-base font-bold text-[#1A1A1A]">
                High Quality Artworks
              </h4>
              <p className="text-xs text-[#666666] font-sans mt-0.5">
                Every artwork is created with passion and attention to detail.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-5 rounded-xl bg-white/70 border border-[#E5E3DC] shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A] shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-serif text-base font-bold text-[#1A1A1A]">
                Premium Photo Framing
              </h4>
              <p className="text-xs text-[#666666] font-sans mt-0.5">
                Crafted into physical high-end framed photo products & delivered to you.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-5 rounded-xl bg-white/70 border border-[#E5E3DC] shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center text-[#E11D48] shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-serif text-base font-bold text-[#1A1A1A]">
                Made with Passion
              </h4>
              <p className="text-xs text-[#666666] font-sans mt-0.5">
                Each artwork is a piece of heart and imagination.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
