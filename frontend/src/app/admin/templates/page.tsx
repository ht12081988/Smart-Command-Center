"use client";

import React, { useState } from "react";
import { Sidebar } from "../../../components/Sidebar";
import { PortalHeader } from "../../../components/PortalHeader";

interface NotificationTemplate {
  id: string;
  name: string;
  channel: "Email" | "SMS";
  triggerEvent: string;
  subject?: string;
  body: string;
  placeholders: string[];
}

const INITIAL_TEMPLATES: NotificationTemplate[] = [
  {
    id: "TEMP-01",
    name: "Case Creation Receipt",
    channel: "Email",
    triggerEvent: "Triggered automatically when a case is successfully logged by an operator.",
    subject: "Sharjah Smart Command Center: Case Reference {CaseID} Received",
    body: "Dear {CitizenName},\n\nThank you for contacting our platform. Your request has been officially received and registered under Reference ID: {CaseID}.\n\nCase Summary: {CaseSummary}\n\nOur team is currently reviewing your request. You will receive SMS alerts as updates occur.\n\nBest Regards,\nSharjah Smart Command Center Team",
    placeholders: ["{CaseID}", "{CitizenName}", "{CaseSummary}"]
  },
  {
    id: "TEMP-02",
    name: "SLA Deadline Warning",
    channel: "Email",
    triggerEvent: "Sent to the assigned Liaison Officer when a case has under 2 hours remaining on its SLA.",
    subject: "URGENT SLA ALERT: Case {CaseID} is nearing deadline",
    body: "Dear {LiaisonOfficer},\n\nThis is an urgent reminder that Case {CaseID} assigned to {ExternalEntity} ({EntityDepartment}) has only {SlaHours} remaining to meet its compliance SLA.\n\nPlease log into the external referrals portal or contact the command center directly to resolve this issue and attach proof of closure.\n\nThank you,\nSharjah Smart Command Center Monitoring Service",
    placeholders: ["{CaseID}", "{LiaisonOfficer}", "{ExternalEntity}", "{EntityDepartment}", "{SlaHours}"]
  },
  {
    id: "TEMP-03",
    name: "Liaison Escalation Alert",
    channel: "Email",
    triggerEvent: "Dispatched to the Senior Liaison / Escalation Officer when a case breaches its SLA.",
    subject: "CRITICAL ESCALATION: Case {CaseID} SLA Breached",
    body: "Dear {EscalationOfficer},\n\nWe are writing to officially escalate Case Reference: {CaseID}.\n\nThis case was assigned to {ExternalEntity} under the department {EntityDepartment}. The standard SLA limit of {SlaHours} has been breached without resolution proof.\n\nAs the Primary Escalation Liaison, please intervene immediately to fast-track this case and upload resolution details.\n\nSincerely,\nExecutive Governance Committee\nSharjah Smart Command Center",
    placeholders: ["{CaseID}", "{EscalationOfficer}", "{ExternalEntity}", "{EntityDepartment}", "{SlaHours}"]
  },
  {
    id: "TEMP-04",
    name: "Case Resolved Notification",
    channel: "SMS",
    triggerEvent: "Sent to the citizen's mobile number once proof of resolution is attached and approved.",
    body: "Dear {CitizenName}, your Case {CaseID} referred to {ExternalEntity} has been successfully resolved. Thank you for your patience. Ref: {CaseID}",
    placeholders: ["{CaseID}", "{CitizenName}", "{ExternalEntity}"]
  }
];

// Mock data to simulate template parsing
const MOCK_REPLACEMENT_DATA = {
  "{CaseID}": "CASE-4081",
  "{CitizenName}": "Ahmed Al-Suwaidi",
  "{CaseSummary}": "Requesting urgent medical waiver support for pending hospital bill clearances at Al Qassimi Hospital.",
  "{LiaisonOfficer}": "Dr. Khalid M.",
  "{EscalationOfficer}": "Mariam Al Shamsi",
  "{ExternalEntity}": "Sharjah Health Authority",
  "{EntityDepartment}": "Medical Approvals Department",
  "{SlaHours}": "3 hours"
};

