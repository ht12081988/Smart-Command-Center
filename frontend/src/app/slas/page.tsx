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


// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResolutionFollowUpPage() {
  const [cases, setCases]               = useState<Case[]>(MOCK_CASES);
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  const [filterLabel, setFilterLabel]   = useState<"All" | SlaLabel>("All");

  // Drawers
  const [logDrawerCase, setLogDrawerCase]   = useState<Case | null>(null);
  const [viewingCase, setViewingCase]       = useState<Case | null>(null);


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

            <div className="bg-gradient-to-br from-red-600 to-red-800 p-5 rounded-2xl border border-red-500/30 text-white shadow-xl shadow-red-900/20 relative overflow-hidden">
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

            <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-5 rounded-2xl border border-orange-400/30 text-white shadow-xl shadow-orange-900/20 relative overflow-hidden">
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

            <div className="bg-gradient-to-br from-card to-background p-5 rounded-2xl border border-border-warm shadow-xl shadow-black/5 relative overflow-hidden">
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

            <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-5 rounded-2xl border border-green-200 shadow-xl shadow-green-900/5 relative overflow-hidden">
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

          {/* ── Master Table ──────────────────────────────────────────────── */}
          <div className="bg-background rounded-2xl border border-border-warm shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border-warm bg-foreground/[0.02] flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-widest">Externally Assigned Cases</h2>
              <div className="flex gap-1.5">
                {(["All", "Breached", "At Risk", "On Track", "Completed"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterLabel(f)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      filterLabel === f
                        ? f === "Breached"    ? "bg-red-600 text-white"
                          : f === "At Risk"   ? "bg-orange-500 text-white"
                          : f === "Completed" ? "bg-green-600 text-white"
                          : "bg-foreground text-background"
                        : "bg-card border border-border-warm text-foreground/50 hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
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
          </div>

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
