import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

// Analytics is opt-in: off by default so self-hosted and forked deployments
// don't emit analytics. The official deployment sets
// NEXT_PUBLIC_ENABLE_ANALYTICS=true.
const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";

export const viewport: Viewport = {
  themeColor: "#1E1B4B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Photo Grouper",
  description: "Create beautiful photo collages with privacy-first design. Your photos stay on your device - zero cloud uploads, ever.",
  manifest: "/site.webmanifest",
  keywords: ["photo collage", "photo grouper", "collage maker", "privacy", "offline", "photo editor"],
  authors: [{ name: "Photo Grouper" }],
  creator: "Photo Grouper",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Photo Grouper",
    title: "Photo Grouper - Create Beautiful Photo Collages",
    description: "Create stunning photo collages with complete privacy. Your photos never leave your device.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Photo Grouper - Privacy-first photo collage maker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Photo Grouper - Create Beautiful Photo Collages",
    description: "Create stunning photo collages with complete privacy. Your photos never leave your device.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Photo Grouper",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {analyticsEnabled && <Analytics />}
      </body>
    </html>
  );
}
