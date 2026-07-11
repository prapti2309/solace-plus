"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  ShieldAlert, 
  Download, 
  Trash2, 
  Eye, 
  Accessibility, 
  Volume2, 
  VolumeX, 
  ChevronRight,
  Database,
  CheckCircle,
  FileText
} from "lucide-react";
import { useEmotionTheme } from "@/contexts/ThemeContext";
import { memoryService, authService } from "@/lib/services/mockServices";
import { getMockDb, ConsentLog } from "@/lib/services/mockDb";

export default function SettingsPage() {
  const router = useRouter();
  const { 
    reducedMotion, 
    setReducedMotion, 
    voiceEnabled, 
    setVoiceEnabled,
    activePersona,
    setActivePersona
  } = useEmotionTheme();

  // Settings states
  const [profileConsent, setProfileConsent] = useState(true);
  const [chatConsent, setChatConsent] = useState(true);
  const [moodConsent, setMoodConsent] = useState(true);
  const [journalConsent, setJournalConsent] = useState(true);
  const [memoryConsent, setMemoryConsent] = useState(true);
  const [auditLogs, setAuditLogs] = useState<ConsentLog[]>([]);

  // UI state
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const db = getMockDb();
    setProfileConsent(db.profile.consent_flags.profile);
    setChatConsent(db.profile.consent_flags.chat_history);
    setMoodConsent(db.profile.consent_flags.mood_tracking);
    setJournalConsent(db.profile.consent_flags.journal_summary);
    setMemoryConsent(db.profile.consent_flags.long_term_memory);
    setAuditLogs(db.consent_logs);
  };

  const handleToggleConsent = async (field: any, val: boolean, setter: any) => {
    setter(val);
    await authService.updateConsent(field, val);
    loadSettings();
  };

  const handleExportData = async () => {
    setIsExporting(true);
    setExportComplete(false);
    
    // Simulate query delay
    setTimeout(async () => {
      const dataStr = await memoryService.exportData();
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'solace-plus-export.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    }, 1000);
  };

  const handlePurgeAllData = async () => {
    setIsPurging(true);
    setTimeout(async () => {
      await memoryService.purgeAllData();
      setIsPurging(false);
      setShowPurgeModal(false);
      // Route back to register/onboarding
      router.push("/register");
    }, 1200);
  };

  return (
    <div className="space-y-8 overflow-y-auto no-scrollbar max-h-full relative">
      {/* Header title */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Settings className="w-5.5 h-5.5 text-mood-accent transition-colors duration-[2500ms]" />
          Privacy & Settings
        </h1>
        <p className="text-slate-400 text-xs mt-1.5 font-medium">
          Control your accessibility options, manage data sharing consents, or download your GDPR archival transcripts.
        </p>
      </div>

      {/* Main configurations scroll list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: UI Preferences & GDPR Downloads */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: UI Preferences */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Accessibility className="w-4.5 h-4.5 text-mood-accent" />
              UI & Accessibility
            </h3>
            
            <div className="space-y-4">
              {/* Reduced Motion Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Reduce Motion</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                    Disables drifting background gradient blobs and glowing orb expansion ripples.
                  </p>
                </div>
                <button
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className="focus:outline-none cursor-pointer"
                >
                  {reducedMotion ? (
                    <div className="w-10 h-6 bg-mood-accent/30 border border-mood-accent/40 rounded-full p-0.5 transition-colors duration-[2500ms] flex justify-end">
                      <div className="w-4.5 h-4.5 rounded-full bg-mood-accent transition-colors duration-[2500ms]" />
                    </div>
                  ) : (
                    <div className="w-10 h-6 bg-slate-800 border border-white/10 rounded-full p-0.5 transition-all flex justify-start">
                      <div className="w-4.5 h-4.5 rounded-full bg-slate-500" />
                    </div>
                  )}
                </button>
              </div>

              {/* Voice responses responses */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">AI Voice Responses</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                    Enables synthesis of warm, calm verbal feedback when AI replies in chat.
                  </p>
                </div>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className="focus:outline-none cursor-pointer"
                >
                  {voiceEnabled ? (
                    <div className="w-10 h-6 bg-mood-accent/30 border border-mood-accent/40 rounded-full p-0.5 transition-colors duration-[2500ms] flex justify-end">
                      <div className="w-4.5 h-4.5 rounded-full bg-mood-accent transition-colors duration-[2500ms]" />
                    </div>
                  ) : (
                    <div className="w-10 h-6 bg-slate-800 border border-white/10 rounded-full p-0.5 transition-all flex justify-start">
                      <div className="w-4.5 h-4.5 rounded-full bg-slate-500" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section: Data Portability & Deletion */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Database className="w-4.5 h-4.5 text-mood-accent" />
              GDPR Compliance Center
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Export Button */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Export All Data</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                    Download a full, readable JSON archive of your chats, profile goals, journal logs, and stored memories.
                  </p>
                </div>
                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="h-10 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/5 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isExporting ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : exportComplete ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Downloaded!
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download JSON
                    </>
                  )}
                </button>
              </div>

              {/* Purge Button */}
              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex flex-col justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-red-200">Purge Safe Space</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                    GDPR Right to be Forgotten. Permanently delete all local caches, reset onboarding states, and log out.
                  </p>
                </div>
                <button
                  onClick={() => setShowPurgeModal(true)}
                  className="h-10 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-red-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Consent Toggles & Audit Trail */}
        <div className="lg:col-span-1 space-y-6">
          {/* Section: Consent checklist */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Consent Settings</h3>
            
            <div className="space-y-3.5">
              {/* Profile details */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">Gated Profile details</span>
                <input
                  type="checkbox"
                  checked={profileConsent}
                  onChange={(e) => handleToggleConsent("profile", e.target.checked, setProfileConsent)}
                  className="w-4 h-4 rounded border-white/10 bg-slate-950 text-mood-accent focus:ring-0 cursor-pointer"
                />
              </div>
              {/* Chat histories */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">Save Chat History</span>
                <input
                  type="checkbox"
                  checked={chatConsent}
                  onChange={(e) => handleToggleConsent("chat_history", e.target.checked, setChatConsent)}
                  className="w-4 h-4 rounded border-white/10 bg-slate-950 text-mood-accent focus:ring-0 cursor-pointer"
                />
              </div>
              {/* Mood checks */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">Mood Logging History</span>
                <input
                  type="checkbox"
                  checked={moodConsent}
                  onChange={(e) => handleToggleConsent("mood_tracking", e.target.checked, setMoodConsent)}
                  className="w-4 h-4 rounded border-white/10 bg-slate-950 text-mood-accent focus:ring-0 cursor-pointer"
                />
              </div>
              {/* Journal summarizes */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">Journal AI reflection</span>
                <input
                  type="checkbox"
                  checked={journalConsent}
                  onChange={(e) => handleToggleConsent("journal_summary", e.target.checked, setJournalConsent)}
                  className="w-4 h-4 rounded border-white/10 bg-slate-950 text-mood-accent focus:ring-0 cursor-pointer"
                />
              </div>
              {/* Memory facts */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">Long-term Memory recall</span>
                <input
                  type="checkbox"
                  checked={memoryConsent}
                  onChange={(e) => handleToggleConsent("long_term_memory", e.target.checked, setMemoryConsent)}
                  className="w-4 h-4 rounded border-white/10 bg-slate-950 text-mood-accent focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section: Consent Audit log */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4.5 h-4.5 text-mood-accent" />
              Consent Audit Logs
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
              {auditLogs.slice().reverse().map((log) => {
                const date = new Date(log.timestamp).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={log.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[9px] flex justify-between">
                    <div>
                      <span className="font-bold text-slate-200 block">{log.field_name}</span>
                      <span className="text-slate-500 block mt-0.5">{date}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md self-center font-extrabold ${log.action === "granted" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {log.action.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Delete/Purge Modal Overlay */}
      {showPurgeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-red-500/20 bg-slate-950 p-6 space-y-6">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert className="w-8 h-8" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Purge Verification Required</h3>
                <p className="text-[10px] text-red-300 font-medium">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              You are about to purge all local databases. This will delete all your conversations transcripts, stored facts (memories), journals reflection logs, and resetting your onboarding status.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPurgeModal(false)}
                disabled={isPurging}
                className="h-10 px-4 rounded-xl glass-panel border border-white/5 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeAllData}
                disabled={isPurging}
                className="h-10 px-5 rounded-xl bg-red-500 text-white hover:bg-red-600 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isPurging ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Purge All Cache
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
