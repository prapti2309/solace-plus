"use client";

import React, { useEffect, useState } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  BrainCircuit, 
  Smile, 
  Calendar,
  AlertCircle,
  Lightbulb,
  Heart
} from "lucide-react";
import { getMockDb } from "@/lib/services/mockDb";

export default function InsightsPage() {
  const [journalsSummary, setJournalsSummary] = useState("");
  const [distortionsList, setDistortionsList] = useState<string[]>([]);
  const [hasData, setHasData] = useState(true);

  useEffect(() => {
    const db = getMockDb();
    if (db.journal_entries.length > 0) {
      // Assemble mock AI summaries
      const summaries = db.journal_entries.map(j => j.ai_summary).filter(Boolean);
      if (summaries.length > 0) {
        setJournalsSummary(
          "Alex, your logs over the past week show that while professional deadlines and VP presentation reviews remain significant triggers for anxiety, you have shown notable resilience by utilizing box breathing pacers. Gratitude logs highlight high emotional comfort gained from family relationships (specifically sister Sarah). Pacing yourself during stressful launch tasks has supported your emotional equilibrium."
        );
      }
      
      const allDistortions = db.journal_entries.flatMap(j => j.cognitive_distortions || []);
      const uniqueDistortions = Array.from(new Set(allDistortions));
      setDistortionsList(uniqueDistortions.length > 0 ? uniqueDistortions : ["Catastrophizing", "All-or-Nothing Thinking"]);
    } else {
      setHasData(false);
    }
  }, []);

  return (
    <div className="space-y-8 overflow-y-auto no-scrollbar max-h-full">
      {/* Header title */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <BrainCircuit className="w-5.5 h-5.5 text-mood-accent transition-colors duration-[2500ms]" />
          Weekly AI-Generated Insights
        </h1>
        <p className="text-slate-400 text-xs mt-1.5 font-medium">
          Synthesized patterns, stress correlations, and mental wellness recommendations derived from your writing.
        </p>
      </div>

      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main AI Summary block */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Summary Card */}
            <div className="p-6 rounded-3xl glass-panel border border-white/10 bg-slate-900/40 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-mood-accent transition-colors duration-[2500ms]">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Weekly Cognitive Synthesizer</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                {journalsSummary || "Alex, you show strong coping patterns when work stress increases. Focusing on mindfulness has supported your boundary-building goals."}
              </p>
            </div>

            {/* Cognitive Patterns */}
            <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="w-4.5 h-4.5 text-amber-400" />
                Dominant Thinking Distortions
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                These are typical cognitive filters identified in your journals during stress checks. Reframing these is the goal of CBT.
              </p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {distortionsList.map((dist, idx) => (
                  <span 
                    key={idx}
                    className="px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-300 uppercase tracking-wide"
                  >
                    {dist}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Side: Actionable coping tips */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl glass-panel border border-white/5 flex flex-col justify-between h-full shadow-xl">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Lightbulb className="w-4.5 h-4.5 text-mood-accent" />
                  Coping Guidance
                </h3>
                
                <div className="space-y-4 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold text-mood-accent uppercase tracking-wider block">Pacing Routine</span>
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      Your work journals indicate stress rises between 2 PM and 4 PM. Schedule a 4-minute box breathing break during this window.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Social Outlet</span>
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      Logs featuring sister Sarah show a 20% distress reduction. Prioritize weekly calls or meetups.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">Screen boundary</span>
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      Sleep hygiene audits show bedtime screens cause higher next-day anxiety. Keep screen shutdown rules active.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-3xl glass-panel border border-white/5 text-center text-xs text-slate-500">
          Not enough journal entries or mood logs logged to generate insights. Write reflections in your AI Journal to activate.
        </div>
      )}
    </div>
  );
}
