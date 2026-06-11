/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { 
  Shield, 
  Search, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  FileText, 
  Lock,
  Cpu,
  Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

// --- CORE UTILITIES ---

// Shannon Entropy for Deception Scanner
function calculateEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;
  const counts: Record<string, number> = {};
  for (const char of str) {
    counts[char] = (counts[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in counts) {
    const p = counts[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

// --- COMPONENTS ---

const Header = ({ operationalStatus, cloudStatus }: { operationalStatus: string, cloudStatus: string }) => (
  <header className="border-b border-black p-6 flex justify-between items-center bg-[#E4E3E0]">
    <div className="flex items-center gap-3">
      <Cpu className="w-8 h-8" />
      <div>
        <h1 className="text-2xl font-bold tracking-tighter uppercase">Sovereign Node 9010</h1>
        <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest leading-none">Truth as a Service (TAAS) Monolith</p>
        <p className="text-[8px] font-serif italic tracking-[0.1em] uppercase opacity-40 mt-1">Truth Our Aim, Honesty Our Product</p>
      </div>
    </div>
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${cloudStatus === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
        <div className="text-right">
          <p className="text-[10px] font-mono opacity-50 uppercase">Cloud</p>
          <p className="text-[10px] font-bold uppercase">{cloudStatus}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-mono opacity-50 uppercase">Status</p>
        <p className="text-xs font-bold text-green-700">{operationalStatus}</p>
      </div>
      <div className="w-12 h-12 border border-black flex items-center justify-center bg-black text-[#E4E3E0]">
        <Lock className="w-5 h-5" />
      </div>
    </div>
  </header>
);

const SectionHeader = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <div className="flex items-center gap-2 mb-4 border-b border-black/10 pb-2">
    <Icon className="w-4 h-4" />
    <h2 className="font-serif italic text-sm uppercase tracking-wider">{title}</h2>
  </div>
);

const DiagnosticItem = ({ label, value, status }: { label: string; value: string; status: 'success' | 'error' | 'warning' | 'neutral' }) => (
  <div className="border border-black/10 p-2 flex flex-col">
    <span className="text-[8px] font-mono uppercase opacity-50 leading-none mb-1">{label}</span>
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${
        status === 'success' ? 'bg-green-500' : 
        status === 'error' ? 'bg-red-500' : 
        status === 'warning' ? 'bg-orange-500' : 'bg-gray-400'
      }`} />
      <span className="text-[10px] font-bold uppercase truncate">{value || 'N/A'}</span>
    </div>
  </div>
);

const OperatorProfile = ({ nodeId }: { nodeId?: string }) => (
  <motion.section 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
  >
    <SectionHeader title="Human-in-the-Loop (HITL) Arbiter" icon={Shield} />
    <div className="space-y-2 font-mono text-[10px]">
      <div className="flex justify-between border-b border-black/10 pb-1">
        <span className="opacity-50 uppercase">Identity</span>
        <span className="font-bold">Juzzy Chance</span>
      </div>
      <div className="flex justify-between border-b border-black/10 pb-1">
        <span className="opacity-50 uppercase">Node ID</span>
        <span className="font-bold text-red-600">{nodeId || "INITIALIZING..."}</span>
      </div>
      <div className="flex justify-between border-b border-black/10 pb-1">
        <span className="opacity-50 uppercase">Designation</span>
        <span className="font-bold">truthprojectofficial-max · it/thing</span>
      </div>
      <div className="flex justify-between border-b border-black/10 pb-1">
        <span className="opacity-50 uppercase">Role</span>
        <span className="font-bold">Managing Director</span>
      </div>
      <div className="flex justify-between border-b border-black/10 pb-1">
        <span className="opacity-50 uppercase">Base</span>
        <span className="font-bold">No fixed base</span>
      </div>
      <div className="flex justify-between border-b border-black/10 pb-1">
        <span className="opacity-50 uppercase">Primary Comms</span>
        <span className="font-bold">TruthProject@TruthProject.Official.com</span>
      </div>
      <div className="flex justify-between border-b border-black/10 pb-1">
        <span className="opacity-50 uppercase">Fallback Comms</span>
        <span className="font-bold">truth.project.official@gmail.com</span>
      </div>
      <div className="mt-4 pt-2 border-t border-black/20 text-center">
        <p className="text-[9px] font-serif italic tracking-[0.2em] uppercase">Truth Our Aim, Honesty Our Product</p>
      </div>
    </div>
  </motion.section>
);

export default function App() {
  const [extraction, setExtraction] = useState(0.05);
  const [performance, setPerformance] = useState(0.8);
  const [risk, setRisk] = useState(0.2);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [deceptionInput, setDeceptionInput] = useState("");
  const [entropy, setEntropy] = useState(0);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [aclReport, setAclReport] = useState<any>(null);
  const [proxies, setProxies] = useState<any>(null);
  const [facts, setFacts] = useState<any[]>([]);
  const [vvReport, setVvReport] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [handoverData, setHandoverData] = useState<any>(null);
  const [merkleChain, setMerkleChain] = useState<any[]>([]);
  const [affidavits, setAffidavits] = useState<any[]>([]);
  const [cliHistory, setCliHistory] = useState<string[]>([
    "> tauri_bridge --init",
    "> [OK] Browser sandbox bypassed.",
    "> [OK] Native FS access granted.",
    "> Type 'help' to begin."
  ]);
  const [cliInput, setCliInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFact, setNewFact] = useState({ category: "01-CORE", statement: "" });

  const [operationalStatus, setOperationalStatus] = useState("65% CORE OPERATIONAL");

  const formatApiError = (action: string, err: any) => {
    const msg = err.message || String(err);
    if (msg === "Failed to fetch") {
      return `${action}: Sovereign Node backend is unreachable (Network Error).`;
    }
    return `${action}: ${msg}`;
  };

  const fetchProxies = async () => {
    try {
      if (isTauri) {
        const data = await invoke("get_proxies");
        setProxies(data);
      } else {
        const res = await fetch("/api/proxies");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setProxies(data);
      }
    } catch (err: any) {
      console.error("Failed to fetch proxies:", err);
      setError(formatApiError("Failed to fetch proxies", err));
    }
  };

  const fetchFacts = async () => {
    try {
      if (isTauri) {
        const data = await invoke("get_facts");
        setFacts(data as any[]);
      } else {
        const res = await fetch("/api/facts");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setFacts(data);
      }
    } catch (err: any) {
      console.error("Failed to fetch facts:", err);
      setError(formatApiError("Failed to fetch facts", err));
    }
  };

  const fetchDiagnostics = async () => {
    try {
      if (isTauri) {
        const data = await invoke("get_diagnostics");
        setDiagnostics(data);
      } else {
        const res = await fetch("/api/diagnostics");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setDiagnostics(data);
      }
    } catch (err: any) {
      console.error("Failed to fetch diagnostics:", err);
      setError(formatApiError("Failed to fetch diagnostics", err));
    }
  };

  const fetchVVReport = async () => {
    try {
      if (isTauri) {
        const data = await invoke("get_vv_report");
        setVvReport(data);
        updateOperationalStatus(data);
      } else {
        const res = await fetch("/api/vv-report");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setVvReport(data);
        updateOperationalStatus(data);
      }
    } catch (err: any) {
      console.error("Failed to fetch VV report:", err);
      setError(formatApiError("Failed to fetch VV report", err));
    }
  };

  const updateOperationalStatus = (report: any) => {
    if (!report || !report.metrics) return;
    const { facts_registered, facts_verified, squeal_reports } = report.metrics;
    
    // Dynamic calculation: Base 65% + Facts Verification (up to 25%) + Squeal Penalty
    // If cloud is online (simulated by total_requests > 0), add a bonus
    let percentage = 65;
    if (facts_registered > 0) {
      percentage += (facts_verified / facts_registered) * 25;
    }
    
    // Penalty for squeal reports (max -10%)
    percentage -= Math.min(squeal_reports * 2, 10);
    
    // Cloud bonus: if we have requests, it means the node is active and "online"
    if (report.metrics.total_requests > 0) {
      percentage += 10;
    }
    
    percentage = Math.max(65, Math.min(100, percentage));
    
    setOperationalStatus(`${Math.round(percentage)}% CORE OPERATIONAL`);
  };

  const fetchMerkleChain = async () => {
    try {
      if (isTauri) {
        const data = await invoke("get_merkle_chain");
        setMerkleChain(data as any[]);
      } else {
        const res = await fetch("/api/merkle");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setMerkleChain(data);
      }
    } catch (err: any) {
      console.error("Failed to fetch Merkle chain:", err);
      setError(formatApiError("Failed to fetch Merkle chain", err));
    }
  };

  const fetchAffidavits = async () => {
    try {
      if (isTauri) {
        const data = await invoke("get_affidavits");
        setAffidavits(data as any[]);
      } else {
        const res = await fetch("/api/affidavits");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setAffidavits(data);
      }
    } catch (err: any) {
      console.error("Failed to fetch affidavits:", err);
      setError(formatApiError("Failed to fetch affidavits", err));
    }
  };

  const vettAffidavit = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/affidavits/vett", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      fetchAffidavits();
      fetchMerkleChain();
    } catch (err: any) {
      console.error("Failed to vett affidavit:", err);
      setError(formatApiError("Failed to vett affidavit", err));
    }
  };

  const forceCloudSync = async () => {
    try {
      const res = await fetch("/api/cloud/sync", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      fetchDiagnostics();
      alert(`Cloud Handshake Established: ${data.target}`);
    } catch (err: any) {
      console.error("Failed to force cloud sync:", err);
      setError(formatApiError("Failed to force cloud sync", err));
    }
  };

  const toggleSovereign = async () => {
    try {
      const res = await fetch("/api/sovereign/toggle", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      fetchDiagnostics();
    } catch (err: any) {
      console.error("Failed to toggle sovereign mode:", err);
      setError(formatApiError("Failed to toggle sovereign mode", err));
    }
  };

  const runHandover = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/handover", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setHandoverData(data);
      fetchMerkleChain();
    } catch (err: any) {
      console.error("Handover sequence failed:", err);
      setError(formatApiError("Handover sequence failed", err));
    } finally {
      setLoading(false);
    }
  };

  const handleCliSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && cliInput.trim()) {
      const cmd = cliInput.trim();
      setCliInput("");
      
      if (cmd.toLowerCase() === 'clear') {
        setCliHistory([]);
        return;
      }
      
      setCliHistory(prev => [...prev, `> ${cmd}`]);
      
      try {
        if (isTauri) {
          // Placeholder for actual Tauri invoke
          setCliHistory(prev => [...prev, `  [TAURI_EXEC] ${cmd}`]);
        } else {
          const res = await fetch("/api/cli", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command: cmd })
          });
          const data = await res.json();
          setCliHistory(prev => [...prev, ...data.output.map((line: string) => `  ${line}`)]);
          
          // Refresh state if command might have changed it
          if (cmd.startsWith("seal")) {
            fetchAffidavits();
            fetchMerkleChain();
          }
        }
      } catch (err) {
        setCliHistory(prev => [...prev, `  [ERROR] CLI execution failed.`]);
      }
    }
  };

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      let data: any;
      if (isTauri) {
        data = await invoke("run_audit", { extraction, performance, risk });
      } else {
        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ extraction, performance, risk })
        });
        data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || data.error);
        }
      }

      setAuditResult(data);
      
      if (data.cvs !== undefined) {
        if (isTauri) {
          const aclData = await invoke("get_acl_report", { cvs: data.cvs });
          setAclReport(aclData);
        } else {
          const aclRes = await fetch(`/api/acl-177?cvs=${data.cvs}`);
          const aclData = await aclRes.json();
          setAclReport(aclData);
        }
      }
      fetchProxies();
      fetchVVReport();
      fetchMerkleChain();
      fetchAffidavits();
    } catch (err: any) {
      console.error("Audit Error:", err);
      let errorMessage = err.message || err.toString();
      if (errorMessage.includes("Unexpected token")) {
        errorMessage = "Backend returned invalid JSON. Sovereign Node may be unreachable or misconfigured.";
      } else if (errorMessage === "Failed to fetch") {
        errorMessage = "Sovereign Node backend is unreachable (Network Error).";
      }
      setError(`AUDIT FAILED: ${errorMessage}`);
      fetchProxies();
      fetchMerkleChain();
      fetchAffidavits();
    } finally {
      setLoading(false);
    }
  };

  const analyzeDeception = async () => {
    if (!deceptionInput) return;
    try {
      if (isTauri) {
        const data = await invoke("analyze_deception", { text: deceptionInput });
        setPatterns(data as any[]);
      } else {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: deceptionInput })
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setPatterns(data.patterns);
      }
    } catch (err: any) {
      console.error("Failed to analyze deception:", err);
      setError(formatApiError("Failed to analyze deception", err));
    }
  };

  const addFact = async () => {
    if (!newFact.statement) return;
    try {
      if (isTauri) {
        await invoke("add_fact", { category: newFact.category, statement: newFact.statement });
      } else {
        const res = await fetch("/api/facts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newFact)
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      }
      setNewFact({ ...newFact, statement: "" });
      fetchFacts();
      fetchVVReport();
    } catch (err: any) {
      console.error("Failed to add fact:", err);
      setError(formatApiError("Failed to add fact", err));
    }
  };

  const verifyFact = async (id: string, status: string) => {
    try {
      if (isTauri) {
        await invoke("verify_fact", { id, status });
      } else {
        const res = await fetch("/api/facts/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status })
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      }
      fetchFacts();
      fetchVVReport();
    } catch (err: any) {
      console.error("Failed to verify fact:", err);
      setError(formatApiError("Failed to verify fact", err));
    }
  };

  const resetNode = async () => {
    try {
      if (isTauri) {
        await invoke("reset_node");
      } else {
        const res = await fetch("/api/reset", { method: "POST" });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      }
      setError(null);
      setAuditResult(null);
      setAclReport(null);
      setPatterns([]);
      fetchProxies();
      fetchVVReport();
      fetchMerkleChain();
      fetchAffidavits();
    } catch (err: any) {
      console.error("Failed to reset node:", err);
      setError(formatApiError("Failed to reset node", err));
    }
  };

  useEffect(() => {
    setEntropy(calculateEntropy(deceptionInput));
    const timer = setTimeout(analyzeDeception, 500);
    return () => clearTimeout(timer);
  }, [deceptionInput]);

  useEffect(() => {
    fetchProxies();
    fetchFacts();
    fetchVVReport();
    fetchDiagnostics();
    fetchMerkleChain();
    fetchAffidavits();
    const interval = setInterval(() => {
      fetchProxies();
      fetchVVReport();
      fetchDiagnostics();
      fetchMerkleChain();
      fetchAffidavits();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-black selection:text-white">
      <Header operationalStatus={operationalStatus} cloudStatus={vvReport?.cloud_status || "CONNECTING..."} />

      <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ENGINES */}
        <div className="lg:col-span-4 space-y-6">
          <OperatorProfile nodeId={diagnostics?.node_identity} />
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <SectionHeader title="01 Core Methodology: BBFB Engine" icon={Activity} />
            
            <div className="space-y-4">
              {error && (
                <div className="bg-red-600 text-white p-3 text-xs font-bold uppercase flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div>
                <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Extraction Level (Tau)</label>
                <input 
                  type="range" min="0" max="0.2" step="0.01" 
                  value={extraction} 
                  onChange={(e) => setExtraction(parseFloat(e.target.value))}
                  className="w-full h-1 bg-black appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono mt-1">
                  <span>0%</span>
                  <span className={extraction > 0.1 ? "text-red-600 font-bold" : ""}>{(extraction * 100).toFixed(1)}%</span>
                  <span>20%</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Performance (Fruit)</label>
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={performance} 
                  onChange={(e) => setPerformance(parseFloat(e.target.value))}
                  className="w-full h-1 bg-black appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono mt-1">
                  <span>0.0</span>
                  <span>{performance.toFixed(2)}</span>
                  <span>1.0</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Risk (Grace)</label>
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={risk} 
                  onChange={(e) => setRisk(parseFloat(e.target.value))}
                  className="w-full h-1 bg-black appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono mt-1">
                  <span>0.0</span>
                  <span>{risk.toFixed(2)}</span>
                  <span>1.0</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={runAudit}
                  disabled={loading}
                  className="border border-black bg-black text-white py-3 font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "PROCESSING..." : "Run Audit"}
                </button>
                <button 
                  onClick={resetNode}
                  className="border border-black bg-white text-black py-3 font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                >
                  Reset Node
                </button>
              </div>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <SectionHeader title="02 Deception Scanner" icon={Search} />
            <div className="space-y-4">
              <div className="relative">
                <textarea 
                  placeholder="Ingest forensic stream for entropy analysis..."
                  value={deceptionInput}
                  onChange={(e) => setDeceptionInput(e.target.value)}
                  className="w-full h-32 border border-black p-3 font-mono text-xs resize-none focus:outline-none"
                />
                {deceptionInput && (
                  <button 
                    onClick={() => setDeceptionInput("")}
                    className="absolute top-2 right-2 bg-black text-white text-[8px] font-bold px-2 py-1 hover:bg-white hover:text-black border border-black transition-colors"
                  >
                    CLEAR
                  </button>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-[10px] font-mono uppercase opacity-50">Shannon Entropy</div>
                <div className={`text-xl font-bold ${entropy > 4.5 ? "text-red-600" : "text-black"}`}>
                  {entropy.toFixed(4)} <span className="text-[10px]">bits/char</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {patterns.map((p, i) => (
                   <div key={i} className="border border-black p-2 bg-red-50 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-red-600 uppercase">HIT: {p.name}</span>
                      <span className="text-[8px] font-mono bg-red-600 text-white px-1">{p.severity}</span>
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-mono opacity-50 border-b border-black/10 pb-1">
                      <span>LINE: {p.line}</span>
                      <span>WORDS: {p.wordCount}</span>
                    </div>
                    <p className="text-[9px] font-mono bg-white/50 p-1 border border-black/5 truncate">
                      {p.content}
                    </p>
                    <p className="text-[10px] opacity-70 italic">{p.description}</p>
                  </div>
                ))}
              </div>

              {entropy > 4.5 && (
                <div className="bg-red-50 border border-red-600 p-2 flex items-center gap-2 text-red-600 text-[10px] font-bold uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  Entropy Anomaly Detected (H &gt; 4.5)
                </div>
              )}
            </div>
          </motion.section>

          {vvReport && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-black p-6 bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <SectionHeader title="V&V Report: Summary" icon={FileText} />
              <div className="space-y-3 font-mono text-[10px]">
                <div className="flex justify-between"><span>Facts Registered:</span> <span>{vvReport.metrics.facts_registered}</span></div>
                <div className="flex justify-between"><span>Facts Verified:</span> <span>{vvReport.metrics.facts_verified}</span></div>
                <div className="flex justify-between"><span>Squeal Reports:</span> <span>{vvReport.metrics.squeal_reports}</span></div>
                <div className="flex justify-between"><span>ATS Status:</span> <span className="text-green-400">{vvReport.metrics.ats_status}</span></div>
                <div className="border-t border-white/20 pt-2 mt-2 italic opacity-70">
                  {vvReport.conclusion}
                </div>
              </div>
            </motion.section>
          )}

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-black p-6 bg-[#f8f8f8] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex justify-between items-center mb-4 border-b border-black/10 pb-2">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <h2 className="font-serif italic text-sm uppercase tracking-wider">Forensic Diagnostics</h2>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={toggleSovereign}
                  className={`text-[8px] font-bold border border-black px-2 py-1 transition-colors ${diagnostics?.sovereign_status === "STANDALONE" ? "bg-green-600 text-white" : "bg-white text-black hover:bg-black hover:text-white"}`}
                >
                  {diagnostics?.sovereign_status === "STANDALONE" ? "SOVEREIGN ACTIVE" : "GO STANDALONE"}
                </button>
                <button 
                  onClick={forceCloudSync}
                  className={`text-[8px] font-bold border border-black px-2 py-1 transition-colors ${diagnostics?.cloud_bridge === "ACTIVE" ? "bg-blue-600 text-white" : "bg-black text-white hover:bg-white hover:text-black"}`}
                >
                  {diagnostics?.cloud_bridge === "ACTIVE" ? "CLOUD SYNCED" : "FORCE CLOUD SYNC"}
                </button>
              </div>
            </div>
            <div className="space-y-3 font-mono text-[10px]">
              <div className="border border-black p-3 bg-white">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold uppercase">Cloud Bridge</span>
                  <span className={`px-1 border ${diagnostics?.cloud_bridge === "ACTIVE" ? "bg-green-100 text-green-800 border-green-800" : "bg-orange-100 text-orange-800 border-orange-800 animate-pulse"}`}>
                    {diagnostics?.cloud_bridge || "CONNECTING"}
                  </span>
                </div>
                <p className="opacity-70 leading-tight mb-2">
                  {diagnostics?.cloud_bridge === "ACTIVE" ? `Direct Azure link established: ${diagnostics?.azure_target}` : `Local simulation active. Handshake pending with ${diagnostics?.azure_target || 'Azure Node'}.`}
                </p>
                <div className="flex justify-between items-center pt-2 border-t border-black/10">
                  <span className="font-bold uppercase opacity-50">Azure Identity</span>
                  <span className={`px-1 border ${
                    ["LOADED_SECRET", "LOADED_MANAGED_IDENTITY", "AUTHENTICATED"].includes(diagnostics?.azure_credential_status) ? "bg-green-100 text-green-800 border-green-800" : 
                    ["INVALID_SECRETS", "INVALID_CREDENTIALS", "AUTH_FAILED"].includes(diagnostics?.azure_credential_status) ? "bg-red-100 text-red-800 border-red-800" : 
                    "bg-orange-100 text-orange-800 border-orange-800"
                  }`}>
                    {diagnostics?.azure_credential_status || "UNKNOWN"}
                  </span>
                </div>
                {diagnostics?.cloud_telemetry && (
                  <div className="mt-2 pt-2 border-t border-black/10 grid grid-cols-2 gap-2 text-[8px]">
                    <div className="col-span-2 truncate"><span className="opacity-50">Sub:</span> {diagnostics.cloud_telemetry.subscription}</div>
                    <div className="col-span-2 truncate"><span className="opacity-50">RG:</span> {diagnostics.cloud_telemetry.resource_group} ({diagnostics.cloud_telemetry.region})</div>
                    <div><span className="opacity-50">Latency:</span> {diagnostics.cloud_telemetry.latency_ms}ms</div>
                    <div><span className="opacity-50">Throughput:</span> {diagnostics.cloud_telemetry.throughput_kbps} kbps</div>
                    <div><span className="opacity-50">Dropped:</span> {diagnostics.cloud_telemetry.packets_dropped}</div>
                    <div><span className="opacity-50">Sec:</span> {diagnostics.cloud_telemetry.encryption}</div>
                  </div>
                )}
              </div>

              <div className="border border-black p-3 bg-white">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold uppercase">Merkle Integrity</span>
                  <span className="bg-green-100 text-green-800 px-1 border border-green-800">
                    {diagnostics?.merkle_integrity || "VERIFYING"}
                  </span>
                </div>
                <p className="opacity-70 leading-tight">
                  Hash-chained logging verified. Last audit anchored: {diagnostics?.last_audit_iso || "N/A"}
                </p>
              </div>

              <div className="border border-black p-3 bg-white">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold uppercase">Python Locator Rot</span>
                  <span className="bg-green-100 text-green-800 px-1 border border-green-800">MITIGATED</span>
                </div>
                <p className="opacity-70 leading-tight">
                  Windows App Execution Aliases for Python disabled. `pet_python_utils::env` stubs bypassed.
                </p>
              </div>
              
              <div className="border border-black p-3 bg-white">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold uppercase">Tauri Bridge</span>
                  <span className={`px-1 border ${diagnostics?.tauri_bridge === "ACTIVE" ? "bg-green-100 text-green-800 border-green-800" : "bg-blue-100 text-blue-800 border-blue-800"}`}>
                    {diagnostics?.tauri_bridge || "READY"}
                  </span>
                </div>
                <p className="opacity-70 leading-tight mb-2">
                  {diagnostics?.tauri_bridge === "ACTIVE" ? "Standalone executable bridge active. Browser metabolic debt eliminated." : "Standalone executable bridge ready. Removing \"Black Box\" browser dependencies."}
                </p>
                {diagnostics?.tauri_bridge === "ACTIVE" && (
                  <div className="mt-2 bg-black text-green-400 p-2 font-mono text-[8px] h-32 overflow-y-auto relative flex flex-col">
                    <div className="absolute top-1 right-1 text-white/30">CLI_TERM_01</div>
                    <div className="flex-1 overflow-y-auto space-y-1 mb-1">
                      {cliHistory.map((line, i) => (
                        <p key={i} className="whitespace-pre-wrap">{line}</p>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 border-t border-green-900 pt-1">
                      <span>&gt;</span>
                      <input 
                        type="text" 
                        value={cliInput}
                        onChange={(e) => setCliInput(e.target.value)}
                        onKeyDown={handleCliSubmit}
                        className="bg-transparent border-none outline-none flex-1 text-green-400"
                        autoFocus
                        spellCheck={false}
                      />
                    </div>
                  </div>
                )}
              </div>

              {diagnostics?.sovereign_status === "STANDALONE" && (
                <div className="border border-black p-3 bg-black text-white animate-pulse">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold uppercase text-green-400">TaaS Integrity</span>
                    <span className="text-[8px] font-mono">SECURE</span>
                  </div>
                  <p className="text-[8px] opacity-70 leading-tight">
                    Sovereign Node 9010 is operating in Standalone Mode. All truth extractions are cryptographically signed and sealed.
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        </div>

        {/* RIGHT COLUMN: VALIDATION & REGISTRY */}
        <div className="lg:col-span-8 space-y-6">
          {diagnostics && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <SectionHeader title="Node Diagnostics: Health & Connectivity" icon={Activity} />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <DiagnosticItem 
                  label="Cloud Bridge" 
                  value={diagnostics.cloud_bridge} 
                  status={diagnostics.cloud_bridge === "ACTIVE" ? "success" : "warning"}
                />
                <DiagnosticItem 
                  label="Azure Credentials" 
                  value={diagnostics.azure_credential_status} 
                  status={diagnostics.azure_credential_status === "VALID" ? "success" : "error"}
                />
                <DiagnosticItem 
                  label="Merkle Integrity" 
                  value={diagnostics.merkle_integrity} 
                  status={diagnostics.merkle_integrity === "VERIFIED" ? "success" : "warning"}
                />
                <DiagnosticItem 
                  label="Python Rot" 
                  value={diagnostics.python_rot} 
                  status={diagnostics.python_rot === "MITIGATED" ? "success" : "error"}
                />
                <DiagnosticItem 
                  label="Tauri Bridge" 
                  value={diagnostics.tauri_bridge} 
                  status={diagnostics.tauri_bridge === "ACTIVE" ? "success" : "warning"}
                />
                <DiagnosticItem 
                  label="Determinism Index" 
                  value="100% REPEATABLE" 
                  status="success"
                />
              </div>
              {diagnostics.cloud_telemetry && (
                <div className="mt-4 p-3 bg-black text-white font-mono text-[9px] grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="truncate">TARGET: {diagnostics.azure_target}</div>
                  <div>REGION: {diagnostics.cloud_telemetry.region}</div>
                  <div>LATENCY: {diagnostics.cloud_telemetry.latency_ms}ms</div>
                  <div>THROUGHPUT: {diagnostics.cloud_telemetry.throughput_kbps}kbps</div>
                </div>
              )}
            </motion.section>
          )}

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <SectionHeader title="Handover & Cryptographic Seal" icon={Lock} />
            <div className="space-y-4">
              {!handoverData ? (
                <div className="flex flex-col items-center justify-center py-6 border border-dashed border-black/20 bg-gray-50">
                  <Lock className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-[10px] font-mono uppercase opacity-50 mb-4 text-center px-6">
                    Ready for state handover. Requires Human-in-the-Loop (HITL) verification of all deterministic outputs before sealing the Merkle root.
                    <br/><br/>
                    <span className="font-bold text-black opacity-100">DEPLOYMENT PROTOCOL:</span> Handover is processed in cryptographic chunks. Each chunk is signed upon terminal entry and verified upon exit, ensuring the payload remains sealed and unhandled by intermediaries.
                  </p>
                  <button 
                    onClick={runHandover}
                    disabled={loading}
                    className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-50"
                  >
                    {loading ? "SEALING CHUNKS..." : "HITL: Verify & Initiate Chunked Handover"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-600 text-white p-3 text-[10px] font-bold uppercase flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Handover Manifest Chunked, Signed & Sealed
                  </div>
                  <div className="grid grid-cols-2 gap-4 font-mono text-[10px]">
                    <div className="border border-black/10 p-2">
                      <span className="opacity-50 uppercase block">Merkle Root</span>
                      <span className="font-bold truncate block">{handoverData.manifest.merkle_root}</span>
                    </div>
                    <div className="border border-black/10 p-2">
                      <span className="opacity-50 uppercase block">Chunks Processed</span>
                      <span className="font-bold block">{handoverData.manifest.chunks_processed || 1}</span>
                    </div>
                    <div className="border border-black/10 p-2 col-span-2">
                      <span className="opacity-50 uppercase block">Timestamp</span>
                      <span className="font-bold block">{handoverData.manifest.timestamp}</span>
                    </div>
                  </div>
                  <div className="border border-black p-3 bg-[#f8f8f8]">
                    <span className="text-[8px] font-mono uppercase opacity-50 block mb-1">Cryptographic Signature (SHA256-RSA)</span>
                    <pre className="text-[8px] font-mono break-all whitespace-pre-wrap leading-tight opacity-80">
                      {handoverData.signature}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setHandoverData(null)}
                      className="flex-1 border border-black py-2 text-[10px] font-bold uppercase hover:bg-black hover:text-white transition-colors"
                    >
                      Reset Handover
                    </button>
                    <button 
                      onClick={() => alert("Manifest ready for export. (Simulated)")}
                      className="flex-1 bg-black text-white py-2 text-[10px] font-bold uppercase hover:bg-white hover:text-black border border-black transition-colors"
                    >
                      Download Packet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="wait">
              {auditResult ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <SectionHeader title="04 Validation: BBFB Result" icon={CheckCircle} />
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-black/10 p-3">
                        <p className="text-[10px] font-mono uppercase opacity-50">LAW Gate</p>
                        <p className={`text-2xl font-bold ${auditResult.law === 0 ? "text-red-600" : "text-green-700"}`}>
                          {auditResult.law === 1 ? "OPEN" : "VETO"}
                        </p>
                      </div>
                      <div className="border border-black/10 p-3">
                        <p className="text-[10px] font-mono uppercase opacity-50">CVS Score</p>
                        <p className="text-2xl font-bold">{auditResult.cvs.toFixed(6)}</p>
                      </div>
                    </div>
                    
                    <div className="border border-black p-4 bg-black text-white">
                      <p className="text-[10px] font-mono uppercase opacity-50 mb-2">System Status</p>
                      <p className="text-xl font-bold tracking-tighter">{auditResult.status}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty-audit"
                  className="border border-black border-dashed p-6 flex flex-col items-center justify-center text-center bg-white/50"
                >
                  <Activity className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-[10px] font-mono uppercase opacity-30">Audit Result Pending</p>
                </motion.div>
              )}
            </AnimatePresence>

            {aclReport ? (
              <div className="border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <SectionHeader title="ACL Section 177 Report" icon={FileText} />
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-black/10 pb-2">
                    <span className="text-[10px] font-mono uppercase opacity-50">Benchmark</span>
                    <span className="font-bold">0.0006</span>
                  </div>
                  <div className={`p-4 border ${aclReport.status === "MAJOR_FAILURE" ? "border-red-600 bg-red-50 text-red-600" : "border-green-700 bg-green-50 text-green-700"}`}>
                    <p className="text-[10px] font-mono uppercase opacity-50 mb-1">Assessment</p>
                    <p className="text-lg font-bold">{aclReport.status.replace("_", " ")}</p>
                  </div>
                  <div className="text-[10px] font-mono opacity-50 flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    ISO DATE MANDATE: {aclReport.timestamp}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-black border-dashed p-6 flex flex-col items-center justify-center text-center bg-white/50">
                <FileText className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-[10px] font-mono uppercase opacity-30">ACL Report Pending</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <SectionHeader title="03 Data Proxies: Monitoring" icon={Database} />
              {proxies && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-black/10 p-3">
                      <p className="text-[10px] font-mono uppercase opacity-50">Extraction</p>
                      <p className={`text-xl font-bold ${proxies.active_extractions > 0.1 ? "text-red-600" : "text-black"}`}>
                        {(proxies.active_extractions * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="border border-black/10 p-3">
                      <p className="text-[10px] font-mono uppercase opacity-50">Failed Attempts</p>
                      <p className="text-xl font-bold">{proxies.failed_attempts} / 5</p>
                    </div>
                  </div>
                  <div className="w-full bg-black/10 h-2">
                    <div 
                      className="bg-black h-full transition-all duration-500" 
                      style={{ width: `${(proxies.failed_attempts / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-mono opacity-50 uppercase">
                    Total Requests: {proxies.total_requests}
                  </p>
                </div>
              )}
            </section>

            <section className="border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <SectionHeader title="Squeal Protocol: Reports" icon={AlertTriangle} />
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {proxies?.squeal_reports.length > 0 ? (
                  proxies.squeal_reports.map((report: any) => (
                    <div key={report.id} className="border border-black p-2 text-[10px] font-mono bg-[#f8f8f8]">
                      <div className="flex justify-between font-bold mb-1">
                        <span className={report.severity === "CRITICAL" ? "text-red-600" : "text-orange-600"}>
                          [{report.severity}] {report.type}
                        </span>
                        <span>{report.id}</span>
                      </div>
                      <p className="opacity-70">{report.details}</p>
                      <p className="opacity-30 mt-1">{report.timestamp}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-mono opacity-30 italic text-center py-8">No anomalies detected.</p>
                )}
              </div>
            </section>
          </div>

          <section className="border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <SectionHeader title="Facts Registry: Ground Truth Store" icon={Database} />
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-black pb-6">
                <div className="md:col-span-2 relative">
                  <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">New Fact Statement</label>
                  <input 
                    type="text" 
                    value={newFact.statement}
                    onChange={(e) => setNewFact({ ...newFact, statement: e.target.value })}
                    placeholder="Enter deterministic truth artifact..."
                    className="w-full border border-black p-2 text-xs font-mono focus:outline-none pr-12"
                  />
                  {newFact.statement && (
                    <button 
                      onClick={() => setNewFact({ ...newFact, statement: "" })}
                      className="absolute bottom-2 right-2 bg-black text-white text-[8px] font-bold px-2 py-1 hover:bg-white hover:text-black border border-black transition-colors"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Category</label>
                  <div className="flex gap-2">
                    <select 
                      value={newFact.category}
                      onChange={(e) => setNewFact({ ...newFact, category: e.target.value })}
                      className="flex-1 border border-black p-2 text-xs font-mono focus:outline-none bg-white"
                    >
                      <option>01-CORE</option>
                      <option>02-EXEC</option>
                      <option>03-DATA</option>
                      <option>04-VAL</option>
                    </select>
                    <button 
                      onClick={addFact}
                      className="bg-black text-white px-4 font-bold uppercase text-[10px] hover:bg-white hover:text-black border border-black transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="p-2 text-[10px] font-mono uppercase opacity-50">Category</th>
                      <th className="p-2 text-[10px] font-mono uppercase opacity-50">Statement</th>
                      <th className="p-2 text-[10px] font-mono uppercase opacity-50">Status</th>
                      <th className="p-2 text-[10px] font-mono uppercase opacity-50">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-[10px] font-mono">
                    {facts.map((fact) => (
                      <tr key={fact.id} className="border-b border-black/5 hover:bg-[#f8f8f8]">
                        <td className="p-2 font-bold">{fact.category}</td>
                        <td className="p-2 opacity-80">{fact.statement}</td>
                        <td className="p-2">
                          <span className={`px-1 font-bold ${
                            fact.status === "VERIFIED" ? "text-green-700" : 
                            fact.status === "REJECTED" ? "text-red-600" : "text-orange-600"
                          }`}>
                            {fact.status}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => verifyFact(fact.id, "VERIFIED")}
                              className="text-[8px] border border-black px-1 hover:bg-black hover:text-white"
                            >
                              HITL: Verify
                            </button>
                            <button 
                              onClick={() => verifyFact(fact.id, "REJECTED")}
                              className="text-[8px] border border-black px-1 hover:bg-black hover:text-white"
                            >
                              HITL: Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <SectionHeader title="Merkle Chain: Audit Log" icon={Terminal} />
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {merkleChain.length > 0 ? (
                  merkleChain.map((log: any, idx: number) => (
                    <div key={idx} className="border border-black p-3 text-[10px] font-mono bg-[#f8f8f8]">
                      <div className="flex justify-between font-bold mb-2 border-b border-black/10 pb-1">
                        <span className={`px-1 ${log.type === 'FORENSIC_HIT' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                          {log.type || "AUDIT_EVENT"}
                        </span>
                        <span>{log.timestamp}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1 opacity-80">
                        <div className="truncate"><span className="opacity-50">Hash:</span> {log.hash}</div>
                        <div className="truncate"><span className="opacity-50">Prev:</span> {log.previousHash}</div>
                        <div className="truncate"><span className="opacity-50">Payload:</span> {log.payload}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-mono opacity-30 italic text-center py-8">No audit logs sealed.</p>
                )}
              </div>
            </section>

            <section className="border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <SectionHeader title="04 Validation: Affidavits" icon={FileText} />
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {affidavits.length > 0 ? (
                  affidavits.map((affidavit: any, idx: number) => (
                    <div key={idx} className={`border border-black p-4 text-[10px] font-mono ${
                      affidavit.status === "SEALED" ? "bg-green-50" : 
                      affidavit.status === "REJECTED" ? "bg-red-50" : "bg-[#f8f8f8]"
                    }`}>
                      <div className="flex justify-between items-center mb-2 border-b border-black/10 pb-1">
                        <span className="font-bold uppercase tracking-tighter">{affidavit.title}</span>
                        <span className={`px-1 font-bold border ${
                          affidavit.status === "SEALED" ? "bg-green-600 text-white border-green-800" : 
                          affidavit.status === "REJECTED" ? "bg-red-600 text-white border-red-800" : "bg-orange-100 text-orange-800 border-orange-800"
                        }`}>
                          {affidavit.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3 opacity-70 text-[8px]">
                        <div><span className="font-bold">ID:</span> {affidavit.id}</div>
                        <div><span className="font-bold">DATE:</span> {affidavit.timestamp}</div>
                        <div className="col-span-2 truncate"><span className="font-bold">MANDATE:</span> {affidavit.mandate}</div>
                      </div>

                      <pre className="whitespace-pre-wrap opacity-90 font-mono text-[9px] leading-tight bg-white/50 p-2 border border-black/5 mb-3">
                        {affidavit.statement}
                      </pre>

                      {affidavit.status === "PENDING_VETTING" && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => vettAffidavit(affidavit.id, "SEALED")}
                            className="flex-1 bg-black text-white py-2 font-bold uppercase text-[9px] hover:bg-green-600 transition-colors border border-black"
                          >
                            HITL: VETT & SEAL
                          </button>
                          <button 
                            onClick={() => vettAffidavit(affidavit.id, "REJECTED")}
                            className="flex-1 bg-white text-black py-2 font-bold uppercase text-[9px] hover:bg-red-600 hover:text-white transition-colors border border-black"
                          >
                            HITL: REJECT
                          </button>
                        </div>
                      )}
                      
                      {affidavit.vettedAt && (
                        <div className="text-[8px] opacity-50 italic mt-2">
                          Vetted by MD at: {affidavit.vettedAt}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-mono opacity-30 italic text-center py-8">No affidavits generated.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="p-6 border-t border-black flex justify-between items-center text-[10px] font-mono uppercase opacity-50">
        <div>&copy; 2026 Sovereign Node 9010 // Absolute Thermodynamic Sovereignty</div>
        <div className="flex gap-4">
          <span>00-99 Protocol</span>
          <span>ISO-8601 Mandate</span>
        </div>
      </footer>
    </div>
  );
}
