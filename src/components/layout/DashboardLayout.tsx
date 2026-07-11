"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { AmbientBackground } from "../theme-engine/AmbientBackground";
import { authService } from "@/lib/services/mockServices";
import { getMockDb } from "@/lib/services/mockDb";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const onboarded = await authService.checkOnboardingStatus();
        if (!onboarded) {
          router.push("/register");
        } else {
          setLoading(false);
        }
      } catch (err) {
        // Fallback
        const db = getMockDb();
        if (!db.isOnboarded) {
          router.push("/register");
        } else {
          setLoading(false);
        }
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <AmbientBackground />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-mood-accent animate-spin" />
          <p className="text-slate-400 text-sm font-medium animate-pulse">Restoring your safe space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-transparent">
      {/* Background visual engine */}
      <AmbientBackground />

      {/* Persistent Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col pt-16 lg:pt-0 p-4 lg:p-4 min-h-[100vh] lg:h-screen lg:overflow-hidden relative z-20">
        <div className="flex-1 w-full rounded-3xl glass-panel border border-white/10 shadow-2xl p-6 lg:p-8 overflow-y-auto no-scrollbar flex flex-col justify-between my-0 lg:my-4 mr-0 lg:mr-4">
          {children}
        </div>
      </main>
    </div>
  );
};
