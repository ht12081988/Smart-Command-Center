"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { PortalHeader } from "../../components/PortalHeader";
import { Pagination } from "../../components/Pagination";

interface CitizenCase {
  id: string;
  title: string;
  category: string;
  status: "Resolved" | "Escalated" | "Closed" | "Open";
  date: string;
}

interface Engagement {
  type: "Call" | "Document" | "Commitment";
  broadcastName?: string;
  description: string;
  date: string;
}

interface CitizenDocument {
  id: string;
  title: string;
  type: "Identity" | "Housing" | "Income" | "Medical Report" | "Bill";
  dateAdded: string;
}

interface Citizen {
  id: string;
  fullName: string;
  emiratesId: string;
  phone: string;
  region: string;
  familyStatus: string;
  activeCaseOpen: boolean;
  pastCases: CitizenCase[];
  engagements: Engagement[];
  documents?: CitizenDocument[];
  isRepeatCaller: boolean;
}

// Mock Data
const MOCK_CITIZENS: Citizen[] = [
  {
    id: "CIT-001",
    fullName: "Salem Al-Ketbi",
    emiratesId: "784-1980-1234567-1",
    phone: "+971 50 123 4567",
    region: "Al Dhaid",
    familyStatus: "Married, 4 Children",
    activeCaseOpen: true,
    isRepeatCaller: true,
    pastCases: [
      { id: "CASE-9410", title: "Housing Expansion Request", category: "Housing", status: "Resolved", date: "Jan 12, 2024" },
      { id: "CASE-9792", title: "Water Pipeline Connection Delay", category: "Infrastructure", status: "Open", date: "Aug 24, 2026" }
    ],
    engagements: [
      { type: "Call", broadcastName: "Radio Ingest", description: "Complained about water pressure.", date: "Aug 24, 2026, 10:30 AM" },
      { type: "Document", description: "Submitted SEWGA utility bill.", date: "Aug 25, 2026, 11:15 AM" }
    ],
    documents: [
      { id: "DOC-101", title: "Emirates ID Copy", type: "Identity", dateAdded: "Jan 10, 2024" },
      { id: "DOC-102", title: "SEWGA Utility Bill", type: "Bill", dateAdded: "Aug 25, 2026" }
    ]
  },
  {
    id: "CIT-002",
    fullName: "Fatima Al-Suwaidi",
    emiratesId: "784-1992-7654321-2",
    phone: "+971 55 987 6543",
    region: "Khorfakkan",
    familyStatus: "Widowed, 2 Children",
    activeCaseOpen: false,
    isRepeatCaller: false,
    pastCases: [
      { id: "CASE-9721", title: "Housing Grant Review request", category: "Housing Allocation", status: "Closed", date: "Aug 23, 2026" }
    ],
    engagements: [
      { type: "Call", broadcastName: "Live TV Broadcast", description: "Patch-in regarding housing delay.", date: "Aug 23, 2026, 09:45 AM" }
    ],
    documents: [
      { id: "DOC-103", title: "Housing Grant Application", type: "Housing", dateAdded: "Aug 23, 2026" }
    ]
  },
  {
    id: "CIT-003",
    fullName: "Ahmed Al-Suwaidi",
    emiratesId: "784-1975-1122334-3",
    phone: "+971 52 444 5555",
    region: "Al Dhaid",
    familyStatus: "Married, 1 Child",
    activeCaseOpen: true,
    isRepeatCaller: false,
    pastCases: [
      { id: "CASE-9810", title: "Executive Directive: Cover Health Debt", category: "Health & Medical", status: "Open", date: "Aug 25, 2026" }
    ],
    engagements: [
      { type: "Call", broadcastName: "Direct Line (Khat Mubasher)", description: "Sheikh intervention.", date: "Aug 25, 2026, 02:00 PM" },
      { type: "Commitment", broadcastName: "Authority Response", description: "Sharjah Health Authority pledged to cover debt within 24h.", date: "Aug 25, 2026, 03:30 PM" }
    ],
    documents: [
      { id: "DOC-104", title: "Hospital Medical Bill", type: "Medical Report", dateAdded: "Aug 25, 2026" }
    ]
  }
];

