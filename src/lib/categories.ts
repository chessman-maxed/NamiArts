import { 
  Star, 
  Sparkles, 
  Heart, 
  User, 
  Landmark, 
  Mountain, 
  Theater, 
  BookOpen 
} from "lucide-react";
import React from "react";

export interface CategoryItem {
  id: string;
  number: number;
  title: string;
  slug: string;
  description: string;
  accentColor: string;
  bgLightColor: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  sampleArtworks: {
    id: string;
    title: string;
    price: string | number;
    imageUrl: string;
  }[];
}

export const ART_CATEGORIES: CategoryItem[] = [
  {
    id: "motivational-quote",
    number: 1,
    title: "Motivational Quote",
    slug: "motivational-quote",
    description: "Inspirational thoughts, motivational quotes, and uplifting words to boost your drive.",
    accentColor: "#2d6a4f",
    bgLightColor: "#e8f5e9",
    badgeBg: "#2d6a4f",
    textColor: "#1b4332",
    borderColor: "rgba(45, 106, 79, 0.3)",
    icon: Star,
    sampleArtworks: [],
  },
  {
    id: "general-quote",
    number: 2,
    title: "General Quote",
    slug: "general-quote",
    description: "Thoughtful quotes, life wisdom, funny, and meaningful words for daily reflection.",
    accentColor: "#3f51b5",
    bgLightColor: "#e8eaf6",
    badgeBg: "#3f51b5",
    textColor: "#1a237e",
    borderColor: "rgba(63, 81, 181, 0.3)",
    icon: Sparkles,
    sampleArtworks: [],
  },
  {
    id: "general-images",
    number: 3,
    title: "General Images",
    slug: "general-images",
    description: "Versatile artwork designs, creative visuals, and aesthetic compositions for custom photo framing (Text Customization Or Any General Customization Can Be Done).",
    accentColor: "#00897b",
    bgLightColor: "#e0f2f1",
    badgeBg: "#00897b",
    textColor: "#004d40",
    borderColor: "rgba(0, 137, 123, 0.3)",
    icon: Mountain,
    sampleArtworks: [],
  },
  {
    id: "glamorous-images",
    number: 4,
    title: "Glamorous Images",
    slug: "glamorous-images",
    description: "Elegant portraits, glamorous aesthetics, and stylish character designs.",
    accentColor: "#d81b60",
    bgLightColor: "#fce4ec",
    badgeBg: "#d81b60",
    textColor: "#880e4f",
    borderColor: "rgba(216, 27, 96, 0.3)",
    icon: User,
    sampleArtworks: [],
  },
  {
    id: "bhakti",
    number: 5,
    title: "Bhakti",
    slug: "bhakti",
    description: "Devotional creations, spiritual energy, divine blessings, and sacred art.",
    accentColor: "#d97706",
    bgLightColor: "#fffbe6",
    badgeBg: "#d97706",
    textColor: "#92400e",
    borderColor: "rgba(217, 119, 6, 0.3)",
    icon: Heart,
    sampleArtworks: [],
  },
  {
    id: "stories",
    number: 6,
    title: "Stories",
    slug: "stories",
    description: "Enjoy our exclusive illustrated stories and manga chapters.",
    accentColor: "#00695c",
    bgLightColor: "#e0f2f1",
    badgeBg: "#00695c",
    textColor: "#004d40",
    borderColor: "rgba(0, 105, 92, 0.3)",
    icon: BookOpen,
    sampleArtworks: [],
  },
];

export function getCategoryBadgeBg(categorySlugOrName?: string): string {
  if (!categorySlugOrName) return "#3f51b5";
  const catLower = categorySlugOrName.toLowerCase();
  const found = ART_CATEGORIES.find(
    (c) =>
      catLower.includes(c.id) ||
      catLower.includes(c.slug) ||
      c.title.toLowerCase().includes(catLower)
  );
  return found ? found.badgeBg : "#3f51b5";
}
