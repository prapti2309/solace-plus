"use client";

import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  Clock, 
  BrainCircuit, 
  BarChart2, 
  AlertTriangle,
  Info
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { adminService } from "@/lib/services/mockServices";
import { getMockDb } from "@/lib/services/mockDb";

export default function AdminPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [safetyCount, setSafetyCount] = useState<any>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const met = await adminService.getMetrics();
    const sf = await adminService.getSafetyEventsCount();
    const fb = await adminService.getFeedbackTrends();
    
    // Supplement safety triggers count from local mock database safety events
    const db = getMockDb();
    const dbCount = db.safety_events.length;
    sf.total_triggers = Math.max(sf.total_triggers, dbCount);
    sf.by_severity.imminent = Math.max(sf.by_severity.imminent, db.safety_events.filter(e => e.severity === "imminent").length);

    setMetrics(met);
    setSafetyCount(sf);
    setFeedback(fb);
  };

  const getSafetyPieData = () => {
    if (!safetyCount) return [];
    return [
      { name: "Flagged (Low)", value: safetyCount.by_severity.flagged, color: "#3b82f6" },
      { name: "Elevated (Medium)", value: safetyCount.by_severity.elevated, color: "#f59e0b" },
      { name: "Imminent (High)", value: safetyCount.by_severity.imminent, color: "#ef4444" }
    ];
  };

  return (
    <div className="space-y-8 overflow-y-auto no-scrollbar max-h-full">
      {/* Header title */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5.5 h-5.5 text-mood-accent transition-colors duration-[2500ms]" />
          Admin Ops & Quality Metrics
        </h1>
        <p className="text-slate-400 text-xs mt-1.5 font-medium">
          Monitor anonymized system health parameters, aggregate crisis triggers, and view model alignment benchmarks.
        </p>
      </div>

      {metrics && safetyCount ? (
        <>
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl glass-panel border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Users className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Daily Active Users</span>
                <span className="text-lg font-extrabold text-white mt-0.5 block">{metrics.daily_active_users}</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl glass-panel border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                <Clock className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Average Latency</span>
                <span className="text-lg font-extrabold text-white mt-0.5 block">{metrics.avg_latency_ms} ms</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl glass-panel border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Activity className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Sessions</span>
                <span className="text-lg font-extrabold text-white mt-0.5 block">{metrics.active_sessions} nodes</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl glass-panel border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <BrainCircuit className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Sentiment Accuracy</span>
                <span className="text-lg font-extrabold text-white mt-0.5 block">{metrics.model_accuracy_sentiment}</span>
              </div>
            </div>
          </div>

          {/* Charts & Safety logs */}
          {mounted && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Feedback Bar Chart */}
              <div className="lg:col-span-2 p-5 rounded-3xl glass-panel border border-white/5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BarChart2 className="w-4.5 h-4.5 text-mood-accent" />
                  Satisfaction Metrics by module
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={feedback} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="category" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis domain={[0, 5]} stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="rating" fill="var(--mood-accent)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Safety triggers pie */}
              <div className="lg:col-span-1 p-5 rounded-3xl glass-panel border border-white/5 flex flex-col justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-400" />
                  Crisis Escalation Logs
                </h3>
                
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getSafetyPieData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {getSafetyPieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1 text-center pb-2">
                  <div className="text-2xl font-black text-white">{safetyCount.total_triggers}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Safety Incidents Flagged</div>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center border-t border-white/5 pt-3">
                  {getSafetyPieData().map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-[8px] font-bold text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span>{entry.name.split(" ")[0]}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center py-12 text-slate-400">
          <div className="w-8 h-8 border-2 border-mood-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* GDPR privacy disclaimer */}
      <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-900/30 border border-white/5 text-[10px] text-slate-500">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>In accordance with mental-health privacy guidelines and GDPR frameworks, this ops view does NOT expose any raw text transcripts, message payloads, journal content, or user identity logs. Safety events are logged using randomized UUID identifiers and severity scores only.</span>
      </div>
    </div>
  );
}
