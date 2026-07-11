"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Phone, 
  Heart, 
  MessageSquare, 
  Wind, 
  ArrowLeft, 
  Eye, 
  Ear, 
  Hand, 
  Smile, 
  Coffee,
  Shield,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { getMockDb } from "@/lib/services/mockDb";

// ─── Crisis Resources ─────────────────────────────────────────────────────────
const HOTLINES = [
  {
    name: "National Suicide & Crisis Lifeline",
    number: "988",
    description: "Free, confidential crisis support 24/7",
    color: "blue",
    urgent: true
  },
  {
    name: "Crisis Text Line",
    number: "Text HOME to 741741",
    description: "Text-based crisis counseling, 24/7",
    color: "teal",
    urgent: false
  },
  {
    name: "International Association for Suicide Prevention",
    number: "iasp.info/resources/Crisis_Centres",
    description: "Global directory of crisis centers",
    color: "purple",
    urgent: false
  },
  {
    name: "SAMHSA National Helpline",
    number: "1-800-662-4357",
    description: "Mental health & substance use disorders, free & confidential",
    color: "indigo",
    urgent: false
  }
];

// ─── Box Breathing ────────────────────────────────────────────────────────────
const BREATHING_PHASES = [
  { label: "Breathe In",  duration: 4, color: "#60a5fa" },
  { label: "Hold",        duration: 4, color: "#a78bfa" },
  { label: "Breathe Out", duration: 4, color: "#34d399" },
  { label: "Hold",        duration: 4, color: "#f9a8d4" },
];

// ─── Grounding senses ────────────────────────────────────────────────────────
const GROUNDING_STEPS = [
  { count: 5, label: "things you can SEE",   icon: Eye,   color: "#60a5fa" },
  { count: 4, label: "things you can TOUCH", icon: Hand,  color: "#a78bfa" },
  { count: 3, label: "things you can HEAR",  icon: Ear,   color: "#34d399" },
  { count: 2, label: "things you can SMELL", icon: Coffee, color: "#fbbf24" },
  { count: 1, label: "thing you can TASTE",  icon: Smile, color: "#fb7185" },
];

