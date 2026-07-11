"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { AmbientBackground } from "@/components/theme-engine/AmbientBackground";
import { getMockDb, saveMockDb } from "@/lib/services/mockDb";

export default function AnonymousOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [consented, setConsented] = useState(true);

  const handleStart = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const db = getMockDb();
      db.isOnboarded = true; // Auto-onboard for anonymous session
      db.profile.name = "Anonymous Guest";
      db.profile.is_anonymous = true;
      db.profile.consent_flags.long_term_memory = consented;
      saveMockDb(db);
      router.push("/home");
    }, 1000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <AmbientBackground />

      <div className="w-full max-w-md rounded-3xl glass-panel border border-white/10 shadow-2xl p-8 relative z-20">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 shadow-lg mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">Anonymous Access</h1>
          <p className="text-sm text-slate-400 mt-2">
            Understand how your session data is managed before proceeding.
          </p>
        </div>

        {/* Core details */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs shrink-0 mt-0.5">1</div>
            <div>
              <h3 className="text-xs font-semibold text-slate-200">Local Temporary Storage</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Your chats and journal logs are stored solely in your browser's local cache. Clearing browser history will purge your data.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs shrink-0 mt-0.5">2</div>
            <div>
              <h3 className="text-xs font-semibold text-slate-200">No Multi-Device Sync</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Since there is no cloud account linked, you cannot access this session or its memory on another computer or phone.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs shrink-0 mt-0.5">3</div>
            <div>
              <h3 className="text-xs font-semibold text-slate-200">Upgradable Later</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                You can back up your journals and memories at any time by registering a secure email account in Settings.
              </p>
            </div>
          </div>
        </div>

        {/* Consent toggle */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 mb-6 flex items-start gap-3">
          <input
            id="anon-consent"
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="w-4 h-4 rounded border-white/10 bg-slate-950 text-mood-accent focus:ring-0 focus:ring-offset-0 mt-0.5 cursor-pointer"
          />
          <label htmlFor="anon-consent" className="text-xs text-slate-300 leading-normal cursor-pointer select-none">
            Enable **Consent-first Memory**. Allow Solace+ to locally extract facts from my messages to personalize conversations.
          </label>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
            ) : (
              <>
                Initialize Safe Session
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          
          <Link
            href="/login"
            className="w-full h-12 rounded-2xl glass-panel-light border border-white/10 hover:bg-white/5 text-sm font-semibold text-slate-300 transition-all flex items-center justify-center cursor-pointer"
          >
            Go Back to Sign In
          </Link>
        </div>

        {/* Privacy verification footer */}
        <div className="flex items-center gap-1.5 justify-center text-[9px] text-slate-500 mt-6 pt-4 border-t border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Your IP and device identities are hashed and anonymized.</span>
        </div>
      </div>
    </div>
  );
}
