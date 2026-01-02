import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
const inter = Inter({ 
  variable: "--font-inter",
  subsets: ['latin'] 
});

export const metadata: Metadata = {
  title: "E-Book Store",
  description: "Your digital library for college textbooks and academic resources",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode;}>) {
  
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-background text-foreground`}
      >
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}