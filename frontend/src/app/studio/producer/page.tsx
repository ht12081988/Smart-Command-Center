"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "../../../components/Sidebar";
import { PortalHeader } from "../../../components/PortalHeader";
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

function formatScheduleDisplay(isoStr: string) {
  if (!isoStr) return { dateStr: "Today", timeStr: "03:30 PM" };
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return { dateStr: "Today", timeStr: isoStr };
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    return { dateStr, timeStr };
  } catch {
    return { dateStr: "Today", timeStr: isoStr };
  }
}

function isScheduledForToday(isoStr: string) {
  if (!isoStr) return true;
  try {
    const targetDate = new Date(isoStr);
    if (isNaN(targetDate.getTime())) return true;
    const now = new Date();
    return (
      targetDate.getFullYear() === now.getFullYear() &&
      targetDate.getMonth() === now.getMonth() &&
      targetDate.getDate() === now.getDate()
    );
  } catch {
    return true;
  }
}

function ProducerStudioPageContent() {
  const {
    activeSource,
    switchSource,
    scheduleDateTime,
    setScheduleDateTime,
    feedTitle,
    setFeedTitle,
    callerQueue,
    activeCaller,
    removeFromQueue,
    goOnAir,
    goOnAirStream,
    endCall,
    disconnectCaller,
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
  const [isTelemetryDrawerOpen, setIsTelemetryDrawerOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [openedFromCatalog, setOpenedFromCatalog] = useState(false);
  
  // Right Panel Tabs Split (Upper & Lower sections)
  const [upperPanelTab, setUpperPanelTab] = useState<"transcript" | "directives" | "chat" | "queue" | "telemetry">("transcript");
  const [lowerPanelTab, setLowerPanelTab] = useState<"prompts" | "notes">("prompts");
  
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Demo auto-trigger sequence
  useEffect(() => {
    const isDemo = searchParams.get("demo") === "true";
    const isDemoHotline = searchParams.get("demo_hotline") === "true";
    
    if (isDemo && !isLive) {
      switchSource("YouTubeLive");
      goOnAirStream();
      setUpperPanelTab("transcript");
      setLowerPanelTab("prompts");
    } else if (isDemoHotline && !isLive) {
      switchSource("HotLine");
      // Find or fall back to default mock caller
      const mockCaller = callerQueue[0] || {
        id: "caller-mock-1",
        fullName: "Salem Al-Ketbi",
        email: "salem.alketbi@example.ae",
        mobile: "+971-50-1234567",
        category: "Housing Allocation",
        region: "Eastern Region (Khorfakkan)",
        notes: "Requesting updates regarding housing allotment application submitted in Jan 2025. Family currently living in a high-rent apartment."
      };
      goOnAir(mockCaller);
      setUpperPanelTab("transcript");
      setLowerPanelTab("prompts");
    }
  }, [searchParams, isLive]);


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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLive) {
        handleDisconnectClick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLive]);

  // Ingest Config Form States
  const [tempSource, setTempSource] = useState<BroadcastSource>("YouTubeLive");
  const [streamUrl, setStreamUrl] = useState("https://www.youtube.com/watch?v=wWYK6IVszPk");
  const [ingestChannel, setIngestChannel] = useState("Sharjah TV Live Stream Feed");
  const [complianceProfile, setComplianceProfile] = useState("Executive Directives Tracking");

  // Simulated Broadcast Telemetry States
  const [telemetryLatency, setTelemetryLatency] = useState("0 ms");
  const [telemetryPacketLoss, setTelemetryPacketLoss] = useState("0.00%");
  const [telemetryBitrate, setTelemetryBitrate] = useState("0 kbps");
  const [telemetryUptime, setTelemetryUptime] = useState(0);

  useEffect(() => {
    if (!isLive) {
      setTelemetryLatency("0 ms");
      setTelemetryPacketLoss("0.00%");
      setTelemetryBitrate("0 kbps");
      setTelemetryUptime(0);
      return;
    }

    if (activeSource === "RadioAoIP") {
      setTelemetryBitrate("1,411 kbps (PCM)");
    } else if (activeSource === "LiveTV") {
      setTelemetryBitrate("320 kbps (AAC)");
    } else if (activeSource === "YouTubeLive") {
      setTelemetryBitrate("256 kbps (AAC)");
    }

    const interval = setInterval(() => {
      setTelemetryUptime(prev => prev + 1);

      if (activeSource === "RadioAoIP") {
        const jitter = (40 + Math.random() * 4).toFixed(1);
        setTelemetryLatency(`${jitter} ms`);
      } else if (activeSource === "LiveTV") {
        const jitter = (1.82 + Math.random() * 0.08).toFixed(2);
        setTelemetryLatency(`${jitter} s`);
      } else {
        setTelemetryLatency("—");
      }

      const lossProb = Math.random();
      if (lossProb > 0.95) {
        setTelemetryPacketLoss((Math.random() * 0.05).toFixed(2) + "%");
      } else {
        setTelemetryPacketLoss("0.00%");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, activeSource]);

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // Language switch toggle state
  const [transcriptLang, setTranscriptLang] = useState<"EN" | "AR">("EN");

  // Producer Notes taking states
  const [producerNotes, setProducerNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  const handleSaveNotes = () => {
    if (activeCaller) {
      activeCaller.notes = producerNotes;
    }
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  // Sync producerNotes when activeCaller changes
  useEffect(() => {
    if (activeCaller) {
      setProducerNotes(activeCaller.notes || "");
    } else {
      setProducerNotes("");
    }
  }, [activeCaller]);

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
      setStreamUrl("https://www.youtube.com/watch?v=wWYK6IVszPk");
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
    const defaultSrc = isLive ? activeSource : "YouTubeLive";
    setTempSource(defaultSrc);
    handleTempSourceChange(defaultSrc);
    setIsConfigDrawerOpen(true);
  };

  const handleEstablishConnection = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfigDrawerOpen(false);
    setFeedTitle(ingestChannel);
    switchSource(tempSource);
    setUpperPanelTab("transcript");
    // Scheduled feed saved. User remains on catalog listing page.
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
      ? `Are you sure you want to disconnect caller ${activeCaller.fullName} from the live broadcast and return to the previous page?` 
      : "Are you sure you want to disconnect the active ingest feed and return to the previous page?";
    setConfirmModalMessage(confirmMsg);
    setShowConfirmModal(true);
  };

  const handleCloseOverlayClick = () => {
    const confirmMsg = activeCaller
      ? `Are you sure you want to close the studio control desk and disconnect caller ${activeCaller.fullName}?`
      : "Are you sure you want to close the studio control desk and disconnect the active feed?";
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
    <div className="h-screen flex overflow-hidden bg-background">
      
      {/* 1. Left Sidebar */}
      <Sidebar activeItem="Live Studio Feed" />

      {/* 2. Main Content Deck Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        <PortalHeader
          title="Live Studio Control Desk"
          subtitle="Manage live feeds, monitor live transcripts, and coordinate the screener queue."
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
            </svg>
          }
          actions={
            <div className="flex items-center gap-3 justify-end whitespace-nowrap">
              {!isLive ? (
                <button
                  onClick={handleOpenConfigClick}
                  className="bg-gold hover:bg-gold-hover text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-colors whitespace-nowrap cursor-pointer"
                >
                  Schedule a Feed
                </button>
              ) : (
                <button
                  onClick={handleDisconnectClick}
                  className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-colors whitespace-nowrap cursor-pointer"
                >
                  Disconnect Feed
                </button>
              )}
            </div>
          }
        />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8 bg-background/50">
          {/* SECTION 1: LIVE NOW & ACTIVE FEEDS */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-border-warm pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">
                  🔴 Live Now & Active Feeds
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* CARD 1: Scheduled Live Feed (Rendered when scheduled for Today) */}
              {isScheduledForToday(scheduleDateTime) && (
                <div className="bg-card border border-border-warm rounded-2xl overflow-hidden shadow-xs hover:border-gold hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
                  <div>
                    <div className="relative h-44 bg-black flex items-center justify-center border-b border-border-warm">
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <span className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <svg className="w-6 h-6 fill-current pl-1" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </div>
                      <span className="absolute top-4 left-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm z-10 bg-red-600 text-white border border-red-700">
                        {activeSource === "LiveTV" ? "Live TV Feed" : activeSource === "RadioAoIP" ? "Radio AoIP Stream" : "YouTube Live Feed"}
                      </span>
                      <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-gold border border-gold/40 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 z-10">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatScheduleDisplay(scheduleDateTime).timeStr}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] text-foreground/45 uppercase tracking-wider font-bold">
                        <span>Today</span>
                        <span className="text-red-500 font-bold">Live Feed Active</span>
                      </div>
                      <h4 className="font-bold text-primary-text-gold text-sm group-hover:text-gold transition-colors line-clamp-2 uppercase tracking-tight">
                        {feedTitle || "Sharjah TV Live Stream Feed"}
                      </h4>
                      <div className="bg-gold-muted/40 border border-gold/25 p-2 rounded-xl flex items-center justify-between text-[9.5px] font-bold text-primary-text-gold mt-1">
                        <span className="uppercase tracking-widest text-foreground/60">Scheduled Feed Time</span>
                        <span className="font-mono text-gold">{formatScheduleDisplay(scheduleDateTime).dateStr} @ {formatScheduleDisplay(scheduleDateTime).timeStr}</span>
                      </div>
                      <ul className="mt-1 space-y-1 text-xs text-foreground/70">
                        <li className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-gold">•</span>
                          <span>Active broadcast feed with real-time STT speech transcription.</span>
                        </li>
                        <li className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-gold">•</span>
                          <span>Listening for Ruler executive directives and immediate citizen complaints.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      onClick={() => {
                        setOpenedFromCatalog(true);
                        switchSource(activeSource === "HotLine" ? "YouTubeLive" : activeSource);
                        goOnAirStream();
                      }}
                      className="w-full text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all bg-gold hover:bg-gold-hover text-white flex items-center justify-center gap-2 cursor-pointer"
                    >
                      🔌 View Feed
                    </button>
                  </div>
                </div>
              )}

              {/* CARD 2: Active Hotline Queue Desk */}
              <div className="bg-card border border-border-warm rounded-2xl overflow-hidden shadow-xs hover:border-gold hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
                <div>
                  <div className="relative h-44 bg-black flex items-center justify-center border-b border-border-warm">
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </span>
                    </div>
                    <span className="absolute top-4 left-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm z-10 bg-indigo-600 text-white border border-indigo-700">
                      Direct Hotline Desk
                    </span>
                  </div>

                  <div className="p-5 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] text-foreground/45 uppercase tracking-wider font-bold">
                      <span>Today</span>
                      <span className="text-amber-500 font-bold">Queue Open ({callerQueue.length} Waiting)</span>
                    </div>
                    <h4 className="font-bold text-primary-text-gold text-sm group-hover:text-gold transition-colors line-clamp-2 uppercase tracking-tight">
                      Sharjah Telephony Hotline Trunk
                    </h4>
                    <ul className="mt-2 space-y-1 text-xs text-foreground/70">
                      <li className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-gold">•</span>
                        <span>Direct telephone line for citizen public grievances.</span>
                      </li>
                      <li className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-gold">•</span>
                        <span>Screen caller queue, manage notes, and auto-draft emergency cases.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      setOpenedFromCatalog(true);
                      switchSource("HotLine");
                      setTimeout(() => {
                        if (callerQueue.length > 0) {
                          goOnAir(callerQueue[0]);
                        } else {
                          goOnAirStream();
                        }
                      }, 50);
                    }}
                    className="w-full text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all bg-foreground text-background hover:bg-gold hover:text-white flex items-center justify-center gap-2 cursor-pointer"
                  >
                    📞 Screen Active Hotline Queue
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: UPCOMING SCHEDULED STREAMS */}
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-border-warm pb-2">
              <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-widest">
                📅 Upcoming Scheduled Broadcasts
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* User's Scheduled Feed (Rendered here when date is NOT Today) */}
              {!isScheduledForToday(scheduleDateTime) && (
                <div className="bg-card border border-border-warm rounded-2xl overflow-hidden shadow-xs hover:border-gold transition-all duration-200 flex flex-col justify-between group">
                  <div>
                    <div className="relative h-44 bg-black flex items-center justify-center border-b border-border-warm">
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <span className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 text-gold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <svg className="w-6 h-6 fill-current pl-1" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </div>
                      <span className="absolute top-4 left-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm z-10 bg-gold text-white">
                        Upcoming Scheduled Feed
                      </span>
                      <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-gold border border-gold/40 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 z-10">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatScheduleDisplay(scheduleDateTime).timeStr}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] text-foreground/45 uppercase tracking-wider font-bold">
                        <span>{formatScheduleDisplay(scheduleDateTime).dateStr}</span>
                        <span className="text-gold font-bold">{formatScheduleDisplay(scheduleDateTime).timeStr}</span>
                      </div>
                      <h4 className="font-bold text-primary-text-gold text-sm group-hover:text-gold transition-colors line-clamp-2 uppercase tracking-tight">
                        {feedTitle || "Sharjah Scheduled Broadcast Feed"}
                      </h4>
                      <p className="text-xs text-foreground/60 mt-1">
                        Scheduled broadcast feed for {formatScheduleDisplay(scheduleDateTime).dateStr} @ {formatScheduleDisplay(scheduleDateTime).timeStr}.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      onClick={() => {
                        setOpenedFromCatalog(true);
                        switchSource("YouTubeLive");
                        goOnAirStream();
                      }}
                      className="w-full text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all bg-gold hover:bg-gold-hover text-white flex items-center justify-center gap-2 cursor-pointer"
                    >
                      🔌 View Feed (Simulation)
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-card border border-border-warm rounded-2xl overflow-hidden shadow-xs hover:border-gold/30 transition-all duration-200 flex flex-col justify-between group opacity-85">
                <div>
                  <div className="relative h-44 bg-black/90 flex items-center justify-center border-b border-border-warm">
                    <span className="w-12 h-12 rounded-full bg-foreground/10 text-foreground/40 flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </span>
                  </div>
                  <div className="p-5 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] text-foreground/45 uppercase tracking-wider font-bold">
                      <span>Sept 02, 2026</span>
                      <span className="text-foreground/50 font-bold">10:00 AM</span>
                    </div>
                    <h4 className="font-bold text-foreground/80 text-sm line-clamp-2 uppercase tracking-tight">
                      Sharjah TV Special Assembly Feed
                    </h4>
                    <p className="text-xs text-foreground/60 mt-1">Scheduled TV broadcast coverage for Executive Council session monitoring.</p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <div className="w-full text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-foreground/5 text-foreground/40 border border-border-warm">
                    📅 Scheduled Broadcast
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border-warm rounded-2xl overflow-hidden shadow-xs hover:border-gold/30 transition-all duration-200 flex flex-col justify-between group opacity-85">
                <div>
                  <div className="relative h-44 bg-black/90 flex items-center justify-center border-b border-border-warm">
                    <span className="w-12 h-12 rounded-full bg-foreground/10 text-foreground/40 flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </span>
                  </div>
                  <div className="p-5 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] text-foreground/45 uppercase tracking-wider font-bold">
                      <span>Sept 03, 2026</span>
                      <span className="text-foreground/50 font-bold">08:30 AM</span>
                    </div>
                    <h4 className="font-bold text-foreground/80 text-sm line-clamp-2 uppercase tracking-tight">
                      Sharjah Radio Morning Sub-Mix Feed
                    </h4>
                    <p className="text-xs text-foreground/60 mt-1">Scheduled AoIP studio sub-mix stream for morning public feedback.</p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <div className="w-full text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-foreground/5 text-foreground/40 border border-border-warm">
                    📅 Scheduled Broadcast
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* FULLSCREEN STUDIO CONTROL DESK OVERLAY (Rendered when isLive is true) */}
        {isLive && (
          <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Overlay Header Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border-warm bg-card shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-600 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-tight">
                      {feedTitle || "Sharjah TV Live Stream Feed"}
                    </h2>
                    <span className="bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      LIVE CONTROL DESK
                    </span>
                  </div>
                  <p className="text-[10px] text-foreground/50 uppercase tracking-wider">
                    Real-time STT Speech Transcripts, AI Directives & Screener Queue
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* STT Accuracy */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gold-muted border border-gold/15 rounded-lg text-xs font-semibold">
                  <span className="text-foreground/50 uppercase text-[9px] font-bold">STT Accuracy:</span>
                  <span className="text-primary-text-gold font-bold">{sttConfidence}%</span>
                </div>

                {/* Telemetry Icon Button */}
                <button
                  onClick={() => setIsTelemetryDrawerOpen(true)}
                  className="flex items-center justify-center w-8 h-8 bg-background hover:bg-gold-muted/40 border border-border-warm hover:border-gold rounded-lg transition-colors shadow-2xs cursor-pointer"
                  title="View Telemetry & Signal Lock"
                >
                  <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>

                {/* Disconnect Feed Button */}
                <button
                  onClick={handleDisconnectClick}
                  className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-colors whitespace-nowrap cursor-pointer"
                >
                  Disconnect Feed
                </button>

                {/* Close X Button (Triggers confirmation prompt) */}
                <button
                  onClick={handleCloseOverlayClick}
                  className="w-8 h-8 rounded-xl bg-card hover:bg-red-50 text-foreground/50 hover:text-red-600 border border-border-warm hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Page"
                >
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <main className="flex-1 p-2 md:p-3 flex flex-col gap-3 overflow-hidden max-h-screen">
            <style>{`
              .custom-kanban-scrollbar::-webkit-scrollbar {
                width: 5px;
                height: 5px;
              }
              .custom-kanban-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-kanban-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(188, 147, 90, 0.25);
                border-radius: 99px;
              }
              .custom-kanban-scrollbar:hover::-webkit-scrollbar-thumb {
                background: rgba(188, 147, 90, 0.55);
              }
            `}</style>

        {/* Workspace Layout Grid */}
        <div className="flex-1 grid grid-cols-12 gap-3 overflow-hidden">
          
          {/* LEFT: Main Player / Hotline Deck Column (7 cols / ~58% width) */}
          <div className="col-span-7 flex flex-col gap-3 h-full overflow-hidden justify-center">

            {/* TOP SECTION: YouTube Player OR Hotline Caller Queue */}
            {activeSource === "HotLine" ? (
              /* HOTLINE MODE: Caller Queue Panel */
              <div className="h-[52%] bg-card border border-border-warm rounded-2xl p-4 flex flex-col gap-3 overflow-hidden shadow-2xs shrink-0">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-border-warm pb-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">
                      📞 Active Screener Queue & Hotline
                    </h3>
                  </div>
                  <span className="bg-gold/15 text-gold border border-gold/30 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {callerQueue.length} Callers Waiting
                  </span>
                </div>

                {/* Currently Active / On-Air Caller Card (if any) */}
                {activeCaller ? (
                  <div className="bg-gradient-to-r from-amber-500/10 via-gold-muted/30 to-background border border-gold/40 rounded-xl p-3 flex flex-col gap-1.5 shrink-0 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-red-600">
                          🔴 Currently On-Air Caller
                        </span>
                      </div>
                      <span className="text-[9.5px] font-mono font-bold text-foreground/50">{activeCaller.region}</span>
                    </div>

                    <div className="flex justify-between items-center pt-0.5">
                      <div>
                        <h4 className="text-xs font-black text-foreground uppercase">{activeCaller.fullName}</h4>
                        <p className="text-[10px] text-foreground/60 font-mono">{activeCaller.mobile} • {activeCaller.category}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => disconnectCaller()}
                          className="bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-background border border-dashed border-border-warm rounded-xl p-3 flex items-center justify-between text-foreground/50 shrink-0 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-foreground/30" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">No Active On-Air Caller</span>
                    </div>
                    <span className="text-[9.5px] text-gold font-bold uppercase tracking-wider">Select caller below to Patch Air</span>
                  </div>
                )}

                {/* Queue List */}
                <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden">
                  <div className="flex justify-between items-center shrink-0 border-b border-border-warm pb-1">
                    <span className="text-[9.5px] uppercase font-bold text-foreground/50 tracking-wider">Screened Caller Queue</span>
                    <span className="text-[9px] font-bold text-foreground/40 uppercase">Click 'Patch Air' to connect</span>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 custom-kanban-scrollbar">
                    {(() => {
                      const waitingCallers = callerQueue.filter(ticket => !activeCaller || ticket.id !== activeCaller.id);
                      return waitingCallers.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-foreground/40 py-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider">No Other Callers Waiting</span>
                        </div>
                      ) : (
                        waitingCallers.map((ticket) => (
                          <div 
                            key={ticket.id} 
                            className="p-2 bg-background border border-border-warm rounded-xl flex items-center justify-between shadow-2xs hover:border-gold/50 transition-all"
                          >
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-foreground">{ticket.fullName}</span>
                                <span className="text-[8.5px] bg-foreground/5 text-foreground/60 px-1.5 py-0.5 rounded font-mono font-bold">
                                  {ticket.region}
                                </span>
                              </div>
                              <span className="text-[9.5px] text-foreground/60">{ticket.category} • {ticket.mobile}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => goOnAir(ticket)}
                                className="bg-gold hover:bg-gold-hover text-white text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                              >
                                ⚡ Patch Air
                              </button>
                            </div>
                          </div>
                        ))
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : isLive && activeSource === "YouTubeLive" ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-border-warm bg-black shadow-md shrink-0">
                <iframe 
                  className="w-full h-full" 
                  src="https://www.youtube.com/embed/wWYK6IVszPk?autoplay=0&mute=1" 
                  title="Sharjah Live stream" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="w-full aspect-video rounded-2xl border border-border-warm bg-card flex flex-col justify-center items-center text-center p-8 shrink-0 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-gold-muted border border-gold/20 flex items-center justify-center text-gold font-bold text-xl mb-3">
                  📻
                </div>
                <h3 className="text-base font-bold text-foreground uppercase tracking-tight mb-1.5">System Ingestion Standby</h3>
                <p className="text-xs text-foreground/50 max-w-sm uppercase tracking-wider leading-relaxed">
                  Ingestion feed offline. Connect ingest feed from the control bar to start live broadcast.
                </p>
              </div>
            )}

            {/* LOWER LEFT SECTION: Auxiliary Producer Tools - AI Suggestions & Notes */}
            <section className="flex-1 bg-card border border-border-warm rounded-2xl p-4 flex flex-col overflow-hidden shadow-2xs min-h-0">
                  
                  {/* Lower Tabs Header */}
                  <div className="flex items-center gap-1 border-b border-border-warm mb-3 overflow-x-auto shrink-0 scrollbar-none">
                    <button 
                      onClick={() => setLowerPanelTab("prompts")}
                      className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 -mb-[1px] transition-colors whitespace-nowrap ${
                        lowerPanelTab === "prompts" ? "border-gold text-gold" : "border-transparent text-foreground/50 hover:text-foreground hover:border-border-warm"
                      }`}
                    >
                      Suggestions
                    </button>
                    <button 
                      onClick={() => setLowerPanelTab("notes")}
                      className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 -mb-[1px] transition-colors whitespace-nowrap ${
                        lowerPanelTab === "notes" ? "border-gold text-gold" : "border-transparent text-foreground/50 hover:text-foreground hover:border-border-warm"
                      }`}
                    >
                      Notes
                    </button>
                  </div>

                  {/* Lower Tab Content Wrappers */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    
                    {/* TAB: AI SUGGESTIONS */}
                    {lowerPanelTab === "prompts" && (
                      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 custom-kanban-scrollbar pr-3">

                        {!aiPrompts || aiPrompts.length === 0 ? (
                          <div className="flex-1 flex flex-col justify-center items-center text-center text-foreground/45 border border-dashed border-border-warm rounded-xl p-3 min-h-[80px]">
                            <span className="text-[9.5px] font-bold uppercase tracking-wide">No active prompts</span>
                          </div>
                        ) : (
                          aiPrompts.map((prompt) => (
                            <div 
                              key={prompt.id} 
                              className="p-2.5 border border-gold/30 bg-gold-muted/40 rounded-xl flex flex-col gap-1 animate-in slide-in-from-right duration-300"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-[11px] text-primary-text-gold">{prompt.title}</span>
                              </div>
                              <p className="text-[13px] text-foreground/85 leading-relaxed">{prompt.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* TAB: NOTES */}
                    {lowerPanelTab === "notes" && (
                      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                        <div className="flex justify-between items-center shrink-0 border-b border-border-warm pb-1 mb-1">
                          <span className="text-[10px] uppercase font-bold text-foreground/50 font-black">Producer Notes</span>
                          {notesSaved && (
                            <span className="text-[8.5px] text-active-green font-bold uppercase tracking-wider animate-pulse">✓ Saved</span>
                          )}
                        </div>
                        <textarea 
                          value={producerNotes}
                          onChange={(e) => setProducerNotes(e.target.value)}
                          className="flex-1 w-full bg-background border border-border-warm rounded-xl p-2.5 text-[11px] focus:outline-none focus:border-gold resize-none"
                          placeholder={
                            activeCaller 
                              ? "Type call notes here..."
                              : "Type session notes here..."
                          }
                        ></textarea>
                        <div className="flex justify-end shrink-0">
                          <button 
                            onClick={handleSaveNotes}
                            className="bg-gold hover:bg-gold-hover text-white px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                          >
                            Save Notes
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </section>

          </div>

          {/* RIGHT: Expanded Utility Panels Column (5 cols / ~42% width) */}
          <div className="col-span-5 flex flex-col gap-4 overflow-hidden h-full">
            
            {/* FULL HEIGHT SECTION: Live Feeds & Cases/Directives */}
            <section className="flex-1 bg-card border border-border-warm rounded-2xl p-4 flex flex-col overflow-hidden shadow-[0_2px_8px_rgba(20,19,17,0.02)] min-h-0">
              
              {/* Upper Tabs Header */}
              <div className="flex items-center gap-1 border-b border-border-warm mb-3 overflow-x-auto shrink-0 scrollbar-none">
                <button 
                  onClick={() => setUpperPanelTab("transcript")}
                  className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 -mb-[1px] transition-colors whitespace-nowrap ${
                    upperPanelTab === "transcript" ? "border-gold text-gold" : "border-transparent text-foreground/50 hover:text-foreground hover:border-border-warm"
                  }`}
                >
                  Transcript
                </button>
                <button 
                  onClick={() => setUpperPanelTab("directives")}
                  className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 -mb-[1px] transition-colors whitespace-nowrap ${
                    upperPanelTab === "directives" ? "border-gold text-gold" : "border-transparent text-foreground/50 hover:text-foreground hover:border-border-warm"
                  }`}
                >
                  Cases & Directives
                </button>
                {activeSource === "YouTubeLive" ? (
                  <button 
                    onClick={() => setUpperPanelTab("chat")}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 -mb-[1px] transition-colors whitespace-nowrap ${
                      upperPanelTab === "chat" ? "border-gold text-gold" : "border-transparent text-foreground/50 hover:text-foreground hover:border-border-warm"
                    }`}
                  >
                    Chat Comments
                  </button>
                ) : activeSource !== "HotLine" ? (
                  <button 
                    onClick={() => setUpperPanelTab("telemetry")}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 -mb-[1px] transition-colors whitespace-nowrap ${
                      upperPanelTab === "telemetry" ? "border-gold text-gold" : "border-transparent text-foreground/50 hover:text-foreground hover:border-border-warm"
                    }`}
                  >
                    Telemetry
                  </button>
                ) : null}
              </div>

              {/* Upper Tab Content Wrappers */}
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* TAB: TRANSCRIPT */}
                {upperPanelTab === "transcript" && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center shrink-0 border-b border-border-warm pb-1.5 mb-2.5">
                      <span className="text-[10px] uppercase font-bold text-foreground/50">Speech Live Transcript</span>
                      {/* Language Toggler */}
                      <div className="flex bg-background border border-border-warm rounded-lg p-0.5 text-[8.5px] font-bold shrink-0">
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
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-3 flex flex-col gap-2.5 custom-kanban-scrollbar">
                      {editableTranscripts.length === 0 ? (
                        <div className="h-full flex flex-col justify-center items-center text-center text-foreground/45 py-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Awaiting live feed start...</span>
                        </div>
                      ) : (
                        editableTranscripts.map((line, idx) => {
                          const isHost = line.speaker.toUpperCase() === "HOST" || line.speaker.toUpperCase() === "PRESENTER" || line.speaker.toUpperCase() === "LEADERSHIP";
                          return (
                            <div 
                              key={idx}
                              className={`flex w-full ${isHost ? "justify-end" : "justify-start"}`}
                            >
                              <div className={`flex flex-col gap-1 p-2.5 border rounded-xl w-full shadow-xs transition-all ${
                                line.detectionType === "directive"
                                  ? "border-red-300 bg-red-500/10 shadow-sm"
                                  : line.detectionType === "suggested_case"
                                  ? "border-gold/50 bg-gold-muted/40 shadow-sm"
                                  : isHost 
                                  ? "border-gray-200 bg-green-50/30 rounded-tr-sm" 
                                  : "border-gray-200 bg-background rounded-tl-sm"
                              }`}>
                                <div className="flex items-center justify-between text-[8px] font-bold uppercase text-foreground/40 mb-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className={isHost ? "text-green-700 font-bold" : ""}>{line.speaker}</span>
                                    {line.detectionType === "directive" && (
                                      <span className="bg-red-600 text-white text-[7.5px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-2xs">
                                        👑 Royal Directive
                                      </span>
                                    )}
                                    {line.detectionType === "suggested_case" && (
                                      <span className="bg-gold text-white text-[7.5px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-2xs">
                                        💡 AI Suggested Case
                                      </span>
                                    )}
                                  </div>
                                  <span>{line.timestamp}</span>
                                </div>
                                <textarea
                                  rows={2}
                                  value={transcriptLang === "AR" ? (line.textAr || line.text) : line.text}
                                  onChange={(e) => handleTranscriptTextChange(idx, e.target.value)}
                                  className={`w-full border border-transparent focus:outline-none rounded px-1.5 py-1 text-[13px] transition-all bg-transparent resize-none leading-relaxed ${
                                    isHost ? "text-green-950 focus:bg-white/80" : "text-foreground focus:bg-card"
                                  }`}
                                  dir={transcriptLang === "AR" ? "rtl" : "ltr"}
                                ></textarea>

                                {line.detectionType && (
                                  <div className="mt-1 pt-1.5 border-t border-border-warm/40 flex justify-between items-center">
                                    <div className="flex gap-2 items-center">
                                      {line.detectionType === "suggested_case" && (
                                        <button onClick={() => router.push('/cases?action=view&id=CASE-9411')} className="text-[9px] font-bold text-gold hover:underline flex items-center gap-1 cursor-pointer">
                                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                          Past Case: CASE-9411
                                        </button>
                                      )}
                                      {line.detectionType === "directive" && (
                                        <button onClick={() => router.push('/cases?action=view&id=CASE-9810')} className="text-[9px] font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer">
                                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                          Past Case: CASE-9810
                                        </button>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => {
                                        const isDir = line.detectionType === "directive";
                                        const name = line.citizenName || (isDir ? "Ahmed Al-Suwaidi" : "Abdullah Al-Mansoori");
                                        const citizenId = isDir ? "CIT-5678" : "CIT-1234";
                                        const category = isDir ? "Health & Medical" : "Housing Allocation";
                                        const dept = isDir ? "Sharjah Health Authority" : "Sharjah Housing Directorate";
                                        const summary = isDir 
                                          ? "Executive Directive: Cover outstanding medical debt immediately"
                                          : "AI Suggested Case: Housing grant application SHJ-HSG-9841 pending review";
                                        const subDept = isDir ? "Medical Approvals" : "Housing Grants";
                                        const liaison = isDir ? "Dr. Khalid Al-Qasimi" : "Eng. Ahmed Al-Suwaidi";
                                        const sla = isDir ? "24" : "72";
                                        const d = new Date();
                                        if (!isDir) d.setDate(d.getDate() + 3);
                                        const date = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                                        
                                        router.push(`/cases?action=new&autofill=true&name=${encodeURIComponent(name)}&citizenId=${encodeURIComponent(citizenId)}&category=${encodeURIComponent(category)}&dept=${encodeURIComponent(dept)}&subDept=${encodeURIComponent(subDept)}&liaison=${encodeURIComponent(liaison)}&sla=${sla}&date=${date}&summary=${encodeURIComponent(summary)}`);
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer ${
                                        line.detectionType === "directive"
                                          ? "bg-red-600 hover:bg-red-700 text-white"
                                          : "bg-gold hover:bg-gold-hover text-white"
                                      }`}
                                    >
                                      ⚡ Update {line.detectionType === "directive" ? "Royal Case" : "Citizen Case"} (Auto-fill)
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={transcriptEndRef} />
                    </div>
                  </div>
                )}

                {/* TAB: CASES & DIRECTIVES */}
                {upperPanelTab === "directives" && (
                  <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
                    <div className="flex justify-between items-center shrink-0 border-b border-border-warm pb-1.5">
                      <span className="text-[10px] uppercase font-bold text-foreground/50">Extracted Cases & Directives</span>
                      {isLive && (
                        <span className="bg-gold-muted text-gold text-[9px] px-1.5 py-0.5 rounded border border-gold/15 font-bold">
                          STT Confidence: {sttConfidence}%
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-3 custom-kanban-scrollbar">
                      {extractedDirectives.length === 0 ? (
                        <span className="text-foreground/40 text-[10px] text-center py-6 my-auto uppercase tracking-wider font-bold">Awaiting AI extraction detection...</span>
                      ) : (
                        extractedDirectives.map((item, idx) => {
                          const isDirective = item.type === "directive" || item.priority === "Critical";
                          return (
                            <div 
                              key={item.id || idx}
                              className={`p-3 rounded-xl border flex flex-col gap-1.5 shadow-2xs transition-all ${
                                isDirective
                                  ? "border-red-300 bg-red-50/60 dark:bg-red-950/20"
                                  : "border-gold/40 bg-gold-muted/30"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  isDirective ? "bg-red-600 text-white" : "bg-gold text-white"
                                }`}>
                                  {isDirective ? "👑 Royal Directive" : "💡 AI Suggested Case"}
                                </span>
                                <span className="text-[8.5px] font-bold text-foreground/50 uppercase">{item.category}</span>
                              </div>

                              <div>
                                <span className="font-bold text-xs text-foreground block">
                                  Citizen: {item.citizenName}
                                </span>
                                <span className="text-[9.5px] text-foreground/60 block mt-0.5">
                                  Assigned Authority: <strong className="text-foreground/80">{item.entity}</strong>
                                </span>
                                <p className="text-[11px] text-foreground/85 italic mt-1 bg-background/50 p-1.5 rounded-lg border border-border-warm/50">
                                  "{item.text}"
                                </p>
                              </div>

                              <div className="mt-1 pt-1.5 border-t border-border-warm/40 flex justify-between items-center">
                                <div className="flex gap-2 items-center">
                                  {!isDirective && (
                                    <button onClick={() => router.push('/cases?action=view&id=CASE-9411')} className="text-[9px] font-bold text-gold hover:underline flex items-center gap-1 cursor-pointer">
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                      Linked: CASE-9411
                                    </button>
                                  )}
                                  {isDirective && (
                                    <button onClick={() => router.push('/cases?action=view&id=CASE-9810')} className="text-[9px] font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer">
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                      Linked: CASE-9810
                                    </button>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    const name = item.citizenName;
                                    const citizenId = isDirective ? "CIT-5678" : "CIT-1234";
                                    const category = isDirective ? "Health & Medical" : "Housing";
                                    const dept = isDirective ? "Sharjah Health Authority" : "Sharjah Housing Directorate";
                                    const summary = isDirective
                                      ? `Executive Directive: ${item.text}`
                                      : `AI Suggested Case: ${item.text}`;
                                    const subDept = isDirective ? "Medical Approvals" : "Housing Grants";
                                    const liaison = isDirective ? "Dr. Khalid Al-Qasimi" : "Eng. Ahmed Al-Suwaidi";
                                    const sla = isDirective ? "24" : "72";
                                    const d = new Date();
                                    if (!isDirective) d.setDate(d.getDate() + 3);
                                    const date = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                                    
                                    router.push(`/cases?action=new&autofill=true&name=${encodeURIComponent(name)}&citizenId=${encodeURIComponent(citizenId)}&category=${encodeURIComponent(category)}&dept=${encodeURIComponent(dept)}&subDept=${encodeURIComponent(subDept)}&liaison=${encodeURIComponent(liaison)}&sla=${sla}&date=${date}&summary=${encodeURIComponent(summary)}`);
                                  }}
                                  className={`px-3 py-1.5 rounded-lg font-bold text-[9.5px] uppercase tracking-wider shadow-2xs transition-colors cursor-pointer ${
                                    isDirective 
                                      ? "bg-red-600 hover:bg-red-700 text-white" 
                                      : "bg-gold hover:bg-gold-hover text-white"
                                  }`}
                                >
                                  ⚡ Update {isDirective ? "Royal Case" : "Citizen Case"} (Auto-fill)
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: CHAT COMMENTS */}
                {upperPanelTab === "chat" && activeSource === "YouTubeLive" && (
                  <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
                    <div className="flex justify-between items-center shrink-0 border-b border-border-warm pb-1.5">
                      <span className="text-[10px] uppercase font-bold text-foreground/50">YT Live Chat</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-3 flex flex-col gap-2 text-xs custom-kanban-scrollbar">
                      {ytComments.length === 0 ? (
                        <span className="text-foreground/40 text-[10px] text-center py-6 my-auto uppercase tracking-wider font-bold">Awaiting comments...</span>
                      ) : (
                        ytComments.map((c, i) => (
                          <div key={i} className="p-2 bg-background border border-border-warm rounded-xl flex flex-col gap-0.5 shadow-2xs">
                            <span className="font-bold text-[10px] text-foreground/50 font-mono">@{c.username}:</span>
                            <p className="text-[13px] text-foreground/85 leading-snug">{c.comment}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}



                {/* TAB: TELEMETRY */}
                {upperPanelTab === "telemetry" && (
                  <div className="flex-1 overflow-y-auto flex flex-col gap-2 text-xs">
                    <div className="p-2.5 bg-background border border-border-warm rounded-xl flex justify-between items-center">
                      <span className="text-[10px] font-bold text-foreground/50 uppercase">Protocol:</span>
                      <span className="font-mono text-gold font-bold">{activeSource}</span>
                    </div>
                    <div className="p-2.5 bg-background border border-border-warm rounded-xl flex justify-between items-center">
                      <span className="text-[10px] font-bold text-foreground/50 uppercase">Status:</span>
                      <span className={`font-bold ${isLive ? "text-green-600" : "text-foreground/40"}`}>{isLive ? "ON AIR" : "STANDBY"}</span>
                    </div>
                  </div>
                )}

              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  )}

      {/* 3. Ingestion Config Setup Drawer (Slides right to left) */}
      {isConfigDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-card border-l border-border-warm p-8 w-full max-w-md shadow-2xl h-full flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <form onSubmit={handleEstablishConnection} className="flex flex-col gap-6">
              <header className="border-b border-border-warm pb-3">
                <h3 className="text-base font-bold text-foreground uppercase tracking-tight">
                  Configure Live Feed
                </h3>
                <p className="text-xs text-foreground/50 uppercase tracking-wider mt-0.5">
                  Establish feed routing to the transcription engine
                </p>
              </header>

              <div className="flex flex-col gap-4">
                
                {/* Source Ingestion Protocol Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Source Feed Protocol
                  </label>
                  <select
                    value={tempSource}
                    onChange={(e) => handleTempSourceChange(e.target.value as BroadcastSource)}
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors font-semibold uppercase tracking-wider"
                  >
                    <option value="YouTubeLive">🔴 YouTube Live API Feed</option>
                    <option value="LiveTV">📺 Live TV RTMP/HLS Encoder</option>
                    <option value="RadioAoIP">📻 AES67 / Dante Studio Sub-mix</option>
                    <option value="HotLine">📞 Active Hotline Connection</option>
                  </select>
                </div>

                {/* Ingestion Stream URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Feed URL / Port Address
                  </label>
                  <input
                    type="text"
                    required
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                {/* Schedule Date & Time */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide flex items-center justify-between">
                    <span>Schedule Date & Time *</span>
                    <span className="text-[9px] font-bold text-gold uppercase tracking-widest">Live Feed Sync</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleDateTime}
                    onChange={(e) => setScheduleDateTime(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors font-medium"
                  />
                </div>

                {/* Feed Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Feed Title
                  </label>
                  <input
                    type="text"
                    required
                    value={ingestChannel}
                    onChange={(e) => setIngestChannel(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                  />
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
                  Schedule & Establish Feed
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
                  Review Case Draft
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
                
                {/* Royal Directive / Live Ingestion Quote Banner */}
                {desc && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex flex-col gap-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <span>👑 Royal Verbal Directive Text</span>
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        Live Feed
                      </span>
                    </div>
                    <p className="text-xs text-foreground/90 italic font-medium leading-relaxed bg-background/80 p-2.5 rounded-lg border border-amber-500/20">
                      "{desc.replace(/^VERBAL EXECUTIVE DIRECTIVE ISSUED ON AIR:\n/, '').replace(/^"/, '').replace(/"$/, '')}"
                    </p>
                  </div>
                )}

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
                  if (openedFromCatalog) {
                    setOpenedFromCatalog(false);
                  } else {
                    if (window.history.length > 1) {
                      router.back();
                    } else {
                      router.push('/executive/ingestion');
                    }
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-[10px] uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                Yes, Disconnect & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
      {/* 4. Telemetry Slide-Over Drawer */}
      {isTelemetryDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-card border-l border-border-warm p-6 w-full max-w-md shadow-2xl h-full flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="flex flex-col gap-6">
              <header className="flex justify-between items-center border-b border-border-warm pb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-foreground/30"}`} />
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">
                      Broadcast Stream Telemetry
                    </h3>
                    <p className="text-[10px] text-foreground/50 uppercase tracking-wider mt-0.5">
                      Signal SLA & Live Audio Line Monitoring
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTelemetryDrawerOpen(false)}
                  className="text-foreground/40 hover:text-foreground p-1 rounded-lg hover:bg-background transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </header>

              {/* Audio VU Level Meters */}
              <div className="bg-background border border-border-warm rounded-2xl p-4 flex flex-col gap-4 shadow-2xs">
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Audio Sub-Mix Lines</span>
                
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-foreground/70">
                    <span>Presenter Line</span>
                    <span className="font-mono">{isLive ? `${presenterDb} dB` : "-INF"}</span>
                  </div>
                  <div className="h-2 w-full bg-card border border-border-warm rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-150 rounded-full ${presenterDb > -10 ? "bg-red-500" : presenterDb > -20 ? "bg-gold" : "bg-green-500"}`} 
                      style={{ width: `${isLive ? Math.max(0, Math.min(100, ((presenterDb + 60) / 60) * 100)) : 0}%` }} 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-foreground/70">
                    <span>Ingest Stream Audio Line</span>
                    <span className="font-mono">{isLive ? `${ingestDb} dB` : "-INF"}</span>
                  </div>
                  <div className="h-2 w-full bg-card border border-border-warm rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-150 rounded-full ${ingestDb > -10 ? "bg-red-500" : ingestDb > -20 ? "bg-gold" : "bg-green-500"}`} 
                      style={{ width: `${isLive ? Math.max(0, Math.min(100, ((ingestDb + 60) / 60) * 100)) : 0}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Live Telemetry Data Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background border border-border-warm rounded-xl p-3 flex flex-col gap-1 shadow-2xs">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-foreground/50">Latency</span>
                  <span className="font-mono font-bold text-sm text-foreground">{isLive ? telemetryLatency : "—"}</span>
                </div>
                <div className="bg-background border border-border-warm rounded-xl p-3 flex flex-col gap-1 shadow-2xs">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-foreground/50">Packet Loss</span>
                  <span className="font-mono font-bold text-sm text-foreground">{isLive ? telemetryPacketLoss : "—"}</span>
                </div>
                <div className="bg-background border border-border-warm rounded-xl p-3 flex flex-col gap-1 shadow-2xs">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-foreground/50">Bitrate</span>
                  <span className="font-mono font-bold text-xs text-foreground truncate">{isLive ? telemetryBitrate : "—"}</span>
                </div>
                <div className="bg-background border border-border-warm rounded-xl p-3 flex flex-col gap-1 shadow-2xs">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-foreground/50">Session Uptime</span>
                  <span className="font-mono font-bold text-xs text-green-600 truncate">{isLive ? formatUptime(telemetryUptime) : "00:00:00"}</span>
                </div>
              </div>

              {/* Protocol & Stream URL Info */}
              <div className="bg-background border border-border-warm rounded-2xl p-4 flex flex-col gap-2 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-bold text-foreground/50 uppercase">Protocol Source:</span>
                  <span className="font-mono text-gold font-bold">{activeSource}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-border-warm/60 pt-2">
                  <span className="text-[10px] font-bold text-foreground/50 uppercase">Stream URL:</span>
                  <span className="font-mono text-[10px] text-foreground/80 truncate max-w-[220px]" title={streamUrl}>{streamUrl || "—"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsTelemetryDrawerOpen(false)}
              className="w-full bg-foreground text-background hover:bg-gold hover:text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
            >
              Close Telemetry Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProducerStudioPage() {
  return (
    <Suspense fallback={null}>
      <ProducerStudioPageContent />
    </Suspense>
  );
}

