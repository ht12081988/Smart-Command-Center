"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "../../../components/Sidebar";
import { PortalHeader } from "../../../components/PortalHeader";
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

// Real coordinate approximations for each region to show on Google Maps
const REGION_COORDS: Record<string, [number, number][]> = {
  "Sharjah City": [
    [25.33, 55.35],
    [25.38, 55.36],
    [25.40, 55.43],
    [25.35, 55.51],
    [25.29, 55.45],
  ],
  "Al Hamriyah": [
    [25.44, 55.49],
    [25.49, 55.48],
    [25.51, 55.53],
    [25.46, 55.55],
  ],
  "Central Region (Al Dhaid)": [
    [25.25, 55.80],
    [25.33, 55.83],
    [25.34, 55.95],
    [25.23, 55.94],
  ],
  "Eastern Region (Khorfakkan)": [
    [25.31, 56.31],
    [25.39, 56.32],
    [25.37, 56.39],
    [25.30, 56.38],
  ],
  "Eastern Region (Kalba)": [
    [25.02, 56.32],
    [25.12, 56.33],
    [25.11, 56.40],
    [25.01, 56.39],
  ],
};

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

function getDensityColor(total: number): string {
  if (total >= 4) return "#ef4444"; // red-500
  if (total >= 2) return "#fb923c"; // orange-400
  if (total >= 1) return "#facc15"; // yellow-400
  return "#9ca3af"; // gray-400
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function GeographicMapContent() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("Sharjah City");

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersGroupRef = useRef<any>(null);

  const searchParams = useSearchParams();
  const dateFilter = searchParams.get("filter") || "Last Month";
  const customStart = searchParams.get("start") || "2026-08-01";
  const customEnd = searchParams.get("end") || "2026-08-27";

  const filterByDate = (dateStr?: string) => {
    if (!dateStr) return false;
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const itemDate = new Date(datePart);
    const targetDate = new Date("2026-08-27");

    switch (dateFilter) {
      case "Today":
        return datePart === "2026-08-27";
      case "Yesterday":
        return datePart === "2026-08-26";
      case "Last Week": {
        const diffTime = targetDate.getTime() - itemDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }
      case "Last Month": {
        const diffTime = targetDate.getTime() - itemDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 30;
      }
      case "Last 90 Days": {
        const diffTime = targetDate.getTime() - itemDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 90;
      }
      case "Date Range": {
        if (!customStart || !customEnd) return true;
        const start = new Date(customStart);
        const end = new Date(customEnd);
        return itemDate >= start && itemDate <= end;
      }
      default:
        return true;
    }
  };

  const filteredCases = MOCK_CASES.filter(c => filterByDate(c.createdAt));

  function getRegionStatsLocal(region: string, category: string) {
    const filtered = filteredCases.filter(c =>
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

  const regionStats = REGIONS.reduce((acc, r) => {
    acc[r] = getRegionStatsLocal(r, activeCategory);
    return acc;
  }, {} as Record<string, ReturnType<typeof getRegionStatsLocal>>);

  const panelRegion = hoveredRegion ?? selectedRegion;

  // 1. Load Leaflet script/styles
  useEffect(() => {
    if (typeof window === "undefined") return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  // 2. Initialize Map Instance
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    // Center map around Sharjah Emirate
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([25.25, 55.85], 9);

    // Apply Google Maps Road layer
    L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attribution: "&copy; Google Maps",
    }).addTo(map);

    layersGroupRef.current = L.featureGroup().addTo(map);
    mapInstanceRef.current = map;
  }, [leafletLoaded]);

  // 3. Draw/Update region overlays dynamically based on stats/states
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;

    const L = (window as any).L;
    layersGroupRef.current.clearLayers();

    REGIONS.forEach(regionName => {
      const coords = REGION_COORDS[regionName];
      if (!coords) return;

      const isSelected = selectedRegion === regionName;
      const isHovered = hoveredRegion === regionName;
      const stats = regionStats[regionName];

      const polygon = L.polygon(coords, {
        color: isSelected ? "#d97706" : "#ffffff",
        weight: isSelected ? 3 : 1.5,
        fillColor: getDensityColor(stats.total),
        fillOpacity: isSelected || isHovered ? 0.65 : 0.35,
      });

      // Hover triggers
      polygon.on("mouseover", () => {
        setHoveredRegion(regionName);
      });
      polygon.on("mouseout", () => {
        setHoveredRegion(null);
      });

      // Click trigger
      polygon.on("click", () => {
        setSelectedRegion(regionName);
      });

      // Add popup showing info
      polygon.bindTooltip(`<strong>${regionName}</strong><br/>${stats.total} Active Cases`, {
        sticky: true,
        direction: "top",
      });

      layersGroupRef.current.addLayer(polygon);
    });
  }, [selectedRegion, hoveredRegion, activeCategory, leafletLoaded]);

  return (
    <div className="h-screen flex overflow-hidden bg-background text-foreground font-sans selection:bg-gold/30">
      <Sidebar activeItem="Executive Command Center" />

      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        <PortalHeader
          title="Geographic Heatmap & Community Needs"
          subtitle="Regional distribution of humanitarian cases across the Emirate of Sharjah."
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          }
        />

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
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 border border-red-400" /> High (4+)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-400 border border-orange-400" /> Medium (2–3)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-400 border border-yellow-400" /> Low (1)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gray-400 border border-border-warm" /> No Cases</span>
            </div>

            {/* Google Map container */}
            <div className="relative bg-card border border-border-warm rounded-2xl shadow-sm overflow-hidden h-[460px] w-full">
              {!leafletLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-card text-xs text-foreground/40 font-bold uppercase tracking-widest">
                  Loading Live Cartography...
                </div>
              )}
              <div ref={mapRef} className="w-full h-full z-0" />
            </div>
          </div>

          {/* Right: Region Panel - Always Visible */}
          <div className="border-l border-border-warm bg-card overflow-hidden shrink-0 w-[320px]">
            <div className="w-[320px] h-full overflow-y-auto p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Selected Region</p>
                  <h3 className="text-base font-bold text-foreground mt-0.5">{panelRegion}</h3>
                </div>
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
          </div>
        </main>
      </div>
    </div>
  );
}

export default function GeographicMapPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background text-foreground">Loading Geographic Map...</div>}>
      <GeographicMapContent />
    </Suspense>
  );
}
