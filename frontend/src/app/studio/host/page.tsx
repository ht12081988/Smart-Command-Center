"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "../../../components/Sidebar";
import { PortalHeader } from "../../../components/PortalHeader";
import { useBroadcast } from "../../../context/BroadcastContext";

export default function HostStudioPage() {
  const {
    activeSource,
    activeCaller,
    isLive,
    transcriptLines,
    aiPrompts,
    ytComments,
    sttConfidence,
    priorCaseMatch,
    entityChecklist
  } = useBroadcast();

  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Language switch toggle state
  const [transcriptLang, setTranscriptLang] = useState<"EN" | "AR">("EN");

  // Auto-scroll transcript feed
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptLines]);

  // Auto-scroll YouTube chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ytComments]);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      
      {/* 1. Left Sidebar */}
      <Sidebar activeItem="Live Studio Feed" />

      {/* 2. Main Broadcast Console Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        <PortalHeader
          title="Smart Studio Broadcast Monitor"
          subtitle="Live on-air transcript monitoring, speech-to-text feed, and interactive studio controls."
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          }
          actions={
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                activeSource === "HotLine" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                activeSource === "YouTubeLive" ? "bg-red-100 text-red-800 border border-red-200" :
                "bg-blue-100 text-blue-800 border border-blue-200"
              }`}>
                {activeSource === "HotLine" && "📞 Active HotLine"}
                {activeSource === "YouTubeLive" && "🔴 YouTube Live"}
                {activeSource === "LiveTV" && "📺 Live TV Feed"}
                {activeSource === "RadioAoIP" && "📻 Radio AoIP Stream"}
              </span>
              {isLive && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gold-muted border border-gold/15 rounded-lg text-xs font-semibold">
                  <span className="text-foreground/50 uppercase text-[9px] font-bold">STT:</span>
                  <span className="text-primary-text-gold font-bold">{sttConfidence}%</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-2.5 py-1 bg-card border border-border-warm rounded-lg">
                <span className={`w-2.5 h-2.5 rounded-full ${isLive ? "bg-red-600 animate-pulse" : "bg-foreground/20"}`}></span>
                <span className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                  {isLive ? "ON AIR" : "STANDBY"}
                </span>
              </div>
            </div>
          }
        />

        <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-hidden max-h-screen">

        {/* Console layout */}
        <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
          
          {/* LEFT: Transcript and Notes Column */}
          <div className="col-span-2 flex flex-col gap-6 overflow-hidden">
            
            {/* Top: Scrolling Transcript Box */}
            <section className="flex-1 bg-card border border-border-warm rounded-xl p-5 flex flex-col overflow-hidden shadow-[0_2px_8px_rgba(20,19,17,0.02)] min-h-[300px]">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-tight mb-3 border-b border-border-warm pb-2 flex items-center justify-between">
              <span>Real-Time Arabic STT Ticker</span>
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
                <span className="text-[10px] text-foreground/45 font-semibold">
                  Language: Gulf Arabic
                </span>
              </div>
            </h2>

            {/* Transcription Feed */}
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
              {transcriptLines.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center text-foreground/45">
                  <svg className="w-10 h-10 mb-2 opacity-30 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span className="text-[11px] font-semibold uppercase tracking-wide">Awaiting audio stream connection...</span>
                </div>
              ) : (
                transcriptLines.map((line, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col gap-1 p-3 rounded-lg max-w-[85%] border ${
                      line.speaker === "Host" || line.speaker === "Presenter"
                        ? "bg-gold-muted border-gold/15 self-start text-foreground"
                        : line.speaker === "Leadership"
                        ? "bg-red-50 border-red-200 self-end text-red-950 font-medium"
                        : "bg-background border-border-warm self-end text-foreground"
                    }`}
                    dir={transcriptLang === "AR" ? "rtl" : "ltr"}
                  >
                    <div className="flex items-center justify-between gap-6" dir="ltr">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                        {line.speaker}
                      </span>
                      <span className="text-[9px] text-foreground/40">{line.timestamp}</span>
                    </div>
                    <p className="text-sm leading-relaxed mt-0.5">
                      {transcriptLang === "AR" ? (line.textAr || line.text) : line.text}
                    </p>
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>
          </section>

          {/* Bottom: Notes Taking Box */}
          {activeSource === "HotLine" && activeCaller && (
            <section className="h-[220px] shrink-0 bg-card border border-border-warm rounded-xl p-5 flex flex-col shadow-[0_2px_8px_rgba(20,19,17,0.02)] animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-tight mb-3 border-b border-border-warm pb-2">
                Host Notes for: <span className="text-primary-text-gold">{activeCaller.fullName}</span>
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

          {/* RIGHT: Caller Context or Live Chat + AI Alerts */}
          <section className="col-span-1 flex flex-col gap-5 overflow-hidden">
            
            {/* Context Widget Card */}
            <div className="bg-card border border-border-warm rounded-xl p-5 shadow-[0_2px_8px_rgba(20,19,17,0.02)] shrink-0">
              {activeSource === "HotLine" ? (
                // Caller Card
                <div className="flex flex-col gap-2">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-tight mb-2 border-b border-border-warm pb-2">
                    Active Caller Profile
                  </h2>
                  {activeCaller ? (
                    <div className="flex flex-col gap-2">
                      <div>
                        <span className="text-xs text-foreground/40 block">NAME</span>
                        <span className="font-bold text-primary-text-gold text-sm">{activeCaller.fullName}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <span className="text-[10px] text-foreground/40 block">REGION</span>
                          <span className="text-xs font-semibold text-foreground">{activeCaller.region}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-foreground/40 block">MOBILE</span>
                          <span className="text-xs font-semibold text-foreground">{activeCaller.mobile}</span>
                        </div>
                      </div>
                      
                      {/* Prior Case Match Alert tag */}
                      {priorCaseMatch && (
                        <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 font-semibold flex items-center gap-1.5 shadow-2xs">
                          <span className="shrink-0 text-amber-600 font-bold">⚠ PRIOR RECORD:</span>
                          <span className="underline truncate">{priorCaseMatch}</span>
                        </div>
                      )}

                      <div className="mt-2.5 p-2.5 bg-background rounded-lg border border-border-warm">
                        <span className="text-[9px] font-bold text-foreground/50 uppercase tracking-widest block mb-0.5">Screener Notes</span>
                        <p className="text-[11px] text-foreground/80 leading-relaxed italic">"{activeCaller.notes}"</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-foreground/40 block text-center py-4">No caller currently on-air</span>
                  )}
                </div>
              ) : (
                // Live Stream Metrics card (for YT/TV/Radio)
                <div className="flex flex-col gap-2">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-tight mb-2 border-b border-border-warm pb-2">
                    Live Stream Metrics
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 bg-background border border-border-warm rounded-lg text-center">
                      <span className="text-[10px] text-foreground/50 block">LIVE VIEWERS</span>
                      <span className="text-sm font-bold text-foreground">{isLive ? "14,842" : "0"}</span>
                    </div>
                    <div className="p-2.5 bg-background border border-border-warm rounded-lg text-center">
                      <span className="text-[10px] text-foreground/50 block">AUDIO QUALITY</span>
                      <span className="text-sm font-bold text-active-green">{isLive ? "Pristine" : "Offline"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Secondary Widget Pane (YT Chat or AI Prompts + Entity Checklist) */}
            <div className="bg-card border border-border-warm rounded-xl p-5 shadow-[0_2px_8px_rgba(20,19,17,0.02)] flex-1 overflow-hidden flex flex-col">
              
              {/* YouTube Chat Feed (Rendered only during YouTubeLive mode) */}
              {activeSource === "YouTubeLive" && (
                <div className="flex-1 flex flex-col overflow-hidden mb-4 border-b border-border-warm pb-4">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-tight mb-2 flex items-center justify-between">
                    <span>YouTube Live Chat</span>
                    <span className="bg-red-50 text-red-600 text-[9px] px-1.5 py-0.5 rounded border border-red-200 uppercase tracking-widest animate-pulse">Live</span>
                  </h3>

                  {/* YouTube Embed Player */}
                  {isLive && activeSource === "YouTubeLive" && (
                    <div className="mb-3 shrink-0 rounded-xl overflow-hidden border border-border-warm bg-black">
                      <iframe 
                        className="w-full h-[120px]" 
                        src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1" 
                        title="Sharjah Live stream" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 text-xs max-h-[140px]">
                    {ytComments.length === 0 ? (
                      <span className="text-foreground/40 text-[11px] text-center my-auto">Chat stream standby...</span>
                    ) : (
                      ytComments.map((c, i) => (
                        <div key={i} className="flex gap-1.5">
                          <span className="font-bold text-primary-text-gold">@{c?.username}:</span>
                          <span className="text-foreground/80">{c?.comment}</span>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </div>
              )}

              {/* Entity Extraction Checklist */}
              {isLive && entityChecklist && entityChecklist.length > 0 && (
                <div className="border-b border-border-warm pb-4 mb-4 shrink-0 animate-in fade-in duration-300">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-tight mb-2">
                    Entity Extraction Checklist
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {entityChecklist.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-1.5 bg-background border border-border-warm rounded-lg text-[10px] font-bold">
                        <span className={`w-2 h-2 rounded-full ${item.status === "extracted" ? "bg-active-green" : "bg-foreground/20 animate-pulse"}`}></span>
                        <span className={item.status === "extracted" ? "text-foreground/80" : "text-foreground/45"}>
                          {item.name}
                        </span>
                        {item.status === "extracted" && (
                          <span className="ml-auto text-[8px] bg-green-50 text-active-green px-1 rounded font-semibold">OK</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Assistant Prompts Panel */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-tight mb-2 flex justify-between items-center shrink-0">
                  <span>AI Prompt Suggestions</span>
                  <span className="bg-gold-muted text-gold text-[9px] px-1.5 py-0.5 rounded border border-gold/10 font-bold">
                    {aiPrompts.length} ALERTS
                  </span>
                </h3>
                
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                  {aiPrompts.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center text-center text-foreground/45 border border-dashed border-border-warm rounded-lg p-4 mt-1">
                      <svg className="w-6 h-6 mb-1 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-wide">Awaiting transcription context</span>
                    </div>
                  ) : (
                    aiPrompts.map((prompt) => (
                      <div 
                        key={prompt.id} 
                        className="p-3 border border-gold/30 bg-gold-muted rounded-xl flex flex-col gap-1.5 animate-in slide-in-from-right duration-300"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-primary-text-gold">{prompt.title}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping"></span>
                        </div>
                        <p className="text-[11px] text-foreground/85 leading-relaxed">{prompt.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </section>

        </div>
      </main>
    </div>
  </div>
);
}


