import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LocalFont",
  description: "Fast and easy way to self host Google Fonts and use them in TailwindCSS.",
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'LocalFont',
    description: 'Fast and easy way to self host Google Fonts and use them in TailwindCSS.',
    url: 'https://www.localfont.app',
    siteName: 'LocalFont',
    images: [
      {
        url: '/localfont_og.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LocalFont',
    description: 'Fast and easy way to self host Google Fonts and use them in TailwindCSS.',
    creator: '@palazski',
    images: ['/localfont.png'],
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
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
