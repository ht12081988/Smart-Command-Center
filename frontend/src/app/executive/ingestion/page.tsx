"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { Sidebar } from "../../../components/Sidebar";
import { PortalHeader } from "../../../components/PortalHeader";
import { ExecutiveNav } from "../../../components/ExecutiveNav";
import { useBroadcast } from "../../../context/BroadcastContext";

export default function IngestionSandboxPage() {
  return (
    <Suspense fallback={null}>
      <IngestionSandboxContent />
    </Suspense>
  );
}

interface StreamSession {
  id: string;
  title: string;
  date: string;
  time: string;
  source: "YouTubeLive" | "LiveTV" | "RadioAoIP" | "HotLine";
  status: "Live" | "Upcoming";
  summary: string[];
  launchHref: string;
}

const MOCK_STREAMS: StreamSession[] = [
  {
    id: "stream-1",
    title: "Direct Line Show - Broadcast Feed",
    date: "Today",
    time: "Live Feed Active",
    source: "YouTubeLive",
    status: "Live",
    summary: [
      "Active TV & YouTube live broadcast feed.",
      "Listening for Ruler executive directives and immediate citizen complaints."
    ],
    launchHref: "/studio/producer?demo=true"
  },
  {
    id: "stream-3",
    title: "Sharjah TV Special Assembly Feed",
    date: "Sept 02, 2026",
    time: "10:00 AM",
    source: "LiveTV",
    status: "Upcoming",
    summary: [
      "Scheduled TV broadcast coverage.",
      "Executive Council session monitoring."
    ],
    launchHref: "#"
  },
  {
    id: "stream-4",
    title: "Sharjah Radio Morning Sub-Mix Feed",
    date: "Sept 03, 2026",
    time: "08:30 AM",
    source: "RadioAoIP",
    status: "Upcoming",
    summary: [
      "Scheduled AoIP studio sub-mix stream.",
      "Morning public program feedback listening."
    ],
    launchHref: "#"
  }
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

function IngestionSandboxContent() {
  const [streams] = useState<StreamSession[]>(MOCK_STREAMS);
  const { scheduleDateTime, feedTitle } = useBroadcast();

  const liveStreams = streams.filter(s => s.status === "Live");
  const upcomingStreams = streams.filter(s => s.status === "Upcoming");

  const formattedSched = formatScheduleDisplay(scheduleDateTime);

  return (
    <div className="h-screen flex overflow-hidden bg-background text-foreground font-sans selection:bg-gold/30">
      <Sidebar activeItem="Executive Command Center" />

      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        <PortalHeader
          title="Executive Command Center"
          subtitle="Strategic intelligence hub for SBA leadership - real-time humanitarian case visibility."
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          actions={
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border-warm rounded-full text-[10px] uppercase tracking-wider text-foreground/60">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live - {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          }
        />

        {/* Tab Nav */}
        <ExecutiveNav />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8">
          
          {/* SECTION 1: LIVE FEEDS */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-border-warm pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">
                  🔴 Live Now & Active Feeds
                </h3>
              </div>
              <span className="text-[10px] font-bold text-gold uppercase tracking-widest bg-gold/10 border border-gold/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Scheduled Feed: {formattedSched.dateStr} • {formattedSched.timeStr}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {liveStreams.map((stream) => (
                <div 
                  key={stream.id}
                  className="bg-card border border-border-warm rounded-2xl overflow-hidden shadow-xs hover:border-gold hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail / Video icon placeholder (matches Archive design) */}
                    <div className="relative h-44 bg-black flex items-center justify-center border-b border-border-warm">
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <span className={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200 ${
                          stream.source === "YouTubeLive" ? "bg-red-600/90" : "bg-blue-600/90"
                        }`}>
                          {stream.source === "YouTubeLive" ? (
                            <svg className="w-6 h-6 fill-current pl-1" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          )}
                        </span>
                      </div>
                      
                      {/* Source badge */}
                      <span className={`absolute top-4 left-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm z-10 ${
                        stream.source === "YouTubeLive" ? "bg-red-600 text-white border border-red-700" : "bg-indigo-600 text-white border border-indigo-700"
                      }`}>
                        {stream.source === "YouTubeLive" ? "YouTube Live Feed" : "Direct Hotline Desk"}
                      </span>

                      {/* Schedule Badge on image overlay */}
                      <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-gold border border-gold/40 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 z-10">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formattedSched.timeStr}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] text-foreground/45 uppercase tracking-wider font-bold">
                        <span>{stream.date}</span>
                        <span className="text-red-500 font-bold">{stream.time}</span>
                      </div>
                      <h4 className="font-bold text-primary-text-gold text-sm group-hover:text-gold transition-colors line-clamp-2 uppercase tracking-tight">
                        {stream.source === "YouTubeLive" && feedTitle ? feedTitle : stream.title}
                      </h4>

                      {/* Scheduled Feed Time Callout */}
                      <div className="bg-gold-muted/40 border border-gold/25 p-2 rounded-xl flex items-center justify-between text-[9.5px] font-bold text-primary-text-gold mt-1">
                        <span className="uppercase tracking-widest text-foreground/60">Scheduled Feed Time</span>
                        <span className="font-mono text-gold">{formattedSched.dateStr} @ {formattedSched.timeStr}</span>
                      </div>

                      <ul className="mt-1 space-y-1 text-xs text-foreground/70">
                        {stream.summary.map((sum, i) => (
                          <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-gold">•</span>
                            <span>{sum}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      href={stream.launchHref}
                      className={`w-full text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all block cursor-pointer ${
                        stream.source === "YouTubeLive" 
                          ? "bg-gold hover:bg-gold-hover text-white" 
                          : "bg-foreground text-background hover:bg-gold hover:text-white"
                      }`}
                    >
                      {stream.source === "YouTubeLive" ? "🔌 View Feed" : "📞 Screen Active Hotline Queue"}
                    </Link>
                  </div>
                </div>
              ))}
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
              {upcomingStreams.map((stream) => (
                <div 
                  key={stream.id}
                  className="bg-card border border-border-warm rounded-2xl overflow-hidden shadow-xs hover:border-gold/30 hover:shadow-xs transition-all duration-200 flex flex-col justify-between group opacity-85"
                >
                  <div>
                    {/* Thumbnail / Waveform placeholder (matches Archive design) */}
                    <div className="relative h-44 bg-black/90 flex items-center justify-center border-b border-border-warm">
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 bg-gradient-to-t from-black/85 to-transparent">
                        <span className="w-12 h-12 rounded-full bg-foreground/10 text-foreground/40 flex items-center justify-center shadow-md">
                          {stream.source === "LiveTV" ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          )}
                        </span>
                      </div>
                      
                      {/* Source badge */}
                      <span className="absolute top-4 left-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm z-10 bg-foreground/10 text-foreground/60 border border-foreground/20">
                        {stream.source === "LiveTV" ? "Television Broadcast" : "Radio Broadcast AoIP"}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] text-foreground/45 uppercase tracking-wider font-bold">
                        <span>{stream.date}</span>
                        <span className="text-gold font-bold">{stream.time}</span>
                      </div>
                      <h4 className="font-bold text-foreground/80 text-sm line-clamp-2 uppercase tracking-tight">
                        {stream.title}
                      </h4>
                      <ul className="mt-2 space-y-1 text-xs text-foreground/50">
                        {stream.summary.map((sum, i) => (
                          <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                            <span>•</span>
                            <span>{sum}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      disabled
                      className="w-full text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-foreground/5 text-foreground/40 border border-foreground/10 block cursor-not-allowed"
                    >
                      🔒 Standby Mode
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
