"use client";

import React, { useEffect, useState } from "react";
import { 
  BookOpen, 
  Calendar, 
  Sparkles, 
  Plus, 
  Save, 
  Search, 
  Loader2, 
  AlertCircle,
  Clock,
  Heart
} from "lucide-react";
import { journalService } from "@/lib/services/mockServices";
import { getMockDb, JournalEntry } from "@/lib/services/mockDb";
import { useEmotionTheme, MoodType } from "@/contexts/ThemeContext";

export default function JournalPage() {
  const { mood, setMood } = useEmotionTheme();
  
  // Data states
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  
  // Form states
  const [editorContent, setEditorContent] = useState("");
  const [editorType, setEditorType] = useState<"daily" | "gratitude">("daily");
  const [editorMood, setEditorMood] = useState<MoodType>("calm");
  const [searchQuery, setSearchQuery] = useState("");
  
  // UI states
  const [isCreating, setIsCreating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    const list = await journalService.getJournals();
    setJournals(list);
    if (list.length > 0 && !selectedJournal) {
      setSelectedJournal(list[0]);
    }
  };

  const handleSelectJournal = (j: JournalEntry) => {
    setIsCreating(false);
    setSelectedJournal(j);
    setError("");
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedJournal(null);
    setEditorContent("");
    setEditorType("daily");
    setEditorMood(mood);
    setError("");
  };

  const handleSaveJournal = async () => {
    setError("");
    const content = editorContent.trim();
    if (!content) {
      setError("Please write some content before saving.");
      return;
    }

    try {
      const newEntry = await journalService.addJournal(content, editorType, editorMood);
      setIsCreating(false);
      setSelectedJournal(newEntry);
      
      // Reload list
      await loadJournals();

      // Trigger background AI reflection job
      setIsSummarizing(true);
      const summarizedEntry = await journalService.generateSummaryAsync(newEntry.id);
      
      // Reload list and set active entry
      await loadJournals();
      setSelectedJournal(summarizedEntry);
      setIsSummarizing(false);
      
      // Auto-update context theme to match saved journal mood
      setMood(editorMood);
    } catch (err) {
      setError("Failed to save journal entry.");
      setIsSummarizing(false);
    }
  };

  // Filter journals
  const filteredJournals = journals.filter(j => 
    j.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (j.ai_summary && j.ai_summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 overflow-hidden">
      {/* Left pane: archive list */}
      <div className="w-full lg:w-72 flex flex-col gap-4 border-r border-white/5 pr-0 lg:pr-6 shrink-0 h-60 lg:h-full">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200">Journal Archives</h2>
          <button
            onClick={handleStartCreate}
            className="p-1.5 rounded-xl glass-panel-light hover:bg-white/5 border border-white/5 text-mood-accent hover:text-white transition-colors cursor-pointer"
            title="Write New Entry"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Archive items scroll */}
        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
          {filteredJournals.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">No journal logs.</div>
          ) : (
            filteredJournals.map((j) => {
              const active = selectedJournal?.id === j.id;
              const formattedDate = new Date(j.created_at).toLocaleDateString([], { 
                month: 'short', 
                day: 'numeric' 
              });
              return (
                <div
                  key={j.id}
                  onClick={() => handleSelectJournal(j)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    active
                      ? "bg-slate-100/10 border-white/5 text-white"
                      : "glass-panel border-transparent text-slate-400 hover:text-slate-200 hover:border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formattedDate}
                    </span>
                    <span className="text-sm">
                      {moodEmojis[j.mood_tag as MoodType] || "😌"}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold mt-2 truncate text-slate-200">
                    {j.type === "gratitude" ? "Gratitude Entry" : "Daily Reflection"}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {j.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right pane: writing execution / reflection detail */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {isCreating ? (
          // Writer Panel
          <div className="flex-1 flex flex-col justify-between overflow-hidden h-full space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-200">New Journal Reflection</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Let your thoughts flow freely without critique.</p>
              </div>

              {/* Action type */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditorType("daily")}
                  className={`h-8 px-3 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                    editorType === "daily"
                      ? "bg-slate-100/10 border-white/5 text-white"
                      : "bg-slate-900/60 border-transparent text-slate-400"
                  }`}
                >
                  Daily Entry
                </button>
                <button
                  onClick={() => setEditorType("gratitude")}
                  className={`h-8 px-3 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                    editorType === "gratitude"
                      ? "bg-slate-100/10 border-white/5 text-white"
                      : "bg-slate-900/60 border-transparent text-slate-400"
                  }`}
                >
                  Gratitude Log
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Mood selector for this journal entry */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 shrink-0">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Log your entry mood</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(moodEmojis) as MoodType[]).map((m) => {
                  const active = editorMood === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setEditorMood(m)}
                      className={`h-9 px-3 rounded-xl border text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                        active
                          ? "bg-mood-accent/20 border-mood-accent text-white"
                          : "glass-panel border-white/5 text-slate-300 hover:border-white/10"
                      }`}
                    >
                      <span>{moodEmojis[m]}</span>
                      <span className="text-[10px] font-semibold">{moodLabels[m]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Textarea */}
            <div className="flex-1 min-h-[150px] relative">
              <textarea
                placeholder={
                  editorType === "gratitude"
                    ? "List 3 things you are grateful for today, no matter how small..."
                    : "Write down whatever is on your mind. How are you feeling? What caused it?"
                }
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="w-full h-full p-4 rounded-3xl glass-input text-xs font-medium resize-none leading-relaxed"
              />
            </div>

            {/* Footer actions */}
            <div className="flex justify-end gap-3 pt-2 shrink-0">
              <button
                onClick={() => handleSelectJournal(journals[0])}
                className="h-10 px-4 rounded-2xl glass-panel border border-white/5 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveJournal}
                className="h-10 px-5 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 text-xs font-semibold transition-all flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Commit to Journal
              </button>
            </div>
          </div>
        ) : selectedJournal ? (
          // Read & AI Reflection Detail Panel
          <div className="flex-1 flex flex-col justify-between overflow-hidden h-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(selectedJournal.created_at).toLocaleDateString([], { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <h3 className="text-sm font-bold text-slate-200 mt-1">
                  {selectedJournal.type === "gratitude" ? "Gratitude Reflection" : "Daily Reflection Journal"}
                </h3>
              </div>
              <span className="text-2xl px-3 py-1.5 rounded-2xl glass-panel border border-white/5">
                {moodEmojis[selectedJournal.mood_tag as MoodType] || "😌"}
              </span>
            </div>

            {/* Content and AI side-by-side or stacked scrollable */}
            <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar pb-6 pr-1">
              {/* User Content Card */}
              <div className="p-5 rounded-3xl glass-panel border border-white/5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Your writing</h4>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedJournal.content}
                </p>
              </div>

              {/* AI Summary & Cognitive distortions block */}
              {isSummarizing ? (
                // Skeletons
                <div className="p-5 rounded-3xl glass-panel border border-white/10 bg-white/5 space-y-4 animate-pulse">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-mood-accent animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-mood-accent">AI Reflection processing...</span>
                  </div>
                  <div className="h-4 bg-white/5 rounded-full w-3/4" />
                  <div className="h-4 bg-white/5 rounded-full w-5/6" />
                </div>
              ) : selectedJournal.ai_summary ? (
                // Summaries
                <div className="p-5 rounded-3xl glass-panel border border-white/10 bg-slate-900/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-mood-accent transition-colors duration-[2500ms]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-mood-accent transition-colors duration-[2500ms]">AI Reflection Summary</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Analyzed
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {selectedJournal.ai_summary}
                  </p>

                  {/* Cognitive Distortions Tag List */}
                  {selectedJournal.cognitive_distortions && (
                    <div className="pt-4 border-t border-white/5 space-y-2">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cognitive Distortions Identified</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJournal.cognitive_distortions.map((d) => (
                          <span 
                            key={d} 
                            className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-300 uppercase tracking-wide"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 rounded-3xl glass-panel border border-white/5 text-center text-xs text-slate-500">
                  No reflections generated. Write a new entry to review AI metrics.
                </div>
              )}
            </div>
          </div>
        ) : (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <BookOpen className="w-12 h-12 text-slate-600 animate-float" />
            <div className="space-y-1 max-w-xs">
              <h3 className="text-sm font-bold text-slate-200">Express Your Mind</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Archive your daily reflections or log gratitude moments. Click the '+' button at the left panel to begin.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
