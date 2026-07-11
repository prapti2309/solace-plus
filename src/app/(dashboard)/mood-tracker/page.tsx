"use client";

import React, { useEffect, useState } from "react";
import { 
  Sparkles, 
  Calendar, 
  Heart, 
  Activity, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { moodService } from "@/lib/services/mockServices";
import { MoodLog } from "@/lib/services/mockDb";
import { useEmotionTheme, MoodType } from "@/contexts/ThemeContext";

export default function MoodTrackerPage() {
  const { mood, setMood } = useEmotionTheme();
  
  // Data states
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [noteText, setNoteText] = useState("");
  const [selectedIntensity, setSelectedIntensity] = useState(7);
  const [selectedMood, setSelectedMood] = useState<MoodType>("calm");
  const [mounted, setMounted] = useState(false);
  const [logTrigger, setLogTrigger] = useState(0);

  const moodEmojis: Record<MoodType, string> = {
    calm: "😌",
    happy: "☀️",
    sad: "🌧️",
    anxious: "🍃",
    angry: "🔥",
    burnout: "🔋",
    hopeful: "🌸",
  };

  const moodColors: Record<MoodType, string> = {
    calm: "#3b82f6", // blue
    happy: "#f59e0b", // yellow/gold
    sad: "#6366f1", // indigo
    anxious: "#10b981", // green/mint
    angry: "#ef4444", // red
    burnout: "#475569", // slate/dark blue
    hopeful: "#ec4899", // pink
  };

  const moodNumericValues: Record<MoodType, number> = {
    happy: 10,
    hopeful: 9,
    calm: 8,
    anxious: 5,
    sad: 4,
    angry: 3,
    burnout: 2,
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [logTrigger]);

  const loadLogs = async () => {
    const list = await moodService.getMoodLogs();
    // Sort chronologically
    const sorted = [...list].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    setLogs(sorted);
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await moodService.addMoodLog(selectedMood, selectedIntensity, noteText || "Checked in from logs.");
    setNoteText("");
    setMood(selectedMood);
    setLogTrigger(prev => prev + 1);
  };

  // 1. Process data for Line/Area Chart (Wellbeing Index Trend)
  const chartData = logs.map(log => {
    const date = new Date(log.created_at);
    return {
      name: date.toLocaleDateString([], { month: "short", day: "numeric" }),
      score: moodNumericValues[log.mood_label] || 5,
      intensity: log.intensity,
      mood: log.mood_label,
    };
  });

  // 2. Process data for Pie Chart (Distribution)
  const distributionData = () => {
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      counts[log.mood_label] = (counts[log.mood_label] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: counts[key],
      color: moodColors[key as MoodType] || "#fff",
    }));
  };

  // 3. Compute indicators
  const getAverageWellbeing = () => {
    if (logs.length === 0) return 0;
    const sum = logs.reduce((acc, log) => acc + (moodNumericValues[log.mood_label] || 5), 0);
    return (sum / logs.length).toFixed(1);
  };

  const getAnxietyLevel = () => {
    const anxietyLogs = logs.filter(l => l.mood_label === "anxious" || l.mood_label === "burnout");
    if (logs.length === 0) return 0;
    return Math.round((anxietyLogs.length / logs.length) * 100);
  };

  // Custom tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200">
          <p className="font-bold">{data.name}</p>
          <p className="mt-1 flex items-center gap-1.5">
            <span>Wellbeing:</span>
            <span className="font-semibold text-mood-accent">{data.score}/10 ({data.mood})</span>
          </p>
          <p className="text-[10px] text-slate-500">Intensity Level: {data.intensity}/10</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 overflow-y-auto no-scrollbar max-h-full">
      {/* Header title */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Heart className="w-5.5 h-5.5 text-mood-accent transition-colors duration-[2500ms]" />
          Mood & Wellbeing Dashboard
        </h1>
        <p className="text-slate-400 text-xs mt-1.5 font-medium">
          Visualize your emotional trajectory, trace anxiety frequencies, and log regular checks.
        </p>
      </div>

      {/* Main Grid: Input + Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check-in panel */}
        <div className="lg:col-span-1 p-5 rounded-3xl glass-panel-light border border-white/5 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Log Today's Mood</h3>
          
          <form onSubmit={handleCheckIn} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400">Emotion Label</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(moodEmojis) as MoodType[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMood(m)}
                    className={`py-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                      selectedMood === m 
                        ? "bg-mood-accent/20 border-mood-accent text-white" 
                        : "glass-panel border-white/5 hover:border-white/10"
                    }`}
                  >
                    <span className="text-lg">{moodEmojis[m]}</span>
                    <span className="text-[8px] font-bold uppercase mt-1 text-slate-400">{m}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400">Intensity Level</label>
                <span className="text-xs font-bold text-mood-accent">{selectedIntensity}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={selectedIntensity}
                onChange={(e) => setSelectedIntensity(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-mood-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400">Reflective Note (Optional)</label>
              <textarea
                placeholder="What triggered this feeling? Record keywords..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full h-20 p-3 rounded-2xl glass-input text-xs font-medium resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              Commit Check-in
            </button>
          </form>
        </div>

        {/* Dynamic Analytics Indicators */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl glass-panel border border-white/5 flex flex-col justify-between h-40">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Average Wellbeing Score</span>
            <div className="my-2">
              <span className="text-4xl font-extrabold text-white">{getAverageWellbeing()}</span>
              <span className="text-slate-500 text-xs ml-1">/ 10</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Calculated over your 15-day history.</p>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-white/5 flex flex-col justify-between h-40">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Anxiety Frequency Ratio</span>
            <div className="my-2">
              <span className="text-4xl font-extrabold text-teal-400">{getAnxietyLevel()}%</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Proportion of logs tagged as Anxious/Burnout.</p>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-white/5 flex flex-col justify-between h-40">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Total Mood Checks</span>
            <div className="my-2">
              <span className="text-4xl font-extrabold text-purple-400">{logs.length}</span>
              <span className="text-slate-500 text-xs ml-1">entries</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Continuous tracking supports self-awareness.</p>
          </div>
        </div>
      </div>

      {/* Charts section */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Area Chart */}
          <div className="lg:col-span-2 p-5 rounded-3xl glass-panel border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Wellbeing Index Trend</h3>
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-mood-accent" />
                Active Analysis
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--mood-accent)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--mood-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 10]} stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="var(--mood-accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Pie Chart */}
          <div className="lg:col-span-1 p-5 rounded-3xl glass-panel border border-white/5 space-y-4 flex flex-col justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Emotional Balance Breakdown</h3>
            <div className="h-56 w-full flex items-center justify-center">
              {distributionData().length === 0 ? (
                <div className="text-xs text-slate-500">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {distributionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Color key notes */}
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center pb-2">
              {distributionData().map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-[9px] font-bold text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Log Feed */}
      <div className="p-5 rounded-3xl glass-panel border border-white/5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent check-in activity</h3>
        <div className="space-y-3">
          {logs.slice().reverse().slice(0, 5).map((log) => {
            const formattedDate = new Date(log.created_at).toLocaleDateString([], { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            return (
              <div 
                key={log.id} 
                className="flex items-center justify-between p-3.5 rounded-2xl glass-panel-light border border-white/5 hover:border-white/10 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl px-2.5 py-1 rounded-xl bg-slate-900/60 border border-white/5">
                    {moodEmojis[log.mood_label]}
                  </span>
                  <div>
                    <div className="font-bold text-slate-200">{log.note}</div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{formattedDate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">Intensity:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 font-bold text-slate-200">{log.intensity}/10</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
