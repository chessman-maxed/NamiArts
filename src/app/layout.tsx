import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import LoadingScreen from "@/components/loading-screen";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NamiArts | Premium Digital Art Portfolio",
  description: "Explore and acquire original premium digital artworks by NamiArts. Luxury gallery showcasing unique illustrations, digital paintings, and concept art.",
  keywords: ["NamiArts", "digital art", "portfolio", "illustration", "buy art", "concept art", "art gallery"],
  authors: [{ name: "NamiArts" }],
  openGraph: {
    title: "NamiArts | Premium Digital Art Portfolio",
    description: "Explore and acquire original premium digital artworks by NamiArts.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} dark scroll-smooth`}
    >
      <body className="bg-neutral-950 text-neutral-100 font-sans min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <LoadingScreen />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
