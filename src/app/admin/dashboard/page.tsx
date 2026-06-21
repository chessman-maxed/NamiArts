"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import {
  Upload,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Image as ImageIcon,
  Loader2,
  X,
  Globe,
  Settings,
  IndianRupee,
  BookOpen,
  BarChart3,
  Users
} from "lucide-react";

interface Artwork {
  id: string;
  title: string;
  price: string | number;
  imageUrl: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
}

interface Story {
  id: string;
  title: string;
  content?: string;
  imageUrl: string;
  imageUrls?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
}

const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = URL.createObjectURL(file);
  });
};

const uploadToCloudinary = (file: File, onProgress: (p: number) => void): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset || "");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          reject(new Error(response.error?.message || "Cloudinary upload failed"));
        } catch {
          reject(new Error("Cloudinary upload failed"));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error during Cloudinary upload."));
    xhr.send(formData);
  });
};

export default function AdminDashboard() {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/admin");
    }
  }, [user, loading, isAdmin, router]);

  // Tab State
  const [activeTab, setActiveTab] = useState<"artworks" | "stories">("artworks");

  // Sidebar State
  const [sidebarTab, setSidebarTab] = useState<"uploading" | "analytics">("uploading");

  // Visits Data States
  const [visits, setVisits] = useState<any[]>([]);
  const [fetchingVisits, setFetchingVisits] = useState(true);

  // Database Data States
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [fetchingArtworks, setFetchingArtworks] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [fetchingStories, setFetchingStories] = useState(true);

  // Upload Artwork States
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  // Upload Story States
  const [storyTitle, setStoryTitle] = useState("");
  const [storyFiles, setStoryFiles] = useState<File[]>([]);
  const [storyUploading, setStoryUploading] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyError, setStoryError] = useState("");

  // Edit Artwork States
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editUploading, setEditUploading] = useState(false);
  const [editUploadProgress, setEditUploadProgress] = useState(0);

  // Edit Story States
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editStoryTitle, setEditStoryTitle] = useState("");
  const [editStoryImageUrls, setEditStoryImageUrls] = useState<string[]>([]);
  const [editStoryFiles, setEditStoryFiles] = useState<File[]>([]);
  const [editStoryUploading, setEditStoryUploading] = useState(false);
  const [editStoryProgress, setEditStoryProgress] = useState(0);

  // Delete States
  const [deletingArtwork, setDeletingArtwork] = useState<Artwork | null>(null);
  const [deletingArtworkLoading, setDeletingArtworkLoading] = useState(false);
  const [deletingStory, setDeletingStory] = useState<Story | null>(null);
  const [deletingStoryLoading, setDeletingStoryLoading] = useState(false);

  // Listen to Artworks Collection
  useEffect(() => {
    if (!user || !isAdmin) return;

    const q = query(collection(db, "artworks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const artList: Artwork[] = [];
      snapshot.forEach((doc) => {
        artList.push({ id: doc.id, ...doc.data() } as Artwork);
      });
      setArtworks(artList);
      setFetchingArtworks(false);
    }, (error) => {
      console.error("Error reading artworks:", error);
      setFetchingArtworks(false);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Listen to Stories Collection
  useEffect(() => {
    if (!user || !isAdmin) return;

    const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const storyList: Story[] = [];
      snapshot.forEach((doc) => {
        storyList.push({ id: doc.id, ...doc.data() } as Story);
      });
      setStories(storyList);
      setFetchingStories(false);
    }, (error) => {
      console.error("Error reading stories:", error);
      setFetchingStories(false);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Listen to Visits Collection
  useEffect(() => {
    if (!user || !isAdmin) return;

    const q = query(collection(db, "visits"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const visitList: any[] = [];
      snapshot.forEach((doc) => {
        visitList.push({ id: doc.id, ...doc.data() });
      });
      setVisits(visitList);
      setFetchingVisits(false);
    }, (error) => {
      console.error("Error reading visits:", error);
      setFetchingVisits(false);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleStoryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setStoryFiles((prev) => [...prev, ...selected]);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditImageFile(e.target.files[0]);
    }
  };

  const handleEditStoryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setEditStoryFiles((prev) => [...prev, ...selected]);
    }
  };

  // Upload/Create Artwork
  const handleUploadArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !imageFile) {
      setUploadError("Title, price, and image file are required.");
      return;
    }

    setUploadError("");
    setUploading(true);
    setUploadProgress(0);

    try {
      const dims = await getImageDimensions(imageFile).catch((err) => {
        console.error("Failed to read image dimensions:", err);
        return null;
      });

      const artUrl = await uploadToCloudinary(imageFile, (p) => {
        setUploadProgress(p);
      });

      await addDoc(collection(db, "artworks"), {
        title,
        price: price.trim(),
        imageUrl: artUrl,
        width: dims?.width || null,
        height: dims?.height || null,
        aspectRatio: dims ? dims.width / dims.height : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Reset form
      setTitle("");
      setPrice("");
      setImageFile(null);
      setUploading(false);
      setUploadProgress(0);

      const fileInput = document.getElementById("artwork-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error("Artwork upload error:", error);
      setUploadError(error.message || "Failed to publish artwork.");
      setUploading(false);
    }
  };

  // Upload/Create Story
  const handleUploadStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle || storyFiles.length === 0) {
      setStoryError("Title and at least one cover image are required.");
      return;
    }

    setStoryError("");
    setStoryUploading(true);
    setStoryProgress(0);

    try {
      const urls: string[] = [];
      for (let i = 0; i < storyFiles.length; i++) {
        const url = await uploadToCloudinary(storyFiles[i], (p) => {
          const individualContribution = p / storyFiles.length;
          const baseline = (i / storyFiles.length) * 100;
          setStoryProgress(Math.round(baseline + individualContribution));
        });
        urls.push(url);
      }

      await addDoc(collection(db, "stories"), {
        title: storyTitle,
        imageUrl: urls[0] || "",
        imageUrls: urls,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Reset form
      setStoryTitle("");
      setStoryFiles([]);
      setStoryUploading(false);
      setStoryProgress(0);

      const fileInput = document.getElementById("story-panel-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error("Story upload error:", error);
      setStoryError(error.message || "Failed to publish story.");
      setStoryUploading(false);
    }
  };

  // Open Edit Artwork Modal
  const openEditArtworkModal = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setEditTitle(artwork.title);
    setEditPrice(String(artwork.price));
    setEditImageFile(null);
  };

  // Open Edit Story Modal
  const openEditStoryModal = (story: Story) => {
    setEditingStory(story);
    setEditStoryTitle(story.title);
    setEditStoryImageUrls(story.imageUrls || (story.imageUrl ? [story.imageUrl] : []));
    setEditStoryFiles([]);
  };

  // Save Edited Artwork
  const handleSaveEditArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork) return;

    setEditUploading(true);
    setEditUploadProgress(0);

    try {
      let finalImageUrl = editingArtwork.imageUrl;
      let dims: { width: number; height: number } | null = null;

      if (editImageFile) {
        dims = await getImageDimensions(editImageFile).catch((err) => {
          console.error("Failed to read image dimensions:", err);
          return null;
        });

        finalImageUrl = await uploadToCloudinary(editImageFile, (p) => {
          setEditUploadProgress(p);
        });
      }

      if (!user) {
        throw new Error("User session expired.");
      }

      const idToken = await user.getIdToken();
      if (editImageFile && finalImageUrl !== editingArtwork.imageUrl) {
        try {
          await fetch("/api/delete-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify({ imageUrl: editingArtwork.imageUrl }),
          });
        } catch (delError) {
          console.error("Failed to delete orphaned old artwork image:", delError);
        }
      }

      const docRef = doc(db, "artworks", editingArtwork.id);
      const updateData: any = {
        title: editTitle,
        price: editPrice.trim(),
        imageUrl: finalImageUrl,
        updatedAt: serverTimestamp(),
      };

      if (editImageFile && dims) {
        updateData.width = dims.width;
        updateData.height = dims.height;
        updateData.aspectRatio = dims.width / dims.height;
      }

      await updateDoc(docRef, updateData);

      setEditingArtwork(null);
      setEditUploading(false);
      setEditUploadProgress(0);
    } catch (error) {
      console.error("Artwork update error:", error);
      alert("Failed to save changes.");
      setEditUploading(false);
    }
  };

  // Save Edited Story
  const handleSaveEditStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;

    if (editStoryImageUrls.length === 0 && editStoryFiles.length === 0) {
      alert("At least one cover image is required for the story.");
      return;
    }

    setEditStoryUploading(true);
    setEditStoryProgress(0);

    try {
      // Upload new files
      const newUrls: string[] = [];
      for (let i = 0; i < editStoryFiles.length; i++) {
        const url = await uploadToCloudinary(editStoryFiles[i], (p) => {
          const individualContribution = p / editStoryFiles.length;
          const baseline = (i / editStoryFiles.length) * 100;
          setEditStoryProgress(Math.round(baseline + individualContribution));
        });
        newUrls.push(url);
      }

      const finalUrls = [...editStoryImageUrls, ...newUrls];

      // Delete orphaned images from Cloudinary
      const originalUrls = editingStory.imageUrls || (editingStory.imageUrl ? [editingStory.imageUrl] : []);
      const deletedUrls = originalUrls.filter((url) => !finalUrls.includes(url));

      if (user && deletedUrls.length > 0) {
        const idToken = await user.getIdToken();
        for (const delUrl of deletedUrls) {
          try {
            await fetch("/api/delete-image", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
              },
              body: JSON.stringify({ imageUrl: delUrl }),
            });
          } catch (delError) {
            console.error("Failed to delete orphaned old story image:", delError);
          }
        }
      }

      const docRef = doc(db, "stories", editingStory.id);
      await updateDoc(docRef, {
        title: editStoryTitle,
        imageUrl: finalUrls[0] || "",
        imageUrls: finalUrls,
        updatedAt: serverTimestamp(),
      });

      setEditingStory(null);
      setEditStoryUploading(false);
      setEditStoryProgress(0);
    } catch (error) {
      console.error("Story update error:", error);
      alert("Failed to save changes.");
      setEditStoryUploading(false);
    }
  };

  // Confirm Delete Artwork
  const handleDeleteArtwork = async () => {
    if (!deletingArtwork) return;
    setDeletingArtworkLoading(true);

    try {
      if (user) {
        const idToken = await user.getIdToken();
        await fetch("/api/delete-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
          },
          body: JSON.stringify({ imageUrl: deletingArtwork.imageUrl }),
        });
      }

      await deleteDoc(doc(db, "artworks", deletingArtwork.id));
      setDeletingArtwork(null);
    } catch (error) {
      console.error("Artwork delete error:", error);
    } finally {
      setDeletingArtworkLoading(false);
    }
  };

  // Confirm Delete Story
  const handleDeleteStory = async () => {
    if (!deletingStory) return;
    setDeletingStoryLoading(true);

    try {
      if (user) {
        const idToken = await user.getIdToken();
        await fetch("/api/delete-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
          },
          body: JSON.stringify({ imageUrl: deletingStory.imageUrl }),
        });
      }

      await deleteDoc(doc(db, "stories", deletingStory.id));
      setDeletingStory(null);
    } catch (error) {
      console.error("Story delete error:", error);
    } finally {
      setDeletingStoryLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/admin");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Analytics calculations
  const totalViews = visits.length;
  const uniqueVisitors = new Set(visits.map(v => v.visitorId).filter(Boolean)).size;

  // Device Breakdown counts
  const devices = visits.reduce((acc: any, curr: any) => {
    const dev = curr.device || "Desktop";
    acc[dev] = (acc[dev] || 0) + 1;
    return acc;
  }, { Mobile: 0, Tablet: 0, Desktop: 0 });

  const totalDeviceVisits = (devices.Mobile + devices.Tablet + devices.Desktop) || 1;
  const mobilePct = Math.round((devices.Mobile / totalDeviceVisits) * 100);
  const tabletPct = Math.round((devices.Tablet / totalDeviceVisits) * 100);
  const desktopPct = Math.round((devices.Desktop / totalDeviceVisits) * 100);

  // Country Breakdown counts
  const countryCounts = visits.reduce((acc: any, curr: any) => {
    const country = curr.country || "Unknown";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as any);

  const sortedCountries = Object.entries(countryCounts)
    .map(([name, count]: [string, any]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Referrer Breakdown counts
  const referrerCounts = visits.reduce((acc: any, curr: any) => {
    const ref = curr.referrer || "Direct";
    acc[ref] = (acc[ref] || 0) + 1;
    return acc;
  }, {} as any);

  const sortedReferrers = Object.entries(referrerCounts)
    .map(([name, count]: [string, any]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Age Group Breakdown counts
  const ageCounts = visits.reduce((acc: any, curr: any) => {
    const age = curr.ageGroup || "18-24";
    acc[age] = (acc[age] || 0) + 1;
    return acc;
  }, { "13-17": 0, "18-24": 0, "25-34": 0, "35-44": 0, "45+": 0 } as any);

  const totalAgeVisits: number = (Object.values(ageCounts).reduce((a: any, b: any) => a + b, 0) as number) || 1;

  // Chart data: visits over the last 7 days
  const getPast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        dateStr: d.toISOString().split("T")[0],
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        count: 0
      });
    }
    return days;
  };

  const chartData = getPast7Days();
  visits.forEach(v => {
    if (!v.timestamp) return;
    const date = v.timestamp.toDate ? v.timestamp.toDate() : new Date(v.timestamp);
    const dateStr = date.toISOString().split("T")[0];
    const match = chartData.find(d => d.dateStr === dateStr);
    if (match) {
      match.count += 1;
    }
  });

  const maxChartCount = Math.max(...chartData.map(d => d.count), 5);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
          <p className="text-neutral-450 text-sm">Authenticating session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-neutral-100 flex flex-col font-sans">
      
      {/* Dashboard Navbar */}
      <header className="border-b border-neutral-900 bg-neutral-950 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[#d4af37]/10 p-2 rounded-lg border border-[#d4af37]/20">
            <Settings className="w-5 h-5 text-[#d4af37]" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-wider text-white">
              NamiArts Admin
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium">Dashboard Control Panel</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            View Live Site
          </a>
          
          <div className="h-4 w-px bg-neutral-800 hidden sm:block" />

          <span className="text-xs text-neutral-400 font-medium hidden md:inline">
            Logged in as: <span className="text-[#d4af37]">{user.email}</span>
          </span>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-neutral-900 hover:bg-red-950/20 text-neutral-400 hover:text-red-400 border border-neutral-800 hover:border-red-900/35 text-xs font-semibold transition-colors cursor-pointer focus:outline-none"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-3 flex flex-row lg:flex-col gap-2 bg-neutral-955 border border-neutral-900 rounded-2xl p-3 sm:p-4 h-fit w-full">
          <div className="hidden lg:block text-[10px] uppercase tracking-wider text-neutral-500 font-bold px-3 mb-2">Navigation</div>
          
          <button
            onClick={() => setSidebarTab("uploading")}
            className={`flex-1 lg:flex-initial w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              sidebarTab === "uploading"
                ? "bg-[#d4af37] text-black shadow-[0_4px_12px_rgba(214,175,55,0.2)] font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent"
            }`}
          >
            <Upload className="w-4 h-4 shrink-0" />
            Uploading
          </button>

          <button
            onClick={() => setSidebarTab("analytics")}
            className={`flex-1 lg:flex-initial w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              sidebarTab === "analytics"
                ? "bg-[#d4af37] text-black shadow-[0_4px_12px_rgba(214,175,55,0.2)] font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent"
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            Analytics
          </button>
        </aside>

        {/* Right Content Panel */}
        <div className="lg:col-span-9 w-full">
          {sidebarTab === "uploading" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Form Panels Column */}
              <section className="lg:col-span-5 flex flex-col gap-8">
                
                {/* Panel 1: Upload Artwork */}
                <div className="bg-neutral-955 border border-neutral-900 rounded-2xl p-6 relative">
                  <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[#d4af37]" />
                    Upload New Artwork
                  </h2>

                  {uploadError && (
                    <div className="mb-4 p-3 bg-red-955/20 border border-red-900/30 text-red-400 text-xs rounded-lg">
                      {uploadError}
                    </div>
                  )}

                  <form onSubmit={handleUploadArtwork} className="flex flex-col gap-5">
                    {/* Title */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
                        Artwork Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter artwork title"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
                        Artwork Price (INR or Free/Sold text) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                          <IndianRupee className="w-4 h-4 text-[#d4af37]" />
                        </span>
                        <input
                          type="text"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="e.g. 15000, Sold, Inquire"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Image Selection */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
                        Image File *
                      </label>
                      <div className="relative border border-dashed border-neutral-800 hover:border-neutral-700 bg-neutral-950 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
                        <input
                          id="artwork-file-input"
                          type="file"
                          required
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <ImageIcon className="w-8 h-8 text-neutral-500 group-hover:text-[#d4af37] transition-colors" />
                        <span className="text-xs text-neutral-400 text-center font-medium">
                          {imageFile ? imageFile.name : "Choose an image file"}
                        </span>
                        <span className="text-[10px] text-neutral-600">Supports PNG, JPG, WEBP</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {uploading && (
                      <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-[#d4af37] h-full transition-all duration-300 rounded-full" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                        <p className="text-[10px] text-[#d4af37] text-right mt-1.5 font-bold">Uploading {uploadProgress}%</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#d4af37] hover:bg-[#b8901c] text-black font-bold text-sm tracking-wide transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Publish Artwork
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Panel 2: Upload Story */}
                <div className="bg-neutral-955 border border-neutral-900 rounded-2xl p-6 relative">
                  <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#d4af37]" />
                    Upload New Story
                  </h2>

                  {storyError && (
                    <div className="mb-4 p-3 bg-red-955/20 border border-red-900/30 text-red-400 text-xs rounded-lg">
                      {storyError}
                    </div>
                  )}

                  <form onSubmit={handleUploadStory} className="flex flex-col gap-5">
                    {/* Title */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
                        Story Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={storyTitle}
                        onChange={(e) => setStoryTitle(e.target.value)}
                        placeholder="Enter story title"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                      />
                    </div>

                    {/* Story Cover Image Upload */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
                        Story Cover Images *
                      </label>
                      <div className="relative border border-dashed border-neutral-800 hover:border-neutral-700 bg-neutral-950 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
                        <input
                          id="story-panel-file-input"
                          type="file"
                          multiple
                          required={storyFiles.length === 0}
                          accept="image/*"
                          onChange={handleStoryFilesChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <ImageIcon className="w-8 h-8 text-neutral-500 group-hover:text-[#d4af37] transition-colors" />
                        <span className="text-xs text-neutral-400 text-center font-medium">
                          Choose one or more cover images
                        </span>
                        <span className="text-[10px] text-neutral-600">Supports PNG, JPG, WEBP</span>
                      </div>
                      {storyFiles.length > 0 && (
                        <div className="mt-4 flex flex-col gap-2">
                          <p className="text-[10px] text-neutral-450 uppercase tracking-wider font-bold">Selected Files ({storyFiles.length})</p>
                          <div className="grid grid-cols-2 gap-2">
                            {storyFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs">
                                <span className="truncate max-w-[120px] text-neutral-300">{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setStoryFiles((prev) => prev.filter((_, i) => i !== idx))}
                                  className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress bar */}
                    {storyUploading && (
                      <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-[#d4af37] h-full transition-all duration-300 rounded-full" 
                          style={{ width: `${storyProgress}%` }}
                        />
                        <p className="text-[10px] text-[#d4af37] text-right mt-1.5 font-bold">Uploading {storyProgress}%</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={storyUploading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#d4af37] hover:bg-[#b8901c] text-black font-bold text-sm tracking-wide transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {storyUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Publish Story
                        </>
                      )}
                    </button>
                  </form>
                </div>

              </section>

              {/* Right Tabbed List Panel: Manage Artworks & Stories */}
              <section className="lg:col-span-7 bg-neutral-955 border border-neutral-900 rounded-2xl p-6 flex flex-col h-fit">
                
                {/* Tab Header Selector */}
                <div className="flex border-b border-neutral-900 mb-6 gap-6">
                  <button
                    onClick={() => setActiveTab("artworks")}
                    className={`pb-4 text-sm font-bold uppercase tracking-wider relative transition-colors ${
                      activeTab === "artworks" ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    Artworks ({artworks.length})
                    {activeTab === "artworks" && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d4af37] animate-fade-in" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("stories")}
                    className={`pb-4 text-sm font-bold uppercase tracking-wider relative transition-colors ${
                      activeTab === "stories" ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    Stories ({stories.length})
                    {activeTab === "stories" && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d4af37] animate-fade-in" />
                    )}
                  </button>
                </div>

                {/* TAB 1: Artworks Management */}
                {activeTab === "artworks" && (
                  <div>
                    {fetchingArtworks ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
                        <p className="text-neutral-500 text-sm">Syncing artworks with database...</p>
                      </div>
                    ) : artworks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center">
                        <ImageIcon className="w-12 h-12 text-neutral-700 mb-4" />
                        <h3 className="font-display text-base font-bold text-white mb-1">No Artworks Found</h3>
                        <p className="text-neutral-500 text-xs max-w-xs leading-relaxed">
                          Upload your first gallery artwork using the panel on the left.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-neutral-300 border-collapse">
                          <thead>
                            <tr className="border-b border-neutral-900 text-xs font-bold uppercase tracking-wider text-neutral-500">
                              <th className="pb-3 pl-2">Preview</th>
                              <th className="pb-3">Title</th>
                              <th className="pb-3">Price</th>
                              <th className="pb-3 text-right pr-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-900/50">
                            {artworks.map((art) => (
                              <tr key={art.id} className="hover:bg-neutral-900/10 transition-colors">
                                <td className="py-4 pl-2">
                                  <div className="relative w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden select-none protected-image">
                                    <img
                                      src={art.imageUrl}
                                      alt={art.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </td>
                                <td className="py-4 font-semibold text-white max-w-[100px] xs:max-w-[150px] md:max-w-xs truncate">
                                  {art.title}
                                </td>
                                <td className="py-4 font-mono font-bold text-[#d4af37]">
                                  {typeof art.price === "number" || !isNaN(Number(art.price))
                                    ? `₹${Number(art.price).toLocaleString()}`
                                    : art.price}
                                </td>
                                <td className="py-4 text-right pr-2">
                                  <div className="inline-flex gap-2">
                                    <button
                                      onClick={() => openEditArtworkModal(art)}
                                      className="p-2 rounded-lg hover:bg-neutral-850 text-neutral-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
                                      title="Edit artwork"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setDeletingArtwork(art)}
                                      className="p-2 rounded-lg hover:bg-red-950/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer focus:outline-none"
                                      title="Delete artwork"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Stories Management */}
                {activeTab === "stories" && (
                  <div>
                    {fetchingStories ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
                        <p className="text-neutral-500 text-sm">Syncing stories with database...</p>
                      </div>
                    ) : stories.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center">
                        <BookOpen className="w-12 h-12 text-neutral-700 mb-4" />
                        <h3 className="font-display text-base font-bold text-white mb-1">No Stories Found</h3>
                        <p className="text-neutral-500 text-xs max-w-xs leading-relaxed">
                          Upload your first creative story using the panel on the left.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-neutral-300 border-collapse">
                          <thead>
                            <tr className="border-b border-neutral-900 text-xs font-bold uppercase tracking-wider text-neutral-500">
                              <th className="pb-3 pl-2">Cover</th>
                              <th className="pb-3">Title</th>
                              <th className="pb-3 text-right pr-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-900/50">
                            {stories.map((story) => (
                              <tr key={story.id} className="hover:bg-neutral-900/10 transition-colors">
                                <td className="py-4 pl-2">
                                  <div className="relative w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden select-none protected-image">
                                    <img
                                      src={story.imageUrl}
                                      alt={story.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </td>
                                <td className="py-4 font-semibold text-white max-w-[100px] xs:max-w-[150px] md:max-w-xs truncate">
                                  {story.title}
                                </td>
                                <td className="py-4 text-right pr-2">
                                  <div className="inline-flex gap-2">
                                    <button
                                      onClick={() => openEditStoryModal(story)}
                                      className="p-2 rounded-lg hover:bg-neutral-850 text-neutral-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
                                      title="Edit story"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setDeletingStory(story)}
                                      className="p-2 rounded-lg hover:bg-red-950/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer focus:outline-none"
                                      title="Delete story"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

              </section>

            </div>
          ) : (
            
            /* Section 2: Analytics Dashboard */
            <div className="bg-neutral-955 border border-neutral-900 rounded-2xl p-6 flex flex-col w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-900">
                <div>
                  <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#d4af37]" />
                    Professional Analytics
                  </h2>
                  <p className="text-xs text-neutral-450 mt-1 font-semibold">Real-time visitor and traffic insights (YouTube style)</p>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg w-fit">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live Syncing Active
                </div>
              </div>

              {fetchingVisits ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
                  <p className="text-neutral-500 text-sm">Aggregating live visitor statistics...</p>
                </div>
              ) : (
                <>
                  {/* Top Overview Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    {/* Card 1: Total Views */}
                    <div className="bg-neutral-900/40 border border-neutral-900 rounded-xl p-5 relative overflow-hidden group hover:border-[#d4af37]/20 transition-all duration-300">
                      <div className="absolute right-4 top-4 text-[#d4af37]/5 group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-12 h-12" />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Total Pageviews</span>
                      <h3 className="text-3xl font-extrabold text-white mt-2 mb-1">{totalViews}</h3>
                      <p className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
                        +100% live database log
                      </p>
                    </div>

                    {/* Card 2: Unique Visitors */}
                    <div className="bg-neutral-900/40 border border-neutral-900 rounded-xl p-5 relative overflow-hidden group hover:border-[#d4af37]/20 transition-all duration-300">
                      <div className="absolute right-4 top-4 text-[#d4af37]/5 group-hover:scale-110 transition-transform">
                        <Users className="w-12 h-12" />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Unique Visitors</span>
                      <h3 className="text-3xl font-extrabold text-white mt-2 mb-1">{uniqueVisitors}</h3>
                      <p className="text-[10px] text-neutral-500 font-semibold">Based on visitor session IDs</p>
                    </div>

                    {/* Card 3: Primary Device */}
                    <div className="bg-neutral-900/40 border border-neutral-900 rounded-xl p-5 relative overflow-hidden group hover:border-[#d4af37]/20 transition-all duration-300">
                      <div className="absolute right-4 top-4 text-[#d4af37]/5 group-hover:scale-110 transition-transform">
                        <Settings className="w-12 h-12" />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Top Traffic Device</span>
                      <h3 className="text-3xl font-extrabold text-white mt-2 mb-1">
                        {mobilePct >= desktopPct ? "Mobile" : "Desktop"}
                      </h3>
                      <p className="text-[10px] text-neutral-450 font-semibold">
                        {mobilePct}% Mobile / {desktopPct}% PC / {tabletPct}% Tablet
                      </p>
                    </div>
                  </div>

                  {/* SVG Analytics Chart */}
                  <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Traffic Over Time</h3>
                        <p className="text-[10px] text-neutral-550 font-semibold">Logged views over the last 7 days</p>
                      </div>
                      <div className="text-[10px] font-mono font-bold text-neutral-500">
                        Date Range: Last 7 Days
                      </div>
                    </div>
                    
                    <div className="w-full h-48 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-neutral-800">
                      {chartData.map((d, index) => {
                        const heightPct = (d.count / maxChartCount) * 100;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                            <div className="absolute -top-7 bg-neutral-950 border border-neutral-800 text-[10px] text-[#d4af37] font-mono font-bold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                              {d.count} views
                            </div>
                            <div 
                              style={{ height: `${heightPct || 4}%` }}
                              className={`w-full rounded-t-md transition-all duration-500 ${
                                d.count > 0 
                                  ? "bg-gradient-to-t from-[#b8901c] to-[#d4af37] shadow-[0_0_15px_rgba(214,175,55,0.2)] group-hover:brightness-110" 
                                  : "bg-neutral-850"
                              }`}
                            />
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider pt-1">{d.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Demographics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    
                    {/* Age Groups Demographics (YouTube style) */}
                    <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-5">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Audience Age Distribution</h3>
                      <div className="flex flex-col gap-4">
                        {Object.entries(ageCounts).map(([age, count]: [string, any]) => {
                          const pct = Math.round((Number(count) / totalAgeVisits) * 100) || 0;
                          return (
                            <div key={age} className="flex items-center gap-3">
                              <span className="text-xs text-neutral-400 font-semibold w-12">{age}</span>
                              <div className="flex-grow bg-neutral-900 rounded-full h-3 overflow-hidden">
                                <div 
                                  style={{ width: `${pct}%` }} 
                                  className="bg-gradient-to-r from-[#b8901c] to-[#d4af37] h-full rounded-full"
                                />
                              </div>
                              <span className="text-xs text-neutral-300 font-mono font-semibold w-10 text-right">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Device Breakdown Progress */}
                    <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-5 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Devices Breakdown</h3>
                        <div className="flex flex-col gap-4">
                          {/* Mobile */}
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-neutral-450 font-semibold w-16">Mobile</span>
                            <div className="flex-grow bg-neutral-900 rounded-full h-2.5 overflow-hidden">
                              <div style={{ width: `${mobilePct}%` }} className="bg-[#d4af37] h-full rounded-full" />
                            </div>
                            <span className="text-xs text-neutral-350 font-mono font-semibold w-10 text-right">{mobilePct}%</span>
                          </div>
                          
                          {/* Desktop */}
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-neutral-450 font-semibold w-16">Desktop</span>
                            <div className="flex-grow bg-neutral-900 rounded-full h-2.5 overflow-hidden">
                              <div style={{ width: `${desktopPct}%` }} className="bg-neutral-400 h-full rounded-full" />
                            </div>
                            <span className="text-xs text-neutral-350 font-mono font-semibold w-10 text-right">{desktopPct}%</span>
                          </div>

                          {/* Tablet */}
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-neutral-450 font-semibold w-16">Tablet</span>
                            <div className="flex-grow bg-neutral-900 rounded-full h-2.5 overflow-hidden">
                              <div style={{ width: `${tabletPct}%` }} className="bg-neutral-600 h-full rounded-full" />
                            </div>
                            <span className="text-xs text-neutral-350 font-mono font-semibold w-10 text-right">{tabletPct}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Summary details */}
                      <div className="border-t border-neutral-900 pt-4 mt-4 grid grid-cols-3 text-center">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block">Mobile</span>
                          <span className="text-xs font-mono font-bold text-white mt-1 block">{devices.Mobile}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block">PC (Desktop)</span>
                          <span className="text-xs font-mono font-bold text-white mt-1 block">{devices.Desktop}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block">Tablet</span>
                          <span className="text-xs font-mono font-bold text-white mt-1 block">{devices.Tablet}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Top Countries Map List */}
                    <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-5">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Top Countries</h3>
                      {sortedCountries.length === 0 ? (
                        <p className="text-xs text-neutral-550 py-4 text-center">No location logs available yet.</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {sortedCountries.map(({ name, count }: any, index: number) => {
                            const pct = Math.round((count / totalViews) * 100) || 0;
                            return (
                              <div key={name} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-900/40 last:border-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-neutral-550 font-bold">{index + 1}.</span>
                                  <span className="text-white font-semibold">{name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-neutral-500 font-mono font-medium">{count} views</span>
                                  <span className="text-[#d4af37] font-mono font-bold w-10 text-right">{pct}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Top Traffic Sources (Referrers) */}
                    <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-5">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Traffic Sources (Referrer)</h3>
                      {sortedReferrers.length === 0 ? (
                        <p className="text-xs text-neutral-550 py-4 text-center">No referrer logs available yet.</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {sortedReferrers.map(({ name, count }: any, index: number) => {
                            const pct = Math.round((count / totalViews) * 100) || 0;
                            return (
                              <div key={name} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-900/40 last:border-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-neutral-550 font-bold">{index + 1}.</span>
                                  <span className="text-white font-semibold truncate max-w-[150px] sm:max-w-[200px]" title={name}>{name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-neutral-500 font-mono font-medium">{count} visits</span>
                                  <span className="text-[#d4af37] font-mono font-bold w-10 text-right">{pct}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Visitor Feed */}
                  <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-5 mt-8">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Recent Visits Feed</h3>
                    {visits.length === 0 ? (
                      <p className="text-xs text-neutral-550 py-4 text-center">No visits registered yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-neutral-900 pb-2 text-neutral-500 uppercase tracking-wider font-bold">
                              <th className="pb-2 pl-2">Time</th>
                              <th className="pb-2">Country</th>
                              <th className="pb-2">Landing Path</th>
                              <th className="pb-2">Referrer</th>
                              <th className="pb-2 text-right pr-2">Device</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-900/50">
                            {visits.slice(0, 10).map((v) => {
                              let formattedTime = "Just Now";
                              if (v.timestamp) {
                                const dateObj = v.timestamp.toDate ? v.timestamp.toDate() : new Date(v.timestamp);
                                formattedTime = dateObj.toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit"
                                }) + " (" + dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ")";
                              }
                              return (
                                <tr key={v.id} className="hover:bg-neutral-900/10 transition-colors">
                                  <td className="py-2.5 pl-2 text-neutral-450">{formattedTime}</td>
                                  <td className="py-2.5 font-semibold text-white">{v.country || "Unknown"}</td>
                                  <td className="py-2.5 font-mono text-neutral-450 truncate max-w-[120px]">{v.path || "/"}</td>
                                  <td className="py-2.5 text-neutral-450 truncate max-w-[100px]">{v.referrer || "Direct"}</td>
                                  <td className="py-2.5 text-right pr-2 text-neutral-400 font-medium">{v.device || "Desktop"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          )}
        </div>
      </main>

      {/* MODAL 1: Edit Artwork Modal */}
      {editingArtwork && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-850 rounded-2xl max-w-md w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingArtwork(null)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-lg font-bold text-white mb-6">
              Edit Artwork Details
            </h3>

            <form onSubmit={handleSaveEditArtwork} className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-450 font-bold mb-2">
                  Artwork Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-neutral-855 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-450 font-bold mb-2">
                  Artwork Price
                </label>
                <input
                  type="text"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full bg-neutral-855 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Replace Image */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-455 font-bold mb-2">
                  Replace Image (Optional)
                </label>
                <div className="relative border border-dashed border-neutral-750 bg-neutral-850 rounded-lg p-4 flex flex-col items-center justify-center gap-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <ImageIcon className="w-6 h-6 text-neutral-500" />
                  <span className="text-xs text-neutral-455 text-center font-medium">
                    {editImageFile ? editImageFile.name : "Select new image file"}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              {editUploading && (
                <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden mt-2">
                  <div 
                    className="bg-[#d4af37] h-full transition-all duration-300" 
                    style={{ width: `${editUploadProgress}%` }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingArtwork(null)}
                  className="w-1/2 py-2.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-white font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editUploading}
                  className="w-1/2 flex items-center justify-center gap-1 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#b8901c] text-black font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {editUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Story Modal */}
      {editingStory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-850 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingStory(null)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-lg font-bold text-white mb-6">
              Edit Story Details
            </h3>

            <form onSubmit={handleSaveEditStory} className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-450 font-bold mb-2">
                  Story Title *
                </label>
                <input
                  type="text"
                  required
                  value={editStoryTitle}
                  onChange={(e) => setEditStoryTitle(e.target.value)}
                  className="w-full bg-neutral-855 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>





              {/* Existing Cover Images */}
              {editStoryImageUrls.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs uppercase tracking-wider text-neutral-450 font-bold mb-2">
                    Current Cover Images ({editStoryImageUrls.length})
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {editStoryImageUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg border border-neutral-800 overflow-hidden group">
                        <img src={url} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditStoryImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 hover:text-red-300 transition-opacity cursor-pointer"
                          title="Delete image"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Cover Images */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-455 font-bold mb-2">
                  Add More Images
                </label>
                <div className="relative border border-dashed border-neutral-750 bg-neutral-850 rounded-lg p-3 flex flex-col items-center justify-center gap-1 cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleEditStoryFilesChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <ImageIcon className="w-5 h-5 text-neutral-500" />
                  <span className="text-xs text-neutral-455 text-center font-medium">
                    Select images to append
                  </span>
                </div>
                {editStoryFiles.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    <p className="text-[10px] text-neutral-550 uppercase tracking-wider font-bold">New Images to Upload ({editStoryFiles.length})</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {editStoryFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-neutral-850 border border-neutral-750 rounded-lg p-1.5 text-xs">
                          <span className="truncate max-w-[120px] text-neutral-350">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => setEditStoryFiles((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-neutral-500 hover:text-red-400 p-0.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {editStoryUploading && (
                <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden mt-2">
                  <div 
                    className="bg-[#d4af37] h-full transition-all duration-300" 
                    style={{ width: `${editStoryProgress}%` }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="w-1/2 py-2.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-white font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editStoryUploading}
                  className="w-1/2 flex items-center justify-center gap-1 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#b8901c] text-black font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {editStoryUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Artwork Modal */}
      {deletingArtwork && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-12 bg-red-955/20 border border-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>

            <h3 className="font-display text-lg font-bold text-white mb-2">
              Delete Artwork?
            </h3>
            <p className="text-neutral-400 text-xs mb-6 leading-relaxed">
              Are you sure you want to delete <strong>&quot;{deletingArtwork.title}&quot;</strong>? This will permanently remove the metadata and delete the image file from storage.
            </p>

            <div className="flex gap-4">
              <button
                disabled={deletingArtworkLoading}
                onClick={() => setDeletingArtwork(null)}
                className="w-1/2 py-2.5 rounded-lg border border-neutral-750 hover:bg-neutral-800 text-white font-semibold text-xs transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                disabled={deletingArtworkLoading}
                onClick={handleDeleteArtwork}
                className="w-1/2 flex items-center justify-center py-2.5 rounded-lg bg-red-650 hover:bg-red-700 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer focus:outline-none"
              >
                {deletingArtworkLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Story Modal */}
      {deletingStory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-12 bg-red-955/20 border border-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>

            <h3 className="font-display text-lg font-bold text-white mb-2">
              Delete Story?
            </h3>
            <p className="text-neutral-400 text-xs mb-6 leading-relaxed">
              Are you sure you want to delete <strong>&quot;{deletingStory.title}&quot;</strong>? This will permanently remove the story and delete the cover image from storage.
            </p>

            <div className="flex gap-4">
              <button
                disabled={deletingStoryLoading}
                onClick={() => setDeletingStory(null)}
                className="w-1/2 py-2.5 rounded-lg border border-neutral-750 hover:bg-neutral-800 text-white font-semibold text-xs transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                disabled={deletingStoryLoading}
                onClick={handleDeleteStory}
                className="w-1/2 flex items-center justify-center py-2.5 rounded-lg bg-red-650 hover:bg-red-700 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer focus:outline-none"
              >
                {deletingStoryLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
