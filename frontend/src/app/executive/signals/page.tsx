"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Sidebar } from "../../../components/Sidebar";
import { PortalHeader } from "../../../components/PortalHeader";
import { ExecutiveNav } from "../../../components/ExecutiveNav";
import { Pagination } from "../../../components/Pagination";
import { MOCK_CASES } from "../../cases/page";

// ─── Mocked AI Signal Clusters ────────────────────────────────────────────────
const SIGNAL_CLUSTERS = [
  {
    id: "SIG-001",
    level: "critical" as const,
    title: "Housing Allocation Denials — Central Region",
    description: "3 cases in Al Dhaid region report repeated housing allocation denials spanning 2–3 years with no official reasoning provided. Families have multiple dependents including disabled members.",
    caseCount: 3,
    dayRange: 180,
    entities: ["Sharjah Housing Department"],
    avgResolution: "No resolution yet",
    slaStatus: "Breached in all cases",
    relatedCases: MOCK_CASES.filter(c => c.primaryClassification === "Housing" && c.region === "Central Region (Al Dhaid)"),
  },
  {
    id: "SIG-002",
    level: "high" as const,
    title: "Medical Bill Accumulation — Multiple Entities",
    description: "4 cases in 90 days related to citizens unable to pay hospital bills. Combined debt exceeds AED 200,000. Cases span Sharjah City and Kalba. Common factor: SHA processing delays.",
    caseCount: 4,
    dayRange: 90,
    entities: ["Sharjah Health Authority"],
    avgResolution: "15.2 days",
    slaStatus: "SLA at risk",
    relatedCases: MOCK_CASES.filter(c => c.primaryClassification === "Health & Medical"),
  },
  {
    id: "SIG-003",
    level: "medium" as const,
    title: "Employment Support Requests — Post-Factory Closures",
    description: "2 new cases in Al Hamriyah linked to factory closures. Citizens are breadwinners with large families. Human Resources Department not yet engaged.",
    caseCount: 2,
    dayRange: 30,
    entities: ["Sharjah Human Resources Department"],
    avgResolution: "Pending",
    slaStatus: "Within SLA",
    relatedCases: MOCK_CASES.filter(c => c.primaryClassification === "Employment"),
  },
  {
    id: "SIG-004",
    level: "low" as const,
    title: "Government Service Delays — Licensing & Land Affairs",
    description: "2 cases experiencing bureaucratic delays in license renewals and land boundary surveys. Linked to SEDD and Sharjah Municipality respectively.",
    caseCount: 2,
    dayRange: 60,
    entities: ["SEDD", "Sharjah Municipality"],
    avgResolution: "TBD",
    slaStatus: "Mixed",
    relatedCases: MOCK_CASES.filter(c => c.primaryClassification === "Government Services"),
  },
];

const LEVEL_STYLES = {
  critical: {
    border: "border-red-500/30",
    bg: "bg-gradient-to-br from-red-950/30 to-red-900/10",
    badge: "text-red-400 bg-red-500/10 border border-red-500/20",
    icon: "text-red-400",
    dot: "bg-red-500",
    label: "🔴 CRITICAL SIGNAL",
  },
  high: {
    border: "border-orange-500/30",
    bg: "bg-gradient-to-br from-orange-950/20 to-orange-900/10",
    badge: "text-orange-400 bg-orange-500/10 border border-orange-500/20",
    icon: "text-orange-400",
    dot: "bg-orange-500",
    label: "🟠 HIGH SIGNAL",
  },
  medium: {
    border: "border-yellow-500/30",
    bg: "bg-gradient-to-br from-yellow-950/20 to-yellow-900/10",
    badge: "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20",
    icon: "text-yellow-400",
    dot: "bg-yellow-400",
    label: "🟡 MEDIUM SIGNAL",
  },
  low: {
    border: "border-blue-500/20",
    bg: "bg-gradient-to-br from-blue-950/10 to-card",
    badge: "text-blue-400 bg-blue-500/10 border border-blue-500/20",
    icon: "text-blue-400",
    dot: "bg-blue-400",
    label: "🔵 LOW SIGNAL",
  },
};

