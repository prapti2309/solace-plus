"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, Check, Info } from "lucide-react";
import { AmbientBackground } from "@/components/theme-engine/AmbientBackground";
import { authService } from "@/lib/services/mockServices";
import { useEmotionTheme } from "@/contexts/ThemeContext";

export default function RegisterPage() {
  const router = useRouter();
  const { setActivePersona } = useEmotionTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [persona, setPersona] = useState<"listener" | "coach" | "motivator" | "guide">("listener");
  const [memoryConsent, setMemoryConsent] = useState(true);

  // Validation state
  const [error, setError] = useState("");

  const stepsCount = 4;

  const goalOptions = [
    "Managing Stress",
    "Mindful Reflection",
    "Improving Sleep",
    "Building Boundaries",
    "Coping with Anxiety",
    "Personal Growth",
    "Emotional Regulation"
  ];

  const personaOptions = [
    { id: "listener", name: "Gentle Listener", desc: "Patient, empathetic, and validates your feelings without rushing to solve problems." },
    { id: "coach", name: "Practical Coach", desc: "Action-oriented, supports breaking down worries, and sets actionable coping steps." },
    { id: "motivator", name: "Inspiring Motivator", desc: "High energy, encouraging, focuses on your strengths and milestones." },
    { id: "guide", name: "Reflective Guide", desc: "Philosophical, focuses on mindfulness, patterns, and self-discovery." }
  ] as const;

  const handleGoalToggle = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter(g => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!email || !password) {
        setError("Please enter your email and password.");
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    } else if (step === 2) {
      if (!name) {
        setError("Please enter your name.");
        return;
      }
    } else if (step === 3) {
      if (goals.length === 0) {
        setError("Please select at least one goal.");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await authService.register({
        name,
        nickname: nickname || name,
        age_group: ageGroup,
        pronouns,
        goals,
        communication_style: persona,
        consent_flags: {
          profile: true,
          chat_history: true,
          mood_tracking: true,
          journal_summary: true,
          long_term_memory: memoryConsent,
          voice_analysis: false
        }
      });
      setActivePersona(persona);
      setLoading(false);
      router.push("/home");
    } catch (err) {
      setError("Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <AmbientBackground />

      <div className="w-full max-w-lg rounded-3xl glass-panel border border-white/10 shadow-2xl p-8 relative z-20">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-mood-accent transition-all duration-500 ease-out" 
            style={{ width: `${(step / stepsCount) * 100}%` }}
          />
        </div>

        {/* Back Button */}
        {step > 1 && (
          <button 
            onClick={handleBack}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-4 -mt-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Account Scaffolding */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-mood-accent" />
                Begin Your Journey
              </h2>
              <p className="text-xs text-slate-400 mt-1">Let's create a secure account for your emotional records.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-semibold px-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-semibold px-1">Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl glass-input text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full h-12 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div className="text-center text-xs text-slate-400 pt-2">
              Already have an account?{" "}
              <Link href="/login" className="text-mood-accent hover:underline font-semibold ml-0.5">
                Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Personal Profile */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">About You</h2>
              <p className="text-xs text-slate-400 mt-1">How should we address you in your quiet space?</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold px-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Alex"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl glass-input text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold px-1">Nickname (Optional)</label>
                  <input
                    type="text"
                    placeholder="Al"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl glass-input text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold px-1">Age Group</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl glass-input text-sm select-none"
                  >
                    <option value="" disabled className="bg-slate-900">Select group</option>
                    <option value="under-18" className="bg-slate-900">Under 18</option>
                    <option value="18-24" className="bg-slate-900">18 - 24</option>
                    <option value="25-34" className="bg-slate-900">25 - 34</option>
                    <option value="35-44" className="bg-slate-900">35 - 44</option>
                    <option value="45-54" className="bg-slate-900">45 - 54</option>
                    <option value="55+" className="bg-slate-900">55+</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold px-1">Pronouns</label>
                  <input
                    type="text"
                    placeholder="they/them, she/her, etc."
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl glass-input text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full h-12 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Wellness Goals */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Set Your Focus</h2>
              <p className="text-xs text-slate-400 mt-1">Select the areas you wish to prioritize (select multiple).</p>
            </div>

            <div className="flex flex-wrap gap-2.5 my-4">
              {goalOptions.map((goal) => {
                const selected = goals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => handleGoalToggle(goal)}
                    className={`px-4 py-3 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                      selected 
                        ? "bg-mood-accent/20 border-mood-accent text-white" 
                        : "glass-panel-light border-white/5 text-slate-300 hover:border-white/10"
                    }`}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              className="w-full h-12 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 4: Companion Persona & Consent */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Choose Your Companion</h2>
              <p className="text-xs text-slate-400 mt-1">Select the support style that fits you best.</p>
            </div>

            {/* Persona Cards */}
            <div className="grid grid-cols-1 gap-2.5">
              {personaOptions.map((p) => {
                const selected = persona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPersona(p.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      selected 
                        ? "bg-mood-accent/15 border-mood-accent text-white" 
                        : "glass-panel-light border-white/5 text-slate-300 hover:border-white/10"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border border-white/10 mt-0.5 flex items-center justify-center shrink-0 ${selected ? "bg-mood-accent/30 text-mood-accent border-mood-accent" : ""}`}>
                      {selected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{p.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{p.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Memory Consent */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex items-start gap-3">
              <input
                id="memory-consent"
                type="checkbox"
                checked={memoryConsent}
                onChange={(e) => setMemoryConsent(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-slate-950 text-mood-accent focus:ring-0 focus:ring-offset-0 mt-0.5 cursor-pointer"
              />
              <div className="text-left">
                <label htmlFor="memory-consent" className="text-xs font-semibold text-slate-300 cursor-pointer block select-none">
                  Enable Consent-based Long-term Memory
                </label>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                  Allows Solace+ to remember facts (e.g. your routine, family relationships) to provide deeper personal insights across chat sessions.
                </p>
              </div>
            </div>

            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
              ) : (
                <>
                  Enter My Sanctuary
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
