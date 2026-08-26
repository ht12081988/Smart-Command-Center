"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { CaseDetailWorkspace, MOCK_CASES, Case, MOCK_CITIZENS_REGISTRY } from "../cases/page";

export type DirectiveStatus = "Active" | "Pending Verification" | "Closed";

export interface ExecutiveDirective {
  id: string;
  linkedCaseId: string;
  authorizingLeader: string;
  status: DirectiveStatus;
  priority: "Critical" | "High";
  deadline: string; // Date string for SLA
  targetEntity: string;
  targetDepartment?: string;
  targetOfficer?: string;
  citizenName: string;
  citizenId: string;
  description: string;
  proofOfClosure?: string[];
  createdAt: string;
}

const AUTHORIZING_LEADERS = [
  "His Highness the Ruler",
  "Crown Prince",
  "Deputy Ruler",
  "Executive Council",
  "Chairman of SBA"
];

const MOCK_LINKED_CASES = [
  "CASE-9810 (Ahmed Al Suwaidi - Housing Delay)",
  "CASE-9811 (Fatima Obaid - Medical Support)",
  "CASE-9812 (Mohammed Al Shamsi - Utilities)",
  "CASE-9813 (Sara Abdulrahman - Education Grant)"
];

const MOCK_ENTITIES = [
  {
    id: "ENT-001", name: "Sharjah Health Authority", department: "Medical Approvals",
    officers: [
      { id: "OFF-101", name: "Dr. Fatima Al Suwaidi", title: "Head of Approvals" },
      { id: "OFF-102", name: "Ahmed Salem", title: "Coordinator" }
    ]
  },
  {
    id: "ENT-001-B", name: "Sharjah Health Authority", department: "Emergency Response",
    officers: [
      { id: "OFF-103", name: "Dr. Saeed Omar", title: "Emergency Director" }
    ]
  },
  {
    id: "ENT-002", name: "Sharjah Housing Directorate", department: "Citizen Grants",
    officers: [
      { id: "OFF-201", name: "Eng. Khalid Al Qasimi", title: "Director of Grants" }
    ]
  }
];

export const MOCK_DIRECTIVES: ExecutiveDirective[] = [
  {
    id: "DIR-2026-001",
    linkedCaseId: "CASE-9810",
    authorizingLeader: "His Highness the Ruler",
    status: "Active",
    priority: "Critical",
    deadline: "2026-08-27T10:00:00Z",
    targetEntity: "Sharjah Housing Directorate",
    targetDepartment: "Citizen Grants",
    targetOfficer: "Eng. Khalid Al Qasimi",
    citizenName: "Salem Al-Ketbi",
    citizenId: "CIT-001",
    description: "Expedite housing allocation for the citizen immediately due to severe home damage.",
    createdAt: "2026-08-26T09:00:00Z"
  },
  {
    id: "DIR-2026-002",
    linkedCaseId: "CASE-9810",
    authorizingLeader: "Crown Prince",
    status: "Closed",
    priority: "High",
    deadline: "2026-08-28T12:00:00Z",
    targetEntity: "Sharjah Health Authority",
    targetDepartment: "Medical Approvals",
    targetOfficer: "Dr. Fatima Al Suwaidi",
    citizenName: "Ahmed Al-Suwaidi",
    citizenId: "CIT-003",
    description: "Cover all international medical treatment costs for the citizen.",
    proofOfClosure: ["hospital_receipt.pdf"],
    createdAt: "2026-08-25T11:30:00Z"
  },
  {
    id: "DIR-2026-003",
    linkedCaseId: "",
    authorizingLeader: "His Highness the Ruler",
    status: "Active",
    priority: "Critical",
    deadline: "2026-08-30T10:00:00Z",
    targetEntity: "Sharjah Police",
    targetDepartment: "Traffic",
    targetOfficer: "Col. Saeed Al Nuaimi",
    citizenName: "N/A",
    citizenId: "N/A",
    description: "Address immediate traffic congestion issues on Al Dhaid Road based on recent reports.",
    createdAt: "2026-08-26T10:00:00Z"
  }
];

