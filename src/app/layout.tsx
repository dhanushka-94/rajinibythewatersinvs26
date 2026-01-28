import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ConditionalLayout } from "@/components/layout/conditional-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rajini by The Waters - Invoice Management System",
  description: "Professional invoice management system for Rajini by The Waters",
  icons: {
    icon: [
      { url: "/images/rajini-logo-flat-color.png", type: "image/png" },
    ],
    apple: [
      { url: "/images/rajini-logo-flat-color.png", type: "image/png" },
    ],
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
        suppressHydrationWarning
      >
        <ConditionalLayout>{children}</ConditionalLayout>
        <Toaster richColors position="top-center" closeButton />
      </body>
    </html>
  );
}
