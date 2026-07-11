"use client";

import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Award, 
  Flame, 
  CheckCircle, 
  Sparkles, 
  Calendar,
  BookOpen,
  Activity,
  Heart
} from "lucide-react";
import { getMockDb } from "@/lib/services/mockDb";

interface Badge {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

export default function ProgressPage() {
  const [moodLogsCount, setMoodLogsCount] = useState(14);
  const [journalsCount, setJournalsCount] = useState(2);
  const [memoriesCount, setMemoriesCount] = useState(4);
  const [completedExercises, setCompletedExercises] = useState(3);
  
  const badges: Badge[] = [
    { id: "b1", title: "Calm Master", desc: "Completed 3 breathing exercises in a single week.", icon: "🧘", unlocked: true, date: "July 08, 2026" },
    { id: "b2", title: "Self-Awareness Catalyst", desc: "Logged your mood every day for 7 consecutive days.", icon: "📊", unlocked: true, date: "July 10, 2026" },
    { id: "b3", title: "Cognitive Pioneer", desc: "Filed your first CBT thought record to reframe distress.", icon: "🧠", unlocked: true, date: "July 09, 2026" },
    { id: "b4", title: "Expressive Soul", desc: "Write 10 journal entries in the AI Journal.", icon: "✍️", unlocked: false },
    { id: "b5", title: "Sanctuary Guardian", desc: "Maintain a 14-day check-in streak.", icon: "🛡️", unlocked: false }
  ];

  useEffect(() => {
    const db = getMockDb();
    setMoodLogsCount(db.mood_logs.length);
    setJournalsCount(db.journal_entries.length);
    setMemoriesCount(db.memories.length);
    // Approximate exercises based on entries
    setCompletedExercises(3 + Math.max(0, db.mood_logs.length - 14));
  }, []);

  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  return (
    <div className="space-y-8 overflow-y-auto no-scrollbar max-h-full">
      {/* Header title */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5.5 h-5.5 text-mood-accent transition-colors duration-[2500ms]" />
          Your Growth & Milestones
        </h1>
        <p className="text-slate-400 text-xs mt-1.5 font-medium">
          A calm space to reflect on the commitment you are making to your mental wellness.
        </p>
      </div>

      {/* Stats Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-panel border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Daily Streak</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{moodLogsCount} Days</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Coping Drills</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{completedExercises} Done</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            <BookOpen className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Journal Pages</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{journalsCount} Entries</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <CheckCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Facts Stored</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{memoriesCount} Memory Nodes</span>
          </div>
        </div>
      </div>

      {/* Progress timeline overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements list */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-white/5 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-mood-accent" />
            Earned Wellness Badges
          </h3>

          <div className="space-y-4">
            {unlockedBadges.map((badge) => (
              <div 
                key={badge.id} 
                className="p-4 rounded-2xl glass-panel-light border border-white/5 flex items-start gap-4 hover:border-white/10 transition-all"
              >
                <div className="text-3xl p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-center shadow-inner select-none shrink-0">
                  {badge.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200">{badge.title}</h4>
                    <span className="text-[9px] text-slate-500 font-semibold">{badge.date}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Locked items */}
          {lockedBadges.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Upcoming Milestones</h4>
              <div className="space-y-3">
                {lockedBadges.map((badge) => (
                  <div 
                    key={badge.id} 
                    className="p-4 rounded-2xl glass-panel border border-white/5 flex items-start gap-4 opacity-50 select-none"
                  >
                    <div className="text-3xl filter grayscale p-2.5 rounded-xl bg-slate-900 border border-white/5 shrink-0">
                      {badge.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-300">{badge.title} (Locked)</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Weekly wellness compliance */}
        <div className="lg:col-span-1 p-6 rounded-3xl glass-panel border border-white/5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Weekly Target Focus</h3>
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              Complete these tasks weekly to establish emotional balance habit loops.
            </p>

            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mt-0.5 shrink-0">
                  ✓
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-300 block">Daily Mood Check-ins</span>
                  <span className="text-[9px] text-slate-500">Complete: 7 / 7 check-ins</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mt-0.5 shrink-0">
                  ✓
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-300 block">AI Reflections</span>
                  <span className="text-[9px] text-slate-500">Complete: 2 / 2 journal reflection runs</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-slate-800 border border-white/10 text-slate-400 flex items-center justify-center mt-0.5 shrink-0">
                  -
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Grounding Drills</span>
                  <span className="text-[9px] text-slate-500">Complete: 1 / 3 exercises done</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 text-center mt-6">
            <span className="text-[10px] text-slate-500 font-medium">Keep dedicating time to your reflection routine.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
