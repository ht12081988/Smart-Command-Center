"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "../../../components/Sidebar";
import { PortalHeader } from "../../../components/PortalHeader";
import { Pagination } from "../../../components/Pagination";

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  module: string;
  actionType: string;
  recordId: string;
  ipAddress: string;
  userAgent: string;
  status: "Success" | "Failed";
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SYSTEM_MODULES = [
  "Live Studio Feed",
  "Call Screener Desk",
  "Broadcast Archives",
  "Citizen Profiles",
  "Case Management",
  "Resolution & Follow-up",
  "Executive Directives",
  "External Entities",
  "User Access Directory",
  "Roles & Permissions",
  "Smart Search"
];

const ACTION_TYPES = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "REJECT",
  "ACTIVATE",
  "DEACTIVATE",
  "ASSIGN",
  "UNASSIGN",
  "EXPORT",
  "IMPORT",
  "LOGIN",
  "LOGOUT",
  "PASSWORD_RESET",
  "PERMISSION_CHANGE"
];

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "LOG-2026-001",
    timestamp: "2026-08-27T10:14:22Z",
    actorName: "Hassan Al-Mansoori",
    actorRole: "Administrator",
    module: "Roles & Permissions",
    actionType: "PERMISSION_CHANGE",
    recordId: "ROLE-002",
    ipAddress: "192.168.1.104",
    userAgent: "Chrome 128 / Windows 11",
    status: "Success",
    fieldName: "permissions",
    oldValue: "['Read', 'Write']",
    newValue: "['Read', 'Write', 'Export']"
  },
  {
    id: "LOG-2026-002",
    timestamp: "2026-08-27T09:44:05Z",
    actorName: "Sarah Al-Haji",
    actorRole: "Producer",
    module: "Call Screener Desk",
    actionType: "DEACTIVATE",
    recordId: "CALL-9801",
    ipAddress: "192.168.1.112",
    userAgent: "Safari 17 / macOS Sonoma",
    status: "Success",
    fieldName: "isActive",
    oldValue: "true",
    newValue: "false"
  },
  {
    id: "LOG-2026-003",
    timestamp: "2026-08-26T15:20:11Z",
    actorName: "Fatima Al-Suwaidi",
    actorRole: "CaseManager",
    module: "Case Management",
    actionType: "UPDATE",
    recordId: "CASE-9810",
    ipAddress: "10.0.4.15",
    userAgent: "Firefox 129 / Linux Ubuntu",
    status: "Success",
    fieldName: "status",
    oldValue: "Under Review",
    newValue: "In Progress"
  },
  {
    id: "LOG-2026-004",
    timestamp: "2026-08-26T11:05:00Z",
    actorName: "Hassan Al-Mansoori",
    actorRole: "Administrator",
    module: "User Access Directory",
    actionType: "CREATE",
    recordId: "USR-304",
    ipAddress: "192.168.1.104",
    userAgent: "Chrome 128 / Windows 11",
    status: "Success",
    fieldName: "userData",
    oldValue: "",
    newValue: "{ name: 'Zayed Al-Mansoori', role: 'Presenter', status: 'Active' }"
  },
  {
    id: "LOG-2026-005",
    timestamp: "2026-08-26T08:12:45Z",
    actorName: "Khalid Al-Qasimi",
    actorRole: "CaseManager",
    module: "Case Management",
    actionType: "DELETE",
    recordId: "CASE-1102",
    ipAddress: "10.0.4.22",
    userAgent: "Edge 127 / Windows 11",
    status: "Success",
    fieldName: "caseData",
    oldValue: "{ id: 'CASE-1102', citizenName: 'Ahmad Al-Mehairi', primaryClassification: 'Housing' }",
    newValue: ""
  },
  {
    id: "LOG-2026-006",
    timestamp: "2026-08-25T17:50:33Z",
    actorName: "Mariam Al-Mansoori",
    actorRole: "ExternalLiaison",
    module: "Resolution & Follow-up",
    actionType: "ASSIGN",
    recordId: "SLA-402",
    ipAddress: "192.168.2.89",
    userAgent: "Chrome 128 / macOS Sequoia",
    status: "Success",
    fieldName: "assignedOfficer",
    oldValue: "TBD",
    newValue: "Eng. Fatma Al-Hamed"
  },
  {
    id: "LOG-2026-007",
    timestamp: "2026-08-25T14:30:00Z",
    actorName: "Sarah Al-Haji",
    actorRole: "Producer",
    module: "Call Screener Desk",
    actionType: "EXPORT",
    recordId: "CALLS-EXPORT-2026-08-25",
    ipAddress: "192.168.1.112",
    userAgent: "Safari 17 / macOS Sonoma",
    status: "Success",
    fieldName: "exportParameters",
    oldValue: "",
    newValue: "{ date: '2026-08-25', format: 'Excel' }"
  },
  {
    id: "LOG-2026-008",
    timestamp: "2026-08-24T09:15:22Z",
    actorName: "Hassan Al-Mansoori",
    actorRole: "Administrator",
    module: "Roles & Permissions",
    actionType: "PASSWORD_RESET",
    recordId: "USR-002",
    ipAddress: "192.168.1.104",
    userAgent: "Chrome 128 / Windows 11",
    status: "Success",
    fieldName: "passwordHash",
    oldValue: "$2a$12$oldhashvalue...",
    newValue: "$2a$12$newhashvalue..."
  },
  {
    id: "LOG-2026-009",
    timestamp: "2026-08-23T11:42:01Z",
    actorName: "Sarah Al-Haji",
    actorRole: "Producer",
    module: "Live Studio Feed",
    actionType: "LOGIN",
    recordId: "SESSION-980",
    ipAddress: "192.168.1.112",
    userAgent: "Safari 17 / iPadOS 17",
    status: "Failed",
    fieldName: "loginAttempt",
    oldValue: "Invalid credentials",
    newValue: "Attempt locked out"
  },
  {
    id: "LOG-2026-010",
    timestamp: "2026-08-22T08:30:15Z",
    actorName: "Khalid Al-Qasimi",
    actorRole: "CaseManager",
    module: "Executive Directives",
    actionType: "REJECT",
    recordId: "DIR-2026-002",
    ipAddress: "10.0.4.22",
    userAgent: "Edge 127 / Windows 11",
    status: "Success",
    fieldName: "verificationStatus",
    oldValue: "Pending",
    newValue: "Rejected"
  }
];

function AuditLogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL State Synchronizers
  const query = searchParams.get("query") || "";
  const filterModule = searchParams.get("module") || "All";
  const filterAction = searchParams.get("action") || "All";
  const filterStatus = searchParams.get("status") || "All";
  const dateFilter = searchParams.get("dateFilter") || "Last Month";
  const customStart = searchParams.get("start") || "2026-08-01";
  const customEnd = searchParams.get("end") || "2026-08-27";

  // Modal inspection target
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Update URL Search Parameters helper
  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/admin/audit?${params.toString()}`);
    setCurrentPage(1);
  };

  const handleDateChange = (type: "start" | "end", val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, val);
    router.push(`/admin/audit?${params.toString()}`);
    setCurrentPage(1);
  };

  // Date filter comparison helper
  const matchesDate = (timestamp: string) => {
    const datePart = timestamp.split("T")[0];
    if (!datePart) return false;
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

  // Filter logs list based on active options
  const filteredLogs = MOCK_AUDIT_LOGS.filter(log => {
    // 1. Text searches
    if (query) {
      const lower = query.toLowerCase();
      const matchesText =
        log.actorName.toLowerCase().includes(lower) ||
        log.recordId.toLowerCase().includes(lower) ||
        log.ipAddress.toLowerCase().includes(lower);
      if (!matchesText) return false;
    }
    // 2. Dropdown module filter
    if (filterModule !== "All" && log.module !== filterModule) return false;
    // 3. Dropdown action type filter
    if (filterAction !== "All" && log.actionType !== filterAction) return false;
    // 4. Dropdown status filter
    if (filterStatus !== "All" && log.status !== filterStatus) return false;
    // 5. Date filter
    if (!matchesDate(log.timestamp)) return false;

    return true;
  });

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Simulated CSV Export Helper
  const handleExportCSV = () => {
    const headers = ["Timestamp", "Actor", "Role", "Module", "Action", "Record ID", "IP Address", "Status", "Field Name", "Old Value", "New Value"];
    const csvRows = [headers.join(",")];

    filteredLogs.forEach(log => {
      const row = [
        `"${log.timestamp}"`,
        `"${log.actorName}"`,
        `"${log.actorRole}"`,
        `"${log.module}"`,
        `"${log.actionType}"`,
        `"${log.recordId}"`,
        `"${log.ipAddress}"`,
        `"${log.status}"`,
        `"${log.fieldName || ''}"`,
        `"${(log.oldValue || '').replace(/"/g, '""')}"`,
        `"${(log.newValue || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SBA_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background text-foreground font-sans selection:bg-gold/30">
      <Sidebar activeItem="Audit Logs" />

      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        <PortalHeader
          title="System Audit Logs"
          subtitle="Immutable transaction ledger capturing administrative changes and authorization actions."
          icon={
            <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          actions={
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-xl text-xs font-bold text-gold uppercase tracking-wider hover:bg-gold hover:text-white transition-all cursor-pointer shadow-sm shadow-gold/5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV Ledger
            </button>
          }
        />

        {/* Filters Panel */}
        <div className="shrink-0 bg-card border-b border-border-warm p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search actor, record ID, IP..."
                value={query}
                onChange={(e) => updateParams("query", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border-warm rounded-xl bg-background/50 text-xs focus:outline-none focus:border-gold transition-colors text-foreground placeholder:text-foreground/30 font-medium"
              />
            </div>

            {/* Module Selector */}
            <div>
              <select
                value={filterModule}
                onChange={(e) => updateParams("module", e.target.value)}
                className="w-full px-3 py-2 border border-border-warm rounded-xl bg-background/50 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="All">All Modules</option>
                {SYSTEM_MODULES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Action Type Selector */}
            <div>
              <select
                value={filterAction}
                onChange={(e) => updateParams("action", e.target.value)}
                className="w-full px-3 py-2 border border-border-warm rounded-xl bg-background/50 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="All">All Actions</option>
                {ACTION_TYPES.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Date Preset Filter */}
            <div className="flex gap-2">
              <select
                value={dateFilter}
                onChange={(e) => updateParams("dateFilter", e.target.value)}
                className="flex-1 px-3 py-2 border border-border-warm rounded-xl bg-background/50 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="Last Week">Last Week</option>
                <option value="Last Month">Last Month</option>
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="Date Range">Date Range</option>
              </select>
              {dateFilter === "Date Range" && (
                <div className="flex items-center gap-1 animate-in fade-in duration-200">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => handleDateChange("start", e.target.value)}
                    className="px-2 py-1.5 rounded-xl border border-border-warm bg-background/50 text-[10px] font-bold focus:outline-none focus:border-gold"
                  />
                  <span className="text-[10px] text-foreground/40 font-bold uppercase">to</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => handleDateChange("end", e.target.value)}
                    className="px-2 py-1.5 rounded-xl border border-border-warm bg-background/50 text-[10px] font-bold focus:outline-none focus:border-gold"
                  />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-card border border-border-warm rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border-warm bg-foreground/[0.01] text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">Action Type</th>
                    <th className="px-4 py-3">Record ID</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-warm/60">
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-foreground/40 font-medium">
                        No transactions match the selected logs filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log, i) => (
                      <tr key={log.id} className="hover:bg-foreground/[0.015] transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground/80">
                          {new Date(log.timestamp).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          })}
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-foreground/80">{log.actorName}</p>
                          <span className="text-[9px] uppercase tracking-wider font-bold text-foreground/40">{log.actorRole}</span>
                        </td>
                        <td className="px-4 py-4 font-medium text-foreground/75">{log.module}</td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-0.5 rounded border text-[9px] font-bold bg-foreground/5 border-border-warm text-foreground/70">
                            {log.actionType}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-black text-gold">{log.recordId}</td>
                        <td className="px-4 py-4 font-medium text-foreground/60">{log.ipAddress}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${
                            log.status === "Success"
                              ? "text-green-600 bg-green-50 border-green-200"
                              : "text-red-600 bg-red-50 border-red-200"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedEntry(log)}
                            className="text-[10px] font-bold text-gold hover:underline uppercase tracking-wider cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Component inside Card */}
            <div className="border-t border-border-warm">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredLogs.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Inspect Transaction Drawer Panel */}
      <AnimatePresence>
        {selectedEntry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-[460px] bg-card border-l border-border-warm shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-border-warm flex justify-between items-center bg-foreground/[0.01]">
                <div>
                  <span className="text-[9px] font-black text-gold uppercase tracking-widest">{selectedEntry.id}</span>
                  <h3 className="text-sm font-bold text-foreground mt-0.5">Audit Transaction Detail</h3>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-1.5 hover:bg-foreground/5 rounded-full text-foreground/40 hover:text-foreground transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 bg-background/50 border border-border-warm rounded-2xl p-4">
                  <div>
                    <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest mb-0.5">Timestamp</p>
                    <p className="font-semibold text-foreground/80">
                      {new Date(selectedEntry.timestamp).toLocaleString("en-GB")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest mb-0.5">Actor Name</p>
                    <p className="font-semibold text-foreground/80">{selectedEntry.actorName}</p>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-foreground/40">{selectedEntry.actorRole}</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest mb-0.5">Module</p>
                    <p className="font-semibold text-foreground/80">{selectedEntry.module}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest mb-0.5">IP Address</p>
                    <p className="font-semibold text-foreground/80">{selectedEntry.ipAddress}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest mb-0.5">Browser Agent / Device</p>
                    <p className="font-semibold text-foreground/60">{selectedEntry.userAgent}</p>
                  </div>
                </div>

                {/* Diff Segment */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border-warm/60 pb-2">
                    <h4 className="font-bold text-foreground/80 uppercase tracking-wider text-[10px]">Data Modification State</h4>
                    {selectedEntry.fieldName && (
                      <span className="px-2 py-0.5 rounded bg-gold/10 border border-gold/20 text-[10px] font-mono text-gold font-bold">
                        {selectedEntry.fieldName}
                      </span>
                    )}
                  </div>

                  {selectedEntry.actionType === "CREATE" ? (
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest">Created Resource Value</p>
                      <pre className="p-3 bg-green-50/50 border border-green-200 text-green-800 rounded-xl overflow-x-auto font-mono text-[10px] whitespace-pre-wrap leading-relaxed">
                        {selectedEntry.newValue}
                      </pre>
                      <p className="text-[9px] text-foreground/40 italic">Old Value was kept blank (New Resource Created).</p>
                    </div>
                  ) : selectedEntry.actionType === "DELETE" ? (
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest">Deleted Resource Value</p>
                      <pre className="p-3 bg-red-50/50 border border-red-200 text-red-800 rounded-xl overflow-x-auto font-mono text-[10px] whitespace-pre-wrap leading-relaxed">
                        {selectedEntry.oldValue}
                      </pre>
                      <p className="text-[9px] text-foreground/40 italic">New Value was kept blank (Resource Removed).</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Old Value */}
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Previous Value (Before)</p>
                        {selectedEntry.oldValue ? (
                          <pre className="p-3 bg-background border border-border-warm rounded-xl overflow-x-auto font-mono text-[10px] whitespace-pre-wrap leading-relaxed text-foreground/75">
                            {selectedEntry.oldValue}
                          </pre>
                        ) : (
                          <p className="text-[10px] text-foreground/30 italic pl-1">No previous value (blank).</p>
                        )}
                      </div>

                      {/* Arrow indicator */}
                      <div className="flex justify-center text-foreground/30">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                        </svg>
                      </div>

                      {/* New Value */}
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">New Value (After)</p>
                        {selectedEntry.newValue ? (
                          <pre className="p-3 bg-gold-muted/10 border border-gold/20 rounded-xl overflow-x-auto font-mono text-[10px] whitespace-pre-wrap leading-relaxed text-gold font-medium">
                            {selectedEntry.newValue}
                          </pre>
                        ) : (
                          <p className="text-[10px] text-foreground/30 italic pl-1">No new value (blank).</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AuditLogPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background text-foreground">Loading Audit Logs Ledger...</div>}>
      <AuditLogContent />
    </Suspense>
  );
}
