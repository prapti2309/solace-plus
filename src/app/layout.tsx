import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
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
  title: "Solace+ — Your AI Mental Wellness Companion",
  description: "Private, emotionally intelligent space featuring adaptive ambient support, journaling, consent-first memory, and grounding tools.",
  keywords: ["mental wellness", "AI companion", "mindfulness", "breathing exercises", "CBT journaling", "emotion detection"],
  authors: [{ name: "Solace+ Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-mood-accent/30 selection:text-white">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
