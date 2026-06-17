"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Search, 
  Sparkles, 
  X, 
  Filter,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";

interface Story {
  id: string;
  title: string;
  summary: string;
  content: string[];
  date: string;
  readTime: string;
  imageUrl: string;
  imageUrls?: string[];
  tags: string[];
  featured?: boolean;
}

const storiesData: Story[] = [];

// StoryImage subcomponent to handle page loading state spinner per slide
const StoryImage = ({ url, alt }: { url: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
        </div>
      )}
      <img
        src={url}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`max-w-full max-h-screen object-contain pointer-events-none select-none transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

export default function StoriesPage() {
  const [searchQuery, setSearchQuery] = useState<string>(" ");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [dynamicStories, setDynamicStories] = useState<Story[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const viewerRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const handleSelectStory = (story: Story) => {
    setSelectedStory(story);
    setActiveImageIndex(0);
  };

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await viewerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Error attempting to toggle fullscreen:", err);
    }
  };

  const changePage = (newIndex: number) => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setActiveImageIndex(newIndex);
    
    // 600ms transition lock matching CSS duration
    setTimeout(() => {
      isTransitioning.current = false;
    }, 600);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isTransitioning.current) return;
    const threshold = 20; // Minimum scroll delta
    if (Math.abs(e.deltaY) < threshold) return;

    const pagesCount = selectedStory?.imageUrls?.length || 1;
    if (e.deltaY > 0) {
      if (activeImageIndex < pagesCount - 1) {
        changePage(activeImageIndex + 1);
      }
    } else {
      if (activeImageIndex > 0) {
        changePage(activeImageIndex - 1);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY.current - touchEndY;
    const threshold = 40; // Swiping pixel limit

    const pagesCount = selectedStory?.imageUrls?.length || 1;
    if (Math.abs(diffY) > threshold) {
      if (diffY > 0) {
        if (activeImageIndex < pagesCount - 1) {
          changePage(activeImageIndex + 1);
        }
      } else {
        if (activeImageIndex > 0) {
          changePage(activeImageIndex - 1);
        }
      }
    }
    touchStartY.current = null;
  };

  useEffect(() => {
    document.title = "NamiArts | Stories & Concept Lore";
  }, []);

  // Sync body scroll locking when reader is active
  useEffect(() => {
    if (selectedStory) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedStory]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!selectedStory) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.error(err));
        }
        setSelectedStory(null);
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        const nextIndex = Math.min((selectedStory.imageUrls?.length || 1) - 1, activeImageIndex + 1);
        changePage(nextIndex);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = Math.max(0, activeImageIndex - 1);
        changePage(prevIndex);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStory, activeImageIndex]);

  // Fetch stories directly from the Firestore "stories" collection
  useEffect(() => {
    const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedStories: Story[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const storyId = doc.id;
        
        // Format date
        let formattedDate = "Recently Added";
        if (data.createdAt) {
          const dateObj = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          formattedDate = dateObj.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          });
        }

        // Split content by newlines to form paragraphs
        const paragraphs = data.content
          ? data.content.split(/\n+/).map((p: string) => p.trim()).filter((p: string) => p.length > 0)
          : [];

        // Estimate reading time
        const wordCount = data.content ? data.content.trim().split(/\s+/).length : 0;
        const readTimeVal = Math.max(1, Math.ceil(wordCount / 180));
        const readTime = `${readTimeVal} min read`;

        // Generate summary from content
        const summary = data.content && data.content.length > 130
          ? data.content.slice(0, 130).trim() + "..."
          : (data.content || "");

        // Dynamic tags
        const tags = ["Story", data.title.split(" ")[0]];

        fetchedStories.push({
          id: storyId,
          title: data.title,
          summary: summary,
          date: formattedDate,
          readTime: readTime,
          imageUrl: data.imageUrl,
          imageUrls: data.imageUrls || (data.imageUrl ? [data.imageUrl] : []),
          tags: tags,
          content: paragraphs
        });
      });
      setDynamicStories(fetchedStories);
    }, (error) => {
      console.error("Error fetching dynamic stories:", error);
    });

    return () => unsubscribe();
  }, []);

  const allStories = [...storiesData, ...dynamicStories];

  // Filtered stories logic
  const filteredStories = allStories.filter((story) => {
    const matchesSearch = searchQuery.trim() === "" || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const featuredStory = allStories.find(s => s.featured) || allStories[0];

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20 bg-neutral-950 relative flex flex-col">
        {/* Glow ambient background */}
        <div className="absolute inset-0 ambient-glow z-0 pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10 w-full flex-grow flex flex-col">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-850 text-[#d4af37] text-xs font-semibold uppercase tracking-wider mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Creative Lore & Backgrounds
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
              Stories behind the <span className="shimmer-text">Art</span>
            </h1>
            <p className="text-neutral-400 text-sm md:text-base font-sans leading-relaxed">
              Explore the rich lore, character concepts, and artistic journeys that shape each original digital piece in the NamiArts gallery.
            </p>
          </div>

          {/* Featured Story Section */}
          {featuredStory && searchQuery.trim() === "" && (
            <div className="mb-12 bg-neutral-900/40 border border-neutral-850 rounded-3xl overflow-hidden backdrop-blur-md group hover:border-[#d4af37]/30 transition-all duration-500">
              <div className="grid md:grid-cols-12 gap-0">
                <div className="md:col-span-5 relative aspect-[16/10] md:aspect-[3/4] w-full overflow-hidden bg-neutral-955">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t md:bg-gradient-to-r from-neutral-950/80 via-transparent to-transparent" />
                  <img
                    src={featuredStory.imageUrl}
                    alt={featuredStory.title}
                    className="absolute inset-0 h-full w-full object-cover object-[center_38%] transition-transform duration-1000 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-[#d4af37] text-black text-[10px] font-extrabold uppercase tracking-widest shadow-lg">
                    Most Recent
                  </span>
                </div>
                <div className="md:col-span-7 p-8 flex flex-col justify-center">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-[#d4af37] transition-colors duration-300">
                    {featuredStory.title}
                  </h2>
                  {featuredStory.summary && featuredStory.summary.trim() !== "" && (
                    <p className="text-neutral-400 text-sm md:text-base leading-relaxed mb-6 font-sans">
                      {featuredStory.summary}
                    </p>
                  )}
                  <div>
                    <button
                      onClick={() => handleSelectStory(featuredStory)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#d4af37] hover:bg-[#b8901c] text-black font-bold text-sm tracking-wide shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      Read Full Story
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="flex justify-end mb-8">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search lore, tags, titles..."
                value={searchQuery === " " ? "" : searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-500 text-xs focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
              />
              {searchQuery.trim() !== "" && (
                <button
                  onClick={() => setSearchQuery(" ")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Stories Grid */}
          {filteredStories.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900/10 border border-neutral-900 rounded-3xl max-w-md mx-auto px-6 w-full my-8">
              <Bookmark className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-white mb-2">No Stories Found</h3>
              <p className="text-neutral-400 text-sm font-sans">
                We couldn't find any stories matching your search or filters. Please try another query or reset the filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery(" ");
                }}
                className="mt-6 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold border border-neutral-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {filteredStories.map((story) => (
                <article
                  key={story.id}
                  className="bg-neutral-900/20 border border-neutral-900 hover:border-neutral-800/80 rounded-2xl p-6 flex flex-col backdrop-blur-sm group hover:bg-neutral-900/40 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Story Card Image */}
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-5 bg-neutral-955">
                    <img
                      src={story.imageUrl}
                      alt={story.title}
                      className={`h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105 ${
                        story.id === "neon-horizon" ? "hue-rotate-60 saturate-150 contrast-125" : ""
                      }`}
                    />
                  </div>

                  <h3 className="font-display text-xl font-bold text-white mb-3 mt-4 group-hover:text-[#d4af37] transition-colors duration-200">
                    {story.title}
                  </h3>

                  {story.summary && story.summary.trim() !== "" && (
                    <p className="text-neutral-400 text-xs md:text-sm leading-relaxed mb-6 font-sans flex-grow">
                      {story.summary}
                    </p>
                  )}

                  <div className="flex justify-end border-t border-neutral-900/80 pt-4 mt-auto">
                    <button
                      onClick={() => handleSelectStory(story)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#d4af37] hover:text-[#b8901c] transition-colors"
                    >
                      Read
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Story Reader Overlay Modal (Immersive Fullscreen) */}
      {selectedStory && (
        <div 
          ref={viewerRef}
          className="fixed inset-0 z-50 bg-black flex flex-col w-screen h-screen overflow-hidden animate-fade-in"
        >
          {/* Top Bar Navigation & Info */}
          <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/85 via-black/55 to-transparent z-30 pointer-events-none flex items-center justify-between px-6 md:px-10">
            <div className="flex items-center gap-4 pointer-events-auto">
              <button
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(err => console.error(err));
                  }
                  setSelectedStory(null);
                }}
                className="p-2.5 rounded-full bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                title="Back to Stories"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-neutral-450 uppercase tracking-widest font-mono font-bold">Reading Story</span>
                <h2 className="text-white font-display text-sm md:text-base font-bold tracking-wide leading-tight drop-shadow-md">
                  {selectedStory.title}
                </h2>
              </div>
            </div>

            {/* Middle Page Counter */}
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/60 border border-white/10 text-neutral-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md pointer-events-auto">
              Page {activeImageIndex + 1} of {selectedStory.imageUrls?.length || 1}
            </div>

            {/* Right Side Action Controls */}
            <div className="flex items-center gap-3 pointer-events-auto">
              {/* Fullscreen Toggle Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2.5 rounded-full bg-neutral-900/60 hover:bg-neutral-800 text-[#d4af37] hover:text-[#b8901c] border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(err => console.error(err));
                  }
                  setSelectedStory(null);
                }}
                className="p-2.5 rounded-full bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                aria-label="Close reader"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Floating Page Counter */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 md:hidden flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 text-neutral-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md pointer-events-none">
            {activeImageIndex + 1} / {selectedStory.imageUrls?.length || 1}
          </div>

          {/* Right Floating Dot Indicators */}
          {selectedStory.imageUrls && selectedStory.imageUrls.length > 1 && (
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3.5 bg-black/55 backdrop-blur-md px-3 py-5 rounded-full border border-white/10 shadow-2xl">
              {selectedStory.imageUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => changePage(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeImageIndex === idx ? "bg-[#d4af37] scale-150 shadow-[0_0_10px_#d4af37]" : "bg-neutral-600 hover:bg-neutral-400 hover:scale-110"
                  }`}
                  title={`Go to page ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Floating navigation chevrons for mouse users */}
          {selectedStory.imageUrls && selectedStory.imageUrls.length > 1 && (
            <>
              {activeImageIndex > 0 && (
                <button
                  onClick={() => changePage(activeImageIndex - 1)}
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-40 hidden md:block p-3 rounded-full bg-neutral-900/60 hover:bg-neutral-800 border border-white/10 text-white hover:text-[#d4af37] transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 backdrop-blur-md"
                  title="Previous Page"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
              )}
              {activeImageIndex < selectedStory.imageUrls.length - 1 && (
                <button
                  onClick={() => changePage(activeImageIndex + 1)}
                  className="absolute right-24 top-1/2 -translate-y-1/2 z-40 hidden md:block p-3 rounded-full bg-neutral-900/60 hover:bg-neutral-800 border border-white/10 text-white hover:text-[#d4af37] transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 backdrop-blur-md"
                  title="Next Page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </>
          )}

          {/* Slideshow container */}
          <div 
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full h-full bg-black relative flex items-center justify-center select-none overflow-hidden"
          >
            {selectedStory.imageUrls && selectedStory.imageUrls.length > 0 ? (
              selectedStory.imageUrls.map((url, idx) => (
                <div 
                  key={url} 
                  className={`absolute inset-0 w-full h-full flex items-center justify-center bg-black transition-all duration-700 ease-in-out ${
                    activeImageIndex === idx 
                      ? "opacity-100 z-10 pointer-events-auto scale-100" 
                      : "opacity-0 z-0 pointer-events-none scale-95"
                  }`}
                >
                  <StoryImage url={url} alt={`${selectedStory.title} page ${idx + 1}`} />

                  {/* Elegant hint overlay on the first slide prompting user to scroll/swipe */}
                  {idx === 0 && selectedStory.imageUrls!.length > 1 && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center z-20 px-5 py-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 animate-fade-in pointer-events-none flex flex-col items-center gap-1">
                      <p className="text-neutral-450 text-[10px] tracking-widest uppercase font-bold">
                        Scroll or swipe to read
                      </p>
                      <ChevronDown className="w-4 h-4 text-[#d4af37] animate-bounce mt-1" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
                <StoryImage url={selectedStory.imageUrl} alt={selectedStory.title} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-10 border-t border-neutral-900 text-center text-sm text-neutral-500 font-sans bg-neutral-950/40 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display text-base font-bold text-white tracking-widest">NAMI<span className="text-[#d4af37]">ARTS</span></p>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Link href="/" className="hover:text-[#d4af37] transition-colors duration-200 text-neutral-450 hover:underline">
              Home
            </Link>
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
