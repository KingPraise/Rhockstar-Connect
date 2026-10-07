import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import AuthProvider from "@/components/providers/AuthProvider";
import NextTopLoader from "nextjs-toploader";
import ToastProvider from "@/components/ui/ToastProvider";
import AIAssistantWidget from "@/components/ai/AIAssistantWidget";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});


export const viewport: Viewport = {
  themeColor: "#8b5cf6",
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

  icons: {
    icon: "/icon.png",
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
      <body className="font-sans">
        <AuthProvider>
          <NextTopLoader />

          {children}

          <ToastProvider />

          <AIAssistantWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
