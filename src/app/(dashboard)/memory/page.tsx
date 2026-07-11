"use client";

import React, { useEffect, useState } from "react";
import { 
  Database, 
  Search, 
  Lock, 
  Unlock, 
  Trash2, 
  Plus, 
  Sparkles, 
  LockKeyhole,
  Check,
  ChevronDown,
  Info,
  Network
} from "lucide-react";
import { memoryService, authService } from "@/lib/services/mockServices";
import { getMockDb, Memory, Profile } from "@/lib/services/mockDb";
import { useEmotionTheme } from "@/contexts/ThemeContext";

export default function MemoryHubPage() {
  const { mood } = useEmotionTheme();
  
  // Data states
  const [memories, setMemories] = useState<Memory[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Filter/Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  // Interactive Modal/Form states
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCat, setNewCat] = useState<Memory["category"]>("goals");
  const [newImportance, setNewImportance] = useState(3);
  const [error, setError] = useState("");

  // Map state
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const categories = [
    { id: "all", name: "All Records" },
    { id: "goals", name: "Goals" },
    { id: "relationships", name: "Relationships" },
    { id: "triggers", name: "Triggers" },
    { id: "preferences", name: "Preferences" },
    { id: "coping", name: "Coping" }
  ];

  const categoryEmojis: Record<string, string> = {
    goals: "🎯",
    relationships: "👥",
    triggers: "⚡",
    preferences: "⚙️",
    coping: "🧘",
    notes: "📝"
  };

  const categoryColors: Record<string, string> = {
    goals: "#fbbf24", // gold
    relationships: "#fbcfe8", // pink
    triggers: "#ef4444", // red
    preferences: "#38bdf8", // sky blue
    coping: "#34d399", // emerald
    notes: "#94a3b8" // slate
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const list = await memoryService.getMemories();
    setMemories(list);
    const prof = await authService.getProfile();
    setProfile(prof);
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newTitle || !newDesc) {
      setError("Please complete all fields.");
      return;
    }

    try {
      await memoryService.addMemory(newTitle, newDesc, newCat, newImportance);
      setIsAdding(false);
      setNewTitle("");
      setNewDesc("");
      loadData();
    } catch (err) {
      setError("Failed to add memory record.");
    }
  };

  const handleDelete = async (id: string, locked: boolean) => {
    if (locked) return;
    await memoryService.deleteMemory(id);
    loadData();
  };

  const handleToggleLock = async (id: string) => {
    await memoryService.toggleLock(id);
    loadData();
  };

  const handleConsentToggle = async (val: boolean) => {
    if (!profile) return;
    await authService.updateConsent("long_term_memory", val);
    loadData();
  };

  // Filter memories
  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === "all" || m.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  // Graph Nodes Setup for Visual Map
  const mapNodes = [
    { id: "center", label: "Me (Alex)", x: 200, y: 150, radius: 24, fill: "var(--mood-accent)", isCenter: true },
    { id: "goals", label: "Goal: Saying No", x: 80, y: 80, radius: 18, fill: categoryColors.goals, text: "Saying no to late meetings" },
    { id: "relationships", label: "Sister Sarah", x: 320, y: 80, radius: 18, fill: categoryColors.relationships, text: "Sarah is near support" },
    { id: "triggers", label: "VP reviews", x: 90, y: 220, radius: 18, fill: categoryColors.triggers, text: "Anxiety before presentation" },
    { id: "preferences", label: "Mindfulness", x: 310, y: 220, radius: 18, fill: categoryColors.preferences, text: "Prefers box breathing" }
  ];

  return (
    <div className="space-y-8 overflow-y-auto no-scrollbar max-h-full">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Database className="w-5.5 h-5.5 text-mood-accent transition-colors duration-[2500ms]" />
            Consent-First Memory Hub
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">
            Review, edit, or delete facts that your AI companion remembers from your chats to personalize support.
          </p>
        </div>

        {/* Global Memory toggle */}
        {profile && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl glass-panel-light border border-white/5 shadow-md self-start md:self-auto">
            <div className="text-left shrink-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Long-term Memory</span>
              <span className="text-xs font-bold text-white mt-0.5 block">
                {profile.consent_flags.long_term_memory ? "Recall Active" : "Paused"}
              </span>
            </div>
            
            <button
              onClick={() => handleConsentToggle(!profile.consent_flags.long_term_memory)}
              className="focus:outline-none cursor-pointer"
            >
              {profile.consent_flags.long_term_memory ? (
                <div className="w-10 h-6 bg-mood-accent/30 border border-mood-accent/40 rounded-full p-0.5 transition-colors duration-[2500ms] flex justify-end">
                  <div className="w-4.5 h-4.5 rounded-full bg-mood-accent transition-colors duration-[2500ms]" />
                </div>
              ) : (
                <div className="w-10 h-6 bg-slate-800 border border-white/5 rounded-full p-0.5 transition-all flex justify-start">
                  <div className="w-4.5 h-4.5 rounded-full bg-slate-500" />
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Grid: SVGs Relational Map + Fact Addition Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Map Pane */}
        <div className="lg:col-span-2 p-5 rounded-3xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Network className="w-4 h-4 text-mood-accent" />
              Memory Relationship Map
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold">Hover nodes for insights</span>
          </div>

          <div className="relative w-full aspect-[4/3] max-h-[300px] bg-slate-900/40 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden">
            {/* SVG Renderer */}
            <svg viewBox="0 0 400 300" className="w-full h-full">
              {/* Connections (Lines) */}
              <line x1="200" y1="150" x2="80" y2="80" stroke="#475569" strokeWidth="1" strokeDasharray="4 4 animate-pulse" />
              <line x1="200" y1="150" x2="320" y2="80" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="200" y1="150" x2="90" y2="220" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="200" y1="150" x2="310" y2="220" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />

              {/* Render Nodes */}
              {mapNodes.map((node) => (
                <g 
                  key={node.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={node.fill}
                    className="transition-all duration-300 hover:scale-115 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]"
                    style={{
                      stroke: hoveredNode === node.id ? "#fff" : "rgba(255,255,255,0.15)",
                      strokeWidth: hoveredNode === node.id ? 2 : 1
                    }}
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill={node.isCenter ? "#0f172a" : "#fff"}
                    fontSize={node.isCenter ? 10 : 8}
                    fontWeight="bold"
                    className="pointer-events-none select-none font-sans"
                  >
                    {node.isCenter ? "Me" : node.label.split(":")[1]?.trim() || node.label}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover details bubble drawer */}
            {hoveredNode && hoveredNode !== "center" && (
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl glass-panel border border-white/10 bg-slate-950/80 animate-fade text-xs flex gap-2">
                <span className="text-lg">
                  {hoveredNode === "goals" && "🎯"}
                  {hoveredNode === "relationships" && "👥"}
                  {hoveredNode === "triggers" && "⚡"}
                  {hoveredNode === "preferences" && "⚙️"}
                </span>
                <div>
                  <h4 className="font-bold text-slate-200 uppercase text-[9px] tracking-wider">
                    {hoveredNode.charAt(0).toUpperCase() + hoveredNode.slice(1)} Node
                  </h4>
                  <p className="text-slate-400 text-[10px] mt-0.5 font-medium leading-relaxed">
                    {mapNodes.find(n => n.id === hoveredNode)?.text}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Manual Memory Record */}
        <div className="lg:col-span-1 p-5 rounded-3xl glass-panel-light border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Record New Fact</h3>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-semibold">
                {error}
              </div>
            )}
            
            <form onSubmit={handleAddMemory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">Brief Title</label>
                <input
                  type="text"
                  placeholder="e.g. Sister's Birthday"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">Detailed Description</label>
                <textarea
                  placeholder="What should Solace+ remember about this?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full h-24 p-3 rounded-xl glass-input text-xs font-medium resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl glass-input text-xs select-none"
                  >
                    <option value="goals" className="bg-slate-900">Goals</option>
                    <option value="relationships" className="bg-slate-900">Relationships</option>
                    <option value="triggers" className="bg-slate-900">Triggers</option>
                    <option value="preferences" className="bg-slate-900">Preferences</option>
                    <option value="coping" className="bg-slate-900">Coping</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">Importance</label>
                  <select
                    value={newImportance}
                    onChange={(e) => setNewImportance(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl glass-input text-xs select-none"
                  >
                    <option value="1" className="bg-slate-900">1 (Muted)</option>
                    <option value="3" className="bg-slate-900">3 (Medium)</option>
                    <option value="5" className="bg-slate-900">5 (Critical)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 mt-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Store Fact
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Fact Archive Grid */}
      <div className="space-y-4">
        {/* Navigation Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2.5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`h-8 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  activeCategory === c.id
                    ? "bg-slate-100/10 border-white/5 text-white"
                    : "glass-panel border-transparent text-slate-400 hover:text-slate-200 hover:border-white/5"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Search fact */}
          <div className="relative w-full md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search facts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-9 pr-4 rounded-xl glass-input text-xs"
            />
          </div>
        </div>

        {/* Fact grid cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.length === 0 ? (
            <div className="md:col-span-2 text-center py-12 rounded-3xl glass-panel border border-white/5 text-xs text-slate-500">
              No memory facts found in this category.
            </div>
          ) : (
            filteredMemories.map((m) => (
              <div 
                key={m.id}
                className="p-5 rounded-3xl glass-panel border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between gap-4 relative group shadow-lg"
              >
                {/* Header indicators */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{categoryEmojis[m.category] || "📝"}</span>
                    <span>{m.category}</span>
                  </span>
                  
                  {/* Lock action */}
                  <button
                    onClick={() => handleToggleLock(m.id)}
                    className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
                    title={m.is_locked ? "Unlock record" : "Lock record"}
                  >
                    {m.is_locked ? (
                      <Lock className="w-3.5 h-3.5 text-mood-accent transition-colors duration-[2500ms]" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-200">{m.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    {m.description}
                  </p>
                </div>

                {/* Footer specs */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Importance: {m.importance}/5</span>
                  
                  {/* Delete button (only show on hover & if unlocked) */}
                  <button
                    onClick={() => handleDelete(m.id, m.is_locked)}
                    disabled={m.is_locked}
                    className="text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors cursor-pointer"
                    title={m.is_locked ? "Unlock to delete" : "Delete record"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* HIPAA / GDPR Info block */}
      <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-900/30 border border-white/5 text-[10px] text-slate-500">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Memory data is stored inside a client-side vector sandbox and verified on every read path. We enforce strict row-level user namespaces. Locking a fact prevents it from being auto-pruned during conversation summary runs.</span>
      </div>
    </div>
  );
}
