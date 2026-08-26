"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "../../../components/Sidebar";
import { ExecutiveNav } from "../../../components/ExecutiveNav";
import { MOCK_CASES } from "../../cases/page";

// ─── Sharjah Region Definitions ───────────────────────────────────────────────
const REGIONS = [
  "Sharjah City",
  "Central Region (Al Dhaid)",
  "Eastern Region (Khorfakkan)",
  "Eastern Region (Kalba)",
  "Al Hamriyah",
];

const CATEGORIES = ["All", "Housing", "Health & Medical", "Employment", "Financial Assistance", "Government Services", "Education"];

function getRegionStats(region: string, category: string) {
  const filtered = MOCK_CASES.filter(c =>
    c.region === region &&
    (category === "All" || c.primaryClassification === category)
  );
  return {
    total: filtered.length,
    urgent: filtered.filter(c => c.priority === "Critical" || c.priority === "High").length,
    overdue: filtered.filter(c => c.slaHours !== undefined && c.slaHours < 0).length,
    cases: filtered,
  };
}

function getDensityClass(total: number): string {
  if (total >= 4) return "fill-red-500/70 stroke-red-400";
  if (total >= 2) return "fill-orange-400/60 stroke-orange-400";
  if (total >= 1) return "fill-yellow-400/50 stroke-yellow-400";
  return "fill-foreground/5 stroke-border-warm";
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GeographicMapPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const regionStats = REGIONS.reduce((acc, r) => {
    acc[r] = getRegionStats(r, activeCategory);
    return acc;
  }, {} as Record<string, ReturnType<typeof getRegionStats>>);

  const panelRegion = selectedRegion ?? hoveredRegion;

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-gold/30">
      <Sidebar activeItem="Executive Command Center" />

      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        <header className="shrink-0 z-30 bg-background/80 backdrop-blur-md border-b border-border-warm px-8 py-5">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Geographic Heatmap & Community Needs
          </h1>
          <p className="text-sm text-foreground/60 mt-1">Regional distribution of humanitarian cases across the Emirate of Sharjah.</p>
        </header>

        <ExecutiveNav />

        <main className="flex-1 overflow-hidden flex gap-0">

          {/* Left: Controls + Map */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    activeCategory === cat
                      ? "bg-gold border-gold text-white shadow-md shadow-gold/20"
                      : "bg-card border-border-warm text-foreground/60 hover:border-gold/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-foreground/50">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500/70 border border-red-400" /> High (4+)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-400/60 border border-orange-400" /> Medium (2–3)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-400/50 border border-yellow-400" /> Low (1)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-foreground/5 border border-border-warm" /> No Cases</span>
            </div>

            {/* SVG Schematic Map of Sharjah */}
            <div className="bg-card border border-border-warm rounded-2xl p-6 shadow-sm overflow-hidden">
              <svg viewBox="0 0 600 400" className="w-full max-h-[400px]" xmlns="http://www.w3.org/2000/svg">
                {/* Background */}
                <rect width="600" height="400" className="fill-background" />
                
                {/* Grid subtle */}
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
                  </pattern>
                </defs>
                <rect width="600" height="400" fill="url(#grid)" />

                {/* Sharjah City — Western coastal main city */}
                <motion.g
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedRegion(selectedRegion === "Sharjah City" ? null : "Sharjah City")}
                  onHoverStart={() => setHoveredRegion("Sharjah City")}
                  onHoverEnd={() => setHoveredRegion(null)}
                  style={{ cursor: "pointer" }}
                >
                  <motion.path
                    d="M 80 80 L 200 70 L 220 160 L 180 200 L 90 190 Z"
                    className={`stroke-2 transition-all duration-300 ${getDensityClass(regionStats["Sharjah City"].total)} ${selectedRegion === "Sharjah City" ? "stroke-gold stroke-[3]" : ""}`}
                    animate={{ opacity: hoveredRegion === "Sharjah City" || selectedRegion === "Sharjah City" ? 1 : 0.75 }}
                  />
                  <text x="148" y="138" textAnchor="middle" className="fill-white text-[10px] font-bold" fontSize="11" fontWeight="bold" fill="white">
                    Sharjah City
                  </text>
                  <text x="148" y="152" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.8)" fontWeight="bold">
                    {regionStats["Sharjah City"].total} cases
                  </text>
                </motion.g>

                {/* Al Hamriyah — North */}
                <motion.g
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedRegion(selectedRegion === "Al Hamriyah" ? null : "Al Hamriyah")}
                  onHoverStart={() => setHoveredRegion("Al Hamriyah")}
                  onHoverEnd={() => setHoveredRegion(null)}
                  style={{ cursor: "pointer" }}
                >
                  <motion.path
                    d="M 90 40 L 200 30 L 200 70 L 80 80 Z"
                    className={`stroke-2 transition-all duration-300 ${getDensityClass(regionStats["Al Hamriyah"].total)} ${selectedRegion === "Al Hamriyah" ? "stroke-gold stroke-[3]" : ""}`}
                    animate={{ opacity: hoveredRegion === "Al Hamriyah" || selectedRegion === "Al Hamriyah" ? 1 : 0.75 }}
                  />
                  <text x="143" y="60" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">Al Hamriyah</text>
                  <text x="143" y="72" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.8)" fontWeight="bold">{regionStats["Al Hamriyah"].total} cases</text>
                </motion.g>

                {/* Central Region (Al Dhaid) — Central interior */}
                <motion.g
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedRegion(selectedRegion === "Central Region (Al Dhaid)" ? null : "Central Region (Al Dhaid)")}
                  onHoverStart={() => setHoveredRegion("Central Region (Al Dhaid)")}
                  onHoverEnd={() => setHoveredRegion(null)}
                  style={{ cursor: "pointer" }}
                >
                  <motion.path
                    d="M 220 100 L 360 90 L 370 220 L 220 230 Z"
                    className={`stroke-2 transition-all duration-300 ${getDensityClass(regionStats["Central Region (Al Dhaid)"].total)} ${selectedRegion === "Central Region (Al Dhaid)" ? "stroke-gold stroke-[3]" : ""}`}
                    animate={{ opacity: hoveredRegion === "Central Region (Al Dhaid)" || selectedRegion === "Central Region (Al Dhaid)" ? 1 : 0.75 }}
                  />
                  <text x="295" y="158" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">Al Dhaid</text>
                  <text x="295" y="172" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.8)" fontWeight="bold">{regionStats["Central Region (Al Dhaid)"].total} cases</text>
                </motion.g>

                {/* Eastern Region Khorfakkan */}
                <motion.g
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedRegion(selectedRegion === "Eastern Region (Khorfakkan)" ? null : "Eastern Region (Khorfakkan)")}
                  onHoverStart={() => setHoveredRegion("Eastern Region (Khorfakkan)")}
                  onHoverEnd={() => setHoveredRegion(null)}
                  style={{ cursor: "pointer" }}
                >
                  <motion.path
                    d="M 380 60 L 490 80 L 500 170 L 375 180 Z"
                    className={`stroke-2 transition-all duration-300 ${getDensityClass(regionStats["Eastern Region (Khorfakkan)"].total)} ${selectedRegion === "Eastern Region (Khorfakkan)" ? "stroke-gold stroke-[3]" : ""}`}
                    animate={{ opacity: hoveredRegion === "Eastern Region (Khorfakkan)" || selectedRegion === "Eastern Region (Khorfakkan)" ? 1 : 0.75 }}
                  />
                  <text x="437" y="122" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">Khorfakkan</text>
                  <text x="437" y="136" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.8)" fontWeight="bold">{regionStats["Eastern Region (Khorfakkan)"].total} cases</text>
                </motion.g>

                {/* Eastern Region Kalba */}
                <motion.g
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedRegion(selectedRegion === "Eastern Region (Kalba)" ? null : "Eastern Region (Kalba)")}
                  onHoverStart={() => setHoveredRegion("Eastern Region (Kalba)")}
                  onHoverEnd={() => setHoveredRegion(null)}
                  style={{ cursor: "pointer" }}
                >
                  <motion.path
                    d="M 380 185 L 500 175 L 510 290 L 385 300 Z"
                    className={`stroke-2 transition-all duration-300 ${getDensityClass(regionStats["Eastern Region (Kalba)"].total)} ${selectedRegion === "Eastern Region (Kalba)" ? "stroke-gold stroke-[3]" : ""}`}
                    animate={{ opacity: hoveredRegion === "Eastern Region (Kalba)" || selectedRegion === "Eastern Region (Kalba)" ? 1 : 0.75 }}
                  />
                  <text x="445" y="240" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">Kalba</text>
                  <text x="445" y="254" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.8)" fontWeight="bold">{regionStats["Eastern Region (Kalba)"].total} cases</text>
                </motion.g>

                {/* Gulf water label */}
                <text x="45" y="300" fontSize="11" fill="rgba(100,150,200,0.5)" fontWeight="bold" transform="rotate(-25, 45, 300)">Arabian Gulf</text>
                {/* East coast label */}
                <text x="530" y="200" fontSize="10" fill="rgba(100,150,200,0.5)" fontWeight="bold" transform="rotate(90, 530, 200)">Gulf of Oman</text>

                {/* Compass rose */}
                <g transform="translate(555, 355)">
                  <circle r="14" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                  <text y="-6" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5">N</text>
                  <text y="12" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5">S</text>
                  <text x="7" y="3" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5">E</text>
                  <text x="-7" y="3" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5">W</text>
                </g>
              </svg>
            </div>
          </div>

          {/* Right: Region Panel */}
          <AnimatePresence>
            {panelRegion && (
              <motion.div
                key="region-panel"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-l border-border-warm bg-card overflow-hidden shrink-0"
              >
                <div className="w-[320px] h-full overflow-y-auto p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Selected Region</p>
                      <h3 className="text-base font-bold text-foreground mt-0.5">{panelRegion}</h3>
                    </div>
                    {selectedRegion && (
                      <button onClick={() => setSelectedRegion(null)} className="p-1.5 hover:bg-foreground/5 rounded-full transition-colors">
                        <svg className="w-4 h-4 text-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-background rounded-xl p-3 border border-border-warm text-center">
                      <p className="text-2xl font-black text-foreground">{regionStats[panelRegion].total}</p>
                      <p className="text-[9px] text-foreground/40 uppercase tracking-widest mt-0.5">Total</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3 border border-orange-200 text-center">
                      <p className="text-2xl font-black text-orange-700">{regionStats[panelRegion].urgent}</p>
                      <p className="text-[9px] text-orange-500 uppercase tracking-widest mt-0.5">Urgent</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3 border border-red-200 text-center">
                      <p className="text-2xl font-black text-red-700">{regionStats[panelRegion].overdue}</p>
                      <p className="text-[9px] text-red-500 uppercase tracking-widest mt-0.5">Overdue</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">Cases in Region</p>
                    <div className="space-y-2">
                      {regionStats[panelRegion].cases.length === 0 ? (
                        <p className="text-xs text-foreground/40 text-center py-4">No cases for selected filter.</p>
                      ) : (
                        regionStats[panelRegion].cases.map(c => (
                          <div key={c.id} className="p-3 bg-background border border-border-warm rounded-xl">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-black text-gold">{c.id}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                c.priority === "Critical" ? "text-red-600 bg-red-50 border border-red-200" :
                                c.priority === "High" ? "text-orange-600 bg-orange-50 border border-orange-200" :
                                "text-foreground/40 bg-foreground/5 border border-border-warm"
                              }`}>{c.priority}</span>
                            </div>
                            <p className="text-xs text-foreground/80 font-medium line-clamp-2">{c.summary}</p>
                            <p className="text-[9px] text-foreground/40 mt-1">{c.primaryClassification} · {c.status}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
