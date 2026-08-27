"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sidebar } from "../../components/Sidebar";
import { PortalHeader } from "../../components/PortalHeader";
import { ExecutiveNav } from "../../components/ExecutiveNav";
import { MOCK_CASES } from "../cases/page";
import { MOCK_DIRECTIVES } from "../directives/page";

// ─── Analytics constants ──────────────────────────────────────────────────────
const ACTIVE_STATUSES = ["New", "Under Review", "Assigned", "In Progress", "Escalated", "Awaiting Citizen", "Reopened"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const MONTH_MAP: Record<string, number> = { "01": 0, "02": 1, "03": 2, "04": 3, "05": 4, "06": 5, "07": 6, "08": 7 };

// Category distribution colors
const CATEGORY_COLORS: Record<string, string> = {
  "Housing":             "bg-blue-500",
  "Health & Medical":    "bg-red-500",
  "Employment":          "bg-purple-500",
  "Financial Assistance":"bg-orange-500",
  "Government Services": "bg-teal-500",
  "Education":           "bg-indigo-500",
};

// ─── KPI Card Component ───────────────────────────────────────────────────────
function KpiCard({ label, value, sub, gradient, icon }: {
  label: string; value: string | number; sub?: string;
  gradient: string; icon: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`${gradient} rounded-2xl p-5 border relative overflow-hidden shadow-xl`}
    >
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-70 mb-1">{label}</p>
          <h3 className="text-4xl font-black">{value}</h3>
          {sub && <p className="text-[10px] mt-1 opacity-60 font-medium">{sub}</p>}
        </div>
        <div className="p-2.5 bg-white/10 rounded-xl">{icon}</div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function ExecutiveDashboardContent() {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const dateFilter = searchParams.get("filter") || "Last Month";
  const customStart = searchParams.get("start") || "2026-08-01";
  const customEnd = searchParams.get("end") || "2026-08-27";

  // Helper to filter items dynamically based on selected date filter
  const filterByDate = (dateStr?: string) => {
    if (!dateStr) return false;
    // Extract date portion: YYYY-MM-DD
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const itemDate = new Date(datePart);
    const targetDate = new Date("2026-08-27"); // Current reference context date

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

  // Perform dynamic filtering of Cases and Directives
  const filteredCases = MOCK_CASES.filter(c => filterByDate(c.createdAt));
  const filteredDirectives = MOCK_DIRECTIVES.filter(d => filterByDate(d.createdAt));

  // Compute reactive states
  const openCases = filteredCases.filter(c => ACTIVE_STATUSES.includes(c.status));
  const urgentCases = filteredCases.filter(c => c.priority === "Critical" || c.priority === "High");
  const overdueCases = filteredCases.filter(c => c.slaHours !== undefined && c.slaHours < 0);
  const resolvedLast30 = filteredCases.filter(c => c.status === "Resolved" || c.status === "Closed");

  const categoryCount: Record<string, number> = {};
  filteredCases.forEach(c => {
    categoryCount[c.primaryClassification] = (categoryCount[c.primaryClassification] || 0) + 1;
  });
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  // Recalculate monthly trend data (always use MOCK_CASES so full year is visible in the trend chart)
  const monthlyData = MONTHS.map(() => 0);
  MOCK_CASES.forEach(c => {
    if (c.createdAt) {
      const m = c.createdAt.split("-")[1];
      if (m && MONTH_MAP[m] !== undefined) monthlyData[MONTH_MAP[m]]++;
    }
  });
  const maxMonthly = Math.max(...monthlyData, 1);

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
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── KPI Cards ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              label="Open Cases"
              value={openCases.length}
              sub="Across all active statuses"
              gradient="bg-gradient-to-br from-card to-background border-border-warm text-foreground"
              icon={<svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            />
            <KpiCard
              label="Urgent / Critical"
              value={urgentCases.length}
              sub="High + Critical priority"
              gradient="bg-gradient-to-br from-orange-600 to-orange-800 border-orange-500/30 text-white"
              icon={<svg className="w-5 h-5 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            />
            <KpiCard
              label="SLA Breached"
              value={overdueCases.length}
              sub="Overdue — action required"
              gradient="bg-gradient-to-br from-red-600 to-red-800 border-red-500/30 text-white"
              icon={<svg className="w-5 h-5 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <KpiCard
              label="Resolved (All Time)"
              value={resolvedLast30.length}
              sub="Successful closures"
              gradient="bg-gradient-to-br from-green-600 to-green-800 border-green-500/30 text-white"
              icon={<svg className="w-5 h-5 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <KpiCard
              label="Active Directives"
              value={MOCK_DIRECTIVES.length}
              sub="Executive-issued orders"
              gradient="bg-gradient-to-br from-yellow-600 to-amber-800 border-yellow-500/30 text-white"
              icon={<svg className="w-5 h-5 text-yellow-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.242.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.176 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 12.08c-.783-.57-.384-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
            />
            <KpiCard
              label="Top Category"
              value={topCategory}
              sub="Most frequent issue type"
              gradient="bg-gradient-to-br from-card to-background border-border-warm text-foreground"
              icon={<svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
            />
            <KpiCard
              label="Avg. First Response"
              value="2.8 Days"
              sub="Across resolved cases"
              gradient="bg-gradient-to-br from-card to-background border-border-warm text-foreground"
              icon={<svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 border border-purple-500/30 rounded-2xl p-5 relative overflow-hidden">
              <p className="text-[10px] uppercase tracking-widest font-bold text-purple-700 dark:text-purple-300 mb-1">🔮 AI Emerging Signal</p>
              <p className="text-sm font-black text-purple-950 dark:text-white">Rise in Housing Denials</p>
              <p className="text-[10px] text-purple-800/80 dark:text-purple-300/70 mt-1 font-medium">3 clustered cases in Al Dhaid — 90 days</p>
              <Link href="/executive/signals" className="mt-2 inline-block text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest hover:text-purple-800 transition-colors">
                View Signals →
              </Link>
            </div>
          </div>

          {/* ── Charts Row ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-4">

            {/* Monthly Trend Bar Chart */}
            <div className="col-span-2 bg-card border border-border-warm rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-widest mb-5">Cases Intake — Trend (2026)</h3>
              <div className="flex items-end gap-2 h-36">
                {MONTHS.map((month, i) => {
                  const val = monthlyData[i];
                  const pct = (val / maxMonthly) * 100;
                  return (
                    <div
                      key={month}
                      className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
                      onMouseEnter={() => setHoveredMonth(i)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      <span className={`text-[9px] font-bold transition-opacity ${hoveredMonth === i ? "opacity-100 text-gold" : "opacity-0"}`}>
                        {val}
                      </span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(pct, 4)}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                        className={`w-full rounded-t-md transition-colors ${
                          hoveredMonth === i ? "bg-gold" : "bg-gold/30 hover:bg-gold/60"
                        }`}
                        style={{ minHeight: "4px" }}
                      />
                      <span className="text-[9px] text-foreground/40 font-medium">{month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-card border border-border-warm rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-widest mb-4">Case Distribution by Category</h3>
              <div className="space-y-3">
                {Object.entries(categoryCount).sort((a,b) => b[1]-a[1]).map(([cat, count]) => {
                  const pct = Math.round((count / MOCK_CASES.length) * 100);
                  const color = CATEGORY_COLORS[cat] || "bg-gray-400";
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="font-bold text-foreground/70">{cat}</span>
                        <span className="text-foreground/40 font-bold">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          className={`h-full rounded-full ${color}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Bottom Row: Urgent Cases + Directives ─────────────────────── */}
          <div className="grid grid-cols-3 gap-4">

            {/* Urgent / Overdue Cases Table */}
            <div className="col-span-2 bg-card border border-border-warm rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border-warm flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Critical & Overdue Cases</h3>
                <Link href="/cases" className="text-[10px] text-gold hover:underline uppercase tracking-widest font-bold">View All →</Link>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-warm">
                    <th className="px-6 py-2 text-left text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Case</th>
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Category</th>
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Entity</th>
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-foreground/40 uppercase tracking-widest">SLA</th>
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {[...overdueCases, ...urgentCases.filter(c => !overdueCases.includes(c))]
                    .slice(0, 6)
                    .map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border-warm/50 hover:bg-foreground/[0.02] transition-colors"
                    >
                      <td className="px-6 py-3">
                        <Link href={`/cases?id=${c.id}`} className="text-gold hover:underline font-bold">{c.id}</Link>
                        <p className="text-foreground/50 text-[10px] truncate max-w-[180px]">{c.citizenName}</p>
                      </td>
                      <td className="px-4 py-3 text-foreground/70 font-medium">{c.primaryClassification}</td>
                      <td className="px-4 py-3 text-foreground/60 text-[10px]">{c.externalEntity}</td>
                      <td className="px-4 py-3">
                        {c.slaHours !== undefined && c.slaHours < 0
                          ? <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded">BREACHED</span>
                          : <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">{c.slaHours}h left</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          c.priority === "Critical" ? "text-red-600 bg-red-50 border-red-200" :
                          c.priority === "High"     ? "text-orange-600 bg-orange-50 border-orange-200" :
                          "text-foreground/50 bg-foreground/5 border-border-warm"
                        }`}>{c.priority}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Active Directives */}
            <div className="bg-card border border-border-warm rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border-warm flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Active Directives</h3>
                <Link href="/directives" className="text-[10px] text-gold hover:underline uppercase tracking-widest font-bold">View All →</Link>
              </div>
              <div className="divide-y divide-border-warm/50">
                {MOCK_DIRECTIVES.slice(0, 4).map((d, i) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="px-5 py-3 hover:bg-foreground/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-[10px] font-black text-gold">{d.id}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        d.status === "Closed"
                          ? "text-green-600 bg-green-50 border-green-200"
                          : d.status === "Pending Verification"
                            ? "text-orange-600 bg-orange-50 border-orange-200"
                            : "text-gold bg-gold/5 border-gold/20"
                      }`}>{d.status}</span>
                    </div>
                    <p className="text-[11px] text-foreground/80 font-medium line-clamp-2">{d.description}</p>
                    <p className="text-[9px] text-foreground/40 mt-1 uppercase tracking-widest">{d.targetEntity}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default function ExecutiveDashboardPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background text-foreground">Loading Executive Dashboard...</div>}>
      <ExecutiveDashboardContent />
    </Suspense>
  );
}
