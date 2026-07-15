import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rhockstar Connect",
  description: "The premier hybrid professional networking and dating platform.",
};

import AuthProvider from "@/components/providers/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
