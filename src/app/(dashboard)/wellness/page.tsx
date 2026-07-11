"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Wind, 
  Eye, 
  BrainCircuit, 
  Moon, 
  Smile, 
  Activity,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { useEmotionTheme } from "@/contexts/ThemeContext";

interface ExerciseItem {
  id: string;
  title: string;
  description: string;
  type: "Breathing" | "Grounding" | "CBT" | "Mindfulness" | "Sleep";
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  icon: React.ComponentType<any>;
  colorClass: string;
  url: string;
}

const EXERCISES: ExerciseItem[] = [
  {
    id: "breathing",
    title: "Box Breathing Pacer",
    description: "Inhale, hold, exhale, hold. Sync your nervous system to a steady 4-second box breathing cadence to quickly calm acute anxiety.",
    type: "Breathing",
    duration: "4 min",
    difficulty: "Beginner",
    icon: Wind,
    colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    url: "/wellness/breathing"
  },
  {
    id: "grounding",
    title: "5-4-3-2-1 Grounding Method",
    description: "De-escalate panic loops by interactively mapping objects you see, feel, hear, smell, and taste to ground your awareness in the present.",
    type: "Grounding",
    duration: "6 min",
    difficulty: "Beginner",
    icon: Eye,
    colorClass: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    url: "/wellness/grounding"
  },
  {
    id: "thought-record",
    title: "CBT Thought Record",
    description: "Identify negative automatic thoughts, pin cognitive distortions, and write logical, compassionate reframing statements.",
    type: "CBT",
    duration: "10 min",
    difficulty: "Intermediate",
    icon: BrainCircuit,
    colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    url: "/wellness/thought-record"
  },
  {
    id: "pmr",
    title: "Progressive Muscle Relaxation",
    description: "Tense and release muscle groups from head to toe to trigger physical stress relief and physical relaxation.",
    type: "Mindfulness",
    duration: "12 min",
    difficulty: "Intermediate",
    icon: Activity,
    colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    url: "/wellness/pmr"
  },
  {
    id: "sleep",
    title: "Sleep Hygiene Review",
    description: "Audit your bedtime habits, screen timers, lighting controls, and temperature schedules to prepare a peaceful sleep cycle.",
    type: "Sleep",
    duration: "5 min",
    difficulty: "Beginner",
    icon: Moon,
    colorClass: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    url: "/wellness/sleep"
  },
  {
    id: "gratitude",
    title: "Expressive Gratitude Nudges",
    description: "Write structural entries acknowledging small aspects of comfort, supportive friends, or beautiful physical occurrences.",
    type: "Mindfulness",
    duration: "5 min",
    difficulty: "Beginner",
    icon: Smile,
    colorClass: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    url: "/journal"
  }
];

export default function WellnessToolkit() {
  const { mood } = useEmotionTheme();

  return (
    <div className="space-y-8 overflow-y-auto no-scrollbar max-h-full">
      {/* Header title */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5.5 h-5.5 text-mood-accent transition-colors duration-[2500ms]" />
          CBT & Mindfulness Wellness Toolkit
        </h1>
        <p className="text-slate-400 text-xs mt-1.5 font-medium">
          Access evidence-informed behavioral coping exercises to regulate acute stress, reframe thinking patterns, and restore calmness.
        </p>
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EXERCISES.map((ex) => {
          const Icon = ex.icon;
          return (
            <div 
              key={ex.id}
              className="p-6 rounded-3xl glass-panel border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all flex flex-col justify-between gap-6 shadow-xl group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {/* Category badge */}
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {ex.type}
                  </span>
                  
                  {/* Difficulty badge */}
                  <span className="text-[10px] font-semibold text-slate-500">
                    {ex.difficulty}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-md ${ex.colorClass}`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 group-hover:text-mood-accent transition-colors duration-300">
                      {ex.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                      {ex.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
                <span className="text-slate-500 font-semibold">Duration: {ex.duration}</span>
                <Link 
                  href={ex.url}
                  className="flex items-center gap-1 text-mood-accent hover:underline font-bold transition-colors duration-[2500ms] cursor-pointer"
                >
                  Launch Exercise
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Footnote */}
      <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-900/30 border border-white/5 text-[10px] text-slate-500">
        <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
        <span>These exercises are based on established Cognitive Behavioral Therapy (CBT) and mindfulness protocols. They are intended for coping support and are not a replacement for clinical diagnosis or psychotherapeutic care.</span>
      </div>
    </div>
  );
}
