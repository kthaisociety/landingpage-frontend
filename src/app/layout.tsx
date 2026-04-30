
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer"
import { TooltipProvider } from '@/components/ui/tooltip';
import {  ToastProvider } from '@/components/ui/toast';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KTH AI Society",
  description: "KTH AI Society is a student-run organization at KTH Royal Institute of Technology that fosters the AI community at KTH. We are a community of students, faculty, and industry professionals who are passionate about AI and its applications.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
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
        <Providers>
          <Navigation />
          <ToastProvider><TooltipProvider>{children}</TooltipProvider></ToastProvider>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
