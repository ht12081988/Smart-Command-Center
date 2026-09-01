"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { PortalHeader } from "../../components/PortalHeader";
import { Pagination } from "../../components/Pagination";
import { Case, CaseDetailWorkspace, MOCK_CASES } from "../cases/page";

import { LogCommunicationDrawer, CommType, CommDirection, CommunicationLog, COMM_ICONS } from "../../components/LogCommunicationDrawer";

type SlaLabel = "Breached" | "At Risk" | "On Track" | "Completed";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getSlaStatus(c: Case): { label: SlaLabel } {
  if (c.status === "Resolved" || c.status === "Closed") return { label: "Completed" };
  if (c.slaHours === undefined) return { label: "On Track" };
  if (c.slaHours < 0) return { label: "Breached" };
  if (c.slaHours <= 24) return { label: "At Risk" };
  return { label: "On Track" };
}

const SLA_BADGE: Record<SlaLabel, string> = {
  Breached:   "bg-red-50 text-red-700 border border-red-200",
  "At Risk":  "bg-orange-50 text-orange-700 border border-orange-200",
  "On Track": "bg-blue-50 text-blue-700 border border-blue-200",
  Completed:  "bg-green-50 text-green-700 border border-green-200",
};


const SLA_KANBAN_COLUMNS: { id: SlaLabel; title: string; theme: { bg: string; headerText: string; badge: string } }[] = [
  {
    id: "Breached",
    title: "SLA Breached",
    theme: {
      bg: "bg-red-500/[0.02] border-red-500/15",
      headerText: "text-red-600 dark:text-red-400",
      badge: "bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse"
    }
  },
  {
    id: "At Risk",
    title: "At Risk",
    theme: {
      bg: "bg-orange-500/[0.02] border-orange-500/15",
      headerText: "text-orange-600 dark:text-orange-400",
      badge: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
    }
  },
  {
    id: "On Track",
    title: "On Track",
    theme: {
      bg: "bg-blue-500/[0.02] border-blue-500/15",
      headerText: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
    }
  },
  {
    id: "Completed",
    title: "Completed",
    theme: {
      bg: "bg-green-500/[0.02] border-green-500/15",
      headerText: "text-green-600 dark:text-green-400",
      badge: "bg-green-500/10 text-green-600 dark:text-green-400"
    }
  }
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResolutionFollowUpPage() {
  const [cases, setCases]               = useState<Case[]>(MOCK_CASES);
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  const [filterLabel, setFilterLabel]   = useState<"All" | SlaLabel>("All");
  const [viewMode, setViewMode]         = useState<"kanban" | "list">("kanban");

  // Drawers
  const [logDrawerCase, setLogDrawerCase]   = useState<Case | null>(null);
  const [viewingCase, setViewingCase]       = useState<Case | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetLabel: SlaLabel) => {
    e.preventDefault();
    const caseId = e.dataTransfer.getData("text/plain");
    if (!caseId) return;

    setCases(prev => prev.map(c => {
      if (c.id !== caseId) return c;
      if (targetLabel === "Completed") {
        return { ...c, status: "Resolved" };
      } else if (targetLabel === "Breached") {
        return { ...c, slaHours: -5, status: "Escalated" };
      } else if (targetLabel === "At Risk") {
        return { ...c, slaHours: 12 };
      } else {
        return { ...c, slaHours: 48 };
      }
    }));
  };


  // Only cases assigned to external entities
  const entityCases = cases.filter(
    c => c.externalEntity && c.externalEntity !== "TBD" && c.externalEntity !== "" && c.slaHours !== undefined
  );

  const breached  = entityCases.filter(c => getSlaStatus(c).label === "Breached");
  const atRisk    = entityCases.filter(c => getSlaStatus(c).label === "At Risk");
  const onTrack   = entityCases.filter(c => getSlaStatus(c).label === "On Track");
  const completed = entityCases.filter(c => getSlaStatus(c).label === "Completed");

  const filteredCases = entityCases
    .filter(c => filterLabel === "All" || getSlaStatus(c).label === filterLabel)
    .sort((a, b) => (a.slaHours ?? 999) - (b.slaHours ?? 999));

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterLabel]);

  const totalPages = Math.ceil(filteredCases.length / pageSize) || 1;
  const paginatedCases = filteredCases.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleLogCommunication = (newLog: CommunicationLog) => {
    if (!logDrawerCase) return;

    // Add to communications log
    setCommunications(prev => [newLog, ...prev]);

    // Also append to the case timeline so it shows in Case Management
    const timelineEvent = {
      id: `TL-${Date.now()}`,
      action: `${COMM_ICONS[newLog.type]} ${newLog.type} ${newLog.direction === "Outbound" ? "to" : "from"} ${newLog.contactPerson}`,
      actor: "Current Operator",
      date: newLog.date,
      comment: newLog.summary,
    };
    setCases(prev =>
      prev.map(c =>
        c.id === logDrawerCase.id
          ? { ...c, timeline: [...c.timeline, timelineEvent] }
          : c
      )
    );

    setLogDrawerCase(null);
  };

  const caseLogs = (caseId: string) => communications.filter(c => c.caseId === caseId);

  return (
    <div className="h-screen flex overflow-hidden bg-background text-foreground font-sans selection:bg-gold/30">
      <Sidebar activeItem="Resolution & Follow-up" />

      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">

        <PortalHeader
          title="Resolution & Follow-up Center"
          subtitle="Track externally-assigned cases, log communications, and manage SLA escalations."
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          {/* ── KPI Cards ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div 
              onClick={() => setFilterLabel(filterLabel === "Breached" ? "All" : "Breached")}
              className={`p-5 rounded-2xl text-white shadow-xl shadow-red-900/20 relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] ${filterLabel === "Breached" ? "bg-gradient-to-br from-red-500 to-red-700 ring-2 ring-red-400 ring-offset-2 ring-offset-background" : "bg-gradient-to-br from-red-600 to-red-800 border border-red-500/30 opacity-90"}`}
            >
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-red-200 mb-1">SLA Breached</p>
                  <h3 className="text-3xl font-black">{breached.length}</h3>
                </div>
                <div className="p-2 bg-red-900/40 rounded-xl">
                  <svg className="w-5 h-5 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setFilterLabel(filterLabel === "At Risk" ? "All" : "At Risk")}
              className={`p-5 rounded-2xl text-white shadow-xl shadow-orange-900/20 relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] ${filterLabel === "At Risk" ? "bg-gradient-to-br from-orange-400 to-orange-600 ring-2 ring-orange-400 ring-offset-2 ring-offset-background" : "bg-gradient-to-br from-orange-500 to-orange-700 border border-orange-400/30 opacity-90"}`}
            >
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-orange-100 mb-1">At Risk</p>
                  <h3 className="text-3xl font-black">{atRisk.length}</h3>
                </div>
                <div className="p-2 bg-orange-900/40 rounded-xl">
                  <svg className="w-5 h-5 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setFilterLabel(filterLabel === "On Track" ? "All" : "On Track")}
              className={`p-5 rounded-2xl shadow-xl shadow-black/5 relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] ${filterLabel === "On Track" ? "bg-gradient-to-br from-card to-background ring-2 ring-gold ring-offset-2 ring-offset-background" : "bg-gradient-to-br from-card to-background border border-border-warm opacity-90"}`}
            >
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/50 mb-1">On Track</p>
                  <h3 className="text-3xl font-black text-foreground">{onTrack.length}</h3>
                </div>
                <div className="p-2 bg-foreground/[0.03] rounded-xl">
                  <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setFilterLabel(filterLabel === "Completed" ? "All" : "Completed")}
              className={`p-5 rounded-2xl shadow-xl shadow-green-900/5 relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] ${filterLabel === "Completed" ? "bg-gradient-to-br from-green-50 to-green-100/50 ring-2 ring-green-500 ring-offset-2 ring-offset-background" : "bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 opacity-90"}`}
            >
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-green-700/60 mb-1">Completed</p>
                  <h3 className="text-3xl font-black text-green-800">{completed.length}</h3>
                </div>
                <div className="p-2 bg-green-200/50 rounded-xl">
                  <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

        {/* Controls Bar: Section Title + View Mode Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-widest">
            Externally Assigned Cases Workspace
          </h2>

          <div className="flex items-center gap-1 bg-card border border-border-warm rounded-xl p-1 shrink-0 shadow-2xs">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-foreground/50 hover:text-foreground"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === "list"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-foreground/50 hover:text-foreground"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              List View
            </button>
          </div>
        </div>

        {/* Main View: Kanban Board vs. List Data Table */}
        {viewMode === "kanban" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {SLA_KANBAN_COLUMNS.map(col => {
              const colCases = filteredCases.filter(c => getSlaStatus(c).label === col.id);
              return (
                <div 
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`p-4 rounded-2xl border flex flex-col gap-3 min-h-[460px] ${col.theme.bg}`}
                >
                  <div className="flex justify-between items-center border-b border-border-warm pb-2 shrink-0">
                    <span className={`font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${col.theme.headerText}`}>
                      {col.title}
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${col.theme.badge}`}>
                        {colCases.length}
                      </span>
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col gap-3 custom-kanban-scrollbar pr-1">
                    {colCases.length === 0 ? (
                      <div className="text-center py-16 text-foreground/30 text-[10px] font-bold uppercase tracking-wider border border-dashed border-border-warm/40 rounded-xl">
                        No Cases
                      </div>
                    ) : (
                      colCases.map(c => {
                        const sla = getSlaStatus(c);
                        const logs = caseLogs(c.id);
                        const isDone = sla.label === "Completed";

                        return (
                          <div 
                            key={c.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                            className="bg-card border border-border-warm rounded-xl p-4 transition-all flex flex-col gap-2.5 shadow-2xs hover:border-gold/50 hover:shadow-md cursor-grab active:cursor-grabbing group relative"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="font-bold text-xs text-primary-text-gold block mb-0.5">{c.id}</span>
                                <span className="text-[9px] text-foreground/50 uppercase tracking-widest font-bold">
                                  {c.feedSource}
                                </span>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider ${
                                  c.priority === "Critical" ? "bg-red-600 text-white border border-red-700 animate-pulse" :
                                  c.priority === "High"     ? "bg-orange-50 text-orange-700 border border-orange-200" :
                                  "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}>
                                  {c.priority}
                                </span>
                              </div>
                            </div>

                            <div className="text-xs text-foreground/90 font-medium leading-relaxed bg-background/50 p-2.5 rounded-lg border border-border-warm/40 line-clamp-2">
                              {c.summary}
                            </div>

                            <div className="border-t border-border-warm/40 pt-2 flex flex-col gap-1 text-[10px]">
                              <div className="flex justify-between items-center">
                                <span className="text-foreground/45 font-semibold">Citizen:</span>
                                <span className="font-bold text-foreground/85 truncate max-w-[130px]">{c.citizenName} ({c.citizenId})</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-foreground/45 font-semibold">External Entity:</span>
                                <span className="font-bold text-gold/90 truncate max-w-[140px]">{c.externalEntity}</span>
                              </div>
                              {c.entityDepartment && (
                                <div className="flex justify-between items-center">
                                  <span className="text-foreground/45 font-semibold">Department:</span>
                                  <span className="font-bold text-foreground/75">{c.entityDepartment}</span>
                                </div>
                              )}
                              {c.liaisonOfficer && (
                                <div className="flex justify-between items-center">
                                  <span className="text-foreground/45 font-semibold">Liaison Officer:</span>
                                  <span className="font-bold text-gold/80">{c.liaisonOfficer}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-foreground/45 font-semibold">SLA Remaining:</span>
                                <span className={`font-mono text-[9.5px] font-bold ${
                                  sla.label === "Breached" ? "text-red-600" :
                                  sla.label === "At Risk" ? "text-orange-600" :
                                  "text-foreground/70"
                                }`}>
                                  {c.slaHours !== undefined ? `${c.slaHours}h remaining` : "N/A"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-border-warm/40 pt-2 mt-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  logs.length > 0 ? "bg-gold/20 text-gold" : "bg-foreground/5 text-foreground/30"
                                }`}>
                                  💬 {logs.length} Comms
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {!isDone && (
                                  <button
                                    onClick={() => setLogDrawerCase(c)}
                                    className="bg-gold hover:bg-gold-hover text-white px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                                  >
                                    Log Comm
                                  </button>
                                )}
                                <button
                                  onClick={() => setViewingCase(c)}
                                  className="bg-background border border-border-warm hover:border-gold text-foreground hover:text-gold px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  View Case
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Master Table */
          <div className="bg-background rounded-2xl border border-border-warm shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border-warm bg-foreground/[0.02] flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-widest">Externally Assigned Cases</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-foreground/[0.02] text-xs uppercase tracking-wider font-bold text-foreground/50">
                  <tr>
                    <th className="px-6 py-4 border-b border-border-warm">Case</th>
                    <th className="px-6 py-4 border-b border-border-warm">External Entity & Officer</th>
                    <th className="px-6 py-4 border-b border-border-warm text-center">Priority</th>
                    <th className="px-6 py-4 border-b border-border-warm text-center">SLA Status</th>
                    <th className="px-6 py-4 border-b border-border-warm text-center">Comms</th>
                    <th className="px-6 py-4 border-b border-border-warm text-center">Case Status</th>
                    <th className="px-6 py-4 border-b border-border-warm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-warm">
                  {filteredCases.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center text-foreground/30 font-bold uppercase tracking-widest text-xs">
                        No cases found for this filter.
                      </td>
                    </tr>
                  )}
                  {paginatedCases.map(c => {
                    const sla      = getSlaStatus(c);
                    const logs     = caseLogs(c.id);
                    const isDone   = sla.label === "Completed";

                    return (
                      <tr key={c.id} className={`hover:bg-foreground/[0.01] transition-colors ${sla.label === "Breached" ? "bg-red-50/30" : ""}`}>

                        {/* Case */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground">{c.id}</div>
                          <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-1">{c.feedSource}</div>
                          <div className="font-semibold text-foreground/80 text-xs">{c.citizenName}</div>
                          <div className="text-[10px] text-foreground/40 font-mono">{c.citizenId}</div>
                        </td>

                        {/* Entity */}
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground/80">{c.externalEntity}</div>
                          {c.entityDepartment && <div className="text-[10px] text-foreground/50 uppercase tracking-wide">{c.entityDepartment}</div>}
                          <div className="text-[10px] font-bold text-gold/80 mt-0.5">{c.liaisonOfficer}</div>
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            c.priority === "Critical" ? "bg-red-50 text-red-700 border border-red-200" :
                            c.priority === "High"     ? "bg-orange-50 text-orange-700 border border-orange-200" :
                            "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}>
                            {c.priority}
                          </span>
                        </td>

                        {/* SLA */}
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${SLA_BADGE[sla.label]}`}>
                            {sla.label}
                          </span>
                          {c.slaHours !== undefined && !isDone && (
                            <div className="text-[10px] font-mono text-foreground/50 mt-1">{c.slaHours}h remaining</div>
                          )}
                        </td>

                        {/* Comm Count */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                            logs.length > 0 ? "bg-gold/20 text-gold" : "bg-foreground/5 text-foreground/30"
                          }`}>
                            {logs.length}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            c.status === "Resolved" || c.status === "Closed"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : c.status === "Escalated"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : c.status === "Assigned"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-foreground/5 text-foreground/70 border border-border-warm"
                          }`}>
                            {c.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          {isDone ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setViewingCase(c)}
                                className="bg-background border border-border-warm hover:border-gold text-foreground hover:text-gold px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                              >
                                View Case
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setLogDrawerCase(c)}
                                className="bg-gold hover:bg-gold-light text-black px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm shadow-gold/20 whitespace-nowrap"
                              >
                                Log Comm
                              </button>
                              <button
                                onClick={() => setViewingCase(c)}
                                className="bg-background border border-border-warm hover:border-gold text-foreground hover:text-gold px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap"
                              >
                                View Case
                              </button>
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCases.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </div>
        )}

        </main>
      </div>

      {/* ── Log Communication Drawer ────────────────────────────────────────── */}
      {logDrawerCase && (
        <LogCommunicationDrawer
          caseRecord={logDrawerCase}
          previousLogs={caseLogs(logDrawerCase.id)}
          onClose={() => setLogDrawerCase(null)}
          onSave={handleLogCommunication}
        />
      )}


      {/* ── Case Detail Workspace (reuses Case Management component) ────────── */}
      {viewingCase && (
        <CaseDetailWorkspace
          activeCase={viewingCase}
          onClose={() => setViewingCase(null)}
          onUpdateCase={(updatedCase) => {
            setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
            if (viewingCase.id === updatedCase.id) setViewingCase(updatedCase);
          }}
          onUpdateStatus={(status, comment) => {
            const newEvent = {
              id: `TL-${Math.floor(Math.random() * 1000)}`,
              action: `Status changed to ${status}`,
              actor: "Current Operator",
              date: new Date().toLocaleString(),
              comment: comment || "No comment provided."
            };
            const updatedCase = { ...viewingCase, status, timeline: [...viewingCase.timeline, newEvent] };
            setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
            setViewingCase(updatedCase);
          }}
        />
      )}



    </div>
  );
}
