"use client";

import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
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
    } else if (user.role === "SBAExecutive") {
      router.push("/executive");
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
      <main className="flex-1 p-8 flex flex-col justify-center items-center text-center gap-4">
        <div className="w-full max-w-xl bg-card border border-border-warm rounded-2xl p-10 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gold-muted border border-gold/20 flex items-center justify-center text-gold font-bold text-xl mx-auto mb-6">
            ✓
          </div>
          <h2 className="text-xl font-bold text-foreground uppercase tracking-tight mb-2">
            Welcome to the Command Center
          </h2>
          <p className="text-sm text-foreground/75 max-w-md mx-auto mb-6">
            You are logged in as <span className="font-semibold text-primary-text-gold">{user.fullName}</span> with the role of <b>{user.role}</b> ({user.department}).
          </p>
          <p className="text-xs text-foreground/50 uppercase tracking-wider leading-relaxed">
            Case lifecycle screens and live studio modules will display here once they are initialized.
          </p>
        </div>
      </main>

    </div>
  );
}
