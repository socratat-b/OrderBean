import Footer from "@/components/layout/Footer";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import DemoModeBanner from "@/components/DemoModeBanner";
import Providers from "@/components/Providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Order Bean",
  description:
    "OrderBean - Modern ordering system for coffee shops. Customer ordering app, kitchen display for staff, and analytics dashboard for owners. Built with Next.js, PostgreSQL, and WebSockets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <DemoModeBanner />
          <HeaderWrapper />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
