"use client";

import React, { useState } from "react";
import { Case } from "../app/cases/page";

// ─── Types ────────────────────────────────────────────────────────────────────
export type CommType = "Phone Call" | "Email" | "WhatsApp" | "Formal Letter";
export type CommDirection = "Outbound" | "Inbound";

export interface CommunicationLog {
  id: string;
  caseId: string;
  type: CommType;
  direction: CommDirection;
  contactPerson: string;
  summary: string;
  outcome: string;
  date: string;
  loggedBy: string;
}

export const COMM_ICONS: Record<CommType, string> = {
  "Phone Call":     "📞",
  "Email":          "📧",
  "WhatsApp":       "💬",
  "Formal Letter":  "📄",
};

interface Props {
  caseRecord: Case;
  onClose: () => void;
  onSave: (log: CommunicationLog) => void;
  previousLogs?: CommunicationLog[];
  initialType?: CommType;
}

export function LogCommunicationDrawer({ caseRecord, onClose, onSave, previousLogs = [], initialType = "Phone Call" }: Props) {
  const [logForm, setLogForm] = useState({
    type: initialType,
    direction: "Outbound" as CommDirection,
    contactPerson: "",
    summary: "",
    outcome: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newLog: CommunicationLog = {
      id: `COMM-${Date.now()}`,
      caseId: caseRecord.id,
      type: logForm.type,
      direction: logForm.direction,
      contactPerson: logForm.contactPerson,
      summary: logForm.summary,
      outcome: logForm.outcome,
      date: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
      loggedBy: "Current Operator",
    };

    onSave(newLog);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[520px] bg-background border-l border-border-warm shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">

        <div className="px-6 py-5 border-b border-border-warm flex items-center justify-between bg-foreground/[0.02] shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">Log Communication</h2>
            <p className="text-xs text-foreground/60 mt-0.5 uppercase tracking-wider font-bold">
              {caseRecord.id} · {caseRecord.externalEntity || caseRecord.citizenName}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
            <svg className="w-5 h-5 text-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Previous Logs */}
          {previousLogs.length > 0 && (
            <div className="bg-card border border-border-warm rounded-xl p-4">
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-3">Previous Communications ({previousLogs.length})</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {previousLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-2 text-xs">
                    <span className="text-base leading-none">{COMM_ICONS[log.type]}</span>
                    <div>
                      <span className="font-bold text-foreground/80">{log.direction} · {log.contactPerson}</span>
                      <p className="text-foreground/50">{log.summary}</p>
                      <p className="text-[9px] text-foreground/30 uppercase tracking-widest mt-0.5">{log.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Type */}
          <div>
            <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-2">Communication Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(["Phone Call", "Email", "WhatsApp", "Formal Letter"] as CommType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLogForm(f => ({ ...f, type: t }))}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                    logForm.type === t
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border-warm bg-card text-foreground/60 hover:border-gold/50"
                  }`}
                >
                  <span>{COMM_ICONS[t]}</span> {t}
                </button>
              ))}
            </div>
          </div>

          {/* Direction */}
          <div>
            <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-2">Direction</label>
            <div className="flex gap-2">
              {(["Outbound", "Inbound"] as CommDirection[]).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setLogForm(f => ({ ...f, direction: d }))}
                  className={`flex-1 px-3 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-colors ${
                    logForm.direction === d
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border-warm bg-card text-foreground/60 hover:border-gold/50"
                  }`}
                >
                  {d === "Outbound" ? "↗ Outbound (We contacted them)" : "↙ Inbound (They contacted us)"}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-2">Contact Person</label>
            <input
              required
              value={logForm.contactPerson}
              onChange={e => setLogForm(f => ({ ...f, contactPerson: e.target.value }))}
              placeholder={`e.g. ${caseRecord.liaisonOfficer || "Name"}`}
              className="w-full px-3 py-2.5 rounded-xl border border-border-warm bg-card text-sm focus:outline-none focus:border-gold text-foreground"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-2">Summary of Discussion</label>
            <textarea
              required
              rows={3}
              value={logForm.summary}
              onChange={e => setLogForm(f => ({ ...f, summary: e.target.value }))}
              placeholder="What was discussed in this communication?"
              className="w-full px-3 py-2.5 rounded-xl border border-border-warm bg-card text-sm focus:outline-none focus:border-gold text-foreground resize-none"
            />
          </div>

          {/* Outcome */}
          <div>
            <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-2">Outcome / Next Step</label>
            <input
              required
              value={logForm.outcome}
              onChange={e => setLogForm(f => ({ ...f, outcome: e.target.value }))}
              placeholder="e.g. Entity promised to respond by 5 PM today"
              className="w-full px-3 py-2.5 rounded-xl border border-border-warm bg-card text-sm focus:outline-none focus:border-gold text-foreground"
            />
          </div>

          <div className="pt-4 border-t border-border-warm flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-foreground/50 uppercase tracking-widest hover:text-foreground transition-colors">Cancel</button>
            <button type="submit" className="bg-gold hover:bg-gold-light text-black px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm shadow-gold/20 transition-colors">
              Save Communication Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
