"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  BookOpen, 
  ArrowLeft, 
  Search, 
  Sparkles, 
  X, 
  Bookmark, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  ChevronDown, 
  Loader2,
  Grid,
  List as ListIcon,
  Flame,
  Clock,
  Layers,
  BookMarked
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      {/* Hidden image element to trigger loading detection */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        onLoad={() => setLoaded(true)}
        className="absolute w-1 h-1 opacity-0 pointer-events-none"
        aria-hidden="true"
      />
      {/* Secure visible image container using background-image */}
      <div
        role="img"
        aria-label={alt}
        style={{ backgroundImage: `url(${url})` }}
        className={`w-full h-full bg-contain bg-center bg-no-repeat pointer-events-none select-none transition-opacity duration-500 ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      />
    </div>
  );
};

export default function StoriesPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [dynamicStories, setDynamicStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
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
    
    // 500ms transition lock
    setTimeout(() => {
      isTransitioning.current = false;
    }, 500);
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
    document.title = "NamiArts | Illustrated Stories & Manga Lore";
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
            month: "short",
            day: "numeric"
          });
        }

        // Split content by newlines
        const paragraphs = data.content
          ? data.content.split(/\n+/).map((p: string) => p.trim()).filter((p: string) => p.length > 0)
          : [];

        // Estimate reading time
        const wordCount = data.content ? data.content.trim().split(/\s+/).length : 0;
        const pageCount = (data.imageUrls && data.imageUrls.length) || 1;
        const readTime = `${Math.max(1, Math.ceil(wordCount / 180) + pageCount)} min read`;

        // Generate summary
        const summary = data.content && data.content.length > 140
          ? data.content.slice(0, 140).trim() + "..."
          : (data.content || "Illustrated story chapter.");

        const tags = ["All", "Manga", "Illustrated"];
        if (data.category) tags.push(data.category);

        fetchedStories.push({
          id: storyId,
          title: data.title || "Untitled Story",
          summary: summary,
          date: formattedDate,
          readTime: readTime,
          imageUrl: data.imageUrl || (data.imageUrls && data.imageUrls[0]) || "",
          imageUrls: data.imageUrls || (data.imageUrl ? [data.imageUrl] : []),
          tags: tags,
          content: paragraphs
        });
      });
      setDynamicStories(fetchedStories);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching dynamic stories:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Compute available tags
  const tagsList = ["All", "Manga", "Illustrated", "Devotional", "Fantasy", "Action"];

  // Filtered stories logic
  const filteredStories = dynamicStories.filter((story) => {
    const matchesSearch = searchQuery.trim() === "" || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag === "All" || story.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const featuredStory = dynamicStories[0];

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20 bg-[#090604] text-neutral-100 relative flex flex-col overflow-x-hidden select-none">
        {/* Glow ambient background layers */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none z-0" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[140px] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-grow flex flex-col">
          
          {/* Header Banner */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold uppercase tracking-widest mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              NamiArts Lore & Illustrated Manga
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
              Original <span className="text-[#d4af37] underline decoration-[#d4af37]/40 underline-offset-8">Illustrated Stories</span>
            </h1>
            <p className="text-neutral-400 text-sm sm:text-base font-sans leading-relaxed">
              Step inside our vibrant world. Read original manga chapters, concept lore, and background stories created exclusively for NamiArts.
            </p>
          </motion.div>

          {/* Featured Highlight Banner */}
          {featuredStory && searchQuery.trim() === "" && selectedTag === "All" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mb-14 relative rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-[#d4af37]/30 shadow-[0_10px_40px_rgba(0,0,0,0.6)] group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                <div className="lg:col-span-6 relative h-72 sm:h-96 w-full overflow-hidden bg-neutral-950 protected-image">
                  <div
                    role="img"
                    aria-label={featuredStory.title}
                    style={{ backgroundImage: `url(${featuredStory.imageUrl})` }}
                    className="absolute inset-0 h-full w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-neutral-900 via-neutral-900/40 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3.5 py-1 rounded-full bg-[#d4af37] text-black text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                      <Flame className="w-3.5 h-3.5 fill-black" />
                      Featured Story
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
                      {featuredStory.imageUrls?.length || 1} Pages
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-xs text-[#d4af37] font-semibold mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredStory.readTime}
                    </span>
                    <span>•</span>
                    <span>{featuredStory.date}</span>
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 group-hover:text-[#d4af37] transition-colors duration-300">
                    {featuredStory.title}
                  </h2>

                  <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3 font-sans">
                    {featuredStory.summary}
                  </p>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleSelectStory(featuredStory)}
                      className="px-7 py-3.5 rounded-xl bg-[#d4af37] hover:bg-[#c39e2e] text-black font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                    >
                      <BookMarked className="w-4.5 h-4.5" />
                      Read Story Now
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Search, Filter Tabs & View Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {tagsList.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all shrink-0 cursor-pointer ${
                    selectedTag === tag
                      ? "bg-[#d4af37] text-black shadow-md scale-105"
                      : "bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-grow md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search story title or lore..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-500 text-xs focus:outline-none focus:border-[#d4af37] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center rounded-full bg-neutral-900 border border-neutral-800 p-1 shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    viewMode === "grid" ? "bg-[#d4af37] text-black" : "text-neutral-400 hover:text-white"
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    viewMode === "list" ? "bg-[#d4af37] text-black" : "text-neutral-400 hover:text-white"
                  }`}
                  title="List View"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Stories List / Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
              <p className="text-neutral-400 text-sm font-sans">Loading story archives...</p>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900/30 border border-neutral-850 rounded-3xl max-w-md mx-auto px-6 w-full my-8">
              <Bookmark className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-white mb-2">No Stories Found</h3>
              <p className="text-neutral-400 text-sm font-sans mb-6">
                No stories match your filter criteria or search query.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag("All");
                }}
                className="px-5 py-2.5 bg-[#d4af37] text-black hover:bg-[#c39e2e] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
                  : "flex flex-col gap-4 mb-16"
              }
            >
              {filteredStories.map((story) => (
                <article
                  key={story.id}
                  className={`bg-neutral-900/50 border border-neutral-800/80 hover:border-[#d4af37]/50 rounded-2xl overflow-hidden backdrop-blur-sm group hover:shadow-[0_8px_30px_rgba(212,175,55,0.1)] transition-all duration-300 flex ${
                    viewMode === "grid" ? "flex-col" : "flex-col sm:flex-row items-center p-4 gap-6"
                  }`}
                >
                  <div
                    className={`relative overflow-hidden bg-neutral-950 protected-image shrink-0 ${
                      viewMode === "grid" ? "aspect-[16/10] w-full" : "aspect-square w-full sm:w-48 rounded-xl"
                    }`}
                  >
                    <div
                      role="img"
                      aria-label={story.title}
                      style={{ backgroundImage: `url(${story.imageUrl})` }}
                      className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-[#d4af37] border border-[#d4af37]/30 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {story.imageUrls?.length || 1} Pages
                    </div>
                  </div>

                  <div className={`flex flex-col flex-grow ${viewMode === "grid" ? "p-6" : "w-full"}`}>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-semibold mb-2">
                      <span>{story.date}</span>
                      <span>{story.readTime}</span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-[#d4af37] transition-colors duration-200">
                      {story.title}
                    </h3>

                    <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6 font-sans flex-grow line-clamp-3">
                      {story.summary}
                    </p>

                    <div className="flex items-center justify-between border-t border-neutral-800/80 pt-4 mt-auto">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#d4af37]">
                        Manga Chapter
                      </span>
                      <button
                        onClick={() => handleSelectStory(story)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#d4af37]/10 hover:bg-[#d4af37] text-[#d4af37] hover:text-black text-xs font-bold transition-all duration-200 cursor-pointer"
                      >
                        Read Story
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Story Reader Overlay Modal */}
      {selectedStory && (
        <div 
          ref={viewerRef}
          className="fixed inset-0 z-50 bg-black flex flex-col w-screen h-screen overflow-hidden animate-fade-in"
        >
          {/* Top Bar Navigation */}
          <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/90 via-black/60 to-transparent z-30 pointer-events-none flex items-center justify-between px-6 md:px-10">
            <div className="flex items-center gap-4 pointer-events-auto">
              <button
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(err => console.error(err));
                  }
                  setSelectedStory(null);
                }}
                className="p-2.5 rounded-full bg-neutral-900/80 hover:bg-[#d4af37] text-neutral-300 hover:text-black border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                title="Back to Stories"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-[#d4af37] uppercase tracking-widest font-mono font-bold">Interactive Manga Reader</span>
                <h2 className="text-white font-display text-sm md:text-base font-bold tracking-wide leading-tight drop-shadow-md">
                  {selectedStory.title}
                </h2>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/80 border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold uppercase tracking-wider backdrop-blur-md pointer-events-auto">
              Page {activeImageIndex + 1} of {selectedStory.imageUrls?.length || 1}
            </div>

            <div className="flex items-center gap-3 pointer-events-auto">
              <button
                onClick={toggleFullscreen}
                className="p-2.5 rounded-full bg-neutral-900/80 hover:bg-[#d4af37] text-[#d4af37] hover:text-black border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>

              <button
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(err => console.error(err));
                  }
                  setSelectedStory(null);
                }}
                className="p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                aria-label="Close reader"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 md:hidden flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 border border-[#d4af37]/30 text-[#d4af37] text-[11px] font-bold uppercase tracking-wider backdrop-blur-md pointer-events-none">
            {activeImageIndex + 1} / {selectedStory.imageUrls?.length || 1}
          </div>

          {selectedStory.imageUrls && selectedStory.imageUrls.length > 1 && (
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3.5 bg-black/70 backdrop-blur-md px-3.5 py-6 rounded-full border border-white/10 shadow-2xl">
              {selectedStory.imageUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => changePage(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeImageIndex === idx ? "bg-[#d4af37] scale-150 shadow-[0_0_12px_#d4af37]" : "bg-neutral-600 hover:bg-neutral-400"
                  }`}
                  title={`Go to page ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {selectedStory.imageUrls && selectedStory.imageUrls.length > 1 && (
            <>
              {activeImageIndex > 0 && (
                <button
                  onClick={() => changePage(activeImageIndex - 1)}
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-40 hidden md:block p-3.5 rounded-full bg-neutral-900/80 hover:bg-[#d4af37] border border-white/10 text-white hover:text-black transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 backdrop-blur-md"
                  title="Previous Page"
                >
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
              )}
              {activeImageIndex < selectedStory.imageUrls.length - 1 && (
                <button
                  onClick={() => changePage(activeImageIndex + 1)}
                  className="absolute right-24 top-1/2 -translate-y-1/2 z-40 hidden md:block p-3.5 rounded-full bg-neutral-900/80 hover:bg-[#d4af37] border border-white/10 text-white hover:text-black transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 backdrop-blur-md"
                  title="Next Page"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </>
          )}

          <div 
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full h-full bg-black relative flex items-center justify-center select-none overflow-hidden"
          >
            {selectedStory.imageUrls && selectedStory.imageUrls.length > 0 ? (
              selectedStory.imageUrls.map((url, idx) => {
                // Performance Optimization: Only render active slide and immediate adjacent slides (idx - 1, idx + 1)
                const isNearActive = Math.abs(idx - activeImageIndex) <= 1;
                if (!isNearActive) return null;

                return (
                  <div 
                    key={url} 
                    className={`absolute inset-0 w-full h-full flex items-center justify-center bg-black transition-all duration-300 ease-out ${
                      activeImageIndex === idx 
                        ? "opacity-100 z-10 pointer-events-auto scale-100" 
                        : "opacity-0 z-0 pointer-events-none scale-95"
                    }`}
                  >
                    <StoryImage url={url} alt={`${selectedStory.title} page ${idx + 1}`} />

                    {idx === 0 && selectedStory.imageUrls!.length > 1 && (
                      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center z-20 px-5 py-3 rounded-2xl bg-black/80 backdrop-blur-md border border-[#d4af37]/40 pointer-events-none flex flex-col items-center gap-1">
                        <p className="text-[#d4af37] text-[10px] tracking-widest uppercase font-bold">
                          Scroll or swipe to turn page
                        </p>
                        <ChevronDown className="w-4 h-4 text-[#d4af37] animate-bounce mt-1" />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
                <StoryImage url={selectedStory.imageUrl} alt={selectedStory.title} />
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="py-10 border-t border-neutral-900 text-center text-sm text-neutral-500 font-sans bg-neutral-950 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display text-base font-bold text-white tracking-widest">NAMI<span className="text-[#d4af37]">ARTS</span></p>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Link href="/" className="hover:text-[#d4af37] transition-colors duration-200 text-neutral-450 hover:underline">
              Home
            </Link>
            <Link href="/#about" className="hover:text-[#d4af37] transition-colors duration-200 text-neutral-450 hover:underline">
              About Us
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