export default function CitizenProfilePage() {
  const [citizens, setCitizens] = useState<Citizen[]>(MOCK_CITIZENS);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  
  // Modals & Workspaces
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Citizen Form State
  const [newCitizen, setNewCitizen] = useState<Partial<Citizen>>({});
  const [eidError, setEidError] = useState("");

  const filteredCitizens = citizens.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.emiratesId.includes(searchQuery) || 
                          c.phone.includes(searchQuery);
    const matchesRegion = regionFilter === "All" || c.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, regionFilter]);

  const totalPages = Math.ceil(filteredCitizens.length / pageSize) || 1;
  const paginatedCitizens = filteredCitizens.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eidRegex = /^784-\d{4}-\d{7}-\d{1}$/;
    if (!newCitizen.emiratesId || !eidRegex.test(newCitizen.emiratesId)) {
      setEidError("Invalid format. Must be 784-XXXX-XXXXXXX-X");
      return;
    }
    
    const citizenToAdd: Citizen = {
      id: `CIT-00${citizens.length + 1}`,
      fullName: newCitizen.fullName || "",
      emiratesId: newCitizen.emiratesId,
      phone: newCitizen.phone || "",
      region: newCitizen.region || "",
      familyStatus: newCitizen.familyStatus || "",
      activeCaseOpen: false,
      isRepeatCaller: false,
      pastCases: [],
      engagements: []
    };

    setCitizens([...citizens, citizenToAdd]);
    setShowAddModal(false);
    setNewCitizen({});
    setEidError("");
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar activeItem="Citizen Profiles" />

      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        <PortalHeader
          title="Citizen Profiles CRM"
          subtitle="Manage identities, track duplicate callers, and review case history to avoid redundant work."
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          actions={
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gold hover:bg-gold-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
            >
              + Add Citizen
            </button>
          }
        />

        <main className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto">

        {/* Filters */}
        <section className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Emirates ID, or Phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-warm bg-card text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
            />
            <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground/50 uppercase font-bold tracking-wider whitespace-nowrap">Region:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border-warm bg-card text-foreground text-xs font-semibold uppercase tracking-wider focus:outline-none focus:border-gold"
            >
              <option value="All">All Regions</option>
              <option value="Sharjah City">Sharjah City</option>
              <option value="Al Dhaid">Al Dhaid</option>
              <option value="Khorfakkan">Khorfakkan</option>
              <option value="Kalba">Kalba</option>
            </select>
          </div>
        </section>

        {/* Main Table List */}
        <section className="bg-card border border-border-warm rounded-2xl overflow-hidden shadow-sm flex flex-col animate-in fade-in duration-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border-warm bg-background/50 text-foreground/50 font-semibold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Citizen Identity</th>
                <th className="py-4 px-6">Contact & Region</th>
                <th className="py-4 px-6 text-center">Status Flags</th>
                <th className="py-4 px-6 text-center">History</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-warm">
              {paginatedCitizens.map((c) => (
                <tr key={c.id} className="hover:bg-background/25 transition-colors group">
                  <td className="py-4 px-6">
                    <span className="font-bold text-primary-text-gold block">{c.fullName}</span>
                    <span className="text-xs text-foreground/50 font-medium">EID: {c.emiratesId}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-foreground/80 block">{c.phone}</span>
                    <span className="text-xs text-foreground/50 font-medium">{c.region}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      {c.activeCaseOpen && (
                        <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                          Active Case Open
                        </span>
                      )}
                      {c.isRepeatCaller && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                          Repeat Caller
                        </span>
                      )}
                      {!c.activeCaseOpen && !c.isRepeatCaller && (
                        <span className="text-foreground/30 text-[10px] font-bold uppercase tracking-wider">-</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-bold text-foreground/70">{c.pastCases.length}</span> <span className="text-[10px] text-foreground/50 uppercase tracking-widest">Cases</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedCitizen(c)}
                      className="bg-background border border-border-warm group-hover:border-gold text-foreground group-hover:text-gold px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCitizens.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </section>
      </main>

      {/* Detail Workspace Full Page Model */}
      {selectedCitizen && (
        <DetailWorkspace 
          citizen={selectedCitizen} 
          onClose={() => setSelectedCitizen(null)} 
        />
      )}

      {/* Add Citizen Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border-warm rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-5 border-b border-border-warm flex justify-between items-center bg-background/50">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Add New Citizen</h2>
              <button onClick={() => setShowAddModal(false)} className="text-foreground/40 hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-1.5">Full Name</label>
                <input required type="text" value={newCitizen.fullName || ""} onChange={e => setNewCitizen({...newCitizen, fullName: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border-warm bg-background text-sm focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-1.5 flex justify-between">
                  <span>Emirates ID</span>
                  {eidError && <span className="text-red-500 normal-case">{eidError}</span>}
                </label>
                <input required placeholder="784-XXXX-XXXXXXX-X" type="text" value={newCitizen.emiratesId || ""} onChange={e => {setNewCitizen({...newCitizen, emiratesId: e.target.value}); setEidError("")}} className={`w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none ${eidError ? "border-red-500 focus:border-red-500" : "border-border-warm focus:border-gold"}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-1.5">Phone</label>
                  <input required type="text" value={newCitizen.phone || ""} onChange={e => setNewCitizen({...newCitizen, phone: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border-warm bg-background text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-1.5">Region</label>
                  <select required value={newCitizen.region || ""} onChange={e => setNewCitizen({...newCitizen, region: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border-warm bg-background text-sm focus:outline-none focus:border-gold">
                    <option value="">Select...</option>
                    <option value="Sharjah City">Sharjah City</option>
                    <option value="Al Dhaid">Al Dhaid</option>
                    <option value="Khorfakkan">Khorfakkan</option>
                    <option value="Kalba">Kalba</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-1.5">Family Status (Relevant for Housing/Grants)</label>
                <input type="text" value={newCitizen.familyStatus || ""} onChange={e => setNewCitizen({...newCitizen, familyStatus: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border-warm bg-background text-sm focus:outline-none focus:border-gold" />
              </div>
              
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-foreground/60 uppercase tracking-widest hover:text-foreground">Cancel</button>
                <button type="submit" className="bg-gold hover:bg-gold-hover text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm">Save Citizen</button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}




function DetailWorkspace({ citizen, onClose }: { citizen: Citizen, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"history" | "engagements" | "documents">("history");
  
  const [localDocs, setLocalDocs] = useState<CitizenDocument[]>(citizen.documents || []);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [newDoc, setNewDoc] = useState<Partial<CitizenDocument>>({});
  const [summaryDoc, setSummaryDoc] = useState<CitizenDocument | null>(null);

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title || !newDoc.type) return;
    const docToAdd: CitizenDocument = {
      id: `DOC-${Math.floor(Math.random() * 1000) + 200}`,
      title: newDoc.title,
      type: newDoc.type as any,
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setLocalDocs([...localDocs, docToAdd]);
    setShowAddDoc(false);
    setNewDoc({});
  };

  const handleDeleteDoc = (id: string) => {
    setLocalDocs(localDocs.filter(d => d.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col p-8 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Top Header */}
      <header className="border-b border-border-warm pb-5 mb-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border-warm hover:bg-card text-foreground font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            ← Back to Directory
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground uppercase">
              {citizen.fullName}
            </h2>
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider mt-0.5">
              ID: {citizen.id} | EID: {citizen.emiratesId}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl border border-border-warm bg-card hover:border-gold font-bold text-[10px] uppercase tracking-wider transition-colors">
            Edit Data
          </button>
          <button className="bg-gold hover:bg-gold-hover text-white px-5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-sm transition-colors">
            Start New Case
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="flex-1 grid grid-cols-3 gap-8 items-start">
        
        {/* Left Column (1/3): Identity & Status Banner */}
        <div className="col-span-1 flex flex-col gap-6">
          
          {/* Active Case Warning Banner (Duplicate Prevention) */}
          {citizen.activeCaseOpen && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm animate-pulse">
              <div className="flex items-center gap-2 mb-2 text-red-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <h3 className="font-bold uppercase tracking-widest text-xs">Active Case Open</h3>
              </div>
              <p className="text-[11px] text-red-900/80 leading-relaxed font-medium">
                This citizen currently has an unresolved case pending. Check the case history before generating duplicate workloads.
              </p>
            </div>
          )}

          {/* Repeat Caller Alert */}
          {citizen.isRepeatCaller && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <div>
                <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1">Repeat Caller Detected</h4>
                <p className="text-[10px] text-amber-900/70 leading-relaxed font-medium">Citizen frequently contacts the program. Ensure past resolutions were fully completed by the responsible authority.</p>
              </div>
            </div>
          )}

          {/* Identity & Area Data Card (Data Minimization applied) */}
          <section className="bg-card border border-border-warm rounded-xl p-5 shadow-[0_2px_8px_rgba(20,19,17,0.01)] flex flex-col gap-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border-warm pb-2 flex justify-between items-center">
              Identity & Area Data
              <span className="bg-foreground/5 text-foreground/40 px-1.5 py-0.5 rounded text-[8px] font-bold">MINIMIZED</span>
            </h3>
            
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <span className="block text-[9px] text-foreground/50 uppercase tracking-widest font-bold mb-0.5">Contact Number</span>
                <span className="font-semibold text-foreground/90">{citizen.phone}</span>
              </div>
              <div>
                <span className="block text-[9px] text-foreground/50 uppercase tracking-widest font-bold mb-0.5">Primary Region</span>
                <span className="font-semibold text-foreground/90">{citizen.region}</span>
              </div>
              <div>
                <span className="block text-[9px] text-foreground/50 uppercase tracking-widest font-bold mb-0.5">Family / Social Status</span>
                <span className="font-semibold text-foreground/90">{citizen.familyStatus}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (2/3): Cases and Engagements */}
        <div className="col-span-2 bg-card border border-border-warm rounded-2xl p-6 shadow-xs flex flex-col self-stretch min-h-[480px]">
          
          <div className="flex border-b border-border-warm mb-6 gap-6 shrink-0">
            <button onClick={() => setActiveTab("history")} className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "history" ? "border-gold text-primary-text-gold" : "border-transparent text-foreground/50 hover:text-foreground"}`}>
              Past Cases ({citizen.pastCases.length})
            </button>
            <button onClick={() => setActiveTab("engagements")} className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "engagements" ? "border-gold text-primary-text-gold" : "border-transparent text-foreground/50 hover:text-foreground"}`}>
              Engagements & Logs ({citizen.engagements.length})
            </button>
            <button onClick={() => setActiveTab("documents")} className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "documents" ? "border-gold text-primary-text-gold" : "border-transparent text-foreground/50 hover:text-foreground"}`}>
              Documents ({localDocs.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            
            {activeTab === "history" && (
              <div className="flex flex-col gap-3">
                {citizen.pastCases.length === 0 ? (
                  <div className="text-center py-10 text-foreground/40 border border-dashed border-border-warm rounded-xl text-xs uppercase tracking-widest font-bold">No Past Cases Found</div>
                ) : (
                  citizen.pastCases.map(c => (
                    <div key={c.id} className="p-4 border border-border-warm bg-background rounded-xl flex items-center justify-between hover:border-gold transition-colors cursor-pointer">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-primary-text-gold text-[11px] uppercase">{c.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            c.status === "Resolved" ? "bg-green-50 text-green-700" :
                            c.status === "Open" ? "bg-red-50 text-red-700" :
                            "bg-foreground/10 text-foreground/60"
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-foreground">{c.title}</h4>
                        <span className="text-[10px] text-foreground/50 uppercase tracking-widest mt-1 block">Category: {c.category}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-[9px] text-foreground/40 uppercase tracking-widest mb-1">Created Date</span>
                        <span className="font-semibold text-xs text-foreground/80">{c.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "engagements" && (
              <div className="flex flex-col gap-4 relative pl-4 border-l-2 border-border-warm/50 ml-2">
                {citizen.engagements.length === 0 ? (
                  <div className="text-center py-10 text-foreground/40 border border-dashed border-border-warm rounded-xl text-xs uppercase tracking-widest font-bold -ml-4">No Engagements Logged</div>
                ) : (
                  citizen.engagements.map((eng, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-gold border-[3px] border-card"></div>
                      
                      <div className="bg-background border border-border-warm p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              eng.type === "Call" ? "bg-blue-50 text-blue-700" :
                              eng.type === "Document" ? "bg-purple-50 text-purple-700" :
                              "bg-amber-50 text-amber-700"
                            }`}>
                              {eng.type}
                            </span>
                            {eng.broadcastName && (
                              <span className="text-[10px] text-primary-text-gold font-bold uppercase tracking-wider bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                                {eng.broadcastName}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-foreground/50 font-bold tracking-widest uppercase">{eng.date}</span>
                        </div>
                        <p className="text-sm text-foreground/85 leading-relaxed font-medium">
                          {eng.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "documents" && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Document Repository</h3>
                  <button onClick={() => setShowAddDoc(true)} className="px-3 py-1.5 rounded-lg bg-gold hover:bg-gold-hover text-white text-[10px] font-bold uppercase tracking-wider transition-colors">+ Upload Doc</button>
                </div>
                
                {showAddDoc && (
                  <form onSubmit={handleAddDoc} className="p-4 bg-background border border-border-warm rounded-xl flex gap-3 items-end mb-4 animate-in fade-in slide-in-from-top-2 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5">Document Title</label>
                      <input required type="text" value={newDoc.title || ""} onChange={e => setNewDoc({...newDoc, title: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border-warm bg-card text-xs focus:outline-none focus:border-gold" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5">Upload File</label>
                      <input required type="file" className="w-full px-2 py-1.5 rounded-lg border border-border-warm bg-card text-xs focus:outline-none focus:border-gold file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-bold file:uppercase file:bg-gold-muted file:text-gold hover:file:bg-gold hover:file:text-white transition-colors cursor-pointer" />
                    </div>
                    <div className="w-48">
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5">Type</label>
                      <select required value={newDoc.type || ""} onChange={e => setNewDoc({...newDoc, type: e.target.value as any})} className="w-full px-3 py-2 rounded-lg border border-border-warm bg-card text-xs focus:outline-none focus:border-gold">
                        <option value="">Select Type...</option>
                        <option value="Identity">Identity</option>
                        <option value="Housing">Housing</option>
                        <option value="Income">Income</option>
                        <option value="Medical Report">Medical Report</option>
                        <option value="Bill">Bill</option>
                      </select>
                    </div>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-active-green hover:bg-green-600 text-white text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0">Save</button>
                    <button type="button" onClick={() => setShowAddDoc(false)} className="px-4 py-2 rounded-lg bg-card border border-border-warm hover:border-foreground/30 text-foreground/60 text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0">Cancel</button>
                  </form>
                )}

                <div className="flex flex-col gap-3">
                  {localDocs.length === 0 ? (
                    <div className="text-center py-10 text-foreground/40 border border-dashed border-border-warm rounded-xl text-xs uppercase tracking-widest font-bold">No Documents Uploaded</div>
                  ) : (
                    localDocs.map(doc => (
                      <div key={doc.id} className="p-4 border border-border-warm bg-background rounded-xl flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-card border border-border-warm flex items-center justify-center text-foreground/50 shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-sm text-foreground">{doc.title}</h4>
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-foreground/10 text-foreground/60">
                                {doc.type}
                              </span>
                            </div>
                            <span className="text-[10px] text-foreground/50 uppercase tracking-widest block">Added: {doc.dateAdded}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setSummaryDoc(doc)} className="px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5" title="Extract & Summarize with AI">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            AI Summary
                          </button>
                          <button onClick={() => handleDeleteDoc(doc.id)} className="p-2 rounded hover:bg-red-50 hover:text-red-600 text-foreground/40 transition-colors" title="Delete Document">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* AI Summary Right Drawer */}
      {summaryDoc && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSummaryDoc(null)} />
          <div className="fixed inset-y-0 right-0 z-[70] w-[400px] bg-background border-l border-border-warm shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <header className="p-5 border-b border-border-warm bg-card flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">AI Extraction</h3>
              </div>
              <button onClick={() => setSummaryDoc(null)} className="text-foreground/40 hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div>
                <span className="block text-[9px] text-foreground/50 uppercase tracking-widest font-bold mb-1">Source Document</span>
                <div className="font-semibold text-sm text-foreground">{summaryDoc.title}</div>
                <div className="text-[10px] text-foreground/50 uppercase tracking-widest mt-1">Type: {summaryDoc.type}</div>
              </div>
              
              <div className="bg-gold/5 border border-gold/20 rounded-xl p-5 relative">
                <div className="absolute top-0 right-0 p-3">
                   <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                </div>
                <h4 className="text-[10px] font-bold text-gold uppercase tracking-widest mb-3 border-b border-gold/20 pb-2">Extracted Entities</h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex justify-between border-b border-border-warm/50 pb-1">
                    <span className="text-foreground/60 font-medium">Confidence Score</span>
                    <span className="text-active-green font-bold">98.5%</span>
                  </li>
                  <li className="flex justify-between border-b border-border-warm/50 pb-1">
                    <span className="text-foreground/60 font-medium">Citizen Match</span>
                    <span className="text-foreground font-bold">Verified</span>
                  </li>
                  <li className="flex justify-between border-b border-border-warm/50 pb-1">
                    <span className="text-foreground/60 font-medium">Extracted Date</span>
                    <span className="text-foreground font-bold">{summaryDoc.dateAdded}</span>
                  </li>
                  <li className="flex justify-between pb-1">
                    <span className="text-foreground/60 font-medium">Key Finding</span>
                    <span className="text-foreground font-bold text-right max-w-[200px]">Meets criteria for Housing Grant fast-track</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-2">AI Summary</h4>
                <p className="text-sm text-foreground/80 leading-relaxed bg-card p-4 rounded-xl border border-border-warm shadow-inner">
                  This document indicates that the citizen meets all requisite parameters for the requested service. The AI model successfully extracted the identity metadata and confirmed it matches the citizen profile. No discrepancies found. Recommend proceeding with the application.
                </p>
              </div>
            </div>
            
            <footer className="p-5 border-t border-border-warm bg-card">
              <button onClick={() => setSummaryDoc(null)} className="w-full py-2.5 rounded-xl bg-gold hover:bg-gold-hover text-white text-xs font-bold uppercase tracking-widest shadow-sm transition-colors">
                Append to Case Notes
              </button>
            </footer>
          </div>
        </>
      )}
    </div>
  );
}


