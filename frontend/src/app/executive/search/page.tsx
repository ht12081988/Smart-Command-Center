"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Sidebar } from "../../../components/Sidebar";
import { ExecutiveNav } from "../../../components/ExecutiveNav";
import { MOCK_CASES, Case } from "../../cases/page";

// ─── NL Search logic ─────────────────────────────────────────────────────────
const KEYWORD_MAP: { keywords: string[]; filter: (c: Case) => boolean }[] = [
  { keywords: ["housing", "house", "accommodation", "home"], filter: c => c.primaryClassification === "Housing" },
  { keywords: ["medical", "health", "hospital", "treatment", "doctor"], filter: c => c.primaryClassification === "Health & Medical" },
  { keywords: ["employment", "job", "work", "career", "factory"], filter: c => c.primaryClassification === "Employment" },
  { keywords: ["financial", "money", "debt", "allowance", "grant", "assistance"], filter: c => c.primaryClassification === "Financial Assistance" },
  { keywords: ["government", "license", "land", "municipality", "sedd"], filter: c => c.primaryClassification === "Government Services" },
  { keywords: ["education", "school", "enrollment", "student"], filter: c => c.primaryClassification === "Education" },
  { keywords: ["overdue", "breach", "breached", "expired", "sla"], filter: c => c.slaHours !== undefined && c.slaHours < 0 },
  { keywords: ["urgent", "critical", "emergency", "high priority"], filter: c => c.priority === "Critical" || c.priority === "High" },
  { keywords: ["escalated", "escalation"], filter: c => c.status === "Escalated" },
  { keywords: ["resolved", "closed", "completed", "done"], filter: c => c.status === "Resolved" || c.status === "Closed" },
  { keywords: ["new", "recent", "fresh"], filter: c => c.status === "New" },
  { keywords: ["in progress", "ongoing", "active"], filter: c => c.status === "In Progress" || c.status === "Under Review" },
  { keywords: ["khorfakkan", "eastern region khorfakkan"], filter: c => c.region === "Eastern Region (Khorfakkan)" },
  { keywords: ["kalba"], filter: c => c.region === "Eastern Region (Kalba)" },
  { keywords: ["dhaid", "al dhaid", "central"], filter: c => c.region === "Central Region (Al Dhaid)" },
  { keywords: ["hamriyah", "al hamriyah"], filter: c => c.region === "Al Hamriyah" },
  { keywords: ["sharjah city"], filter: c => c.region === "Sharjah City" },
];

const EXAMPLE_QUERIES = [
  "Show all overdue housing cases",
  "Critical medical cases in Sharjah City",
  "Escalated cases in Al Dhaid",
  "New employment cases in Al Hamriyah",
  "Financial assistance breached",
];

function searchCases(query: string): Case[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  const matchedFilters = KEYWORD_MAP.filter(km =>
    km.keywords.some(kw => lower.includes(kw))
  );
  if (matchedFilters.length === 0) {
    // Fallback: text search on summary/facts
    return MOCK_CASES.filter(c =>
      c.summary.toLowerCase().includes(lower) ||
      c.citizenName.toLowerCase().includes(lower) ||
      c.externalEntity.toLowerCase().includes(lower)
    );
  }
  // AND logic: case must pass all matched filters
  return MOCK_CASES.filter(c => matchedFilters.every(f => f.filter(c)));
}

