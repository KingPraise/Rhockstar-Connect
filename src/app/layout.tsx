import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  metadataBase: new URL('https://rhockstarconnect.com'),
  title: "Rhockstar Connect | Professional Networking, Jobs, Communities & Relationships",
  description: "Join Rhockstar Connect to build professional networks, find job opportunities, join public chat communities, and create meaningful relationships.",
  keywords: "networking, jobs, career, dating, relationship, professionals, community, public chat, lagos, tech",
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    title: "Rhockstar Connect | Connect, Join Communities & Find Jobs",
    description: "The all-in-one professional networking, job matching, public communities, and social platform.",
    url: "https://rhockstarconnect.com",
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

import NextTopLoader from 'nextjs-toploader';
import ToastProvider from '@/components/ui/ToastProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextTopLoader
          color="#38bdf8"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #38bdf8,0 0 5px #38bdf8"
        />
        <AuthProvider>
          <ToastProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
