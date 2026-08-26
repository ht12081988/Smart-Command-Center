"use client";

import React, { useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { useBroadcast } from "../../context/BroadcastContext";

const CATEGORIES = ["Housing Allocation", "Health & Medical", "Employment Opportunity", "Financial Assistance", "Government Services"];
const REGIONS = ["Sharjah City", "Central Region (Al Dhaid)", "Eastern Region (Khorfakkan)", "Eastern Region (Kalba)", "Al Hamriyah"];

interface CitizenMock {
  name: string;
  email: string;
  phone: string;
  region: string;
  category: string;
  notes: string;
}

const MOCK_CITIZENS: CitizenMock[] = [
  { name: "Abdullah Al-Shehhi", email: "abdullah.s@gmail.com", phone: "+971-50-988-1234", region: "Eastern Region (Khorfakkan)", category: "Financial Assistance", notes: "Applying for emergency housing maintenance grant due to recent rain damage." },
  { name: "Mariam Al-Ali", email: "mariam.a@yahoo.com", phone: "+971-56-777-9876", region: "Sharjah City", category: "Health & Medical", notes: "Requesting treatment extension approval for home nursing services." },
  { name: "Sultan Al-Suwaidi", email: "sultan.suw@gmail.com", phone: "+971-55-111-3322", region: "Central Region (Al Dhaid)", category: "Employment Opportunity", notes: "Seeking placement support after graduating with a degree in civil engineering." },
  { name: "Jawaher Al-Hassani", email: "jawaher.h@outlook.com", phone: "+971-52-444-5566", region: "Sharjah City", category: "Government Services", notes: "Inquiring about delay in commercial license renewal process from Sharjah Economic Development Department." },
  { name: "Khalid Al-Marzooqi", email: "khalid.m@gmail.com", phone: "+971-54-333-2211", region: "Al Hamriyah", category: "Housing Allocation", notes: "Looking for status update on land allocation application submitted under my father's name." }
];

interface HotlineLine {
  id: number;
  status: "idle" | "ringing" | "active";
  phoneNumber?: string;
  citizenData?: CitizenMock;
}

const INITIAL_LINES: HotlineLine[] = [
  { id: 1, status: "idle" },
  { 
    id: 2, 
    status: "ringing", 
    phoneNumber: "+971-56-777-9876",
    citizenData: MOCK_CITIZENS[1]
  },
  { id: 3, status: "idle" },
  { 
    id: 4, 
    status: "ringing", 
    phoneNumber: "+971-50-988-1234",
    citizenData: MOCK_CITIZENS[0]
  },
  { id: 5, status: "idle" },
];

export default function ScreenerPage() {
  const { addCallerToQueue, callerQueue } = useBroadcast();

  // Hotline Lines State
  const [lines, setLines] = useState<HotlineLine[]>(INITIAL_LINES);
  const [activeLineId, setActiveLineId] = useState<number | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [category, setCategory] = useState("Housing Allocation");
  const [region, setRegion] = useState("Sharjah City");
  const [notes, setNotes] = useState("");
  
  const [successMsg, setSuccessMsg] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  const handleLineClick = (line: HotlineLine) => {
    if (line.status === "ringing") {
      // Pick up the ringing call
      setLines(prev =>
        prev.map(l => {
          if (l.id === line.id) return { ...l, status: "active" as const };
          if (l.status === "active") return { ...l, status: "idle" as const }; // Auto-idle the previous active one
          return l;
        })
      );
      setActiveLineId(line.id);
      
      // Auto-fill fields
      setFullName(line.citizenData?.name || "");
      setEmail(line.citizenData?.email || "");
      setMobile(line.phoneNumber || "");
      setRegion(line.citizenData?.region || "Sharjah City");
      setCategory(line.citizenData?.category || "Housing Allocation");
      setNotes(line.citizenData?.notes || "");
      
      setInfoMsg(`📞 Line ${line.id} Connected. Citizen profile auto-loaded.`);
      setTimeout(() => setInfoMsg(""), 4000);
    } else if (line.status === "active") {
      // Release line back to idle / put on hold
      setLines(prev =>
        prev.map(l => l.id === line.id ? { ...l, status: "idle" as const } : l)
      );
      setActiveLineId(null);
      setMobile("");
      setFullName("");
      setEmail("");
      setNotes("");
      setInfoMsg(`🔌 Line ${line.id} disconnected.`);
      setTimeout(() => setInfoMsg(""), 3000);
    } else {
      // Clicked idle line -> simulate outgoing dial
      const mockNumber = "+971-5" + Math.floor(10000000 + Math.random() * 90000000);
      setLines(prev =>
        prev.map(l => {
          if (l.id === line.id) return { ...l, status: "active" as const, phoneNumber: mockNumber, citizenData: undefined };
          if (l.status === "active") return { ...l, status: "idle" as const };
          return l;
        })
      );
      setActiveLineId(line.id);
      setMobile(mockNumber);
      setFullName("");
      setEmail("");
      setNotes("");
      setInfoMsg(`📞 Outbound call simulated on Line ${line.id}.`);
      setTimeout(() => setInfoMsg(""), 3000);
    }
  };

  const simulateIncomingCall = () => {
    const idleLines = lines.filter(l => l.status === "idle");
    if (idleLines.length === 0) {
      setInfoMsg("⚠️ All lines are busy!");
      setTimeout(() => setInfoMsg(""), 3000);
      return;
    }
    const targetLine = idleLines[Math.floor(Math.random() * idleLines.length)];
    const randomCitizen = MOCK_CITIZENS[Math.floor(Math.random() * MOCK_CITIZENS.length)];
    
    setLines(prev =>
      prev.map(l =>
        l.id === targetLine.id
          ? { ...l, status: "ringing" as const, phoneNumber: randomCitizen.phone, citizenData: randomCitizen }
          : l
      )
    );
    setInfoMsg(`🔔 Incoming Call on Line ${targetLine.id}...`);
    setTimeout(() => setInfoMsg(""), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !mobile || !notes) return;

    addCallerToQueue({
      fullName,
      email,
      mobile,
      category,
      region,
      notes
    });

    // Reset active line to idle since it has been screened and pushed to queue
    if (activeLineId !== null) {
      setLines(prev =>
        prev.map(l => l.id === activeLineId ? { ...l, status: "idle" as const, phoneNumber: undefined, citizenData: undefined } : l)
      );
      setActiveLineId(null);
    }

    setSuccessMsg(true);
    setFullName("");
    setEmail("");
    setMobile("");
    setNotes("");

    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="min-h-screen flex bg-background">
      
      {/* 1. Left Sidebar */}
      <Sidebar activeItem="Call Screener Desk" />

      {/* 2. Main Content Workspace */}
      <main className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto">
        
        {/* Header */}
        <header className="border-b border-border-warm pb-5 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
              Live Call Screening Desk
            </h1>
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider mt-1">
              Intake citizen calls, verify credentials, log basic details, and route tickets to the live studio queue
            </p>
          </div>
          <button
            type="button"
            onClick={simulateIncomingCall}
            className="px-4 py-2 border border-gold bg-gold/5 text-gold hover:bg-gold hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm shadow-gold/10"
          >
            ⚡ Simulate Call Ring
          </button>
        </header>

        {/* ── NEW: Hotline Hardware Status / PBX Monitor Panel ── */}
        <section className="bg-card border border-border-warm rounded-xl p-5 shadow-[0_2px_8px_rgba(20,19,17,0.02)]">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-bold text-foreground/75 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              HOTLINE PBX INTERFACE (5 PHYSICAL LINES)
            </h2>
            {infoMsg && (
              <span className="text-[11px] font-bold text-gold uppercase tracking-wider animate-pulse">
                {infoMsg}
              </span>
            )}
          </div>
          <div className="grid grid-cols-5 gap-3">
            {lines.map(line => {
              let statusBg = "bg-background border-border-warm text-foreground/50";
              let statusIconColor = "text-foreground/30";
              let statusText = "AVAILABLE";
              let showRingAnimation = false;

              if (line.status === "ringing") {
                statusBg = "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20";
                statusIconColor = "text-red-500";
                statusText = "RINGING...";
                showRingAnimation = true;
              } else if (line.status === "active") {
                statusBg = "bg-active-green/10 border-active-green/30 text-active-green hover:bg-active-green/20";
                statusIconColor = "text-active-green";
                statusText = "CONNECTED";
              }

              return (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => handleLineClick(line)}
                  className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all text-center relative overflow-hidden ${statusBg} ${
                    line.status === "idle" ? "hover:border-gold/40 hover:text-gold" : ""
                  }`}
                >
                  {/* Flashing light indicator for ringing */}
                  {showRingAnimation && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  )}

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black tracking-wider uppercase opacity-85">LINE 0{line.id}</span>
                  </div>

                  <div className="p-2 rounded-full bg-foreground/[0.03] transition-transform duration-100 flex items-center justify-center">
                    {line.status === "ringing" ? (
                      <svg className={`w-5 h-5 ${statusIconColor} animate-bounce`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    ) : line.status === "active" ? (
                      <svg className={`w-5 h-5 ${statusIconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    ) : (
                      <svg className={`w-5 h-5 ${statusIconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-wider">{statusText}</span>
                    <span className="text-[9px] font-medium opacity-60 tracking-wider truncate max-w-[120px]">
                      {line.phoneNumber || "0.00 OUT"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Content Split: Form on Left, Queue on Right */}
        <div className="grid grid-cols-3 gap-6 items-start">
          
          {/* Screening Form Panel */}
          <section className="col-span-2 bg-card border border-border-warm rounded-xl p-6 shadow-[0_2px_8px_rgba(20,19,17,0.02)]">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-tight mb-4 border-b border-border-warm pb-2 flex justify-between items-center">
              <span>Citizen Screening Form</span>
              {activeLineId && (
                <span className="text-[10px] font-bold text-active-green bg-active-green/5 px-2 py-0.5 rounded border border-active-green/10 uppercase tracking-wider animate-pulse">
                  Active Intake: Line 0{activeLineId}
                </span>
              )}
            </h2>

            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-active-green text-xs px-4 py-3 rounded-lg mb-4 flex items-center gap-2 font-medium">
                ✓ Caller successfully routed to the active broadcast queue.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Citizen Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Salem Al-Ketbi"
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. salem@gmail.com"
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+971-50-XXXXXXX"
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Request Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                    Citizen Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                  >
                    {REGIONS.map((reg) => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-foreground/70 uppercase tracking-wide">
                  Screening Notes / Citizen Complaint Summary
                </label>
                <textarea
                  required
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Summarize the core request details here (e.g. application submission date, issue history)..."
                  className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30 resize-none"
                />
              </div>

              <button
                type="submit"
                className="bg-gold hover:bg-gold-hover text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-colors mt-2"
              >
                + Push Caller to Studio Queue
              </button>
            </form>
          </section>

          {/* Studio Queue Sidebar Panel */}
          <section className="col-span-1 bg-card border border-border-warm rounded-xl p-5 shadow-[0_2px_8px_rgba(20,19,17,0.02)] self-stretch flex flex-col">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-tight mb-3 border-b border-border-warm pb-2 flex justify-between items-center">
              <span>Studio Call Queue</span>
              <span className="bg-gold-muted text-gold text-[10px] px-2 py-0.5 rounded border border-gold/10 font-bold">
                {callerQueue.length} WAITING
              </span>
            </h2>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 max-h-[480px]">
              {callerQueue.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center p-6 border border-dashed border-border-warm rounded-lg text-foreground/45 mt-4">
                  <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-[11px] font-semibold uppercase tracking-wide">No active calls screened</span>
                  <span className="text-[10px] text-foreground/40 mt-1">Screened calls will appear here in order</span>
                </div>
              ) : (
                callerQueue.map((caller) => (
                  <div 
                    key={caller.id}
                    className="p-3 border border-border-warm bg-background rounded-lg flex flex-col gap-1 hover:border-gold transition-colors duration-150 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-primary-text-gold text-xs block">{caller.fullName}</span>
                      <span className="text-[9px] bg-green-50 border border-green-200 text-active-green px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                        Queued
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-foreground/60">{caller.region}</span>
                    <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest mt-1 block">{caller.category}</span>
                    <p className="text-[11px] text-foreground/80 mt-1 line-clamp-2 italic">
                      "{caller.notes}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </main>

    </div>
  );
}