export default function ExecutiveDirectivesPage() {
  const { user } = useAuth();
  const [directives, setDirectives] = useState<ExecutiveDirective[]>(MOCK_DIRECTIVES);
  
  // Drawer & Modal States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [closingDirectiveId, setClosingDirectiveId] = useState<string | null>(null);

  const [viewingCase, setViewingCase] = useState<Case | null>(null);
  const [localCases, setLocalCases] = useState<Case[]>(MOCK_CASES);
  
  // Link Case Drawer States
  const [showCreateCaseDrawer, setShowCreateCaseDrawer] = useState(false);
  const [linkingDirectiveId, setLinkingDirectiveId] = useState<string | null>(null);
  const [newCaseForm, setNewCaseForm] = useState({
    citizenName: "",
    citizenId: "",
    summary: ""
  });
  
  // Form State
  const [form, setForm] = useState({
    linkedCaseId: "",
    authorizingLeader: AUTHORIZING_LEADERS[0],
    status: "Active" as DirectiveStatus,
    priority: "Critical" as "Critical" | "High",
    deadline: "",
    targetEntity: "",
    targetDepartment: "",
    targetOfficer: "",
    citizenName: "",
    citizenId: "",
    description: ""
  });

  const [showCitizenSuggestions, setShowCitizenSuggestions] = useState(false);

  const suggestedCitizens = MOCK_CITIZENS_REGISTRY.filter(c => 
    (form.citizenName.length >= 3 && c.name.toLowerCase().includes(form.citizenName.toLowerCase())) ||
    (form.citizenId.length >= 3 && c.id.toLowerCase().includes(form.citizenId.toLowerCase()))
  );

  const selectCitizen = (citizen: { id: string, name: string }) => {
    setForm({ ...form, citizenName: citizen.name, citizenId: citizen.id });
    setShowCitizenSuggestions(false);
  };

  const [closureForm, setClosureForm] = useState({
    proofFiles: null as FileList | null,
    signOff: false
  });

  // KPIs
  const activeCount = directives.filter(d => d.status === "Active").length;
  const pendingCount = directives.filter(d => d.status === "Pending Verification").length;
  const closedCount = directives.filter(d => d.status === "Closed").length;

  const openDrawer = (directive?: ExecutiveDirective) => {
    if (directive) {
      setEditingId(directive.id);
      setForm({
        linkedCaseId: directive.linkedCaseId,
        authorizingLeader: directive.authorizingLeader,
        status: directive.status,
        priority: directive.priority,
        deadline: directive.deadline.substring(0, 16), // datetime-local format
        targetEntity: directive.targetEntity,
        targetDepartment: directive.targetDepartment || "",
        targetOfficer: directive.targetOfficer || "",
        citizenName: directive.citizenName,
        citizenId: directive.citizenId,
        description: directive.description
      });
    } else {
      setEditingId(null);
      setForm({
        linkedCaseId: "",
        authorizingLeader: AUTHORIZING_LEADERS[0],
        status: "Active",
        priority: "Critical",
        deadline: "",
        targetEntity: "",
        targetDepartment: "",
        targetOfficer: "",
        citizenName: "",
        citizenId: "",
        description: ""
      });
    }
    setIsDrawerOpen(true);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "new") {
        openDrawer();
        // Clean up the URL without reloading the page
        window.history.replaceState({}, "", "/directives");
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalLinkedCaseId = form.linkedCaseId;
    
    // Auto-create case logic
    if (finalLinkedCaseId === "NEW_CASE") {
      finalLinkedCaseId = `CASE-${Math.floor(Math.random() * 9000) + 1000}`;
      const newCase: Case = {
        id: finalLinkedCaseId,
        status: "New",
        citizenId: form.citizenId || "TBD",
        citizenName: form.citizenName || "Unknown",
        feedSource: "Executive Directive",
        summary: form.description,
        facts: "Case automatically created from Executive Directive.",
        primaryClassification: "General",
        secondaryClassification: "N/A",
        priority: form.priority,
        caseOwner: "System",
        externalEntity: form.targetEntity,
        entityDepartment: form.targetDepartment || "TBD",
        liaisonOfficer: form.targetOfficer || "TBD",
        tasks: [],
        timeline: [
          { id: `TL-${Math.floor(Math.random() * 1000)}`, action: "Case Auto-Created from Directive", actor: "System", date: new Date().toLocaleString() }
        ],
        documents: []
      };
      setLocalCases([newCase, ...localCases]);
    }

    if (editingId) {
      setDirectives(directives.map(d => 
        d.id === editingId ? { ...d, ...form, linkedCaseId: finalLinkedCaseId, deadline: form.deadline ? new Date(form.deadline).toISOString() : new Date().toISOString() } : d
      ));
    } else {
      const newDirective: ExecutiveDirective = {
        ...form,
        linkedCaseId: finalLinkedCaseId,
        id: `DIR-2026-00${directives.length + 1}`,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      setDirectives([newDirective, ...directives]);
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this directive? This action is highly restricted and will be logged.")) {
      setDirectives(directives.filter(d => d.id !== id));
    }
  };

  const openClosureModal = (id: string) => {
    setClosingDirectiveId(id);
    setClosureForm({ proofFiles: null, signOff: false });
    setIsClosureModalOpen(true);
  };

  const handleCloseDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closureForm.proofFiles || !closureForm.signOff) return;
    
    // Mock upload
    const fileNames = Array.from(closureForm.proofFiles).map(f => f.name);
    
    setDirectives(directives.map(d => 
      d.id === closingDirectiveId ? { ...d, status: "Closed", proofOfClosure: fileNames } : d
    ));
    setIsClosureModalOpen(false);
  };

  const handleViewCase = (linkedCaseId: string) => {
    const linkedCase = localCases.find(c => c.id === linkedCaseId);
    if (linkedCase) {
      setViewingCase(linkedCase);
    } else {
      alert("Linked case details not found in mock data.");
    }
  };

  const openCreateCaseDrawerForDirective = (directiveId: string) => {
    setLinkingDirectiveId(directiveId);
    setNewCaseForm({ citizenName: "", citizenId: "", summary: "" });
    setShowCreateCaseDrawer(true);
  };

  const handleCreateCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingDirectiveId) return;

    const newCaseId = `CASE-${Math.floor(Math.random() * 9000) + 1000}`;
    const newCase: Case = {
      id: newCaseId,
      status: "New",
      citizenId: newCaseForm.citizenId || "TBD",
      citizenName: newCaseForm.citizenName || "Unknown",
      feedSource: "Executive Directive",
      summary: newCaseForm.summary,
      facts: "Case generated from Directive",
      primaryClassification: "General",
      secondaryClassification: "N/A",
      priority: "High",
      caseOwner: "System",
      externalEntity: "TBD",
      entityDepartment: "TBD",
      liaisonOfficer: "TBD",
      tasks: [],
      timeline: [{ id: `TL-${Math.random()}`, action: "Case Linked to Directive", actor: "System", date: new Date().toLocaleString() }],
      documents: []
    };

    // Add to local cases
    setLocalCases([newCase, ...localCases]);
    
    // Update the directive
    setDirectives(directives.map(d => 
      d.id === linkingDirectiveId ? { ...d, linkedCaseId: newCaseId } : d
    ));

    setShowCreateCaseDrawer(false);
    setLinkingDirectiveId(null);
  };

  const selectedEntities = MOCK_ENTITIES.filter(e => e.name === form.targetEntity);
  const specificEntity = selectedEntities.find(e => e.department === form.targetDepartment);
  const uniqueEntityNames = Array.from(new Set(MOCK_ENTITIES.map(e => e.name)));

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-gold/30">
      <Sidebar activeItem="Executive Directives" />

      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Header */}
        <header className="shrink-0 z-30 bg-background/80 backdrop-blur-md border-b border-border-warm px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.242.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.176 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 12.08c-.783-.57-.384-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Executive Directives Dashboard
          </h1>
          <p className="text-sm text-foreground/60 mt-1">Strategic oversight and management of high-level leadership orders.</p>
        </div>
        <button onClick={() => openDrawer()} className="bg-gold hover:bg-gold-light text-black px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-gold/20 transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Log Directive
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 w-full space-y-6">
        {/* KPI Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-5 rounded-2xl border border-orange-400/30 text-white shadow-xl shadow-orange-900/20 relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-orange-100 mb-1">No Case</p>
                <h3 className="text-3xl font-black">{directives.filter(d => !d.linkedCaseId).length}</h3>
              </div>
              <div className="p-2 bg-orange-900/40 rounded-xl"><svg className="w-5 h-5 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-800 p-5 rounded-2xl border border-red-500/30 text-white shadow-xl shadow-red-900/20 relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-red-200 mb-1">Critical Priority</p>
                <h3 className="text-3xl font-black">{directives.filter(d => d.priority === "Critical").length}</h3>
              </div>
              <div className="p-2 bg-red-900/40 rounded-xl"><svg className="w-5 h-5 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-card to-background p-5 rounded-2xl border border-border-warm shadow-xl shadow-black/5 relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/50 mb-1">Active Directives</p>
                <h3 className="text-3xl font-black text-foreground">{directives.filter(d => d.status === "Active").length}</h3>
              </div>
              <div className="p-2 bg-foreground/[0.03] rounded-xl"><svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-5 rounded-2xl border border-green-200 shadow-xl shadow-green-900/5 relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-green-700/60 mb-1">Closed (Verified)</p>
                <h3 className="text-3xl font-black text-green-800">{directives.filter(d => d.status === "Closed").length}</h3>
              </div>
              <div className="p-2 bg-green-200/50 rounded-xl"><svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-background rounded-2xl border border-border-warm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border-warm bg-foreground/[0.02]">
            <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-widest">Directive Master List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-foreground/[0.02] text-xs uppercase tracking-wider font-bold text-foreground/50">
                <tr>
                  <th className="px-6 py-4 border-b border-border-warm">ID & Date</th>
                  <th className="px-6 py-4 border-b border-border-warm">Citizen</th>
                  <th className="px-6 py-4 border-b border-border-warm">Authorizing Leader</th>
                  <th className="px-6 py-4 border-b border-border-warm">Target Entity</th>
                  <th className="px-6 py-4 border-b border-border-warm text-center">Status & Priority</th>
                  <th className="px-6 py-4 border-b border-border-warm text-center">SLA Deadline</th>
                  <th className="px-6 py-4 border-b border-border-warm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-warm">
                {directives.map(d => (
                  <tr key={d.id} className="hover:bg-foreground/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{d.id}</div>
                      <div className="text-[10px] text-foreground/50 uppercase tracking-widest">{new Date(d.createdAt).toLocaleDateString()} &bull; <span className="text-gold">{d.linkedCaseId || "UNLINKED"}</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{d.citizenName}</div>
                      <div className="text-[10px] text-foreground/40 font-mono">{d.citizenId}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{d.authorizingLeader}</td>
                    <td className="px-6 py-4">
                      <div className="text-foreground/80 font-medium">{d.targetEntity}</div>
                      {d.targetDepartment && <div className="text-[10px] text-foreground/50 uppercase">{d.targetDepartment}</div>}
                      {d.targetOfficer && <div className="text-[10px] font-bold text-gold/80">{d.targetOfficer}</div>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          d.status === "Active" ? "bg-red-50 text-red-700 border border-red-200" :
                          d.status === "Pending Verification" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-green-50 text-green-700 border border-green-200"
                        }`}>
                          {d.status}
                        </span>
                        <span className="text-[10px] font-bold text-foreground/50 uppercase">{d.priority} Priority</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-mono font-medium text-foreground/70">{new Date(d.deadline).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {d.linkedCaseId ? (
                          <button onClick={() => handleViewCase(d.linkedCaseId)} className="bg-background border border-border-warm hover:border-gold text-foreground hover:text-gold px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap">
                            View Case
                          </button>
                        ) : (
                          <button onClick={() => openCreateCaseDrawerForDirective(d.id)} className="bg-gold hover:bg-gold-light text-black px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap">
                            Create Case
                          </button>
                        )}
                        {d.status !== "Closed" && (
                          <button onClick={() => openClosureModal(d.id)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] uppercase font-bold tracking-wider rounded-lg transition-colors whitespace-nowrap">
                            Verify & Close
                          </button>
                        )}
                        <button onClick={() => openDrawer(d)} className="p-1.5 text-foreground/40 hover:text-gold transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(d.id)} className="p-1.5 text-foreground/40 hover:text-red-500 transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Screen 5.1: Intake & Logging Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-lg bg-background border-l border-border-warm shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-6 py-5 border-b border-border-warm flex items-center justify-between bg-foreground/[0.02]">
              <div>
                <h2 className="text-lg font-bold text-foreground">{editingId ? "Edit Directive" : "Log New Directive"}</h2>
                <p className="text-xs text-foreground/60 mt-1 uppercase tracking-wider font-bold">Strict Audit Logging Enabled</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
                <svg className="w-5 h-5 text-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Citizen Name</label>
                  <input 
                    required 
                    value={form.citizenName} 
                    onChange={e => {
                      setForm({...form, citizenName: e.target.value});
                      setShowCitizenSuggestions(true);
                    }} 
                    onFocus={() => setShowCitizenSuggestions(true)}
                    className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold" 
                  />
                  {showCitizenSuggestions && form.citizenName.length >= 3 && suggestedCitizens.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-card border border-border-warm rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {suggestedCitizens.map(c => (
                        <li 
                          key={c.id} 
                          onClick={() => selectCitizen(c)}
                          className="px-4 py-2 text-sm text-foreground hover:bg-gold/10 cursor-pointer border-b border-border-warm last:border-0"
                        >
                          <span className="font-bold">{c.name}</span> <span className="text-[10px] text-foreground/50">({c.id})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Citizen ID</label>
                  <input 
                    required 
                    value={form.citizenId} 
                    onChange={e => {
                      setForm({...form, citizenId: e.target.value});
                      setShowCitizenSuggestions(true);
                    }} 
                    onFocus={() => setShowCitizenSuggestions(true)}
                    className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold" 
                    placeholder="CIT-XXXX" 
                  />
                  {showCitizenSuggestions && form.citizenId.length >= 3 && suggestedCitizens.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-card border border-border-warm rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {suggestedCitizens.map(c => (
                        <li 
                          key={c.id} 
                          onClick={() => selectCitizen(c)}
                          className="px-4 py-2 text-sm text-foreground hover:bg-gold/10 cursor-pointer border-b border-border-warm last:border-0"
                        >
                          <span className="font-bold">{c.name}</span> <span className="text-[10px] text-foreground/50">({c.id})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Linked Case Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Linked Case</label>
                <select required value={form.linkedCaseId} onChange={e => setForm({...form, linkedCaseId: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold">
                  <option value="" disabled>Select a Case to Link...</option>
                  <option value="NEW_CASE" className="font-bold text-gold">+ Create new case automatically</option>
                  {localCases.map(c => (
                    <option key={c.id} value={c.id}>{c.id} ({c.citizenName} - {c.summary.substring(0,25)}...)</option>
                  ))}
                </select>
                <p className="text-[10px] text-foreground/40 mt-1">Directives must be linked to a case or a new one can be created.</p>
              </div>

              {/* Authorizing Leader Dropdown */}
              <div className="bg-red-50/50 p-4 rounded-xl border border-red-200">
                <label className="block text-[10px] font-bold text-red-700 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Authorizing Leader (Human Sign-off Required)
                </label>
                <select required value={form.authorizingLeader} onChange={e => setForm({...form, authorizingLeader: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-red-200 bg-white text-sm focus:outline-none focus:border-red-400">
                  {AUTHORIZING_LEADERS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Priority</label>
                  <select required value={form.priority} onChange={e => setForm({...form, priority: e.target.value as any})} className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold">
                    <option value="Critical">Critical Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">SLA Deadline</label>
                  <input type="datetime-local" required value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Target External Entity</label>
                <select 
                  required 
                  value={form.targetEntity} 
                  onChange={e => setForm({...form, targetEntity: e.target.value, targetDepartment: "", targetOfficer: ""})} 
                  className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold"
                >
                  <option value="" disabled>Select Entity...</option>
                  {uniqueEntityNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {selectedEntities.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Department</label>
                    <select 
                      required 
                      value={form.targetDepartment} 
                      onChange={e => setForm({...form, targetDepartment: e.target.value, targetOfficer: ""})} 
                      className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold"
                    >
                      <option value="" disabled>Select Department...</option>
                      {selectedEntities.map(e => (
                        <option key={e.id} value={e.department}>{e.department}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Liaison Officer</label>
                    <select 
                      required 
                      value={form.targetOfficer} 
                      onChange={e => setForm({...form, targetOfficer: e.target.value})} 
                      className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold"
                      disabled={!form.targetDepartment}
                    >
                      <option value="" disabled>Select Officer...</option>
                      {specificEntity?.officers.map(o => (
                        <option key={o.id} value={o.name}>{o.name} ({o.title})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Directive Description</label>
                <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Exact text of the directive issued..." className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold resize-none" />
              </div>

            </form>
            
            <div className="p-6 border-t border-border-warm bg-foreground/[0.02]">
              <button onClick={handleSave} className="w-full bg-gold hover:bg-gold-light text-black py-3 rounded-xl font-bold text-sm tracking-wide transition-colors">
                {editingId ? "Update Directive" : "Authorize & Log Directive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen 5.3: Verification Closure Modal */}
      {isClosureModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsClosureModalOpen(false)} />
          <div className="relative w-full max-w-md bg-background border border-border-warm shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border-warm bg-green-50/50">
              <h2 className="text-lg font-bold text-green-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Verify & Close Directive
              </h2>
            </div>
            
            <form onSubmit={handleCloseDirective} className="p-6 space-y-6">
              <p className="text-sm text-foreground/80">
                You are about to close <span className="font-bold">{closingDirectiveId}</span>. Directives require official proof of execution before closure.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Upload Proof of Closure (Mandatory)</label>
                <input 
                  type="file" 
                  required 
                  multiple
                  onChange={e => setClosureForm({...closureForm, proofFiles: e.target.files})}
                  className="w-full px-3 py-2 rounded-xl border border-dashed border-border-warm bg-foreground/[0.02] text-sm focus:outline-none focus:border-gold file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gold file:text-black hover:file:bg-gold-light" 
                />
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50/50 border border-red-200 rounded-xl">
                <input 
                  type="checkbox" 
                  id="signOff"
                  required
                  checked={closureForm.signOff}
                  onChange={e => setClosureForm({...closureForm, signOff: e.target.checked})}
                  className="mt-1 w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500" 
                />
                <label htmlFor="signOff" className="text-xs text-red-800 font-medium">
                  I, <span className="font-bold">{user?.fullName}</span>, officially verify that this directive has been executed and the attached documents serve as valid proof of closure.
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsClosureModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border-warm text-sm font-bold text-foreground/80 hover:bg-foreground/[0.02] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={!closureForm.signOff || !closureForm.proofFiles} className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Verify & Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Linked Case Workspace */}
      {viewingCase && (
        <CaseDetailWorkspace 
          activeCase={viewingCase} 
          onClose={() => setViewingCase(null)} 
          onUpdateCase={(updatedCase) => {
            setLocalCases(localCases.map(c => c.id === updatedCase.id ? updatedCase : c));
            if (viewingCase.id === updatedCase.id) setViewingCase(updatedCase);
          }}
          onUpdateStatus={(status, comment) => {
            const newEvent = {
              id: `TL-${Math.floor(Math.random() * 1000)}`,
              action: `Status changed to ${status}`,
              actor: "Current User",
              date: new Date().toLocaleString(),
              comment: comment || "No comment provided."
            };
            const updatedCase = { ...viewingCase, status, timeline: [...viewingCase.timeline, newEvent] };
            setLocalCases(localCases.map(c => c.id === updatedCase.id ? updatedCase : c));
            setViewingCase(updatedCase);
          }}
        />
      )}

      {/* Right-to-Left Drawer for Create Case */}
      {showCreateCaseDrawer && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[450px] bg-card h-full shadow-2xl flex flex-col border-l border-border-warm animate-in slide-in-from-right duration-300">
            <header className="px-6 py-5 border-b border-border-warm flex justify-between items-center bg-background shrink-0">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Create Case for Directive</h2>
              <button onClick={() => setShowCreateCaseDrawer(false)} className="text-foreground/40 hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
            
            <form onSubmit={handleCreateCaseSubmit} className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto">
              <div className="relative">
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Citizen Name</label>
                <input 
                  required 
                  value={newCaseForm.citizenName} 
                  onChange={e => setNewCaseForm({...newCaseForm, citizenName: e.target.value})} 
                  className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold" 
                />
              </div>
              
              <div className="relative">
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Citizen ID</label>
                <input 
                  required 
                  value={newCaseForm.citizenId} 
                  onChange={e => setNewCaseForm({...newCaseForm, citizenId: e.target.value})} 
                  className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold" 
                  placeholder="CIT-XXXX" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Case Summary / Description</label>
                <textarea 
                  required 
                  rows={4}
                  value={newCaseForm.summary} 
                  onChange={e => setNewCaseForm({...newCaseForm, summary: e.target.value})} 
                  className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold resize-none" 
                />
              </div>

              <div className="mt-auto pt-6 flex gap-3">
                <button type="button" onClick={() => setShowCreateCaseDrawer(false)} className="px-5 py-2.5 rounded-xl border border-border-warm font-bold text-xs uppercase tracking-wider text-foreground/60 hover:bg-foreground/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-gold hover:bg-gold-hover text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-colors">
                  Create & Link Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
