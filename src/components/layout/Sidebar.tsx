"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  Heart, 
  Database, 
  Settings, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  UserCheck,
  User
} from "lucide-react";
import { useEmotionTheme, MoodType } from "@/contexts/ThemeContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Chat Support", href: "/chat", icon: MessageSquare },
  { label: "AI Journal", href: "/journal", icon: BookOpen },
  { label: "Mood Logs", href: "/mood-tracker", icon: Heart },
  { label: "Wellness Tools", href: "/wellness", icon: Sparkles },
  { label: "Memory Hub", href: "/memory", icon: Database },
  { label: "Progress Logs", href: "/progress", icon: TrendingUp },
  { label: "My Profile", href: "/profile", icon: User },
  { label: "Admin View", href: "/admin", icon: ShieldCheck },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { mood, setMood } = useEmotionTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const moodEmojis: Record<MoodType, string> = {
    calm: "😌",
    happy: "☀️",
    sad: "🌧️",
    anxious: "🍃",
    angry: "🔥",
    burnout: "🔋",
    hopeful: "🌸",
  };

  const moodLabels: Record<MoodType, string> = {
    calm: "Calm",
    happy: "Happy",
    sad: "Sad",
    anxious: "Anxious",
    angry: "Angry",
    burnout: "Burnout",
    hopeful: "Hopeful",
  };

  // Determine if active route match
  const isActive = (href: string) => {
    if (href === "/chat" && pathname.startsWith("/chat")) return true;
    if (href === "/wellness" && pathname.startsWith("/wellness")) return true;
    return pathname === href;
  };

  const handleMoodSelect = (m: MoodType) => {
    setMood(m);
  };

  const handleLogout = () => {
    // Purge session indicators and route to login
    localStorage.removeItem("solace_plus_db");
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-4">
      {/* Upper Logo and nav section */}
      <div>
        {/* Brand header */}
        <div className={`flex items-center gap-3 px-2 py-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <Link href="/home" className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-slate-50 to-slate-200 bg-clip-text text-transparent">
                Solace<span className="text-mood-accent transition-colors duration-[2500ms] font-medium">+</span>
              </span>
            </Link>
          )}
          {collapsed && (
            <Link href="/home" className="text-xl font-bold text-mood-accent transition-colors duration-[2500ms]">
              S+
            </Link>
          )}
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5 mt-6">
          {NAV_ITEMS.map((item) => {
            const ActiveIcon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 border border-transparent ${
                  active
                    ? "bg-slate-100/10 text-white border-white/5 shadow-md shadow-black/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                } ${collapsed ? "justify-center" : ""}`}
                title={item.label}
              >
                <ActiveIcon className={`w-5 h-5 transition-colors ${active ? "text-mood-accent" : "text-slate-400"}`} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Lower adaptive settings and mood control section */}
      <div className="space-y-4">
        {/* Quick Ambience Switcher */}
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${collapsed ? "text-center" : ""}`}>
          {!collapsed && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Ambient State</span>
              <span className="text-xs text-mood-accent transition-colors duration-[2500ms] px-2 py-0.5 rounded-full bg-white/5 font-semibold">
                {moodLabels[mood]}
              </span>
            </div>
          )}
          <div className={`grid gap-1.5 ${collapsed ? "grid-cols-1" : "grid-cols-7"}`}>
            {(Object.keys(moodEmojis) as MoodType[]).map((m) => (
              <button
                key={m}
                onClick={() => handleMoodSelect(m)}
                className={`p-1 text-sm rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                  mood === m 
                    ? "bg-mood-accent/20 border border-mood-accent/30 scale-110" 
                    : "hover:bg-white/5 border border-transparent hover:scale-105"
                }`}
                title={`Ambience: ${moodLabels[m]}`}
              >
                {moodEmojis[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Extra Actions */}
        <div className="space-y-1.5">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent transition-all ${
              isActive("/settings") ? "bg-slate-100/10 text-white border-white/5" : ""
            } ${collapsed ? "justify-center" : ""}`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 px-3 py-3 rounded-2xl text-slate-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent transition-all cursor-pointer ${
              collapsed ? "justify-center" : ""
            }`}
            title="Reset Database"
          >
            <X className="w-5 h-5" />
            {!collapsed && <span className="text-sm font-medium">Log Out & Reset</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header (only on mobile) */}
      <div className="lg:hidden flex items-center justify-between w-full p-4 glass-panel border-b border-white/5 fixed top-0 left-0 right-0 z-40 h-16">
        <Link href="/home" className="flex items-center gap-2">
          <span className="text-lg font-bold">
            Solace<span className="text-mood-accent font-medium">+</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-200 hover:text-white glass-panel-light rounded-xl cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[80vw] h-full glass-panel border-r border-white/10 flex flex-col justify-between py-4">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Direct copy of SidebarContent */}
            <div className="flex-1 overflow-y-auto no-scrollbar pt-6">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col h-[calc(100vh-2rem)] my-4 ml-4 rounded-3xl glass-panel border border-white/10 transition-all duration-300 relative z-30 shadow-2xl ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full glass-panel border border-white/10 flex items-center justify-center hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer z-40"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};
