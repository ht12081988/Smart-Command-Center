"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "../../../components/Sidebar";
import { PortalHeader } from "../../../components/PortalHeader";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";

interface AgentTool {
  name: string;
  description: string;
  enabled: boolean;
}

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  model: string;
  temperature: number;
  confidenceThreshold: number;
  systemPrompt: string;
  tools: AgentTool[];
  invocations: number;
  latencyMs: number;
  costEstimateUSD: number;
}

export default function AIAgentsConfigPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"prompt" | "tools">("prompt");

  // Redirect if not Administrator (or check permissions dynamically)
  useEffect(() => {
    if (user && user.role !== "Administrator") {
      router.push("/executive");
    }
  }, [user, router]);

  const [agents, setAgents] = useState<AgentConfig[]>([
    {
      id: "triage",
      name: "Triage Ingestion Agent",
      description: "Ingests call transcripts, social listening feeds, and web forms to auto-detect citizen problems, urgency levels, and draft core case info.",
      enabled: true,
      model: "gemini-1.5-flash",
      temperature: 0.1,
      confidenceThreshold: 0.85,
      systemPrompt: "You are the Triage Ingestion Agent for Sharjah Smart Command Center. Analyze the text feed. Extract: citizen name, core issue, urgency, classification. Reply ONLY in structured JSON.",
      tools: [
        { name: "search_citizen_database", description: "Search the global citizen registry using names or national IDs to find profile matches.", enabled: true },
        { name: "create_draft_case", description: "Instantly register a pending case draft inside Case Management.", enabled: true },
        { name: "flag_priority_alert", description: "Trigger visual red-alert warnings across admin dashboards for critical distress events.", enabled: true }
      ],
      invocations: 14205,
      latencyMs: 450,
      costEstimateUSD: 14.20
    },
    {
      id: "router",
      name: "SLA Routing Agent",
      description: "Analyzes case parameters to suggest the most appropriate External Entity and Liaison Officer, automatically computing SLA thresholds.",
      enabled: true,
      model: "gemini-1.5-pro",
      temperature: 0.2,
      confidenceThreshold: 0.90,
      systemPrompt: "You are the SLA Routing Agent. Match cases to target entities (Health Authority, Police, Housing). Recommend Liaison Officers based on historical assignment data.",
      tools: [
        { name: "get_external_entities", description: "Retrieve active workloads and capacity statuses of external Sharjah departments.", enabled: true },
        { name: "assign_case_to_entity", description: "Re-assign the target Case ID to a specific government entity and liaison officer.", enabled: true },
        { name: "send_external_notification", description: "Send automated referral emails and SMS alerts to the target department liaison officer.", enabled: false }
      ],
      invocations: 8931,
      latencyMs: 780,
      costEstimateUSD: 26.80
    },
    {
      id: "summarizer",
      name: "Executive Summarizer Agent",
      description: "Synthesizes multi-case reports, timelines, and resolution bottlenecks into concise high-level briefs for the Executive Command Center.",
      enabled: false,
      model: "gemini-1.5-pro",
      temperature: 0.4,
      confidenceThreshold: 0.70,
      systemPrompt: "You are the Executive Summarizer Agent. Review lists of related cases and timelines. Generate concise executive summaries highlighting resolutions and active bottlenecks.",
      tools: [
        { name: "get_historical_analytics", description: "Compile monthly analytics, SLA breach tallies, and average resolution times.", enabled: true }
      ],
      invocations: 1204,
      latencyMs: 1420,
      costEstimateUSD: 18.06
    },
    {
      id: "copilot",
      name: "Global Copilot Sidebar",
      description: "The interactive side-panel assistant that guides screeners, managers, and executives by answering dynamic context-aware queries.",
      enabled: true,
      model: "gemini-1.5-flash",
      temperature: 0.7,
      confidenceThreshold: 0.50,
      systemPrompt: "You are the Smart Command Center Global Copilot. Help the operator resolve their current tasks. Answer queries based on the provided screen context.",
      tools: [
        { name: "get_active_case_details", description: "Extract files, timeline comments, and communications for the case currently displayed on screen.", enabled: true },
        { name: "get_policy_directives", description: "Scan the knowledge base using semantic vector searches to fetch matching policy rules.", enabled: true },
        { name: "log_communication", description: "Write summary records of copilot text dialogues directly into case timeline logs.", enabled: true }
      ],
      invocations: 34092,
      latencyMs: 380,
      costEstimateUSD: 34.09
    }
  ]);

  const [selectedAgentId, setSelectedAgentId] = useState<string>("triage");
  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  const handleToggle = (id: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const handleUpdate = (field: keyof AgentConfig, value: any) => {
    setAgents(prev => prev.map(a => a.id === selectedAgentId ? { ...a, [field]: value } : a));
  };

  const handleToggleTool = (toolName: string) => {
    setAgents(prev => prev.map(a => a.id === selectedAgentId ? {
      ...a,
      tools: a.tools.map(t => t.name === toolName ? { ...t, enabled: !t.enabled } : t)
    } : a));
  };

  const handleSaveConfig = () => {
    alert("AI Agent Configurations saved successfully!");
  };

  if (!user || user.role !== "Administrator") {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background text-foreground font-sans selection:bg-gold/30">
      <Sidebar activeItem="AI Agent Settings" />

      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        <PortalHeader
          title="AI Agent Settings"
          subtitle="Configure, calibrate, and monitor active AI agents operating across command modules."
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
          {/* Agent Directory List */}
          <div className="w-full lg:w-[400px] flex flex-col gap-4 shrink-0">
            <h2 className="text-xs font-bold text-foreground/60 uppercase tracking-widest px-1">Active AI Agents</h2>
            <div className="flex flex-col gap-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col gap-2 ${
                    selectedAgentId === agent.id
                      ? "border-gold bg-gold/[0.03] shadow-md shadow-gold/5"
                      : "border-border-warm bg-card hover:border-foreground/20"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-bold text-sm transition-colors ${selectedAgentId === agent.id ? "text-gold" : "text-foreground"}`}>
                        {agent.name}
                      </h3>
                      <p className="text-[10px] text-foreground/50 font-mono mt-0.5">{agent.model}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={agent.enabled}
                        onChange={() => handleToggle(agent.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-foreground/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                    </label>
                  </div>
                  <p className="text-xs text-foreground/70 line-clamp-2 leading-relaxed">
                    {agent.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Invocations Card */}
            <div className="bg-card border border-border-warm rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Global AI Engine Usage</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/50 border border-border-warm rounded-xl p-3.5">
                  <span className="block text-[9px] text-foreground/45 uppercase tracking-wider font-semibold">Total Queries</span>
                  <span className="text-xl font-black mt-1 block">78,432</span>
                </div>
                <div className="bg-background/50 border border-border-warm rounded-xl p-3.5">
                  <span className="block text-[9px] text-foreground/45 uppercase tracking-wider font-semibold">Cost (MTD)</span>
                  <span className="text-xl font-black mt-1 block text-green-600">$93.15</span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration & Tuning Workspace */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-card border border-border-warm rounded-3xl p-6 lg:p-8 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-border-warm pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold uppercase tracking-wider">{activeAgent.name}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${activeAgent.enabled ? "bg-green-500/10 text-green-600" : "bg-foreground/10 text-foreground/50"}`}>
                      {activeAgent.enabled ? "Online" : "Offline"}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/60 mt-1">{activeAgent.description}</p>
                </div>
                <button
                  onClick={handleSaveConfig}
                  className="bg-gold hover:bg-gold-hover text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shrink-0"
                >
                  Save Configuration
                </button>
              </div>

              {/* Hyperparameters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Inference Model</label>
                  <select
                    value={activeAgent.model}
                    onChange={(e) => handleUpdate("model", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border-warm bg-background text-sm font-semibold focus:outline-none focus:border-gold"
                  >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    <option value="cohere-embed-v3">Cohere Multilingual v3</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Creativity (Temp)</label>
                    <span className="text-[10px] font-mono font-bold text-gold bg-gold/10 px-1.5 py-0.5 rounded">{activeAgent.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={activeAgent.temperature}
                    onChange={(e) => handleUpdate("temperature", parseFloat(e.target.value))}
                    className="w-full h-1 bg-border-warm rounded-lg appearance-none cursor-pointer accent-gold"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Confidence Limit</label>
                    <span className="text-[10px] font-mono font-bold text-gold bg-gold/10 px-1.5 py-0.5 rounded">{(activeAgent.confidenceThreshold * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="0.99"
                    step="0.01"
                    value={activeAgent.confidenceThreshold}
                    onChange={(e) => handleUpdate("confidenceThreshold", parseFloat(e.target.value))}
                    className="w-full h-1 bg-border-warm rounded-lg appearance-none cursor-pointer accent-gold"
                  />
                </div>
              </div>

              {/* Tabs Section for System Prompt and Tool Access */}
              <div className="flex flex-col gap-4">
                <div className="flex border-b border-border-warm gap-4">
                  <button
                    onClick={() => setActiveTab("prompt")}
                    className={`pb-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                      activeTab === "prompt"
                        ? "text-gold border-b-2 border-gold"
                        : "text-foreground/40 hover:text-foreground"
                    }`}
                  >
                    System Prompt
                  </button>
                  <button
                    onClick={() => setActiveTab("tools")}
                    className={`pb-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                      activeTab === "tools"
                        ? "text-gold border-b-2 border-gold"
                        : "text-foreground/40 hover:text-foreground"
                    }`}
                  >
                    Tool Calls
                  </button>
                </div>

                {activeTab === "prompt" ? (
                  <div className="flex flex-col gap-2 animate-in fade-in duration-200">
                    <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Agent Instructions</label>
                    <textarea
                      value={activeAgent.systemPrompt}
                      onChange={(e) => handleUpdate("systemPrompt", e.target.value)}
                      className="w-full min-h-[160px] p-4 rounded-2xl border border-border-warm bg-background text-sm font-mono focus:outline-none focus:border-gold resize-y leading-relaxed"
                      placeholder="Insert instructions for LLM orchestration..."
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                    <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Available Functions</label>
                    <div className="grid grid-cols-1 gap-3">
                      {activeAgent.tools.map((tool) => (
                        <div key={tool.name} className="flex items-start justify-between p-4 bg-background border border-border-warm rounded-2xl hover:border-gold/30 transition-all">
                          <div className="flex flex-col gap-1 pr-4">
                            <span className="font-mono text-xs font-bold text-gold">{tool.name}()</span>
                            <span className="text-xs text-foreground/60 leading-relaxed">{tool.description}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                            <input
                              type="checkbox"
                              checked={tool.enabled}
                              onChange={() => handleToggleTool(tool.name)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-foreground/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Agent Performance Analytics */}
              <div className="border-t border-border-warm pt-6">
                <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-widest mb-4">Real-Time Performance Dashboard</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background border border-border-warm rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] text-foreground/45 uppercase tracking-wider font-semibold">Total Calls</span>
                      <span className="text-lg font-black mt-1 block">{activeAgent.invocations.toLocaleString()}</span>
                    </div>
                    <div className="p-2 bg-foreground/[0.02] rounded-xl text-foreground/60">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  </div>

                  <div className="bg-background border border-border-warm rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] text-foreground/45 uppercase tracking-wider font-semibold">Average Latency</span>
                      <span className="text-lg font-black mt-1 block">{activeAgent.latencyMs} ms</span>
                    </div>
                    <div className="p-2 bg-foreground/[0.02] rounded-xl text-foreground/60">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  </div>

                  <div className="bg-background border border-border-warm rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] text-foreground/45 uppercase tracking-wider font-semibold">Est. Cost (MTD)</span>
                      <span className="text-lg font-black mt-1 block text-green-600">${activeAgent.costEstimateUSD.toFixed(2)}</span>
                    </div>
                    <div className="p-2 bg-foreground/[0.02] rounded-xl text-foreground/60">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
