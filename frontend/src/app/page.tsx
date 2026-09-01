"use client";

import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "../components/Sidebar";

export default function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, redirect to login page
    if (!user) {
      router.push("/login");
    } else if (user.role === "Administrator") {
      // Admins go to the user management console
      router.push("/admin/users");
    } else {
      router.push("/executive/ingestion");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-foreground/50 text-sm uppercase tracking-widest font-semibold animate-pulse">
          Redirecting to Login...
        </span>
      </div>
    );
  }

  // Fallback layout for other roles (Presenter, Producer, CaseManager, ExternalLiaison)
  return (
    <div className="min-h-screen flex bg-background">
      
      {/* Sidebar navigation */}
      <Sidebar activeItem="Executive Command Center" />

      {/* Main Panel Content */}
      <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          
          {/* Welcome Info Box */}
          <div className="flex-1 bg-card border border-border-warm rounded-2xl p-6 shadow-sm flex flex-col justify-center text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-gold-muted border border-gold/20 flex items-center justify-center text-gold font-bold text-lg mb-4 mx-auto md:mx-0">
              ✓
            </div>
            <h2 className="text-lg font-bold text-foreground uppercase tracking-tight mb-1.5">
              Welcome to the Smart Command Center
            </h2>
            <p className="text-xs text-foreground/75 mb-4">
              You are logged in as <span className="font-semibold text-primary-text-gold">{user.fullName}</span> with the role of <b>{user.role}</b> ({user.department}).
            </p>
            <p className="text-[11px] text-foreground/50 uppercase tracking-wider leading-relaxed">
              Use the sidebar to navigate through live studio ingestion feeds, active case registries, user directories, and template managers.
            </p>
          </div>

          {/* Quick Demo Sandbox Card */}
          <div className="flex-[1.5] bg-card border border-border-warm rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Demo Sandbox
              </h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                Run an interactive client demonstration of the end-to-end command center pipeline:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-background border border-border-warm rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-black text-red-500 mb-1 block">🔴 Live Feed Ingest</span>
                    <span className="text-xs font-bold text-foreground block mb-1">Direct Line Show</span>
                    <p className="text-[10px] text-foreground/50 leading-relaxed mb-3">AI will listen, auto-screen, and suggest a case directive draft.</p>
                  </div>
                  <Link href="/studio/producer?demo=true" className="bg-gold hover:bg-gold-hover text-white text-center py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm transition-colors block">
                    Launch Ingest
                  </Link>
                </div>

                <div className="bg-background border border-border-warm rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-black text-indigo-500 mb-1 block">📞 Hotline Screener</span>
                    <span className="text-xs font-bold text-foreground block mb-1">Active Citizen Caller</span>
                    <p className="text-[10px] text-foreground/50 leading-relaxed mb-3">Screen callers, match profiles, and review task checklists.</p>
                  </div>
                  <Link href="/studio/producer?demo_hotline=true" className="bg-foreground text-background hover:bg-gold hover:text-white text-center py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm transition-colors block">
                    Launch Hotline
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