function AISignalsContent() {
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);

  const searchParams = useSearchParams();
  const dateFilter = searchParams.get("filter") || "Last Month";
  const customStart = searchParams.get("start") || "2026-08-01";
  const customEnd = searchParams.get("end") || "2026-08-27";

  const filterByDate = (dateStr?: string) => {
    if (!dateStr) return false;
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const itemDate = new Date(datePart);
    const targetDate = new Date("2026-08-27");

    switch (dateFilter) {
      case "Today":
        return datePart === "2026-08-27";
      case "Yesterday":
        return datePart === "2026-08-26";
      case "Last Week": {
        const diffTime = targetDate.getTime() - itemDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }
      case "Last Month": {
        const diffTime = targetDate.getTime() - itemDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 30;
      }
      case "Last 90 Days": {
        const diffTime = targetDate.getTime() - itemDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 90;
      }
      case "Date Range": {
        if (!customStart || !customEnd) return true;
        const start = new Date(customStart);
        const end = new Date(customEnd);
        return itemDate >= start && itemDate <= end;
      }
      default:
        return true;
    }
  };

  const filteredClusters = SIGNAL_CLUSTERS.map(cluster => {
    const related = cluster.relatedCases.filter(c => filterByDate(c.createdAt));
    return {
      ...cluster,
      caseCount: related.length,
      relatedCases: related
    };
  }).filter(cluster => cluster.caseCount > 0);

  const totalPages = Math.ceil(filteredClusters.length / pageSize) || 1;
  const paginatedSignals = filteredClusters.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="h-screen flex overflow-hidden bg-background text-foreground font-sans selection:bg-gold/30">
      <Sidebar activeItem="Executive Command Center" />

      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        <PortalHeader
          title="Root-Cause & Emerging Signal Intelligence"
          subtitle="AI-clustered case patterns flagging systemic service failures for leadership review."
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />

        <ExecutiveNav />

        <main className="flex-1 overflow-y-auto p-6 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            {paginatedSignals.map((signal, i) => {
              const styles = LEVEL_STYLES[signal.level];
              const isExpanded = expandedSignal === signal.id;
              return (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl border p-5 space-y-3 ${styles.border} ${styles.bg}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${styles.badge} px-2 py-0.5 rounded-full`}>
                        {styles.label}
                      </span>
                      <h3 className="text-sm font-bold text-foreground mt-2">{signal.title}</h3>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${styles.dot} animate-pulse`} />
                  </div>

                  {/* Description */}
                  <p className="text-xs text-foreground/70 leading-relaxed">{signal.description}</p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="bg-background/50 rounded-xl p-2.5 text-center border border-white/5">
                      <p className="text-xl font-black text-foreground">{signal.caseCount}</p>
                      <p className="text-[9px] text-foreground/40 uppercase tracking-widest">Cases</p>
                    </div>
                    <div className="bg-background/50 rounded-xl p-2.5 text-center border border-white/5">
                      <p className="text-xl font-black text-foreground">{signal.dayRange}d</p>
                      <p className="text-[9px] text-foreground/40 uppercase tracking-widest">Window</p>
                    </div>
                    <div className="bg-background/50 rounded-xl p-2.5 text-center border border-white/5">
                      <p className="text-xs font-black text-foreground leading-tight">{signal.avgResolution}</p>
                      <p className="text-[9px] text-foreground/40 uppercase tracking-widest mt-0.5">Avg. Res.</p>
                    </div>
                  </div>

                  {/* Entities */}
                  <div className="flex flex-wrap gap-1.5">
                    {signal.entities.map(e => (
                      <span key={e} className="text-[9px] font-bold text-foreground/60 bg-foreground/5 border border-border-warm px-2 py-0.5 rounded-full">{e}</span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setExpandedSignal(isExpanded ? null : signal.id)}
                      className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border border-border-warm bg-background/30 hover:border-gold/50 rounded-lg transition-colors text-foreground/70 hover:text-foreground"
                    >
                      {isExpanded ? "Hide Cases ↑" : "View Clustered Cases ↓"}
                    </button>
                    <Link
                      href="/directives"
                      className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest bg-gold/10 border border-gold/30 hover:bg-gold hover:text-white rounded-lg transition-all text-gold text-center"
                    >
                      Flag for Directive
                    </Link>
                  </div>

                  {/* Expanded Cases */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 border-t border-border-warm/30 space-y-2">
                          {signal.relatedCases.length === 0
                            ? <p className="text-xs text-foreground/40 text-center py-2">No matching cases in dataset.</p>
                            : signal.relatedCases.map(c => (
                            <Link key={c.id} href={`/cases?id=${c.id}`} className="block p-3 bg-background/40 border border-border-warm/50 rounded-xl hover:border-gold/50 transition-colors group">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black text-gold">{c.id}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                  c.slaHours !== undefined && c.slaHours < 0
                                    ? "text-red-400 bg-red-500/10 border-red-500/20"
                                    : "text-foreground/40 bg-foreground/5 border-border-warm"
                                }`}>{c.slaHours !== undefined && c.slaHours < 0 ? "BREACHED" : c.status}</span>
                              </div>
                              <p className="text-xs text-foreground/70 mt-1 line-clamp-1">{c.summary}</p>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredClusters.length}
            pageSize={pageSize}
            pageSizeOptions={[2, 4, 10]}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default function AISignalsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background text-foreground">Loading AI Signals...</div>}>
      <AISignalsContent />
    </Suspense>
  );
}
