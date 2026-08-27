"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "../../../components/Sidebar";
import { PortalHeader } from "../../../components/PortalHeader";
import { Pagination } from "../../../components/Pagination";
import { useRouter } from "next/navigation";

export interface ArchiveSession {
  id: string;
  title: string;
  date: string;
  duration: string;
  source: "YouTubeLive" | "LiveTV" | "RadioAoIP" | "HotLine";
  casesCount: number;
  directivesCount: number;
  summary: string[];
  transcript: { speaker: string; text: string; time: string }[];
  chatArchive?: { username: string; comment: string }[];
  linkedCases: { id: string; title: string; category: string; citizen: string }[];
  callers?: { id: string; name: string; region: string; duration: string }[];
  callNotes?: { callerName: string; time: string; text: string; author: string }[];
  mediaUrl: string; // YouTube embed ID or audio placeholder
}

// Mock historical archives data covering all 4 sources
export const MOCK_ARCHIVES: ArchiveSession[] = [
  {
    id: "arch-1",
    title: "Direct Line Live Broadcast - August 25, 2026 Feed",
    date: "August 25, 2026",
    duration: "1h 12m",
    source: "YouTubeLive",
    casesCount: 1,
    directivesCount: 1,
    mediaUrl: "jfKfPfyJRdk",
    summary: [
      "His Highness the Sheikh of Sharjah connected on the live Hot Line stream.",
      "Executive directive issued to Sharjah Health Authority to cover medical debts for Ahmed Al-Suwaidi.",
      "Producer verified and routed the case to Health Authority with an urgent 24h SLA."
    ],
    transcript: [
      { speaker: "Presenter", text: "We are live on television and YouTube, monitoring direct communications from the executive council.", time: "10:00:12" },
      { speaker: "Presenter", text: "His Highness the Sheikh is currently listening to local concerns in the central region.", time: "10:01:05" },
      { speaker: "His Highness", text: "Regarding the request from the citizen Ahmed Al-Suwaidi in Al Dhaid who has medical debt...", time: "10:02:40" },
      { speaker: "His Highness", text: "I direct the Sharjah Health Authority to cover his outstanding medical bills immediately.", time: "10:03:15" },
      { speaker: "Presenter", text: "May Allah protect His Highness. A clear directive has been issued for Ahmed Al-Suwaidi.", time: "10:04:02" }
    ],
    chatArchive: [
      { username: "Salem_AlKetbi", comment: "May Allah protect His Highness, always connecting directly with local people!" },
      { username: "Fatima_SHJ", comment: "We hope the Housing Department reviews the Al Dhaid applications soon." },
      { username: "Ali_Mansoori", comment: "Direct Line is the best channel for community transparency." },
      { username: "Hassan_AlAli", comment: "Sharjah Health Authority is always quick to resolve these directives." }
    ],
    linkedCases: [
      { id: "CASE-9810", title: "Executive Directive: Cover Health Debt", category: "Health & Medical", citizen: "Ahmed Al-Suwaidi" }
    ],
    callNotes: [
      { callerName: "Ahmed Al-Suwaidi", time: "10:01:45", text: "Caller verified via direct line. Medical debt is related to recent critical surgery in Sharjah Hospital. Total amount outstanding is 45,000 AED.", author: "Producer Salem" },
      { callerName: "Ahmed Al-Suwaidi", time: "10:04:10", text: "HH Directive issued on air. Routing file to Health Authority immediately.", author: "Producer Salem" }
    ]
  },
  {
    id: "arch-2",
    title: "Direct Line Radio Broadcast - August 24, 2026",
    date: "August 24, 2026",
    duration: "45m",
    source: "RadioAoIP",
    casesCount: 2,
    directivesCount: 0,
    mediaUrl: "radio-audio-tape",
    summary: [
      "Citizen caller raised concerns regarding clean water pipeline extensions in Al Dhaid region.",
      "Inquiry submitted to SEWGA (Sharjah Electricity, Water & Gas Authority) to audit pipeline deadlines."
    ],
    transcript: [
      { speaker: "Presenter", text: "Welcome to today's radio feed of Direct Line. Let's patch in Salem from Al Dhaid.", time: "14:15:22" },
      { speaker: "Salem", text: "Assalamu Alaikum. Our housing block in Al Dhaid is experiencing delays in water connection.", time: "14:16:04" },
      { speaker: "Presenter", text: "We will contact SEWGA immediately. The case manager will follow up on this query within 48 hours.", time: "14:17:15" }
    ],
    linkedCases: [
      { id: "CASE-9410", title: "Water Pipeline Connection Delay", category: "Government Services", citizen: "Salem Al-Ketbi" }
    ],
    callNotes: [
      { callerName: "Salem", time: "14:16:30", text: "Al Dhaid housing block sector 4. Water connection delayed by 3 months. Needs SEWGA escalation.", author: "Radio Screener" }
    ]
  },
  {
    id: "arch-3",
    title: "Direct Line TV Broadcast - August 23, 2026",
    date: "August 23, 2026",
    duration: "1h 30m",
    source: "LiveTV",
    casesCount: 3,
    directivesCount: 0,
    mediaUrl: "jfKfPfyJRdk", // Reusing standard mock stream for visual demo
    summary: [
      "Citizen discussed housing application delays submitted since 2023.",
      "Referred to Sharjah Housing Department with standard case priority."
    ],
    transcript: [
      { speaker: "Presenter", text: "Let's welcome Fatima from Khorfakkan to the TV broadcast feed.", time: "11:32:10" },
      { speaker: "Fatima", text: "Assalamu Alaikum. I submitted my housing files in October 2023. My children are growing and we need space.", time: "11:33:02" },
      { speaker: "Presenter", text: "We will route this case file to the Housing Department to review your priority status.", time: "11:34:12" }
    ],
    linkedCases: [
      { id: "CASE-9721", title: "Housing Grant Review request", category: "Housing Allocation", citizen: "Fatima Al-Suwaidi" }
    ],
    callNotes: [
      { callerName: "Fatima", time: "11:33:45", text: "Application #49281 submitted in Oct 2023. Family size has increased. Requesting priority escalation.", author: "TV Producer Desk" }
    ]
  },
  {
    id: "arch-4",
    title: "Hotline Intake Block - August 22, 2026",
    date: "August 22, 2026",
    duration: "2h 15m",
    source: "HotLine",
    casesCount: 5,
    directivesCount: 0,
    mediaUrl: "hotline-tape-record",
    summary: [
      "Intake screening of 5 callers. Form logs successfully routed to Operations Desk.",
      "Issues logged: 3 housing requests, 1 medical cover inquiry, 1 employment referral."
    ],
    transcript: [
      { speaker: "Screener", text: "Screener Intake desk active. Caller 1 verified: Mohammed Al-Ali from Sharjah City.", time: "09:12:00" },
      { speaker: "Screener", text: "Screener Intake desk active. Caller 2 verified: Maryam Al-Mansoori from Kalba.", time: "09:30:15" }
    ],
    callers: [
      { id: "cal-1", name: "Mohammed Al-Ali", region: "Sharjah City", duration: "12m 45s" },
      { id: "cal-2", name: "Maryam Al-Mansoori", region: "Kalba", duration: "08m 20s" }
    ],
    linkedCases: [
      { id: "CASE-9681", title: "Hotline Intake: Mohammed Al-Ali", category: "Housing Allocation", citizen: "Mohammed Al-Ali" },
      { id: "CASE-9682", title: "Hotline Intake: Maryam Al-Mansoori", category: "Employment Opportunity", citizen: "Maryam Al-Mansoori" }
    ],
    callNotes: [
      { callerName: "Mohammed Al-Ali", time: "09:15:20", text: "Housing application from 2024. Current rental has structural issues, needs urgent review.", author: "Hotline Agent 4" },
      { callerName: "Maryam Al-Mansoori", time: "09:34:10", text: "Recent graduate looking for employment initiatives. Referred to HR Directorate.", author: "Hotline Agent 2" }
    ]
  }
];

