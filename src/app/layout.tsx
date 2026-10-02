import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solace+ — Your AI Mental Wellness Companion",
  description: "Private, emotionally intelligent space featuring adaptive ambient support, journaling, consent-first memory, and grounding tools.",
  keywords: ["mental wellness", "AI companion", "mindfulness", "breathing exercises", "CBT journaling", "emotion detection"],
  authors: [{ name: "Solace+ Team" }],
};

import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${outfit.variable} ${inter.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-mood-accent/30 selection:text-white">
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