export default function SafetyScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"resources" | "breathing" | "grounding">("resources");
  const [breathPhase, setBreathPhase] = useState(0);
  const [breathProgress, setBreathProgress] = useState(0);
  const [breathActive, setBreathActive] = useState(false);
  const [groundingStep, setGroundingStep] = useState(0);
  const [alertSent, setAlertSent] = useState(false);
  const [emergencyName, setEmergencyName] = useState("");

  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pull emergency contact name from local db
  useEffect(() => {
    const db = getMockDb();
    if (db.profile?.emergency_contact?.name) {
      setEmergencyName(db.profile.emergency_contact.name);
    }
  }, []);

  // ── Box Breathing Engine ────────────────────────────────────────────────────
  useEffect(() => {
    if (!breathActive) {
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      setBreathProgress(0);
      return;
    }

    let phase = breathPhase;
    let progress = 0;
    const TICK_MS = 50;

    const runPhase = () => {
      const phaseDuration = BREATHING_PHASES[phase].duration * 1000;
      progress = 0;

      breathIntervalRef.current = setInterval(() => {
        progress += TICK_MS;
        setBreathProgress(Math.min(progress / phaseDuration, 1));
      }, TICK_MS);

      breathTimerRef.current = setTimeout(() => {
        if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
        phase = (phase + 1) % BREATHING_PHASES.length;
        setBreathPhase(phase);
        runPhase();
      }, phaseDuration);
    };

    runPhase();

    return () => {
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, [breathActive]);

  const handleSendAlert = () => {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 5000);
  };

  const currentPhase = BREATHING_PHASES[breathPhase];
  const circumference = 2 * Math.PI * 64;
  const strokeDash = circumference * (1 - breathProgress);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start overflow-y-auto no-scrollbar"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, #0f1729 0%, #070b14 60%, #030508 100%)",
      }}
    >
      {/* ── Subtle ambient glow ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #60a5fa, transparent 70%)", filter: "blur(80px)" }}
        />
        <div className="absolute bottom-[-10%] right-[10%] w-[40vw] h-[40vw] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)", filter: "blur(60px)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.18)" }}
            >
              <Shield className="w-7 h-7 text-blue-300" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            You Are Safe Here
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
            Solace+ detected something in our conversation that made us want to pause and check in.
            You don't have to face this alone. Take a breath — we're right here with you.
          </p>
        </div>

        {/* ── Emergency Contact Alert ──────────────────────────────────────── */}
        {emergencyName && (
          <div className="p-4 rounded-2xl border border-blue-500/20 space-y-3"
            style={{ background: "rgba(59,130,246,0.06)" }}
          >
            <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Heart className="w-4 h-4" />
              Your Trusted Contact
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 text-sm font-semibold">{emergencyName}</p>
                <p className="text-slate-500 text-xs mt-0.5">Emergency contact on file</p>
              </div>
              <button
                onClick={handleSendAlert}
                disabled={alertSent}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                style={{
                  background: alertSent ? "rgba(52,211,153,0.15)" : "rgba(96,165,250,0.15)",
                  border: alertSent ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(96,165,250,0.3)",
                  color: alertSent ? "#34d399" : "#93c5fd",
                }}
              >
                {alertSent ? "✓ Alert Sent" : "Send a Quick Alert"}
              </button>
            </div>
            {alertSent && (
              <p className="text-[10px] text-emerald-400 font-medium">
                A discreet check-in message has been queued for {emergencyName}. (Simulated — no real message sent.)
              </p>
            )}
          </div>
        )}

        {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
        <div className="flex rounded-2xl p-1 gap-1"
          style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {[
            { key: "resources", label: "Crisis Lines", icon: Phone },
            { key: "breathing", label: "Box Breathing", icon: Wind },
            { key: "grounding", label: "5-4-3-2-1", icon: Eye },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              style={activeTab === key ? {
                background: "rgba(96,165,250,0.12)",
                border: "1px solid rgba(96,165,250,0.25)",
                color: "#93c5fd",
              } : {
                border: "1px solid transparent",
                color: "#64748b",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Resources Tab ───────────────────────────────────────────────── */}
        {activeTab === "resources" && (
          <div className="space-y-3">
            {HOTLINES.map((line, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl flex items-center justify-between gap-4 transition-all group"
                style={{
                  background: line.urgent ? "rgba(96,165,250,0.08)" : "rgba(15,23,42,0.4)",
                  border: line.urgent ? "1px solid rgba(96,165,250,0.2)" : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.15)" }}
                  >
                    {line.urgent ? <AlertCircle className="w-4 h-4 text-blue-300" /> : <Phone className="w-4 h-4 text-blue-300/60" />}
                  </div>
                  <div>
                    <p className="text-slate-200 text-xs font-bold leading-snug">{line.name}</p>
                    <p className="text-blue-300 text-sm font-extrabold mt-0.5 font-mono">{line.number}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">{line.description}</p>
                  </div>
                </div>
                {line.urgent && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg shrink-0"
                    style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)", color: "#93c5fd" }}
                  >
                    24/7
                  </span>
                )}
              </div>
            ))}

            <div className="text-center pt-2">
              <a
                href="https://findahelpline.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Find a helpline in your country — findahelpline.com
              </a>
            </div>
          </div>
        )}

        {/* ── Box Breathing Tab ────────────────────────────────────────────── */}
        {activeTab === "breathing" && (
          <div className="flex flex-col items-center gap-6 py-4">
            <p className="text-xs text-slate-400 text-center max-w-sm leading-relaxed">
              Box breathing activates your parasympathetic nervous system and helps reduce acute anxiety within minutes.
              Follow the circle — breathe with it.
            </p>

            {/* SVG Breathing Ring */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="64" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle
                  cx="80" cy="80" r="64"
                  fill="none"
                  stroke={breathActive ? currentPhase.color : "#334155"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={breathActive ? strokeDash : circumference}
                  style={{ transition: "stroke 0.5s ease" }}
                />
              </svg>
              <div className="text-center z-10">
                <p className="text-xl font-extrabold text-slate-100">
                  {breathActive ? currentPhase.label : "Ready"}
                </p>
                {breathActive && (
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">
                    {currentPhase.duration}s
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setBreathActive(!breathActive); setBreathPhase(0); setBreathProgress(0); }}
                className="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer"
                style={{
                  background: breathActive ? "rgba(248,113,113,0.12)" : "rgba(96,165,250,0.12)",
                  border: breathActive ? "1px solid rgba(248,113,113,0.25)" : "1px solid rgba(96,165,250,0.25)",
                  color: breathActive ? "#fca5a5" : "#93c5fd",
                }}
              >
                {breathActive ? "Pause" : "Start Breathing"}
              </button>
            </div>

            {/* Phase guide */}
            <div className="grid grid-cols-4 gap-2 w-full">
              {BREATHING_PHASES.map((p, idx) => (
                <div key={idx} className="text-center p-2.5 rounded-xl"
                  style={{
                    background: breathActive && breathPhase === idx ? `${p.color}18` : "rgba(255,255,255,0.03)",
                    border: breathActive && breathPhase === idx ? `1px solid ${p.color}40` : "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: p.color }}>{p.label}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{p.duration}s</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 5-4-3-2-1 Grounding Tab ─────────────────────────────────────── */}
        {activeTab === "grounding" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              The 5-4-3-2-1 technique uses your five senses to anchor you to the present moment
              and interrupt the stress response. Work through each step.
            </p>

            <div className="space-y-2">
              {GROUNDING_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = groundingStep === idx;
                const isDone = groundingStep > idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setGroundingStep(isDone ? idx : Math.min(idx, groundingStep + 1))}
                    className="w-full p-4 rounded-2xl text-left flex items-center gap-4 transition-all cursor-pointer group"
                    style={{
                      background: isDone ? "rgba(52,211,153,0.06)" : isActive ? `${step.color}10` : "rgba(15,23,42,0.35)",
                      border: isDone ? "1px solid rgba(52,211,153,0.2)" : isActive ? `1px solid ${step.color}35` : "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: isDone ? "rgba(52,211,153,0.12)" : `${step.color}12`,
                        border: isDone ? "1px solid rgba(52,211,153,0.25)" : `1px solid ${step.color}25`,
                      }}
                    >
                      {isDone
                        ? <span className="text-emerald-400 font-bold text-sm">✓</span>
                        : <Icon className="w-4.5 h-4.5" style={{ color: isActive ? step.color : "#64748b" }} />
                      }
                    </div>
                    <div className="flex-1">
                      <span className="text-2xl font-black" style={{ color: isDone ? "#34d399" : isActive ? step.color : "#475569" }}>
                        {step.count}
                      </span>
                      <span className="text-slate-300 text-xs font-semibold ml-2">{step.label}</span>
                    </div>
                    {isActive && !isDone && (
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>

            {groundingStep >= GROUNDING_STEPS.length && (
              <div className="text-center p-4 rounded-2xl"
                style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}
              >
                <p className="text-emerald-300 text-sm font-bold">Well done. 💚</p>
                <p className="text-slate-400 text-xs mt-1">You've completed the grounding exercise. Take a moment to notice how you feel right now.</p>
                <button onClick={() => setGroundingStep(0)} className="mt-3 text-[10px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer underline underline-offset-2">
                  Start again
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Footer Actions ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => router.push("/chat")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer"
            style={{ background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.2)", color: "#93c5fd" }}
          >
            <MessageSquare className="w-4 h-4" />
            Return to Chat
          </button>
          <button
            onClick={() => router.push("/home")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#64748b" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Dashboard
          </button>
        </div>

        {/* ── Disclaimer ──────────────────────────────────────────────────── */}
        <p className="text-center text-[9px] text-slate-600 leading-relaxed pb-4">
          Solace+ is not a licensed medical provider or crisis service. If you are in immediate danger,
          please call emergency services (911 / 999 / 112) or go to your nearest emergency room.
          The resources above connect you with trained human counselors.
        </p>
      </div>
    </div>
  );
}
