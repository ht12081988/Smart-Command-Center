"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function HeroVisual() {
  return (
    <div className="relative h-full min-h-[320px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(181,142,88,0.22),_transparent_32%),linear-gradient(135deg,_#12110f_0%,_#1b1815_52%,_#0e0d0b_100%)]">
      <div className="absolute inset-0 opacity-35">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>

      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-active-cyan/10 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-10 text-white">
        <div className="max-w-lg space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold-muted px-3 py-1 text-[10px] font-bold uppercase tracking-[0.35em] text-gold">
            SBA Smart Portal
          </span>
          <div className="space-y-3">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-[0.95]">
              Executive command
              <span className="block text-gold">for humanitarian action.</span>
            </h2>
            <p className="max-w-md text-sm lg:text-base text-white/72 leading-relaxed">
              A unified intelligence workspace for broadcasts, directives, cases, and leadership oversight across the Sharjah command ecosystem.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-xl">
          <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">Live visibility</p>
            <p className="mt-2 text-lg font-bold">Cases, directives, entities</p>
            <p className="mt-1 text-xs text-white/55">Monitor outcomes and response flow in one place.</p>
          </div>
          <div className="rounded-2xl border border-gold/20 bg-gold/10 p-4 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold/80">Role aware</p>
            <p className="mt-2 text-lg font-bold text-white">Permission-driven access</p>
            <p className="mt-1 text-xs text-white/65">Users see only what their role is approved to view.</p>
          </div>
        </div>

        <div className="relative mt-6 h-[240px]">
          <svg viewBox="0 0 800 420" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="goldGlow" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(181,142,88,0.9)" />
                <stop offset="100%" stopColor="rgba(181,142,88,0.15)" />
              </linearGradient>
              <linearGradient id="panelGlow" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
              </linearGradient>
            </defs>

            <path d="M85 290 C180 210, 295 240, 375 175 C460 108, 615 88, 720 132" fill="none" stroke="url(#goldGlow)" strokeWidth="3" strokeDasharray="8 10" opacity="0.8" />
            <path d="M95 325 C205 260, 310 280, 400 220 C500 155, 615 150, 710 190" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="2" strokeDasharray="3 11" />

            <g transform="translate(150 92)">
              <rect x="0" y="0" width="190" height="118" rx="20" fill="url(#panelGlow)" stroke="rgba(255,255,255,0.12)" />
              <rect x="18" y="18" width="70" height="10" rx="5" fill="rgba(181,142,88,0.85)" />
              <rect x="18" y="40" width="128" height="9" rx="4.5" fill="rgba(255,255,255,0.35)" />
              <rect x="18" y="58" width="96" height="9" rx="4.5" fill="rgba(255,255,255,0.2)" />
              <circle cx="154" cy="56" r="24" fill="rgba(181,142,88,0.16)" stroke="rgba(181,142,88,0.55)" />
              <path d="M146 56l5 5 10-12" fill="none" stroke="#F4E7D0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            <g transform="translate(442 56)">
              <rect x="0" y="0" width="218" height="146" rx="22" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)" />
              <rect x="18" y="18" width="96" height="12" rx="6" fill="rgba(255,255,255,0.28)" />
              <rect x="18" y="46" width="172" height="12" rx="6" fill="rgba(181,142,88,0.55)" />
              <rect x="18" y="68" width="126" height="12" rx="6" fill="rgba(255,255,255,0.18)" />
              <rect x="18" y="92" width="152" height="12" rx="6" fill="rgba(255,255,255,0.14)" />
              <rect x="18" y="118" width="82" height="10" rx="5" fill="rgba(0,210,196,0.38)" />
            </g>

            <g transform="translate(338 224)">
              <circle cx="64" cy="64" r="64" fill="rgba(181,142,88,0.12)" stroke="rgba(181,142,88,0.36)" strokeWidth="2" />
              <circle cx="64" cy="64" r="38" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" />
              <path d="M64 28v72M28 64h72" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
              <circle cx="64" cy="64" r="6" fill="#F4E7D0" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const success = login(username, password);
    if (!success) {
      setError("Invalid username or password.");
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[60%_40%]">
        <div className="hidden lg:block">
          <HeroVisual />
        </div>

        <div className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-10">
          <div className="w-full max-w-[480px]">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold-muted border border-gold/20 text-gold font-bold text-lg">
                SBA
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">
                  Smart Command Center
                </h1>
                <p className="text-[11px] font-medium text-foreground/50 tracking-wider uppercase mt-0.5">
                  Humanitarian Case Management
                </p>
              </div>
            </div>

            <div className="bg-card rounded-3xl p-8 sm:p-10 shadow-[0_18px_60px_rgba(20,19,17,0.08)]">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold-muted border border-gold/20 text-gold font-bold text-xl mb-4">
                  SBA
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
                  Smart Command Center
                </h1>
                <p className="text-xs font-medium text-foreground/50 tracking-wider uppercase mt-1">
                  Humanitarian Case Management
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="font-semibold">Error:</span> {error}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin, host, officer"
                    className="px-4 py-3 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="px-4 py-3 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gold hover:bg-gold-hover text-white py-3 rounded-xl font-semibold text-sm tracking-wide uppercase transition-colors shadow-md shadow-gold/10 mt-2"
                >
                  Sign In
                </button>
              </form>

              <div className="mt-8 pt-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                  <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-wider">Demo Access Accounts</span>
                </div>
                <div className="grid grid-cols-1 gap-y-2 text-[11px] text-foreground/60">
                  <div>
                    <span className="font-semibold block text-foreground/80">Administrator</span>
                    <span>admin / admin123</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
