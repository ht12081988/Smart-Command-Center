"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const EXEC_TABS = [
  { label: "Command Dashboard", href: "/executive", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" },
  { label: "Geographic Map", href: "/executive/map", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
  { label: "Entity Scorecard", href: "/executive/entities", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { label: "AI Signals", href: "/executive/signals", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
];

function ExecutiveNavInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const filter = searchParams.get("filter") || "Last Month";
  const start = searchParams.get("start") || "2026-08-01";
  const end = searchParams.get("end") || "2026-08-27";

  const queryStr = `?filter=${encodeURIComponent(filter)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;

  const handleFilterChange = (newFilter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", newFilter);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDateChange = (type: "start" | "end", val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, val);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="shrink-0 border-b border-border-warm bg-background/80 backdrop-blur-md px-8 flex justify-between items-center">
      <div className="flex items-center gap-1 overflow-x-auto">
        {EXEC_TABS.map((tab) => {
          const isActive = tab.href === "/executive"
            ? pathname === "/executive"
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={`${tab.href}${queryStr}`}
              className={`flex items-center gap-2 px-4 py-3.5 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-gold text-gold"
                  : "border-transparent text-foreground/50 hover:text-foreground hover:border-border-warm"
              }`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </Link>
          );
        })}
      </div>
      <div className="shrink-0 py-2">
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-border-warm bg-card text-foreground text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:border-gold cursor-pointer"
          >
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Last Week">Last Week</option>
            <option value="Last Month">Last Month</option>
            <option value="Last 90 Days">Last 90 Days</option>
            <option value="Date Range">Date Range</option>
          </select>
          {filter === "Date Range" && (
            <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
              <input
                type="date"
                value={start}
                onChange={(e) => handleDateChange("start", e.target.value)}
                className="px-2 py-1 rounded-lg border border-border-warm bg-card text-foreground text-[10px] font-bold focus:outline-none focus:border-gold"
              />
              <span className="text-[10px] text-foreground/40 font-bold uppercase">to</span>
              <input
                type="date"
                value={end}
                onChange={(e) => handleDateChange("end", e.target.value)}
                className="px-2 py-1 rounded-lg border border-border-warm bg-card text-foreground text-[10px] font-bold focus:outline-none focus:border-gold"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ExecutiveNav() {
  return (
    <Suspense fallback={<div className="h-12 border-b border-border-warm bg-background" />}>
      <ExecutiveNavInner />
    </Suspense>
  );
}
