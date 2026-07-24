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
  title: "Rhockstar Connect | Professional Networking & Meaningful Relationships",
  description: "Join Rhockstar Connect to build professional networks, find job opportunities, and create meaningful personal relationships in a premium ecosystem.",
  keywords: "networking, jobs, career, dating, relationship, professionals, community",
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    title: "Rhockstar Connect | Network, Grow, Connect",
    description: "The premier hybrid professional networking and dating platform. Built for professionals to excel.",
    url: "https://rhockstarconnect.netlify.app",
    siteName: "Rhockstar Connect",
    images: [
      {
        url: "/logo-dark.png",
        width: 800,
        height: 600,
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