export default function ArchivesPage() {
  const router = useRouter();
  const [sessions] = useState<ArchiveSession[]>(MOCK_ARCHIVES);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  
  // Detail Drawer state
  const [selectedSession, setSelectedSession] = useState<ArchiveSession | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.linkedCases.some(c => c.citizen.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.linkedCases.some(c => c.id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSource = sourceFilter === "All" || s.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sourceFilter]);

  const totalPages = Math.ceil(filteredSessions.length / pageSize) || 1;
  const paginatedSessions = filteredSessions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      
      {/* 1. Left Sidebar */}
      <Sidebar activeItem="Broadcast Archives" />

      {/* 2. Main content area wrapper */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        <PortalHeader
          title="Past Broadcast Archives"
          subtitle="Review recorded television, radio, and YouTube streams, audit transcript text, and inspect case ingestion history."
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />

        <main className="flex-1 min-h-0 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">

        {/* Filter Bar */}
        <section className="flex gap-4 items-center shrink-0">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past episodes by name, citizen, or case ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-warm bg-card text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
            />
            <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground/50 uppercase font-bold tracking-wider whitespace-nowrap">Ingest Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border-warm bg-card text-foreground text-xs font-semibold uppercase tracking-wider focus:outline-none focus:border-gold"
            >
              <option value="All">All Ingest Feeds</option>
              <option value="YouTubeLive">YouTube Live</option>
              <option value="LiveTV">Live Television</option>
              <option value="RadioAoIP">Radio Broadcast</option>
              <option value="HotLine">Direct Hotline</option>
            </select>
          </div>

          {/* Card vs List layout toggler */}
          <div className="flex bg-card border border-border-warm rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === "card" 
                  ? "bg-gold text-white" 
                  : "text-foreground/60 hover:text-foreground hover:bg-background/50"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === "list" 
                  ? "bg-gold text-white" 
                  : "text-foreground/60 hover:text-foreground hover:bg-background/50"
              }`}
            >
              List
            </button>
          </div>
        </section>

        {/* 3. Conditional Layout Views */}
        {viewMode === "card" ? (
          /* Grid Card View (Default) */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedSessions.map((session) => (
                <div 
                  key={session.id}
                  className="bg-card border border-border-warm rounded-2xl overflow-hidden shadow-xs hover:border-gold hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail / Waveform Placeholder */}
                    <div className="relative h-44 bg-black flex items-center justify-center border-b border-border-warm">
                      {session.source === "YouTubeLive" || session.source === "LiveTV" ? (
                        /* Video placeholder */
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 bg-gradient-to-t from-black/80 to-transparent">
                          <span className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <svg className="w-6 h-6 fill-current pl-1" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                        </div>
                      ) : (
                        /* Audio waveform placeholder */
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 bg-gradient-to-t from-black/80 to-transparent">
                          <span className="w-12 h-12 rounded-full bg-amber-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          </span>
                        </div>
                      )}
                      {/* Badge source */}
                      <span className={`absolute top-4 left-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm z-10 ${
                        session.source === "YouTubeLive" ? "bg-red-600 text-white border border-red-700" :
                        session.source === "LiveTV" ? "bg-blue-600 text-white border border-blue-700" :
                        session.source === "RadioAoIP" ? "bg-amber-600 text-white border border-amber-700" :
                        "bg-green-600 text-white border border-green-700"
                      }`}>
                        {session.source.replace("Live", " Live").replace("TV", " TV").replace("AoIP", " AoIP").replace("HotLine", " Hotline")}
                      </span>
                    </div>

                    {/* Card Content Info */}
                    <div className="p-5 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] text-foreground/45 uppercase tracking-wider font-bold">
                        <span>{session.date}</span>
                        <span>{session.duration}</span>
                      </div>
                      <h3 className="font-bold text-primary-text-gold text-sm group-hover:text-gold transition-colors line-clamp-2">
                        {session.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-5 pt-0 flex justify-between items-center border-t border-border-warm/40 mt-3">
                    <div className="flex gap-2.5 text-[10px] font-bold text-foreground/50">
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${session.directivesCount > 0 ? "bg-red-600" : "bg-foreground/20"}`}></span>
                        {session.directivesCount} DIRECTIVES
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/20"></span>
                        {session.casesCount} CASES
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedSession(session)}
                      className="bg-gold hover:bg-gold-hover text-white px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xs transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredSessions.length}
              pageSize={pageSize}
              pageSizeOptions={[6, 12, 24]}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </div>
        ) : (
          /* Table List View */
          <section className="bg-card border border-border-warm rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(20,19,17,0.02)] animate-in fade-in duration-200">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border-warm bg-background/50 text-foreground/50 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-4 px-6">Episode / Session Title</th>
                    <th className="py-4 px-6">Source Feed</th>
                    <th className="py-4 px-6">Broadcast Date</th>
                    <th className="py-4 px-6">Duration</th>
                    <th className="py-4 px-6">Directives</th>
                    <th className="py-4 px-6">Cases Created</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-warm">
                  {paginatedSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-background/25 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-bold text-primary-text-gold block">{session.title}</span>
                        <span className="text-xs text-foreground/40 font-medium">Session ID: #{session.id}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          session.source === "YouTubeLive" ? "bg-red-50 text-red-700 border border-red-200" :
                          session.source === "LiveTV" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          session.source === "RadioAoIP" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-green-50 text-green-700 border border-green-200"
                        }`}>
                          {session.source.replace("Live", " Live").replace("TV", " TV").replace("AoIP", " AoIP").replace("HotLine", " Hotline")}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-foreground/80">{session.date}</td>
                      <td className="py-4 px-6 text-foreground/80">{session.duration}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`font-semibold ${session.directivesCount > 0 ? "text-red-600 font-bold" : "text-foreground/40"}`}>
                          {session.directivesCount}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-semibold text-foreground/80">{session.casesCount}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedSession(session)}
                          className="bg-gold hover:bg-gold-hover text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                        >
                          Review Session
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
              totalItems={filteredSessions.length}
              pageSize={pageSize}
              pageSizeOptions={[6, 12, 24]}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </section>
        )}
      </main>

      {/* 3. Detail Review Full-Screen Workspace */}
      {selectedSession && (
        <DetailWorkspace 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
        />
      )}

      </div>
    </div>
  );
}

interface DetailWorkspaceProps {
  session: ArchiveSession;
  onClose: () => void;
}

function DetailWorkspace({ session, onClose }: DetailWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"summary" | "notes" | "transcript" | "chat" | "cases" | "callers">("summary");

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col p-8 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Top Header */}
      <header className="border-b border-border-warm pb-5 mb-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border-warm hover:bg-card text-foreground font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            ← Back to Archives
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground uppercase">
              {session.title}
            </h2>
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider mt-0.5">
              Broadcast Date: {session.date} | Show Duration: {session.duration}
            </p>
          </div>
        </div>

        {/* Source Badge */}
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          session.source === "YouTubeLive" ? "bg-red-50 text-red-700 border border-red-200" :
          session.source === "LiveTV" ? "bg-blue-50 text-blue-700 border border-blue-200" :
          session.source === "RadioAoIP" ? "bg-amber-50 text-amber-700 border border-amber-200" :
          "bg-green-50 text-green-700 border border-green-200"
        }`}>
          {session.source.replace("Live", " Live").replace("TV", " TV").replace("AoIP", " AoIP").replace("HotLine", " Hotline")} Feed
        </span>
      </header>

      {/* Grid Split Content */}
      <div className="flex-1 grid grid-cols-3 gap-8 items-start">
        
        {/* Left Column (1/3): Media Player & Metrics */}
        <div className="col-span-1 flex flex-col gap-6">
          <section className="rounded-xl overflow-hidden border border-border-warm bg-black shrink-0 shadow-sm">
            {session.source === "YouTubeLive" || session.source === "LiveTV" ? (
              <iframe
                className="w-full h-[240px]"
                src={`https://www.youtube.com/embed/${session.mediaUrl}`}
                title="Archive replay player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="h-[200px] flex flex-col justify-center items-center text-center p-6 text-foreground/45 bg-card border-b border-border-warm">
                <svg className="w-10 h-10 mb-2 text-gold animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="text-[12px] font-bold uppercase tracking-wide">Studio Audio Tape Recording</span>
                <span className="text-[10px] text-foreground/40 mt-1 block">Ingest Source: {session.source === "RadioAoIP" ? "Radio AoIP Sub-Mix" : "Hotline Intake Record"}</span>
              </div>
            )}
          </section>

          {/* Quick Metrics */}
          <section className="bg-card border border-border-warm rounded-xl p-5 shadow-[0_2px_8px_rgba(20,19,17,0.01)] flex flex-col gap-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border-warm pb-2">
              Broadcast Overview
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-background border border-border-warm rounded-xl">
                <span className="text-[10px] text-foreground/50 block font-semibold uppercase">Directives</span>
                <span className={`text-lg font-bold ${session.directivesCount > 0 ? "text-red-600" : "text-foreground"}`}>
                  {session.directivesCount}
                </span>
              </div>
              <div className="p-3 bg-background border border-border-warm rounded-xl">
                <span className="text-[10px] text-foreground/50 block font-semibold uppercase">Cases Generated</span>
                <span className="text-lg font-bold text-foreground">
                  {session.casesCount}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (2/3): Tabbed Intelligence Panes */}
        <div className="col-span-2 bg-card border border-border-warm rounded-2xl p-6 shadow-xs flex flex-col self-stretch min-h-[480px]">
          
          {/* Tabs Navigation Header */}
          <div className="flex border-b border-border-warm mb-6 gap-6 shrink-0">
            {[
              { id: "summary", label: "AI Summary" },
              { id: "notes", label: "Call Notes" },
              { id: "transcript", label: "Timestamped Transcript" },
              ...(session.source !== "HotLine" ? [{ id: "chat", label: "Live Chat Log" }] : []),
              { id: "cases", label: "Case Created & Routed" },
              ...(session.source === "HotLine" ? [{ id: "callers", label: "List of Callers" }] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "border-gold text-primary-text-gold"
                    : "border-transparent text-foreground/50 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dynamic Tab Body Container */}
          <div className="flex-1 overflow-y-auto">
            
            {/* AI Summary Tab */}
            {activeTab === "summary" && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="bg-gold-muted/20 border border-gold/15 rounded-xl p-5">
                  <h4 className="text-xs font-bold text-primary-text-gold uppercase tracking-wider mb-3">
                    AI Post-Show Executive Summary
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-foreground/80 leading-relaxed flex flex-col gap-2.5">
                    {session.summary.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>

                {session.source === "HotLine" && session.callers && (
                  <div className="mt-2 flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-foreground/70 uppercase tracking-wider mb-1 px-1">
                      Individual Caller Summaries
                    </h4>
                    {session.callers.map((caller, idx) => (
                      <div key={idx} className="bg-card border border-border-warm hover:border-gold/30 rounded-xl p-5 flex justify-between items-start gap-6 transition-all shadow-[0_2px_8px_rgba(20,19,17,0.02)]">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1.5">
                            <h5 className="font-bold text-foreground text-sm">{caller.name}</h5>
                            <span className="text-[9px] uppercase font-bold tracking-widest bg-background border border-border-warm px-2 py-0.5 rounded text-foreground/60">
                              {caller.region}
                            </span>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-foreground/40">
                              ⏱ {caller.duration}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/70 leading-relaxed">
                            {idx === 0 
                              ? "Caller raised concerns about a housing allocation application submitted in 2024. Mentioned structural issues in current rental property requiring urgent attention."
                              : "Inquired about recent local employment initiatives and requested referral to the Sharjah Human Resources Directorate for available openings."
                            }
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            const summaryText = idx === 0 
                              ? "Caller raised concerns about a housing allocation application submitted in 2024. Mentioned structural issues in current rental property requiring urgent attention."
                              : "Inquired about recent local employment initiatives and requested referral to the Sharjah Human Resources Directorate for available openings.";
                            router.push(`/cases?action=new&autofill=true&name=${encodeURIComponent(caller.name)}&summary=${encodeURIComponent(summaryText)}`);
                          }}
                          className="shrink-0 px-4 py-2.5 bg-background border border-border-warm rounded-xl text-[10px] font-bold uppercase tracking-wider text-foreground hover:border-gold hover:text-primary-text-gold transition-colors shadow-sm flex items-center gap-1.5 mt-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          Create Case
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Screener/Producer Call Notes Tab */}
            {activeTab === "notes" && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200 pr-2 max-h-[400px] overflow-y-auto">
                {session.callNotes && session.callNotes.length > 0 ? (
                  session.callNotes.map((note, idx) => (
                    <div key={idx} className="bg-background border border-border-warm rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-border-warm/50 pb-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground uppercase tracking-widest">{note.callerName}</span>
                          <span className="text-[10px] bg-card border border-border-warm px-2 py-0.5 rounded text-foreground/50">Call Note</span>
                        </div>
                        <span className="text-[10px] text-foreground/45 font-mono">{note.time}</span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">"{note.text}"</p>
                      <div className="text-right mt-1">
                        <span className="text-[9px] font-bold text-primary-text-gold uppercase tracking-wider">Logged By: {note.author}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-foreground/40 border border-dashed border-border-warm rounded-xl">
                    No notes were logged for this session.
                  </div>
                )}
              </div>
            )}

            {/* Transcript Tab */}
            {activeTab === "transcript" && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200 max-h-[380px] overflow-y-auto pr-2">
                {session.transcript.map((line, idx) => (
                  <div key={idx} className="p-3 border border-border-warm bg-background rounded-xl flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px] text-foreground/45 uppercase tracking-wider">
                      <span className="font-bold">{line.speaker}</span>
                      <span>{line.time}</span>
                    </div>
                    <p className="text-sm text-foreground/85 leading-relaxed">{line.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Live Chat Log Tab */}
            {activeTab === "chat" && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-200 max-h-[380px] overflow-y-auto pr-2">
                {session.chatArchive ? (
                  session.chatArchive.map((chat, idx) => (
                    <div key={idx} className="flex gap-2 p-3 bg-background border border-border-warm rounded-xl text-sm items-start">
                      <span className="font-bold text-primary-text-gold shrink-0">@{chat.username}:</span>
                      <span className="text-foreground/80 leading-relaxed">{chat.comment}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-foreground/40 border border-dashed border-border-warm rounded-xl">
                    No live chat logs were recorded for this ingestion source channel.
                  </div>
                )}
              </div>
            )}

            {/* Case Created & Routed Tab */}
            {activeTab === "cases" && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {session.linkedCases.map((c) => (
                    <div 
                      key={c.id}
                      className="p-4 bg-background border border-border-warm rounded-xl hover:border-gold cursor-pointer transition-all duration-200 flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-primary-text-gold text-xs">{c.id}</span>
                        <span className="bg-red-50 border border-red-200 text-red-700 text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                          Active Inbound
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground">{c.title}</h4>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-foreground/50 mt-2 border-t border-border-warm/40 pt-2">
                        <div>
                          <span className="block font-bold">CITIZEN</span>
                          <span>{c.citizen}</span>
                        </div>
                        <div>
                          <span className="block font-bold">CATEGORY</span>
                          <span>{c.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of Callers Tab (Hotline only) */}
            {activeTab === "callers" && session.callers && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 gap-3">
                  {session.callers.map((caller) => (
                    <div key={caller.id} className="p-4 bg-background border border-border-warm rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-primary-text-gold text-sm">{caller.name}</h4>
                        <span className="text-[10px] text-foreground/50 uppercase tracking-widest font-semibold">{caller.region}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-foreground/40 uppercase tracking-widest">Call Duration</span>
                        <span className="text-xs font-bold text-foreground/80">{caller.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

