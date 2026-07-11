"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Flame, 
  MessageCircle, 
  BookOpen, 
  Database, 
  ArrowRight,
  Heart,
  TrendingUp
} from "lucide-react";
import { useEmotionTheme, MoodType } from "@/contexts/ThemeContext";
import { authService, moodService, recommendationService } from "@/lib/services/mockServices";
import { getMockDb } from "@/lib/services/mockDb";

export default function HomeDashboard() {
  const router = useRouter();
  const { mood, setMood } = useEmotionTheme();
  const [userName, setUserName] = useState("Alex");
  const [streak, setStreak] = useState(4);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recentNote, setRecentNote] = useState("");

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    // Load profile
    const loadProfile = async () => {
      const prof = await authService.getProfile();
      if (prof.name) {
        setUserName(prof.nickname || prof.name);
      }
    };
    loadProfile();
  }, []);

  // Fetch recommendations whenever mood changes
  useEffect(() => {
    const loadRecs = async () => {
      const recs = await recommendationService.getRecommendations(mood);
      setRecommendations(recs);
    };
    loadRecs();
  }, [mood]);

  const handleMoodLog = async (selectedMood: MoodType) => {
    setMood(selectedMood);
    await moodService.addMoodLog(selectedMood, 8, "Checked in from main dashboard dashboard.");
    // Randomize some prompts
    const db = getMockDb();
    setStreak(db.mood_logs.length);
  };

  const handleQuickChat = async () => {
    const categories = ["anxiety", "worklife", "relationships", "general"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const newChat = await getMockDb();
    // Redirecting to chat landing or creating new
    router.push("/chat");
  };

  return (
    <div className="space-y-8 flex flex-col justify-between h-full">
      {/* Upper Panel */}
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 leading-tight">
              {getGreeting()}, <span className="text-mood-accent transition-colors duration-[2500ms]">{userName}</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1.5 font-medium">
              Welcome back to your private sanctuary. Take a breath and pace yourself today.
            </p>
          </div>
          {/* Streak indicator */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-panel-light border border-white/5 shadow-md self-start md:self-auto">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Check-in Streak</div>
              <div className="text-sm font-bold text-white leading-none mt-0.5">{streak} Days</div>
            </div>
          </div>
        </div>

        {/* Interactive Check-in */}
        <div className="p-6 rounded-3xl glass-panel-light border border-white/5 space-y-4">
          <h2 className="text-sm font-bold text-slate-200">How are you feeling right now?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {(Object.keys(moodEmojis) as MoodType[]).map((m) => {
              const active = mood === m;
              return (
                <button
                  key={m}
                  onClick={() => handleMoodLog(m)}
                  className={`py-3.5 px-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    active 
                      ? "bg-mood-accent/20 border-mood-accent shadow-lg shadow-mood-accent/10 scale-105" 
                      : "glass-panel border-white/5 hover:border-white/10 hover:scale-[1.02]"
                  }`}
                >
                  <span className="text-2xl">{moodEmojis[m]}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-300">
                    {moodLabels[m]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Coping Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-mood-accent" />
              Suggested Exercises for you
            </h2>
            <Link href="/wellness" className="text-xs text-mood-accent hover:underline font-semibold flex items-center gap-0.5">
              Explore All Tools
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <Link 
                key={rec.id} 
                href={rec.url}
                className="group p-5 rounded-3xl glass-panel border border-white/5 hover:border-white/15 hover:bg-white/5 transition-all flex flex-col justify-between gap-4 h-40 shadow-xl"
              >
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {rec.type}
                  </span>
                  <h3 className="text-sm font-bold text-slate-200 mt-3.5 leading-snug group-hover:text-mood-accent transition-colors duration-300">
                    {rec.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold">{rec.duration} exercise</span>
                  <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-mood-accent group-hover:text-slate-950 transition-colors">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-8 mt-6">
        <Link 
          href="/chat"
          className="flex items-center gap-4 p-5 rounded-3xl glass-panel border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all shadow-md group"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 group-hover:bg-indigo-500/20 transition-all shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Talk to Solace</h4>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
              Enter an emotionally adaptive chat session with your AI companion.
            </p>
          </div>
        </Link>

        <Link 
          href="/journal"
          className="flex items-center gap-4 p-5 rounded-3xl glass-panel border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all shadow-md group"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300 group-hover:bg-teal-500/20 transition-all shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Write in Journal</h4>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
              Express your feelings in writing and review cognitive reflections.
            </p>
          </div>
        </Link>

        <Link 
          href="/memory"
          className="flex items-center gap-4 p-5 rounded-3xl glass-panel border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all shadow-md group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 group-hover:bg-purple-500/20 transition-all shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Inspect Memories</h4>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
              View and control the facts that Solace remembers about you.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
