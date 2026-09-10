import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import CartDrawer from "@/components/cart-drawer";
import LoadingScreen from "@/components/loading-screen";
import ScreenshotProtection from "@/components/screenshot-protection";
import AnalyticsTracker from "@/components/analytics-tracker";
import SmoothScroll from "@/components/smooth-scroll";
import ScrollProgress from "@/components/scroll-progress";
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
  title: "NamiArts | Premium Custom Photo Frames & Art Gallery",
  description: "Choose the artwork you love, select your preferred frame type and colour, and get it crafted into a beautiful physical photo frame by NamiArts.",
  keywords: ["NamiArts", "photo frames", "framed art", "custom frames", "wall decor", "picture frames", "art gallery"],
  authors: [{ name: "NamiArts" }],
  openGraph: {
    title: "NamiArts | Premium Custom Photo Frames & Art Gallery",
    description: "Choose the artwork you love, select your preferred frame type and colour, and get it crafted into a beautiful physical photo frame by NamiArts.",
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
      className={`${inter.variable} ${outfit.variable} dark`}
    >
      <body className="bg-neutral-950 text-neutral-100 font-sans min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <CartProvider>
            <SmoothScroll>
              <ScrollProgress />
              <LoadingScreen />
              <ScreenshotProtection />
              <AnalyticsTracker />
              {children}
              <CartDrawer />
            </SmoothScroll>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

