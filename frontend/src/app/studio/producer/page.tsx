"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "../../../components/Sidebar";
import { useBroadcast, BroadcastSource, ScreenerTicket } from "../../../context/BroadcastContext";

const DEPARTMENTS = [
  "Sharjah Housing Authority",
  "Sharjah Health Authority",
  "Ministry of Human Resources & Emiratisation",
  "Sharjah Social Services Department",
  "Sharjah Electricity, Water & Gas Authority"
];

const COMPLIANCE_PROFILES = [
  "Executive Directives Tracking",
  "Standard Case Management SLA",
  "General Public Feedback Auditing"
];

export default function ProducerStudioPage() {
  const {
    activeSource,
    switchSource,
    callerQueue,
    activeCaller,
    goOnAir,
    goOnAirStream,
    endCall,
    isLive,
    transcriptLines,
    ytComments,
    extractedDirectives,
    sttConfidence,
    priorCaseMatch,
    aiPrompts
  } = useBroadcast();

  const [editableTranscripts, setEditableTranscripts] = useState(transcriptLines);
  
  // Drawers States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  
  // Right Panel Tabs
  const [rightPanelTab, setRightPanelTab] = useState<"prompts" | "directives">("prompts");
  
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  
  const router = useRouter();

  // Simulated live VU volume level states
  const [presenterDb, setPresenterDb] = useState(-60);
  const [ingestDb, setIngestDb] = useState(-60);

  useEffect(() => {
    if (!isLive) {
      setPresenterDb(-60);
      setIngestDb(-60);
      return;
    }
    const interval = setInterval(() => {
      setPresenterDb(Math.floor(Math.random() * (-3 - -32 + 1) + -32));
      setIngestDb(Math.floor(Math.random() * (-6 - -38 + 1) + -38));
    }, 150);
    return () => clearInterval(interval);
  }, [isLive]);

  // Sync internal editable transcripts state when context updates
  useEffect(() => {
    setEditableTranscripts(transcriptLines);
  }, [transcriptLines]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [editableTranscripts]);

  // Ingest Config Form States
  const [tempSource, setTempSource] = useState<BroadcastSource>("YouTubeLive");
  const [streamUrl, setStreamUrl] = useState("https://www.youtube.com/watch?v=jfKfPfyJRdk");
  const [ingestChannel, setIngestChannel] = useState("Sharjah TV Live Stream Feed");
  const [complianceProfile, setComplianceProfile] = useState("Executive Directives Tracking");

  // Language switch toggle state
  const [transcriptLang, setTranscriptLang] = useState<"EN" | "AR">("EN");

  // Case Draft Form States
  const [caseTitle, setCaseTitle] = useState("");
  const [citizenName, setCitizenName] = useState("");
  const [mobileNum, setMobileNum] = useState("");
  const [category, setCategory] = useState("Housing Allocation");
  const [dept, setDept] = useState("Sharjah Housing Authority");
  const [desc, setDesc] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);

  const handleTempSourceChange = (src: BroadcastSource) => {
    setTempSource(src);
    if (src === "YouTubeLive") {
      setStreamUrl("https://www.youtube.com/watch?v=jfKfPfyJRdk");
      setIngestChannel("Sharjah TV Live Stream Feed");
    } else if (src === "LiveTV") {
      setStreamUrl("rtmp://broadcast.sba.gov.ae/live/sharjah_tv");
      setIngestChannel("Sharjah TV Direct Feed");
    } else if (src === "RadioAoIP") {
      setStreamUrl("aes67://multicast.sba.gov.ae:5004/direct_line");
      setIngestChannel("Direct Line Radio Sub-Mix");
    } else if (src === "HotLine") {
      setStreamUrl("SIP/trunk-hotline-sba");
      setIngestChannel("Sharjah Hotline Telephony Hybrid");
    }
  };

  const handleTranscriptTextChange = (idx: number, newText: string) => {
    const updated = [...editableTranscripts];
    updated[idx].text = newText;
    setEditableTranscripts(updated);
  };

  const handleOpenConfigClick = () => {
    setTempSource(activeSource);
    handleTempSourceChange(activeSource);
    setIsConfigDrawerOpen(true);
  };

  const handleEstablishConnection = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfigDrawerOpen(false);
    switchSource(tempSource);
    if (tempSource !== "HotLine") {
      // Stream sources trigger automatic transcription feed
      // Wrap in small timeout to ensure switchSource completes context state update
      setTimeout(() => {
        goOnAirStream();
      }, 50);
    }
  };

  const handleGenerateDraftClick = () => {
    if (activeSource === "HotLine" && activeCaller) {
      setCaseTitle(`Hotline Request: ${activeCaller.fullName}`);
      setCitizenName(activeCaller.fullName);
      setMobileNum(activeCaller.mobile);
      setCategory(activeCaller.category);
      setDept("Sharjah Housing Authority");
      setDesc(activeCaller.notes);
    } else if (extractedDirectives.length > 0) {
      const directive = extractedDirectives[0];
      setCaseTitle(`Executive Directive: ${directive.citizenName}`);
      setCitizenName(directive.citizenName);
      setMobileNum("+971-50-XXXXXXX");
      setCategory(directive.category);
      setDept(directive.entity);
      setDesc(`VERBAL EXECUTIVE DIRECTIVE ISSUED ON AIR:\n"${directive.text}"`);
    } else {
      setCaseTitle("General Broadcast Inquiry");
      setCitizenName("Unknown / Anonymous");
      setMobileNum("");
      setCategory("Government Services");
      setDept("Sharjah Social Services Department");
      setDesc("");
    }
    setIsDrawerOpen(true);
  };

  const handleDisconnectClick = () => {
    const confirmMsg = activeCaller 
      ? `Are you sure you want to disconnect caller ${activeCaller.fullName} from the live broadcast?` 
      : "Are you sure you want to disconnect the active ingest feed?";
    setConfirmModalMessage(confirmMsg);
    setShowConfirmModal(true);
  };

  const handleApproveCase = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setIsDrawerOpen(false);
      endCall();
    }, 2000);
  };

  return (
    <div className="min-h-screen flex bg-background">
      
      {/* 1. Left Sidebar */}
      <Sidebar activeItem="Live Studio Feed" />

      {/* 2. Main Content Deck */}
      <main className="flex-1 p-8 flex flex-col gap-6 overflow-hidden max-h-screen">
        
        {/* Header control deck */}
        <header className="flex justify-between items-center border-b border-border-warm pb-4 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">
              Producer Control Deck
            </h1>
            
            {/* Read-Only Source Status Badge */}
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                !isLive ? "bg-foreground/5 text-foreground/40 border border-border-warm" :
                activeSource === "HotLine" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                activeSource === "YouTubeLive" ? "bg-red-50 text-red-700 border border-red-200" :
                "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                {!isLive && "○ System Standby (Offline)"}
                {isLive && activeSource === "HotLine" && "📞 Ingest: Active Hotline"}
                {isLive && activeSource === "YouTubeLive" && "🔴 Ingest: YouTube Live Feed"}
                {isLive && activeSource === "LiveTV" && "📺 Ingest: Television Matrix"}
                {isLive && activeSource === "RadioAoIP" && "📻 Ingest: Radio AoIP Stream"}
              </span>
            </div>
          </div>

          {/* Go On-Air Trigger Buttons & VU meters */}
          <div className="flex items-center gap-6">
            
            {/* Live Dual Audio VU Meters */}
            {isLive && (
              <div className="flex items-center gap-4 bg-background border border-border-warm rounded-xl px-4 py-1.5 shadow-2xs">
                {/* Presenter Level */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-bold text-foreground/45 uppercase tracking-widest">Presenter Mic</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(12)].map((_, i) => {
                      const limit = -60 + (i * 5);
                      const active = presenterDb >= limit;
                      const isHot = limit > -10;
                      return (
                        <span 
                          key={i} 
                          className={`w-1 h-2 rounded-xs transition-colors duration-75 ${
                            !active ? "bg-foreground/5" : isHot ? "bg-red-500" : "bg-emerald-500"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Ingest Line Level */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-bold text-foreground/45 uppercase tracking-widest">Citizen Line</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(12)].map((_, i) => {
                      const limit = -60 + (i * 5);
                      const active = ingestDb >= limit;
                      const isHot = limit > -10;
                      return (
                        <span 
                          key={i} 
                          className={`w-1 h-2 rounded-xs transition-colors duration-75 ${
                            !active ? "bg-foreground/5" : isHot ? "bg-red-500" : "bg-emerald-500"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {!isLive && (
              <button
                onClick={handleOpenConfigClick}
                className="bg-gold hover:bg-gold-hover text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
              >
                Connect Ingest Feed
              </button>
            )}
            
            {isLive && (
              <button 
                onClick={handleDisconnectClick}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
              >
                Disconnect Feed
              </button>
            )}
          </div>
        </header>

        {/* Workspace Layout Grid */}
        <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
          
          {/* LEFT: Transcript and Notes Column */}
          <div className="col-span-2 flex flex-col gap-6 overflow-hidden">

            {/* Top: Real-time editable transcript board */}
            <section className="flex-1 bg-card border border-border-warm rounded-xl p-5 flex flex-col overflow-hidden shadow-[0_2px_8px_rgba(20,19,17,0.02)] min-h-[300px]">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-tight mb-3 border-b border-border-warm pb-2 flex items-center justify-between">
              <span>Speech-to-Text Live Transcript (Interactive Editor)</span>
              <div className="flex items-center gap-3">
                {/* Language Toggler */}
                <div className="flex bg-background border border-border-warm rounded-lg p-0.5 text-[9.5px] font-bold">
                  <button
                    type="button"
                    onClick={() => setTranscriptLang("EN")}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${transcriptLang === "EN" ? "bg-gold text-white" : "text-foreground/50 hover:text-foreground"}`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setTranscriptLang("AR")}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${transcriptLang === "AR" ? "bg-gold text-white" : "text-foreground/50 hover:text-foreground"}`}
                  >
                    AR
                  </button>
                </div>
                <span className="bg-gold-muted text-gold text-[9px] px-1.5 py-0.5 rounded border border-gold/10 font-bold">
                  EDITABLE FEED
                </span>
              </div>
            </h2>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
              {editableTranscripts.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center text-foreground/45">
                  <span className="text-[11px] font-semibold uppercase tracking-wide">Awaiting show start...</span>
                </div>
              ) : (
                editableTranscripts.map((line, idx) => {
                  const isHost = line.speaker.toUpperCase() === "HOST";
                  return (
                    <div 
                      key={idx}
                      className={`flex w-full ${isHost ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex flex-col gap-1.5 p-3 rounded-2xl border w-full shadow-sm ${
                        isHost 
                          ? "border-green-200 bg-green-50 rounded-tr-sm" 
                          : "border-border-warm bg-background rounded-tl-sm"
                      }`}>
                        <div className={`flex items-center gap-6 ${isHost ? "justify-end flex-row-reverse" : "justify-between"}`}>
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${isHost ? "text-green-700" : "text-foreground/50"}`}>
                            {line.speaker}
                          </span>
                          <span className={`text-[9px] ${isHost ? "text-green-700/60" : "text-foreground/40"}`}>{line.timestamp}</span>
                        </div>
                        {/* Live editable text area for correcting transcript errors */}
                        <input
                          type="text"
                          value={transcriptLang === "AR" ? (line.textAr || line.text) : line.text}
                          onChange={(e) => handleTranscriptTextChange(idx, e.target.value)}
                          className={`w-full border border-transparent focus:outline-none rounded px-2 py-1.5 text-sm transition-all ${
                            isHost ? "bg-white/60 text-green-950 hover:border-green-300 focus:border-green-500" : "bg-card text-foreground hover:border-border-warm focus:border-gold"
                          }`}
                          dir={transcriptLang === "AR" ? "rtl" : "ltr"}
                        />
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={transcriptEndRef} />
            </div>
          </section>

          {/* Bottom: Notes Taking Box */}
          {activeSource === "HotLine" && activeCaller && (
            <section className="h-[220px] shrink-0 bg-card border border-border-warm rounded-xl p-5 flex flex-col shadow-[0_2px_8px_rgba(20,19,17,0.02)] animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-tight mb-3 border-b border-border-warm pb-2">
                Producer Notes for: <span className="text-primary-text-gold">{activeCaller.fullName}</span>
              </h2>
              <textarea 
                className="flex-1 w-full bg-background border border-border-warm rounded-lg p-3 text-sm focus:outline-none focus:border-gold resize-none"
                placeholder="Type private notes here during the call. These notes will be saved to the citizen's profile automatically when the call ends."
              ></textarea>
              <div className="mt-3 flex justify-end">
                <button className="bg-gold hover:bg-gold-hover text-white px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm">
                  Save Notes
                </button>
              </div>
            </section>
          )}

        </div>

          {/* RIGHT: Queue monitor / Directives and action box */}
          <section className="col-span-1 flex flex-col gap-5 overflow-hidden">
            
            {/* Source-specific Queue Panel */}
            <div className="bg-card border border-border-warm rounded-xl p-5 shadow-[0_2px_8px_rgba(20,19,17,0.02)] flex-1 overflow-hidden flex flex-col">
              {activeSource === "HotLine" ? (
                // Hotline queue
                <div className="flex-1 flex flex-col overflow-hidden">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-tight mb-3 border-b border-border-warm pb-2 flex justify-between items-center">
                    <span>Screener Queue</span>
                    <span className="bg-foreground/5 text-foreground/60 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      {callerQueue.length} WAITING
                    </span>
                  </h3>
                  
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                    {callerQueue.length === 0 ? (
                      <span className="text-foreground/40 text-[10px] text-center my-auto">No screened calls in queue</span>
                    ) : (
                      callerQueue.map((caller) => (
                        <div 
                          key={caller.id}
                          className={`p-3 border rounded-xl flex items-center justify-between gap-3 transition-colors ${
                            activeCaller?.id === caller.id 
                              ? "bg-gold-muted border-gold/40 text-foreground" 
                              : "bg-background border-border-warm hover:border-gold/30"
                          }`}
                        >
                          <div>
                            <span className="font-bold text-xs text-primary-text-gold block">{caller.fullName}</span>
                            <span className="text-[9px] text-foreground/50">{caller.region}</span>
                          </div>
                          
                          <button
                            onClick={() => goOnAir(caller)}
                            disabled={isLive && activeCaller?.id === caller.id}
                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                              activeCaller?.id === caller.id
                                ? "bg-active-green text-white cursor-default"
                                : "bg-gold hover:bg-gold-hover text-white"
                            }`}
                          >
                            {activeCaller?.id === caller.id ? "On Air" : "PATCH IN"}
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Past Cases Section for Active Caller */}
                  {activeCaller && priorCaseMatch && (
                    <div className="mt-4 pt-4 border-t border-border-warm flex flex-col gap-2 shrink-0">
                      <h4 className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="text-gold">◷</span> Prior Case History
                      </h4>
                      <div className="bg-foreground/5 border border-border-warm rounded-lg p-2.5 text-xs">
                        <span className="font-semibold text-primary-text-gold block mb-0.5">Caller: {activeCaller.fullName}</span>
                        <p className="text-foreground/80 leading-relaxed font-medium">
                          {priorCaseMatch}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // YouTube Chat comments feed
                <div className="flex-1 flex flex-col overflow-hidden">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-tight mb-2 border-b border-border-warm pb-2 flex justify-between items-center">
                    <span>YT Live Chat Stream</span>
                    <span className="bg-red-50 text-red-600 text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-widest animate-pulse">Monitor</span>
                  </h3>

                  {/* YouTube Embed Player */}
                  {isLive && activeSource === "YouTubeLive" && (
                    <div className="mb-3 shrink-0 rounded-xl overflow-hidden border border-border-warm bg-black">
                      <iframe 
                        className="w-full h-[150px]" 
                        src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1" 
                        title="Sharjah Live stream" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 text-xs">
                    {ytComments.length === 0 ? (
                      <span className="text-foreground/40 text-[10px] text-center my-auto">Stream chat offline</span>
                    ) : (
                      ytComments.map((c, i) => (
                        <div key={i} className="flex gap-1.5 p-2 bg-background border border-border-warm rounded-lg">
                          <span className="font-bold text-primary-text-gold">@{c?.username}:</span>
                          <span className="text-foreground/80 leading-relaxed">{c?.comment}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tabbed AI Assistant & Directives Panel */}
            <div className="bg-card border border-border-warm rounded-xl p-5 shadow-[0_2px_8px_rgba(20,19,17,0.02)] shrink-0 flex flex-col gap-3 min-h-[220px]">
              
              <div className="flex justify-between items-center border-b border-border-warm pb-2 shrink-0">
                <div className="flex gap-4">
                  <button 
                    onClick={() => setRightPanelTab("prompts")}
                    className={`text-xs font-bold uppercase tracking-tight pb-2 border-b-2 transition-colors ${
                      rightPanelTab === "prompts" ? "border-gold text-foreground" : "border-transparent text-foreground/50 hover:text-foreground/80"
                    }`}
                  >
                    AI Suggestions
                  </button>
                  <button 
                    onClick={() => setRightPanelTab("directives")}
                    className={`text-xs font-bold uppercase tracking-tight pb-2 border-b-2 transition-colors ${
                      rightPanelTab === "directives" ? "border-gold text-foreground" : "border-transparent text-foreground/50 hover:text-foreground/80"
                    }`}
                  >
                    Extracted Directives
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  {rightPanelTab === "prompts" && (
                    <span className="bg-gold-muted text-gold text-[9px] px-1.5 py-0.5 rounded border border-gold/10 font-bold">
                      {aiPrompts?.length || 0} ALERTS
                    </span>
                  )}
                  {rightPanelTab === "directives" && isLive && (
                    <span className="bg-gold-muted text-gold text-[9px] px-1.5 py-0.5 rounded border border-gold/15 font-bold">
                      Acc: {sttConfidence}%
                    </span>
                  )}
                  {rightPanelTab === "directives" && extractedDirectives.length > 0 && (
                    <span className="bg-red-50 text-red-700 text-[9px] px-1.5 py-0.5 rounded border border-red-200 font-bold">
                      {extractedDirectives.length} DETECTED
                    </span>
                  )}
                </div>
              </div>

              {/* Tab Content: AI Prompts */}
              {rightPanelTab === "prompts" && (
                <div className="flex-1 max-h-[160px] overflow-y-auto pr-1 flex flex-col gap-3">
                  {!aiPrompts || aiPrompts.length === 0 ? (
                    <div className="flex flex-col justify-center items-center text-center text-foreground/45 border border-dashed border-border-warm rounded-lg p-4 h-full">
                      <span className="text-[10px] font-bold uppercase tracking-wide">No active prompts</span>
                    </div>
                  ) : (
                    aiPrompts.map((prompt) => (
                      <div 
                        key={prompt.id} 
                        className="p-3 border border-gold/30 bg-gold-muted rounded-xl flex flex-col gap-1.5 animate-in slide-in-from-right duration-300"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[10px] text-primary-text-gold">{prompt.title}</span>
                        </div>
                        <p className="text-[10px] text-foreground/85 leading-relaxed">{prompt.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab Content: Extracted Directives */}
              {rightPanelTab === "directives" && (
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[160px]">
                  {activeSource !== "HotLine" && extractedDirectives.length === 0 ? (
                    <span className="text-foreground/40 text-[10px] text-center py-4 my-auto">Awaiting live directive detection...</span>
                  ) : activeSource === "HotLine" && !activeCaller ? (
                    <span className="text-foreground/40 text-[10px] text-center py-4 my-auto">No active caller to extract draft from</span>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl text-xs">
                        {activeSource === "HotLine" && activeCaller ? (
                          <div>
                            <span className="font-semibold text-primary-text-gold block">Caller: {activeCaller.fullName}</span>
                            <p className="text-foreground/80 mt-1 italic">"{activeCaller.notes}"</p>
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold text-red-950 block">Directive: Cover Health Debt</span>
                            <span className="text-[10px] text-foreground/50 mt-0.5 block">Target: {extractedDirectives[0]?.entity}</span>
                            <p className="text-foreground/80 mt-1 italic">"{extractedDirectives[0]?.text}"</p>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => router.push('/directives?action=new')}
                        className="w-full shrink-0 bg-gold hover:bg-gold-hover text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
                      >
                        Log Directive
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

          </section>

        </div>
      </main>

      {/* 3. Ingestion Config Setup Drawer (Slides right to left) */}
      {isConfigDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-card border-l border-border-warm p-8 w-full max-w-md shadow-2xl h-full flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <form onSubmit={handleEstablishConnection} className="flex flex-col gap-6">
              <header className="border-b border-border-warm pb-3">
                <h3 className="text-base font-bold text-foreground uppercase tracking-tight">
                  Configure Live Ingestion Feed
                </h3>
                <p className="text-xs text-foreground/50 uppercase tracking-wider mt-0.5">
                  Establish feed routing to the transcription engine
                </p>
              </header>

              <div className="flex flex-col gap-4">
                
                {/* Source Ingestion Protocol Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Ingestion Source Protocol
                  </label>
                  <select
                    value={tempSource}
                    onChange={(e) => handleTempSourceChange(e.target.value as BroadcastSource)}
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors font-semibold uppercase tracking-wider"
                  >
                    <option value="YouTubeLive">🔴 YouTube Live API Ingest</option>
                    <option value="LiveTV">📺 Live TV RTMP/HLS Encoder</option>
                    <option value="RadioAoIP">📻 AES67 / Dante Studio Sub-mix</option>
                    <option value="HotLine">📞 Active Hotline Connection</option>
                  </select>
                </div>

                {/* Ingestion Stream URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Feed Ingest URL / Port Address
                  </label>
                  <input
                    type="text"
                    required
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                {/* Target Channel Identifier */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Target Broadcast Channel Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={ingestChannel}
                    onChange={(e) => setIngestChannel(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                {/* Compliance Rules Profile */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Directives Compliance Rules Profile
                  </label>
                  <select
                    value={complianceProfile}
                    onChange={(e) => setComplianceProfile(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                  >
                    {COMPLIANCE_PROFILES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-border-warm pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsConfigDrawerOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border-warm bg-background hover:bg-background/80 text-foreground font-semibold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-hover text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Establish Ingestion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. CRUD Review Case Draft Drawer (Slides right to left) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-card border-l border-border-warm p-8 w-full max-w-md shadow-2xl h-full flex flex-col justify-between animate-in slide-in-from-right duration-300 overflow-y-auto">
            <form onSubmit={handleApproveCase} className="flex flex-col gap-6">
              <header className="border-b border-border-warm pb-3">
                <h3 className="text-base font-bold text-foreground uppercase tracking-tight">
                  Review Case Ingestion Draft
                </h3>
                <p className="text-xs text-foreground/50 uppercase tracking-wider mt-0.5">
                  Verify details before routing case to operations
                </p>
              </header>

              {successMsg && (
                <div className="bg-green-50 border border-green-200 text-active-green text-xs px-4 py-3 rounded-lg flex items-center gap-2 font-medium">
                  ✓ Case draft approved and routed to the Operations Queue.
                </div>
              )}

              <div className="flex flex-col gap-4">
                
                {/* Case Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Case Title
                  </label>
                  <input
                    type="text"
                    required
                    value={caseTitle}
                    onChange={(e) => setCaseTitle(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                {/* Citizen Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Citizen Name
                  </label>
                  <input
                    type="text"
                    required
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                {/* Mobile Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={mobileNum}
                    onChange={(e) => setMobileNum(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                {/* Routing Department */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Target Government Authority
                  </label>
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Case Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Case Description / Transcribed Directive
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30 resize-none"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-border-warm pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border-warm bg-background hover:bg-background/80 text-foreground font-semibold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-hover text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Approve & Route Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Custom Premium Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border-warm rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <header className="border-b border-border-warm pb-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="text-red-600 text-lg">⚠</span> Confirm Disconnect
              </h3>
            </header>
            
            <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
              {confirmModalMessage}
            </p>
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-border-warm bg-background hover:bg-background/80 text-foreground font-semibold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  endCall();
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-[10px] uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