export default function NotificationTemplatesPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(INITIAL_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("TEMP-01");
  const [successMsg, setSuccessMsg] = useState(false);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const handleUpdateField = (field: "subject" | "body", value: string) => {
    setTemplates(prev =>
      prev.map(t => (t.id === selectedTemplate.id ? { ...t, [field]: value } : t))
    );
  };

  const handleInsertPlaceholder = (placeholder: string) => {
    const currentBody = selectedTemplate.body;
    handleUpdateField("body", currentBody + " " + placeholder);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2500);
  };

  // Dynamic template text parsing helper
  const parseTemplateText = (text: string) => {
    let parsed = text;
    Object.entries(MOCK_REPLACEMENT_DATA).forEach(([key, value]) => {
      parsed = parsed.replaceAll(key, value);
    });
    return parsed;
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background text-foreground font-sans">
      <Sidebar activeItem="Notification Templates" />

      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        <PortalHeader
          title="Notification & Email Template Manager"
          subtitle="Configure automated email templates, SMS formats, placeholders, and escalation alerts."
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 flex gap-6 min-h-0">
          
          {/* Left Column: Template Selector List */}
          <div className="w-[300px] shrink-0 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-foreground/50 uppercase tracking-widest px-1">System Templates</h3>
            <div className="flex flex-col gap-2.5">
              {templates.map(t => {
                const isActive = t.id === selectedTemplateId;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTemplateId(t.id);
                      setSuccessMsg(false);
                    }}
                    className={`w-full p-4 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                      isActive
                        ? "bg-gold-muted border-gold/50 text-foreground"
                        : "bg-card border-border-warm hover:border-gold/30 text-foreground/80 hover:bg-card/85"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-xs uppercase tracking-wide truncate max-w-[170px]">{t.name}</span>
                      <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        t.channel === "Email" ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-purple-50 text-purple-700 border border-purple-100"
                      }`}>
                        {t.channel}
                      </span>
                    </div>
                    <span className="text-[10px] text-foreground/50 line-clamp-2 leading-relaxed">
                      {t.triggerEvent}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Template Editor & Preview */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <form onSubmit={handleSave} className="bg-card border border-border-warm rounded-2xl p-6 shadow-sm flex flex-col gap-5 shrink-0">
              
              <div className="flex justify-between items-center border-b border-border-warm pb-3">
                <div>
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{selectedTemplate.name}</h2>
                  <p className="text-[10px] text-foreground/50 mt-1">{selectedTemplate.triggerEvent}</p>
                </div>
                {successMsg && (
                  <span className="text-[10px] text-active-green font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                    ✓ Template Saved Successfully
                  </span>
                )}
              </div>

              {/* Email Subject field (Only visible if channel is Email) */}
              {selectedTemplate.channel === "Email" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Email Subject</label>
                  <input
                    type="text"
                    required
                    value={selectedTemplate.subject || ""}
                    onChange={e => handleUpdateField("subject", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold transition-colors font-medium text-foreground"
                  />
                </div>
              )}

              {/* Template Body area */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Template Content Body</label>
                <textarea
                  required
                  value={selectedTemplate.body}
                  onChange={e => handleUpdateField("body", e.target.value)}
                  className="w-full h-44 px-3.5 py-3 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold transition-colors font-mono leading-relaxed resize-none text-foreground"
                />
              </div>

              {/* Placeholders Toolbar */}
              <div className="bg-foreground/[0.02] border border-border-warm rounded-xl p-3.5 flex flex-col gap-2">
                <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Click to Insert Dynamic Placeholder:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.placeholders.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleInsertPlaceholder(p)}
                      className="px-2.5 py-1 bg-background hover:bg-gold-muted border border-border-warm hover:border-gold/30 rounded-lg text-[10px] font-mono font-bold text-foreground/80 hover:text-primary-text-gold transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-gold hover:bg-gold-hover text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>

            {/* Ingest Live Preview Container */}
            <div className="bg-foreground/[0.01] border border-border-warm border-dashed rounded-2xl p-6 flex flex-col gap-3 overflow-hidden flex-1 min-h-[180px]">
              <h4 className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest border-b border-border-warm/60 pb-1.5 shrink-0">
                Live Transactional Preview (Simulated with Sample Case Data)
              </h4>
              
              <div className="flex-1 overflow-y-auto flex flex-col gap-4 text-xs font-medium leading-relaxed pr-1">
                {selectedTemplate.channel === "Email" ? (
                  /* Email Preview Box */
                  <div className="bg-card border border-border-warm rounded-xl p-5 shadow-xs flex flex-col gap-3 font-sans">
                    <div className="flex flex-col gap-1 text-[11px] text-foreground/60 border-b border-border-warm pb-2.5">
                      <div><span className="font-bold text-foreground/45">To:</span> <span className="font-mono">recipient@sharjah.ae</span></div>
                      <div className="mt-1"><span className="font-bold text-foreground/45">Subject:</span> <span className="font-bold text-foreground/80">{parseTemplateText(selectedTemplate.subject || "")}</span></div>
                    </div>
                    <div className="text-foreground/80 whitespace-pre-wrap leading-relaxed pt-1">
                      {parseTemplateText(selectedTemplate.body)}
                    </div>
                  </div>
                ) : (
                  /* SMS Preview Box */
                  <div className="flex justify-start">
                    <div className="max-w-[340px] bg-[#E2F7CB] border border-[#d2eba3] rounded-2xl rounded-tl-sm p-3 text-slate-800 shadow-xs relative text-[11px] leading-relaxed">
                      <div className="font-bold text-[8px] uppercase tracking-wider text-emerald-800/60 mb-1">Incoming SMS</div>
                      <div className="whitespace-pre-wrap">{parseTemplateText(selectedTemplate.body)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
