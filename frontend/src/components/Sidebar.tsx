"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  activeItem?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Sidebar expand/collapse state (persist in localStorage if client side)
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("scc_sidebar_collapsed");
    if (stored === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("scc_sidebar_collapsed", String(nextState));
  };

  if (!user) return null;

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  // System navigation items mapped to our scope modules
  const navItems = [
    {
      name: "Executive Command Center",
      href: "/executive",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      name: "Smart Search",
      href: "/executive/search",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      name: "Live Studio Feed",
      href: user.role === "Presenter" ? "/studio/host" : "/studio/producer",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    },
    {
      name: "Call Screener Desk",
      href: "/screener",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
    },
    {
      name: "Broadcast Archives",
      href: "/studio/archives",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      name: "Citizen Profiles",
      href: "/citizens",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: "Case Management",
      href: "/cases",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      name: "Resolution & Follow-up",
      href: "/slas",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: "Executive Directives",
      href: "/directives",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.242.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.176 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 12.08c-.783-.57-.384-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      name: "Directory of Entities",
      href: "/admin/entities",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      name: "User Access Directory",
      href: "/admin/users",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      name: "Roles & Permissions",
      href: "/admin/roles",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      name: "Audit Logs",
      href: "/admin/audit",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  // Role permissions module access definition
  const ROLE_PERMISSIONS: Record<string, string[]> = {
    Administrator: [
      "Executive Command Center",
      "Smart Search",
      "Live Studio Feed",
      "Call Screener Desk",
      "Broadcast Archives",
      "Citizen Profiles",
      "Case Management",
      "Resolution & Follow-up",
      "Executive Directives",
      "Directory of Entities",
      "User Access Directory",
      "Roles & Permissions",
      "Audit Logs"
    ],
    SBAExecutive: [
      "Executive Command Center",
      "Smart Search",
      "Broadcast Archives",
      "Resolution & Follow-up",
      "Executive Directives"
    ],
    Presenter: [
      "Live Studio Feed",
      "Broadcast Archives",
      "Citizen Profiles"
    ],
    Producer: [
      "Live Studio Feed",
      "Call Screener Desk",
      "Broadcast Archives",
      "Citizen Profiles",
      "Case Management",
      "Executive Directives"
    ],
    CaseManager: [
      "Citizen Profiles",
      "Case Management",
      "Resolution & Follow-up",
      "Executive Directives"
    ],
    ExternalLiaison: [
      "Resolution & Follow-up"
    ]
  };

  const permittedItems = navItems.filter((item) => {
    const allowed = ROLE_PERMISSIONS[user.role] || [];
    return allowed.includes(item.name);
  });

  return (
    <aside
      className={`bg-sidebar-bg flex h-screen flex-col overflow-hidden border-r border-sidebar-bg/50 shrink-0 text-sidebar-fg transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[76px]" : "w-[260px]"
      }`}
    >
      <div className="shrink-0">
        {/* Brand Logo & Collapse Toggle */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between min-h-[73px]">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="w-8 h-8 rounded-full bg-gold-muted border border-gold/20 flex items-center justify-center text-gold font-bold text-xs shrink-0">
              SBA
            </span>
            {!isCollapsed && (
              <div className="animate-in fade-in duration-200">
                <span className="block font-bold text-[12px] text-white tracking-wide uppercase leading-tight whitespace-nowrap">
                  SMART COMMAND
                </span>
                <span className="text-[9px] text-sidebar-fg/60 tracking-wider uppercase font-medium whitespace-nowrap">
                  Sharjah Broadcasting Authority
                </span>
              </div>
            )}
          </div>
          
          {/* Collapse toggle button arrow */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded hover:bg-white/5 hover:text-white transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-1 text-[13px] font-medium">
          {!isCollapsed && (
            <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-sidebar-fg/40 mb-1 animate-in fade-in duration-200">
              Main Modules
            </div>
          )}
          
          {permittedItems.map((item, idx) => {
            const isActive = activeItem ? activeItem === item.name : pathname === item.href;
            return (
              <a
                key={idx}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive
                    ? "text-gold bg-gold-muted font-semibold"
                    : "hover:text-white hover:bg-white/5"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                {isActive && (
                  <span className="absolute left-[-12px] top-0 bottom-0 w-[4px] bg-active-cyan rounded-r"></span>
                )}
                {item.icon}
                {!isCollapsed && <span className="animate-in fade-in duration-200">{item.name}</span>}
              </a>
            );
          })}
        </nav>
      </div>

      {/* User Profile */}
      <div className="shrink-0 flex flex-col border-t border-white/5 bg-black/10">
        {/* User Card info block */}
        <div className={`p-4 flex items-center justify-between ${isCollapsed ? "flex-col gap-3 p-3" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-white text-xs shrink-0" title={user.fullName}>
              {initials}
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in duration-200">
                <span className="block text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                  {user.fullName}
                </span>
                <span className="text-[9px] text-sidebar-fg/60 font-medium uppercase tracking-wider mt-0.5 block">
                  {user.role.replace("Manager", " Mgr").replace("Liaison", " Lsn")}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            title="Sign Out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

      </div>
    </aside>
  );
};