const STATUS_BADGE: Record<string, string> = {
  "New":             "text-blue-600 bg-blue-50 border-blue-200",
  "Under Review":    "text-purple-600 bg-purple-50 border-purple-200",
  "In Progress":     "text-gold bg-gold/10 border-gold/30",
  "Assigned":        "text-cyan-600 bg-cyan-50 border-cyan-200",
  "Escalated":       "text-red-600 bg-red-50 border-red-200",
  "Awaiting Citizen":"text-orange-600 bg-orange-50 border-orange-200",
  "Resolved":        "text-green-600 bg-green-50 border-green-200",
  "Closed":          "text-gray-500 bg-gray-50 border-gray-200",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SmartSearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [results, setResults] = useState<Case[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (q: string) => {
    const q2 = q.trim();
    if (!q2) return;
    setSubmitted(q2);
    setResults(searchCases(q2));
    setSearched(true);
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-gold/30">
      <Sidebar activeItem="Executive Command Center" />

      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        <header className="shrink-0 z-30 bg-background/80 backdrop-blur-md border-b border-border-warm px-8 py-5">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Smart Natural Language Search
          </h1>
          <p className="text-sm text-foreground/60 mt-1">Query the case database using plain language — no filters needed.</p>
        </header>

        <ExecutiveNav />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Search Interface */}
          <div className="max-w-3xl mx-auto space-y-4">

            {/* Search Box */}
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch(query)}
                placeholder="e.g. Show all overdue housing cases in Al Dhaid..."
                className="w-full pl-12 pr-32 py-4 text-base bg-card border-2 border-border-warm focus:border-gold focus:outline-none rounded-2xl text-foreground shadow-lg placeholder:text-foreground/30 transition-colors"
              />
              <button
                onClick={() => handleSearch(query)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gold hover:bg-gold-hover text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-sm shadow-gold/20"
              >
                Search
              </button>
            </div>

            {/* Example Queries */}
            {!searched && (
              <div className="space-y-2">
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold">Try these queries:</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_QUERIES.map(q => (
                    <button
                      key={q}
                      onClick={() => { setQuery(q); handleSearch(q); }}
                      className="px-3 py-1.5 text-xs bg-card border border-border-warm hover:border-gold/50 rounded-full text-foreground/70 hover:text-foreground transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <AnimatePresence>
            {searched && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest">
                      {results.length === 0
                        ? "No results for"
                        : `${results.length} result${results.length > 1 ? "s" : ""} for`}
                    </p>
                    <p className="text-base font-bold text-foreground mt-0.5">"{submitted}"</p>
                  </div>
                  <button
                    onClick={() => { setQuery(""); setSubmitted(""); setResults([]); setSearched(false); }}
                    className="text-[10px] text-foreground/40 hover:text-foreground uppercase tracking-widest font-bold transition-colors"
                  >
                    Clear ×
                  </button>
                </div>

                {results.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-border-warm rounded-2xl">
                    <svg className="w-10 h-10 text-foreground/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm text-foreground/40 font-medium">No cases matched your query.</p>
                    <p className="text-xs text-foreground/30 mt-1">Try different keywords like "housing", "medical", "overdue".</p>
                  </div>
                ) : (
                  results.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={`/cases?id=${c.id}`}
                        className="block p-4 bg-card border border-border-warm hover:border-gold/50 rounded-2xl transition-all hover:shadow-md hover:shadow-gold/5 group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] font-black text-gold">{c.id}</span>
                              <span className="text-[10px] text-foreground/40">·</span>
                              <span className="text-[10px] text-foreground/50 font-medium">{c.citizenName}</span>
                              {c.region && (
                                <>
                                  <span className="text-[10px] text-foreground/40">·</span>
                                  <span className="text-[10px] text-foreground/50">{c.region}</span>
                                </>
                              )}
                            </div>
                            <p className="text-sm font-medium text-foreground group-hover:text-gold transition-colors line-clamp-2">{c.summary}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[9px] font-bold text-foreground/50 bg-foreground/5 border border-border-warm px-2 py-0.5 rounded-full">
                                {c.primaryClassification}
                              </span>
                              <span className="text-[9px] font-bold text-foreground/50 bg-foreground/5 border border-border-warm px-2 py-0.5 rounded-full">
                                {c.externalEntity}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_BADGE[c.status] ?? "text-foreground/40 bg-foreground/5 border-border-warm"}`}>
                              {c.status}
                            </span>
                            {c.slaHours !== undefined && c.slaHours < 0 && (
                              <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">SLA BREACHED</span>
                            )}
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              c.priority === "Critical" ? "text-red-500" : c.priority === "High" ? "text-orange-500" : "text-foreground/30"
                            }`}>{c.priority}</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!searched && (
            <div className="max-w-3xl mx-auto py-20 text-center">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg className="w-14 h-14 text-gold/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </motion.div>
              <p className="text-sm text-foreground/30 font-medium">Type a plain-language query to search across all {MOCK_CASES.length} cases.</p>
              <p className="text-xs text-foreground/20 mt-1">Supports category, region, status, priority, and entity keywords.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
