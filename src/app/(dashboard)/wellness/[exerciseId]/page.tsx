"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Wind, 
  Eye, 
  BrainCircuit, 
  Moon, 
  Activity, 
  Play, 
  Pause, 
  RotateCcw,
  Check,
  ChevronRight,
  Info
} from "lucide-react";
import { useEmotionTheme } from "@/contexts/ThemeContext";

type ExerciseId = "breathing" | "grounding" | "thought-record" | "pmr" | "sleep";

export default function ExerciseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const exerciseId = params?.exerciseId as ExerciseId;
  const { mood, setMood } = useEmotionTheme();

  // Common UI states
  const [activeStep, setActiveStep] = useState(0);
  const [complete, setComplete] = useState(false);

  // 1. Breathing Exercise States
  const [breathingStage, setBreathingStage] = useState<"inhale" | "hold-in" | "exhale" | "hold-out">("inhale");
  const [breathingTimer, setBreathingTimer] = useState(4);
  const [breathingIsPlaying, setBreathingIsPlaying] = useState(false);

  // 2. Grounding Exercise States
  const [groundingInputs, setGroundingInputs] = useState<string[]>(["", "", "", "", ""]);
  
  // 3. CBT Thought Record States
  const [cbtSituation, setCbtSituation] = useState("");
  const [cbtThoughts, setCbtThoughts] = useState("");
  const [cbtDistortions, setCbtDistortions] = useState<string[]>([]);
  const [cbtAlternative, setCbtAlternative] = useState("");
  const [cbtOriginalIntensity, setCbtOriginalIntensity] = useState(8);
  const [cbtNewIntensity, setCbtNewIntensity] = useState(4);

  const distortionsOptions = [
    "Catastrophizing (worst-case thoughts)",
    "All-or-Nothing Thinking (perfect vs disaster)",
    "Mind Reading (assuming others think poorly)",
    "Emotional Reasoning (I feel it, so it's true)",
    "Should Statements (unbending rules)",
    "Overgeneralization (never/always tags)"
  ];

  // Box Breathing Loop Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (exerciseId === "breathing" && breathingIsPlaying) {
      interval = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev > 1) return prev - 1;
          
          // Rotate stages
          setBreathingStage((stage) => {
            switch (stage) {
              case "inhale": return "hold-in";
              case "hold-in": return "exhale";
              case "exhale": return "hold-out";
              case "hold-out": return "inhale";
            }
          });
          return 4;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [exerciseId, breathingIsPlaying]);

  const handleCbtDistortionToggle = (dist: string) => {
    if (cbtDistortions.includes(dist)) {
      setCbtDistortions(cbtDistortions.filter(d => d !== dist));
    } else {
      setCbtDistortions([...cbtDistortions, dist]);
    }
  };

  const handleCompleteExercise = () => {
    setComplete(true);
    setMood("calm"); // Normalize mood to calm post-exercise
  };

  // Render Exercise: 1. BOX BREATHING
  const renderBreathing = () => {
    const stageDetails = {
      "inhale": { text: "Inhale Slowly...", sub: "Fill your lungs with air", scale: 1.4, color: "text-blue-300" },
      "hold-in": { text: "Hold...", sub: "Sustain the breath gently", scale: 1.4, color: "text-purple-300" },
      "exhale": { text: "Exhale Slowly...", sub: "Release all tension", scale: 1.0, color: "text-teal-300" },
      "hold-out": { text: "Hold...", sub: "Rest empty before inhale", scale: 1.0, color: "text-slate-400" }
    };
    const active = stageDetails[breathingStage];

    return (
      <div className="flex flex-col items-center justify-center space-y-8 py-4">
        {/* Animated breathing circle */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Pulsing wave ring */}
          <div 
            className="absolute rounded-full border border-white/5 bg-white/5 transition-all duration-[4000ms] ease-in-out filter blur-sm"
            style={{
              width: breathingIsPlaying ? (breathingStage === "inhale" || breathingStage === "hold-in" ? "260px" : "180px") : "180px",
              height: breathingIsPlaying ? (breathingStage === "inhale" || breathingStage === "hold-in" ? "260px" : "180px") : "180px",
            }}
          />
          {/* Core Breathing Orb */}
          <div 
            className="absolute rounded-full glass-panel border border-white/15 flex flex-col items-center justify-center transition-all duration-[4000ms] ease-in-out shadow-2xl z-20"
            style={{
              width: breathingIsPlaying ? (breathingStage === "inhale" || breathingStage === "hold-in" ? "200px" : "140px") : "140px",
              height: breathingIsPlaying ? (breathingStage === "inhale" || breathingStage === "hold-in" ? "200px" : "140px") : "140px",
              background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.1), rgba(0,0,0,0.3))",
              backgroundColor: "rgba(15, 23, 42, 0.4)"
            }}
          >
            {/* Center timer */}
            {breathingIsPlaying ? (
              <span className={`text-4xl font-extrabold transition-colors duration-500 ${active.color}`}>
                {breathingTimer}
              </span>
            ) : (
              <Play className="w-10 h-10 text-slate-400 fill-slate-400" />
            )}
          </div>
        </div>

        {/* Text descriptions */}
        <div className="text-center space-y-2 h-16">
          {breathingIsPlaying ? (
            <>
              <h3 className={`text-lg font-bold transition-colors duration-500 ${active.color}`}>{active.text}</h3>
              <p className="text-xs text-slate-400">{active.sub}</p>
            </>
          ) : (
            <>
              <h3 className="text-sm font-bold text-slate-200">Prepare for Box Breathing</h3>
              <p className="text-xs text-slate-400">Click Play below to begin your 4-second cycle.</p>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={() => setBreathingIsPlaying(!breathingIsPlaying)}
            className="w-12 h-12 rounded-full glass-panel border border-white/5 hover:border-white/10 hover:bg-white/5 flex items-center justify-center text-white cursor-pointer"
          >
            {breathingIsPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
          </button>
          <button
            onClick={() => {
              setBreathingIsPlaying(false);
              setBreathingStage("inhale");
              setBreathingTimer(4);
            }}
            className="w-12 h-12 rounded-full glass-panel border border-white/5 hover:border-white/10 hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Complete Check button */}
        {!complete && (
          <button
            onClick={handleCompleteExercise}
            className="mt-6 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
          >
            Complete Session
          </button>
        )}
      </div>
    );
  };

  // Render Exercise: 2. 5-4-3-2-1 GROUNDING
  const renderGrounding = () => {
    const steps = [
      { count: 5, prompt: "things you can SEE around you.", placeholder: "e.g. coffee cup, green leaf, shadow on wall...", desc: "Focus your eyes, notice colors, shapes, and lighting." },
      { count: 4, prompt: "things you can physically FEEL/TOUCH.", placeholder: "e.g. key texture, wool socks, cold air on face...", desc: "Observe sensations, weight, texture, and temperature." },
      { count: 3, prompt: "things you can HEAR in the distance.", placeholder: "e.g. clock tick, traffic hum, wind blowing...", desc: "Listen carefully, catalog far away and close sounds." },
      { count: 2, prompt: "things you can SMELL.", placeholder: "e.g. rain scent, clean linen, woody desk...", desc: "Inhale, seek scents in the room or environment." },
      { count: 1, prompt: "thing you can TASTE.", placeholder: "e.g. mint flavor, water moisture, tea note...", desc: "Focus on taste buds, notice any trace element or dampness." }
    ];
    const current = steps[activeStep];

    const handleTextChange = (val: string) => {
      const copy = [...groundingInputs];
      copy[activeStep] = val;
      setGroundingInputs(copy);
    };

    const handleNextStep = () => {
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1);
      } else {
        handleCompleteExercise();
      }
    };

    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-between items-center text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
          <span>Step {activeStep + 1} of 5</span>
          <span className="text-mood-accent font-bold">Grounding active</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-extrabold text-mood-accent">{current.count}</span>
            <h3 className="text-sm font-bold text-slate-200">Identify {current.prompt}</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold">{current.desc}</p>
        </div>

        <div className="space-y-1.5">
          <textarea
            placeholder={current.placeholder}
            value={groundingInputs[activeStep]}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full h-24 p-4 rounded-2xl glass-input text-xs font-medium resize-none leading-relaxed"
          />
        </div>

        <button
          onClick={handleNextStep}
          disabled={!groundingInputs[activeStep].trim()}
          className="w-full h-11 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          {activeStep === steps.length - 1 ? "Complete Grounding" : "Next Grounding Step"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Render Exercise: 3. CBT THOUGHT RECORD
  const renderCbt = () => {
    const steps = ["Situation", "Automatic Thoughts", "Distortions", "Alternative Thoughts", "Outcome"];
    const currentTab = steps[activeStep];

    const handleNextCbt = () => {
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1);
      } else {
        handleCompleteExercise();
      }
    };

    return (
      <div className="max-w-xl mx-auto space-y-6">
        {/* Steps indicator */}
        <div className="flex justify-between border-b border-white/5 pb-2 shrink-0 overflow-x-auto no-scrollbar">
          {steps.map((st, i) => (
            <button
              key={st}
              disabled={i > activeStep}
              onClick={() => setActiveStep(i)}
              className={`text-[9px] font-bold uppercase tracking-wider pb-1 cursor-pointer transition-all border-b-2 whitespace-nowrap px-2 ${
                activeStep === i 
                  ? "border-mood-accent text-white" 
                  : i < activeStep 
                    ? "border-transparent text-slate-300 hover:text-white"
                    : "border-transparent text-slate-600"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-6">
          {activeStep === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">1. Define the Situation</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Briefly describe what happened. Who was there? What was happening? When and where did it occur?
                </p>
              </div>
              <textarea
                placeholder="e.g. My boss sent a slack message asking for a meeting in 15 mins without explaining why. I was at my desk at 2 PM."
                value={cbtSituation}
                onChange={(e) => setCbtSituation(e.target.value)}
                className="w-full h-32 p-4 rounded-2xl glass-input text-xs font-medium resize-none leading-relaxed"
              />
            </div>
          )}

          {activeStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">2. Automatic Thoughts</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  What automatically ran through your mind? What fears or worst-case predictions did you generate?
                </p>
              </div>
              <textarea
                placeholder="e.g. I am going to get fired. They found a major bug in my presentation. My job is at risk."
                value={cbtThoughts}
                onChange={(e) => setCbtThoughts(e.target.value)}
                className="w-full h-32 p-4 rounded-2xl glass-input text-xs font-medium resize-none leading-relaxed"
              />
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">3. Flag Cognitive Distortions</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Review common cognitive traps. Which distortions fit your automatic thoughts? (select multiple)
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {distortionsOptions.map(d => {
                  const selected = cbtDistortions.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleCbtDistortionToggle(d)}
                      className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                        selected
                          ? "bg-amber-500/10 border-amber-500 text-white"
                          : "glass-panel border-white/5 text-slate-300 hover:border-white/10"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${selected ? "bg-amber-500 text-slate-950 border-amber-500" : "border-white/10"}`}>
                        {selected && <Check className="w-3 h-3 font-bold" />}
                      </div>
                      <span>{d}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">4. Rational Alternative Thoughts</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Challenge your automatic thoughts. What is the actual evidence? What would you tell a friend in this exact situation? Write a logical reframe.
                </p>
              </div>
              <textarea
                placeholder="e.g. My boss asks for syncs regularly. They might just want a quick update or have a client question. Even if there is an issue, we will collaborate to fix it."
                value={cbtAlternative}
                onChange={(e) => setCbtAlternative(e.target.value)}
                className="w-full h-32 p-4 rounded-2xl glass-input text-xs font-medium resize-none leading-relaxed"
              />
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-200">5. Evaluate Outcome</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Re-evaluate your stress. Rate your emotional intensity before and after reframing.
                </p>
              </div>
              
              <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Original Distress:</span>
                    <span>{cbtOriginalIntensity} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={cbtOriginalIntensity}
                    onChange={(e) => setCbtOriginalIntensity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-mood-accent">
                    <span>New distress rating:</span>
                    <span>{cbtNewIntensity} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={cbtNewIntensity}
                    onChange={(e) => setCbtNewIntensity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-mood-accent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigator buttons */}
        <div className="flex justify-end gap-3 pt-2">
          {activeStep > 0 && (
            <button
              onClick={() => setActiveStep(activeStep - 1)}
              className="h-10 px-4 rounded-2xl glass-panel border border-white/5 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Back
            </button>
          )}
          
          <button
            onClick={handleNextCbt}
            disabled={
              (activeStep === 0 && !cbtSituation.trim()) ||
              (activeStep === 1 && !cbtThoughts.trim()) ||
              (activeStep === 2 && cbtDistortions.length === 0) ||
              (activeStep === 3 && !cbtAlternative.trim())
            }
            className="h-10 px-5 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {activeStep === steps.length - 1 ? "File CBT Record" : "Next Step"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Render Exercise: 4. PROGRESSIVE MUSCLE RELAXATION (PMR)
  const renderPmr = () => {
    const steps = [
      { area: "Face & Head", instructions: "Squeeze your eyes shut, wrinkle your forehead, and clench your jaw. Hold for 5 seconds... now fully release. Notice the warm, heavy relaxation spreading." },
      { area: "Shoulders & Neck", instructions: "Pull your shoulders up toward your ears, tensing your neck muscles. Hold tight... 3, 2, 1... now let them drop completely. Feel the weight lift." },
      { area: "Hands & Arms", instructions: "Clench both hands into tight fists, tensing your forearms and biceps. Hold... hold... now release. Feel your fingers uncurl and relax on your lap." },
      { area: "Chest & Stomach", instructions: "Take a deep breath and hold it while tightening your abdominal muscles. Hold the tension... now release, breathing out slowly. Feel your torso soften." },
      { area: "Legs & Feet", instructions: "Point your toes downward, tensing your calves, thighs, and feet. Hold the tension tight... now let go. Feel the release flow into the ground." }
    ];
    const current = steps[activeStep];

    const handleNext = () => {
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1);
      } else {
        handleCompleteExercise();
      }
    };

    return (
      <div className="max-w-md mx-auto space-y-6 text-center py-4">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          PMR Guide — Part {activeStep + 1} of 5
        </span>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-mood-accent transition-colors duration-[2500ms]">{current.area}</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-semibold px-4">{current.instructions}</p>
        </div>

        {/* Tensing animation placeholder */}
        <div className="w-24 h-24 rounded-full border-2 border-dashed border-mood-accent/30 mx-auto animate-pulse flex items-center justify-center bg-mood-accent/5">
          <Activity className="w-6 h-6 text-mood-accent animate-pulse-slow" />
        </div>

        <button
          onClick={handleNext}
          className="w-full h-11 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {activeStep === steps.length - 1 ? "Complete PMR" : "Move to Next muscle group"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Render Exercise: 5. SLEEP HYGIENE AUDIT
  const renderSleep = () => {
    const checks = [
      { id: "s-1", text: "No screen usage or blue-light exposure 45 mins before bed." },
      { id: "s-2", text: "Room temperature adjusted to cool (between 65-68°F / 18-20°C)." },
      { id: "s-3", text: "No caffeine intakes within 8 hours of sleep schedule." },
      { id: "s-4", text: "Heavy black-out curtains or eye mask active to block light." },
      { id: "s-5", text: "Quiet environment or white noise/ambient sounds playing." }
    ];

    return (
      <div className="max-w-md mx-auto space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Bedtime Routine Audit</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Verify your current sleep environment setup. Check all that apply:
        </p>

        <div className="space-y-2">
          {checks.map(chk => (
            <div key={chk.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
              <input
                id={chk.id}
                type="checkbox"
                className="w-4 h-4 rounded border-white/10 bg-slate-950 text-mood-accent focus:ring-0 focus:ring-offset-0 mt-0.5 cursor-pointer"
              />
              <label htmlFor={chk.id} className="text-xs text-slate-200 leading-normal cursor-pointer select-none">
                {chk.text}
              </label>
            </div>
          ))}
        </div>

        <button
          onClick={handleCompleteExercise}
          className="w-full h-11 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          Complete Audit
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const getHeaderIcon = () => {
    switch (exerciseId) {
      case "breathing": return Wind;
      case "grounding": return Eye;
      case "thought-record": return BrainCircuit;
      case "pmr": return Activity;
      case "sleep": return Moon;
      default: return Wind;
    }
  };

  const getExerciseTitle = () => {
    switch (exerciseId) {
      case "breathing": return "Box Breathing Coach";
      case "grounding": return "5-4-3-2-1 Grounding Method";
      case "thought-record": return "CBT Thought Record";
      case "pmr": return "Progressive Muscle Relaxation";
      case "sleep": return "Sleep Hygiene Audit";
      default: return "Wellness Exercise";
    }
  };

  const HeaderIcon = getHeaderIcon();

  return (
    <div className="space-y-6 flex flex-col justify-between h-full">
      {/* Upper header */}
      <div className="shrink-0 flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link
            href="/wellness"
            className="p-2 rounded-xl glass-panel hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Back to wellness directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-mood-accent/15 border border-mood-accent/20 flex items-center justify-center text-mood-accent transition-colors duration-[2500ms]">
              <HeaderIcon className="w-4 h-4" />
            </div>
            <h1 className="text-sm font-extrabold text-slate-200">{getExerciseTitle()}</h1>
          </div>
        </div>
      </div>

      {/* Main interactive node */}
      <div className="flex-1 flex flex-col justify-center py-4">
        {complete ? (
          // Success State
          <div className="max-w-md mx-auto text-center space-y-6 py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/5">
              <Check className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-bold text-slate-100">Exercise Complete!</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold px-6">
                You've successfully completed this exercise. Taking a small moment of focus is a wonderful step towards emotional resilience. Your ambient mood has been calibrated.
              </p>
            </div>
            <Link
              href="/wellness"
              className="inline-flex h-11 px-6 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 text-xs font-semibold items-center justify-center transition-all shadow-md cursor-pointer"
            >
              Return to Toolkit
            </Link>
          </div>
        ) : (
          // Exercise Views
          <>
            {exerciseId === "breathing" && renderBreathing()}
            {exerciseId === "grounding" && renderGrounding()}
            {exerciseId === "thought-record" && renderCbt()}
            {exerciseId === "pmr" && renderPmr()}
            {exerciseId === "sleep" && renderSleep()}
          </>
        )}
      </div>

      {/* Info notice */}
      <div className="shrink-0 flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 text-[9px] text-slate-500 justify-center">
        <Info className="w-3.5 h-3.5" />
        <span>Your answers inside coping exercises are kept in temporary state and never shared with analytics.</span>
      </div>
    </div>
  );
}
