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
  BookOpen
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

          {/* Panel 2: Upload Story (New Panel) */}
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
