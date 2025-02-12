import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FastFont",
  description: "Fast and easy way to self host Google Fonts and use them in TailwindCSS.",
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'FastFont',
    description: 'Fast and easy way to self host Google Fonts and use them in TailwindCSS.',
    url: 'https://www.fastfont.app',
    siteName: 'FastFont',
    images: [
      {
        url: '/fastfont_og.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FastFont',
    description: 'Fast and easy way to self host Google Fonts and use them in TailwindCSS.',
    creator: '@palazski',
    images: ['/fastfont.png'],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <TooltipProvider>
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </TooltipProvider>
      </body>
    </html>
  );
}
