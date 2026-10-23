import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import AuthProvider from "@/components/providers/AuthProvider";
import NextTopLoader from "nextjs-toploader";
import ToastProvider from "@/components/ui/ToastProvider";
import AIAssistantWidget from "@/components/ai/AIAssistantWidget";
import AnalyticsProvider from "@/components/AnalyticsProvider";


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});


export const viewport: Viewport = {
  themeColor: "#000b29",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title:
    "Rhockstar Connect | Professional Networking & Meaningful Relationships",

  description:
    "Join Rhockstar Connect to build professional networks, find job opportunities, and create meaningful personal relationships in a premium ecosystem.",

  keywords:
    "networking, jobs, career, dating, relationship, professionals, community",

  manifest: "/manifest.json",

  icons: {
    icon: [
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Rhockstar Connect",
  },

  openGraph: {
    title:
      "Rhockstar Connect | Network, Grow, Connect",

  description:
    "The premier hybrid professional networking and dating platform. Built for professionals to excel.",

    url: "https://rhockstarconnect.netlify.app",

    siteName: "Rhockstar Connect",

    images: [
      {
        url: "https://rhockstarconnect.com/og-image.jpg",
        width: 1792,
        height: 1024,
        alt: "Rhockstar Connect Preview",
      },
    ],

    locale: "en_US",

    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Rhockstar Connect" />
        <meta name="application-name" content="Rhockstar Connect" />
        <meta name="theme-color" content="#000b29" />
      </head>
      <body className="font-sans">
        <AuthProvider>
          <NextTopLoader />

          {children}

          <ToastProvider />


          <AIAssistantWidget />
        </AuthProvider>
        <AnalyticsProvider />
      </body>
    </html>
  );
}
