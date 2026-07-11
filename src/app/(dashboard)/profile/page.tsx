"use client";

import React, { useEffect, useState } from "react";
import { 
  User, 
  Lock, 
  Save, 
  Compass, 
  Info,
  CalendarCheck
} from "lucide-react";
import { authService } from "@/lib/services/mockServices";
import { Profile } from "@/lib/services/mockDb";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Input fields
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [occupation, setOccupation] = useState("");
  const [language, setLanguage] = useState("English");
  
  // Emergency contacts
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const p = await authService.getProfile();
    setProfile(p);
    setName(p.name);
    setNickname(p.nickname);
    setPronouns(p.pronouns);
    setOccupation(p.occupation);
    setLanguage(p.language);
    setEmergencyName(p.emergency_contact?.name || "");
    setEmergencyRelationship(p.emergency_contact?.relationship || "");
    setEmergencyPhone(p.emergency_contact?.phone || "");
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name) {
      setError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      await authService.updateProfile({
        name,
        nickname,
        pronouns,
        occupation,
        language,
        emergency_contact: {
          name: emergencyName,
          relationship: emergencyRelationship,
          phone: emergencyPhone,
          consent: true
        }
      });
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      loadProfile();
    } catch (err) {
      setError("Failed to save profile changes.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <div className="w-10 h-10 border-2 border-mood-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 overflow-y-auto no-scrollbar max-h-full">
      {/* Header title */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <User className="w-5.5 h-5.5 text-mood-accent transition-colors duration-[2500ms]" />
          Your Profile Space
        </h1>
        <p className="text-slate-400 text-xs mt-1.5 font-medium">
          Edit your profile identifiers, pronouns, and emergency contact details.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
          Changes saved successfully.
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Identifiers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Compass className="w-4.5 h-4.5 text-mood-accent" />
              General Identifiers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">Pronouns</label>
                <input
                  type="text"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">Occupation</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">Language</label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section: Emergency Contacts Contact */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CalendarCheck className="w-4.5 h-4.5 text-mood-accent" />
                Emergency Escalation Contact
              </h3>
              {/* Field level encryption indicators */}
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                AES-256 Encrypted
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">Relationship</label>
                <input
                  type="text"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">Phone number</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl glass-input text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Summaries info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-white/5 flex flex-col justify-between h-full shadow-xl">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Wellness Goals Summary</h3>
              {profile && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {profile.goals.map((goal, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-bold text-slate-300 uppercase tracking-wide"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/5 mt-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full h-11 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Footnote */}
      <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-900/30 border border-white/5 text-[10px] text-slate-500">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Gated profile fields and emergency contacts are encrypted before storage. Audit logs track whenever your emergency contact detail is referenced in crisis detection flows.</span>
      </div>
    </div>
  );
}
