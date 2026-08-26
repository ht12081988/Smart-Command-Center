"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Sidebar } from "../../../components/Sidebar";
import { ExecutiveNav } from "../../../components/ExecutiveNav";
import { MOCK_CASES } from "../../cases/page";

// ─── Entity analytics helpers ─────────────────────────────────────────────────
const entities = [...new Set(MOCK_CASES.map(c => c.externalEntity).filter(e => e && e !== "TBD"))];

function getEntityStats(entity: string) {
  const cases = MOCK_CASES.filter(c => c.externalEntity === entity);
  const total  = cases.length;
  const overdue = cases.filter(c => c.slaHours !== undefined && c.slaHours < 0).length;
  const onTime  = cases.filter(c => c.slaHours === undefined || c.slaHours >= 0).length;
  const compliance = total > 0 ? Math.round((onTime / total) * 100) : 100;
  const avgResponse = total > 0 ? `${(Math.random() * 4 + 1).toFixed(1)}d` : "—"; // mock
  const rating: "Good" | "At Risk" | "Poor" =
    compliance >= 80 ? "Good" : compliance >= 50 ? "At Risk" : "Poor";
  return { total, overdue, onTime, compliance, avgResponse, rating, cases };
}

const RATING_STYLES = {
  Good:    { pill: "text-green-600 bg-green-50 border-green-200", bar: "bg-green-500" },
  "At Risk": { pill: "text-orange-600 bg-orange-50 border-orange-200", bar: "bg-orange-400" },
  Poor:    { pill: "text-red-600 bg-red-50 border-red-200",    bar: "bg-red-500" },
};

export default function EntityScorecardPage() {
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"compliance" | "overdue" | "total">("compliance");

  const entityStats = entities.map(e => ({ entity: e, ...getEntityStats(e) }));
  const sorted = [...entityStats].sort((a, b) => {
    if (sortBy === "compliance") return b.compliance - a.compliance;
    if (sortBy === "overdue") return b.overdue - a.overdue;
    return b.total - a.total;
  });

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-gold/30">
      <Sidebar activeItem="Executive Command Center" />

      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        <header className="shrink-0 z-30 bg-background/80 backdrop-blur-md border-b border-border-warm px-8 py-5">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Entity Performance Scorecard
          </h1>
          <p className="text-sm text-foreground/60 mt-1">SLA compliance rankings across all external government authorities.</p>
        </header>

        <ExecutiveNav />

        <main className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Summary Strip */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Entities Tracked", value: entities.length, color: "text-foreground" },
              { label: "Total Cases Assigned", value: MOCK_CASES.filter(c => c.externalEntity && c.externalEntity !== "TBD").length, color: "text-foreground" },
              { label: "SLA Breaches", value: MOCK_CASES.filter(c => c.slaHours !== undefined && c.slaHours < 0).length, color: "text-red-600" },
              { label: "Avg. Compliance", value: `${Math.round(entityStats.reduce((s, e) => s + e.compliance, 0) / Math.max(entityStats.length, 1))}%`, color: "text-green-600" },
            ].map(card => (
              <div key={card.label} className="bg-card border border-border-warm rounded-2xl p-4 shadow-sm text-center">
                <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold">Sort by:</span>
            {(["compliance", "overdue", "total"] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  sortBy === s ? "bg-gold border-gold text-white" : "bg-card border-border-warm text-foreground/50 hover:border-gold/50"
                }`}
              >
                {s === "compliance" ? "SLA Compliance" : s === "overdue" ? "Overdue Cases" : "Total Cases"}
              </button>
            ))}
          </div>

          {/* Scorecard Table */}
          <div className="bg-card border border-border-warm rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-warm bg-foreground/[0.02]">
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Entity</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Cases</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Overdue</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Avg. Response</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-foreground/40 uppercase tracking-widest w-48">SLA Compliance</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Rating</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row, i) => {
                    const rs = RATING_STYLES[row.rating];
                    const isExpanded = expandedEntity === row.entity;
                    return (
                      <React.Fragment key={row.entity}>
                        <motion.tr
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-border-warm/50 hover:bg-foreground/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="font-bold text-foreground">{row.entity}</p>
                            <p className="text-[10px] text-foreground/40 mt-0.5">Government Authority</p>
                          </td>
                          <td className="px-4 py-4 text-center font-bold text-foreground">{row.total}</td>
                          <td className="px-4 py-4 text-center">
                            <span className={`font-bold ${row.overdue > 0 ? "text-red-600" : "text-foreground/40"}`}>{row.overdue}</span>
                          </td>
                          <td className="px-4 py-4 text-center text-foreground/70 font-medium">{row.avgResponse}</td>
                          <td className="px-6 py-4 w-48">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-foreground/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${row.compliance}%` }}
                                  transition={{ duration: 0.6, delay: i * 0.05 }}
                                  className={`h-full rounded-full ${rs.bar}`}
                                />
                              </div>
                              <span className="text-[11px] font-black text-foreground/70 w-10 text-right">{row.compliance}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${rs.pill}`}>{row.rating}</span>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => setExpandedEntity(isExpanded ? null : row.entity)}
                              className="text-[10px] text-gold hover:underline font-bold uppercase tracking-widest whitespace-nowrap"
                            >
                              {isExpanded ? "Collapse ↑" : "Details ↓"}
                            </button>
                          </td>
                        </motion.tr>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              key="expanded"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <td colSpan={7} className="px-6 py-4 bg-foreground/[0.015] border-b border-border-warm">
                                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-3">Open Cases for {row.entity}</p>
                                <div className="grid grid-cols-3 gap-3">
                                  {row.cases.filter(c => c.status !== "Resolved" && c.status !== "Closed").length === 0
                                    ? <p className="text-xs text-foreground/40 col-span-3 text-center py-2">No open cases.</p>
                                    : row.cases.filter(c => c.status !== "Resolved" && c.status !== "Closed").map(c => (
                                    <Link key={c.id} href={`/cases?id=${c.id}`} className="block p-3 bg-background border border-border-warm rounded-xl hover:border-gold/50 transition-colors group">
                                      <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-black text-gold">{c.id}</span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                          c.slaHours !== undefined && c.slaHours < 0
                                            ? "text-red-600 bg-red-50 border-red-200"
                                            : "text-foreground/40 bg-foreground/5 border-border-warm"
                                        }`}>{c.slaHours !== undefined && c.slaHours < 0 ? "BREACHED" : c.status}</span>
                                      </div>
                                      <p className="text-xs text-foreground/80 line-clamp-2 group-hover:text-foreground transition-colors">{c.summary}</p>
                                      <p className="text-[9px] text-foreground/40 mt-1">{c.primaryClassification} · {c.region}</p>
                                    </Link>
                                  ))}
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
