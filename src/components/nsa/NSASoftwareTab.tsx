import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Play,
  RotateCw,
  GitBranch,
  Star,
  Download,
  AlertTriangle,
  FolderGit2,
  Code2,
  Layers,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  Radio,
  UserX,
  Users,
  Lock,
} from 'lucide-react';
import {
  NSARepository,
  GhidraAnalysisResult,
  GhidraCompromiseHardeningStatus,
  WalkoffPlaybook,
} from '../../types/nsaSoftware';
import { nsaService } from '../../services/nsaService';
import { GhidraHoneypotTelemetry } from './GhidraHoneypotTelemetry';
import { ZeroTrustAllLevelsEnforcer } from './ZeroTrustAllLevelsEnforcer';

interface NSASoftwareTabProps {
  onLoadCodeToPipeline?: (code: string) => void;
}

export const NSASoftwareTab: React.FC<NSASoftwareTabProps> = ({
  onLoadCodeToPipeline,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    | 'zero-trust-all-levels'
    | 'ghidra-containment'
    | 'honeypots'
    | 'ghidra'
    | 'catalog'
    | 'walkoff'
    | 'simp'
  >('zero-trust-all-levels');

  const [repositories, setRepositories] = useState<NSARepository[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Ghidra & Hardening State
  const [ghidraPreset, setGhidraPreset] = useState<string>('rsa-montgomery');
  const [ghidraResult, setGhidraResult] = useState<GhidraAnalysisResult | null>(null);
  const [hardeningStatus, setHardeningStatus] =
    useState<GhidraCompromiseHardeningStatus | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeGhidraPane, setActiveGhidraPane] = useState<
    'bft-consensus' | 'decompiler' | 'disassembly' | 'pcode' | 'symbols' | 'vulnerabilities'
  >('bft-consensus');
  const [microVmEnforced, setMicroVmEnforced] = useState<boolean>(true);
  const [rmiHardBlocked, setRmiHardBlocked] = useState<boolean>(true);
  const [bftQuorumRequired, setBftQuorumRequired] = useState<boolean>(true);

  // WALKOFF State
  const [walkoffPlaybook, setWalkoffPlaybook] = useState<WalkoffPlaybook | null>(null);
  const [isExecutingWalkoff, setIsExecutingWalkoff] = useState<boolean>(false);
  const [walkoffCompleted, setWalkoffCompleted] = useState<boolean>(false);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  useEffect(() => {
    nsaService.getRepositories().then(setRepositories).catch(console.error);
    nsaService.runGhidraAnalysis('rsa-montgomery').then(setGhidraResult).catch(console.error);
    nsaService.getGhidraHardeningStatus().then(setHardeningStatus).catch(console.error);
    nsaService.getWalkoffPlaybook().then(setWalkoffPlaybook).catch(console.error);
  }, []);

  const handleRunGhidra = async (presetId: string) => {
    setGhidraPreset(presetId);
    setIsAnalyzing(true);
    try {
      const res = await nsaService.runGhidraAnalysis(presetId);
      setGhidraResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunWalkoff = async () => {
    setIsExecutingWalkoff(true);
    setWalkoffCompleted(false);
    try {
      await nsaService.executeWalkoff();
      setTimeout(() => {
        setIsExecutingWalkoff(false);
        setWalkoffCompleted(true);
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsExecutingWalkoff(false);
    }
  };

  const filteredRepos = repositories.filter((repo) => {
    const matchesCategory =
      selectedCategory === 'All' || repo.category === selectedCategory;
    const matchesQuery =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const categories = [
    'All',
    'Reverse Engineering',
    'Data Streaming & ETL',
    'SOAR & Automation',
    'Time-Series & Big Data',
    'Compliance & Hardening',
    'Graph Analytics',
    'Secure Coding & Education',
  ];

  return (
    <div className="space-y-6">
      {/* Critical Incident Alert Banner: Ghidra Compromised -> Zero-Trust Containment Active */}
      <div className="p-4 rounded-xl border border-rose-500/60 bg-gradient-to-r from-rose-950/70 via-zinc-950 to-emerald-950/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white uppercase">
                THREAT ADVISORY: GHIDRA COMPROMISED
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-600 text-emerald-300">
                CONTAINMENT: ZERO-TRUST BFT QUORUM ACTIVE
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Incident ID: {hardeningStatus?.incidentId || 'NSA-CIRT-2026-GHIDRA-ZERO-TRUST'}
              </span>
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed">
              <strong>Architecture Hardened:</strong> Ghidra SRE is now treated as an <strong>untrusted, potentially trojanized binary analysis worker</strong>. Direct host execution and Java RMI (ports 13100–13102) are severed. All decompilation runs inside an ephemeral air-gapped <code className="text-cyan-300">Firecracker/seccomp-bpf</code> microVM, and P-Code/SSA outputs require <strong>3-Way Byzantine Fault Tolerant (BFT) Consensus</strong> against independent <code className="text-emerald-300">Radare2/Rizin ESIL</code> and <code className="text-emerald-300">angr VEX IR</code> lifters signed with <strong>NIST FIPS 204 ML-DSA-87</strong>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveSubTab('zero-trust-all-levels')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-950/60"
          >
            <UserX className="w-4 h-4 animate-pulse" />
            <span>Zero Trust Personnel Enforcer</span>
          </button>

          <button
            onClick={() => setActiveSubTab('honeypots')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-950/60"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Defensive Honeypots & Telemetry</span>
          </button>

          {hardeningStatus && onLoadCodeToPipeline && (
            <button
              onClick={() => onLoadCodeToPipeline(hardeningStatus.hardenedArchitectureSnippet)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Audit BFT Architecture in Pipeline</span>
            </button>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-zinc-900/80 to-slate-900/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
                <FolderGit2 className="w-3 h-3 text-blue-400" />
                NSA Zero-Trust Hardened Ecosystem
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-700">
                Ghidra Quarantined in MicroVM
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                FIPS 204 ML-DSA-87 SLEIGH Attestation
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              National Security Agency (NSA) Zero-Trust Hardened Suite
            </h2>
            <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
              Hardened defense architecture assuming complete supply-chain or runtime compromise of <strong className="text-rose-300">Ghidra SRE</strong>. Enforces <strong className="text-emerald-300">Multi-Engine BFT Lifter Quorum (Rizin + angr + LLVM-MC)</strong>, <strong className="text-cyan-300">WALKOFF SOAR Quarantine</strong>, and <strong className="text-blue-300">SIMP SELinux Mandatory Containment</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <a
              href="https://github.com/NationalSecurityAgency"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-colors flex items-center gap-2 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              <span>NSA GitHub Org</span>
            </a>
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] uppercase font-mono text-zinc-400">BFT Lifter Quorum</div>
                <div className="text-sm font-bold font-mono text-emerald-300">3-of-4 Verified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-zinc-800">
          <button
            onClick={() => setActiveSubTab('zero-trust-all-levels')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'zero-trust-all-levels'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                : 'bg-zinc-900/70 text-rose-300 hover:text-white hover:bg-zinc-800/80 border border-rose-800/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Zero Trust All-Levels Enforcer</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-950 border border-rose-400/30 text-rose-200">
              INSIDER DEFENSE
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('ghidra-containment')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'ghidra-containment'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                : 'bg-zinc-900/70 text-rose-300 hover:text-white hover:bg-zinc-800/80 border border-rose-800/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Ghidra Compromise Containment & BFT Hardening</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-950 border border-rose-400/30 text-rose-200">
              ZERO-TRUST
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('honeypots')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'honeypots'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'bg-zinc-900/70 text-purple-300 hover:text-white hover:bg-zinc-800/80 border border-purple-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span>Defensive Honeypots & Telemetry</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-950 border border-purple-400/30 text-purple-200">
              CANARY GRID
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('ghidra')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'ghidra'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-blue-300" />
            <span>Quarantined Ghidra Workbench (BFT Attested)</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950 border border-amber-400/30 text-amber-200">
              SANDBOXED
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-cyan-300" />
            <span>NSA GitHub Catalog</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
              {repositories.length} Repos
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('walkoff')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'walkoff'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-300" />
            <span>WALKOFF SOAR Quarantine Playbook</span>
          </button>

          <button
            onClick={() => setActiveSubTab('simp')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'simp'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>SIMP & SELinux Ghidra Jail (DISA STIG)</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 0: Ghidra Compromise Containment & BFT Hardening Architecture */}
      {activeSubTab === 'ghidra-containment' && hardeningStatus && (
        <div className="space-y-6">
          {/* Interactive Zero-Trust Hardening Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-zinc-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                  1. Firecracker Seccomp-BPF MicroVM
                </span>
                <button
                  onClick={() => setMicroVmEnforced(!microVmEnforced)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                    microVmEnforced
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {microVmEnforced ? 'ENFORCED' : 'BYPASSED'}
                </button>
              </div>
              <p className="text-xs text-zinc-400">
                Isolates Ghidra native C++ <code className="text-zinc-200">decompile</code> worker in a disposable microVM. Blocks 392 Linux syscalls (`execve`, `socket`, `connect`, `ptrace`) so a heap overflow in ELF/DWARF parsing cannot escape.
              </p>
              <div className="text-[11px] font-mono text-cyan-300 pt-1">
                Profile: {hardeningStatus.sandboxPolicy.seccompProfile}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/40 bg-zinc-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                  2. Java RMI & Jython Air-Gap
                </span>
                <button
                  onClick={() => setRmiHardBlocked(!rmiHardBlocked)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                    rmiHardBlocked
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {rmiHardBlocked ? 'HARD-BLOCKED' : 'EXPOSED'}
                </button>
              </div>
              <p className="text-xs text-zinc-400">
                Disables Ghidra Server collaborative RMI ports (13100–13102), runs inside an unshared <code className="text-zinc-200">AIRGAPPED_NULL_NETNS</code>, and requires <strong>FIPS 204 ML-DSA-87</strong> signatures on all SLEIGH `.sla` specs.
              </p>
              <div className="text-[11px] font-mono text-amber-300 pt-1">
                Policy: {hardeningStatus.sandboxPolicy.pluginSignatureEnforcement}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/40 bg-zinc-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                  3. 3-Way BFT Decompiler Quorum
                </span>
                <button
                  onClick={() => setBftQuorumRequired(!bftQuorumRequired)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                    bftQuorumRequired
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {bftQuorumRequired ? 'QUORUM ACTIVE' : 'SINGLE ENGINE'}
                </button>
              </div>
              <p className="text-xs text-zinc-400">
                Prevents a compromised Ghidra binary from hiding RSA/ECC vulnerabilities or falsifying PQC audit reports by requiring AST/CFG agreement across <strong>Rizin ESIL</strong>, <strong>angr VEX IR</strong>, and <strong>LLVM-MC</strong>.
              </p>
              <div className="text-[11px] font-mono text-emerald-300 pt-1">
                Quorum: {hardeningStatus.sandboxPolicy.triEngineConsensusQuorum}
              </div>
            </div>
          </div>

          {/* Mitigated Compromise Attack Vectors Table */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Ghidra Compromise Attack Vectors & Architectural Hardening Matrix</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400">
                All 4 Attack Surfaces Contained
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hardeningStatus.compromiseVectorsMitigated.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-rose-300">{v.vector}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-700 text-emerald-300 shrink-0">
                      {v.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-amber-300">{v.cveOrCwe}</div>
                  <div className="text-xs text-zinc-400">
                    <strong className="text-zinc-200">Compromised Surface:</strong> {v.attackSurface}
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-emerald-900/50 text-xs text-emerald-200">
                    <strong>Hardened Mitigation:</strong> {v.mitigationControl}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hardened BFT Multi-Lifter Python Reference Implementation */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-cyan-300 uppercase">
                Zero-Trust BFT Binary Auditor & ML-DSA-87 SLEIGH Verifier (Python / liboqs)
              </div>
              <button
                onClick={() =>
                  handleCopy(hardeningStatus.hardenedArchitectureSnippet, 'bft_code')
                }
                className="px-3 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'bft_code' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied Hardened Code</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy Hardened Module</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              {hardeningStatus.hardenedArchitectureSnippet}
            </pre>
          </div>
        </div>
      )}

      {/* SUB-TAB: Zero Trust All-Levels Enforcer & Insider Threat Neutralization */}
      {activeSubTab === 'zero-trust-all-levels' && (
        <ZeroTrustAllLevelsEnforcer
          onNavigateToHoneypots={() => setActiveSubTab('honeypots')}
        />
      )}

      {/* SUB-TAB: Ghidra Defensive Deception Honeypots & Real-Time Telemetry */}
      {activeSubTab === 'honeypots' && (
        <GhidraHoneypotTelemetry
          onNavigateToWalkoff={() => setActiveSubTab('walkoff')}
        />
      )}

      {/* SUB-TAB 1: Ghidra SRE Decompiler Workbench */}
      {activeSubTab === 'ghidra' && (
        <div className="space-y-6">
          {/* Preset Selector & Controls */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-blue-400" />
                Target Binary Preset:
              </span>
              <button
                onClick={() => handleRunGhidra('rsa-montgomery')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  ghidraPreset === 'rsa-montgomery'
                    ? 'bg-rose-950/80 border border-rose-600 text-rose-200 font-semibold'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                🔴 Legacy RSA-2048 Exponentiation (x86_64)
              </button>
              <button
                onClick={() => handleRunGhidra('mlkem-pqc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  ghidraPreset === 'mlkem-pqc'
                    ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-200 font-semibold'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                🟢 NIST FIPS 203 ML-KEM-768 NTT (AArch64 NEON)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRunGhidra(ghidraPreset)}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Running 3-Way BFT Lifters...' : 'Re-Run Sandboxed BFT Pass'}</span>
              </button>
              {ghidraResult && onLoadCodeToPipeline && (
                <button
                  onClick={() => onLoadCodeToPipeline(ghidraResult.decompiledC)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
                  title="Load BFT-verified C code into 3-Agent PQC Migration Pipeline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send Verified Code to Pipeline</span>
                </button>
              )}
            </div>
          </div>

          {/* Ghidra Header Summary */}
          {ghidraResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950">
                <div className="text-[10px] uppercase font-mono text-zinc-400">Binary Target</div>
                <div className="text-xs font-bold font-mono text-blue-300 truncate">
                  {ghidraResult.binaryName}
                </div>
                <div className="text-[10px] text-zinc-400">{ghidraResult.format}</div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950">
                <div className="text-[10px] uppercase font-mono text-zinc-400">Target CPU Arch</div>
                <div className="text-xs font-bold font-mono text-cyan-300">
                  {ghidraResult.architecture}
                </div>
                <div className="text-[10px] text-zinc-400">SLED Processor Spec</div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950">
                <div className="text-[10px] uppercase font-mono text-zinc-400">Vulnerabilities</div>
                <div className="text-xs font-bold font-mono text-amber-300 flex items-center gap-1">
                  {ghidraResult.detectedVulnerabilities.length > 0 ? (
                    <>
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      <span>{ghidraResult.detectedVulnerabilities.length} Detected</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>0 Flaws</span>
                    </>
                  )}
                </div>
                <div className="text-[10px] text-zinc-400">CWE / Cryptanalysis</div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950">
                <div className="text-[10px] uppercase font-mono text-zinc-400">Analysis Time</div>
                <div className="text-xs font-bold font-mono text-emerald-300">
                  {ghidraResult.analysisMetrics.analysisTimeMs} ms
                </div>
                <div className="text-[10px] text-zinc-400">Headless Ghidra Pass</div>
              </div>
            </div>
          )}

          {/* Ghidra Workbench Panes */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
            {/* Pane Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-zinc-900 border-b border-zinc-800">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  onClick={() => setActiveGhidraPane('bft-consensus')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeGhidraPane === 'bft-consensus'
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-400 hover:text-emerald-200 hover:bg-zinc-800'
                  }`}
                >
                  3-Way BFT Lifter Quorum
                </button>
                <button
                  onClick={() => setActiveGhidraPane('decompiler')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeGhidraPane === 'decompiler'
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  Quarantined Decompiler (C-Pseudocode)
                </button>
                <button
                  onClick={() => setActiveGhidraPane('disassembly')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeGhidraPane === 'disassembly'
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  Disassembly Listing ({ghidraResult?.instructions.length || 0})
                </button>
                <button
                  onClick={() => setActiveGhidraPane('pcode')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeGhidraPane === 'pcode'
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  P-Code Micro-Ops
                </button>
                <button
                  onClick={() => setActiveGhidraPane('symbols')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeGhidraPane === 'symbols'
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  Symbols & Strings
                </button>
                <button
                  onClick={() => setActiveGhidraPane('vulnerabilities')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeGhidraPane === 'vulnerabilities'
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  Cryptanalytic Findings ({ghidraResult?.detectedVulnerabilities.length || 0})
                </button>
              </div>

              {ghidraResult && (
                <button
                  onClick={() =>
                    handleCopy(ghidraResult.decompiledC, 'decompiled_code')
                  }
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono text-zinc-300 hover:bg-zinc-800 border border-zinc-700/80 transition-colors"
                >
                  {copiedKey === 'decompiled_code' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-zinc-400" />
                      <span>Copy Decompiled</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Pane Content */}
            <div className="p-4 font-mono text-xs overflow-x-auto min-h-[380px] max-h-[550px] overflow-y-auto">
              {/* 0. 3-Way BFT Lifter Quorum */}
              {activeGhidraPane === 'bft-consensus' && ghidraResult?.compromiseContainment && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-emerald-300">
                        Byzantine Fault Tolerant (BFT) Multi-Lifter Consensus Verification
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Ghidra output is untrusted and cross-checked against independent Rizin ESIL, angr VEX IR, and LLVM-MC lifters.
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold">
                      {ghidraResult.compromiseContainment.pqcAttestationSignature.slice(0, 36)}...
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ghidraResult.compromiseContainment.decompilerBftConsensus.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border space-y-1.5 ${
                          item.status === 'TAMPER_DETECTED_POISONED_PCODE'
                            ? 'border-rose-500/60 bg-rose-950/20'
                            : 'border-emerald-500/40 bg-zinc-900/70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white">{item.engine}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'TAMPER_DETECTED_POISONED_PCODE'
                                ? 'bg-rose-600 text-white'
                                : 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-cyan-300">{item.ssaHash}</div>
                        <div className="text-[11px] text-zinc-300">{item.divergenceNotes}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. Decompiler */}
              {activeGhidraPane === 'decompiler' && ghidraResult && (
                <div className="space-y-2">
                  <div className="text-[11px] text-zinc-400 pb-2 border-b border-zinc-800/80 flex items-center justify-between">
                    <span>// Quarantined Ghidra Decompiler 11.2 (Verified via Rizin + angr BFT Quorum)</span>
                    <span className="text-blue-400 font-semibold">{ghidraResult.architecture}</span>
                  </div>
                  <pre className="text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap selection:bg-blue-900/60">
                    {ghidraResult.decompiledC}
                  </pre>
                </div>
              )}

              {/* 2. Disassembly */}
              {activeGhidraPane === 'disassembly' && ghidraResult && (
                <div className="space-y-1">
                  <div className="grid grid-cols-12 text-[10px] text-zinc-400 uppercase tracking-wider py-1 border-b border-zinc-800">
                    <span className="col-span-2">Address</span>
                    <span className="col-span-3">Raw Bytes</span>
                    <span className="col-span-2">Mnemonic</span>
                    <span className="col-span-3">Operands</span>
                    <span className="col-span-2 text-right">Comment</span>
                  </div>
                  {ghidraResult.instructions.map((ins, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 text-[11px] py-1 border-b border-zinc-900/80 hover:bg-zinc-900/50 transition-colors items-center font-mono"
                    >
                      <span className="col-span-2 text-blue-400 font-bold">{ins.address}</span>
                      <span className="col-span-3 text-zinc-400 truncate">{ins.bytes}</span>
                      <span className="col-span-2 text-emerald-400 font-semibold">{ins.mnemonic}</span>
                      <span className="col-span-3 text-zinc-200">{ins.operands}</span>
                      <span className="col-span-2 text-right text-amber-300 text-[10px] truncate">
                        {ins.comment || ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. P-Code Micro-Ops */}
              {activeGhidraPane === 'pcode' && ghidraResult && (
                <div className="space-y-3">
                  <div className="text-[11px] text-zinc-400 pb-2 border-b border-zinc-800">
                    P-Code Intermediate Representation (Processor-Agnostic Micro-Operations for SSA)
                  </div>
                  {ghidraResult.pcodeIntermediate.map((p, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 space-y-1.5">
                      <div className="text-xs font-bold text-cyan-300">{p.instruction}</div>
                      <div className="space-y-1 pl-3 border-l-2 border-blue-500/40">
                        {p.pcode.map((op, oIdx) => (
                          <div key={oIdx} className="text-zinc-300 text-[11px]">
                            {op}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. Symbols & Strings */}
              {activeGhidraPane === 'symbols' && ghidraResult && (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-zinc-300 mb-2">Identified Functions & Symbols:</div>
                    <div className="space-y-1">
                      {ghidraResult.symbols.map((sym, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800 text-xs"
                        >
                          <span className="text-blue-400 font-bold">{sym.name}</span>
                          <span className="text-zinc-400 text-[11px]">{sym.address}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 font-mono">
                            {sym.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-zinc-300 mb-2">Discovered ASCII / Unicode Strings:</div>
                    <div className="space-y-1">
                      {ghidraResult.stringsFound.map((str, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800 text-xs"
                        >
                          <span className="text-emerald-300 truncate max-w-md font-mono">"{str.string}"</span>
                          <span className="text-zinc-400 text-[11px]">{str.address}</span>
                          <span className="text-zinc-400 text-[10px] font-mono">{str.section}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Cryptanalytic Findings */}
              {activeGhidraPane === 'vulnerabilities' && ghidraResult && (
                <div className="space-y-3">
                  {ghidraResult.detectedVulnerabilities.map((vuln, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        vuln.severity === 'CRITICAL'
                          ? 'border-rose-500/60 bg-rose-950/20'
                          : vuln.severity === 'HIGH'
                          ? 'border-amber-500/60 bg-amber-950/20'
                          : 'border-emerald-500/60 bg-emerald-950/20'
                      } space-y-2`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              vuln.severity === 'CRITICAL'
                                ? 'bg-rose-500 text-black'
                                : vuln.severity === 'HIGH'
                                ? 'bg-amber-500 text-black'
                                : 'bg-emerald-500 text-black'
                            }`}
                          >
                            {vuln.severity}
                          </span>
                          <span className="text-sm font-bold text-zinc-100">{vuln.type}</span>
                        </div>
                        <span className="text-xs font-mono text-zinc-400">{vuln.cwe}</span>
                      </div>
                      <p className="text-xs text-zinc-300">{vuln.description}</p>
                      <div className="text-xs text-zinc-400">
                        <strong className="text-zinc-200">Location:</strong> {vuln.location}
                      </div>
                      <div className="text-xs p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-rose-300">
                        <strong>Quantum Threat Analysis:</strong> {vuln.quantumImplication}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: NSA GitHub Catalog */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Search NSA repositories (Ghidra, NiFi, WALKOFF, SIMP)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Repositories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRepos.map((repo) => (
              <div
                key={repo.id}
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white hover:text-blue-300 transition-colors">
                          <a
                            href={repo.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5"
                          >
                            {repo.name}
                            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                          </a>
                        </h3>
                        {repo.status === 'Flagship' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            FLAGSHIP
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">{repo.repoName}</div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-mono text-amber-400 bg-zinc-950 px-2 py-1 rounded border border-zinc-800 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{repo.stars.toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">{repo.description}</p>

                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
                    <div className="text-[10px] uppercase font-mono text-zinc-400">CNSA 2.0 Impact:</div>
                    <div className="text-xs text-zinc-200">{repo.cnsaRelevance}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-mono text-zinc-400">Key Capabilities:</div>
                    <ul className="space-y-1">
                      {repo.keyFeatures.slice(0, 3).map((feat, fIdx) => (
                        <li key={fIdx} className="text-xs text-zinc-300 flex items-start gap-1.5">
                          <span className="text-blue-400">›</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>Language: <strong className="text-zinc-200">{repo.primaryLanguage}</strong></span>
                    <span>License: <strong className="text-zinc-200">{repo.license}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(repo.quickStartCommands.clone, `clone_${repo.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
                      title={repo.quickStartCommands.clone}
                    >
                      {copiedKey === `clone_${repo.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied Clone</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-zinc-500" />
                          <span>git clone</span>
                        </>
                      )}
                    </button>
                    {repo.quickStartCommands.docker && (
                      <button
                        onClick={() =>
                          handleCopy(repo.quickStartCommands.docker!, `docker_${repo.id}`)
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
                        title={repo.quickStartCommands.docker}
                      >
                        {copiedKey === `docker_${repo.id}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied Docker</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-zinc-500" />
                            <span>docker run</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WALKOFF SOAR Orchestration Simulator */}
      {activeSubTab === 'walkoff' && walkoffPlaybook && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                  NSA SOAR Orchestration Engine
                </span>
                <h3 className="text-lg font-bold text-white">{walkoffPlaybook.title}</h3>
                <p className="text-xs text-zinc-300 mt-1">{walkoffPlaybook.description}</p>
              </div>

              <button
                onClick={handleRunWalkoff}
                disabled={isExecutingWalkoff}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isExecutingWalkoff ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Executing SOAR Flow...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Trigger Automated Playbook</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-xs font-mono p-2.5 rounded-lg bg-zinc-950 border border-purple-500/20 text-purple-200">
              <strong>Event Trigger:</strong> {walkoffPlaybook.trigger}
            </div>
          </div>

          {/* Workflow Sequence */}
          <div className="space-y-3">
            {walkoffPlaybook.nodes.map((node, index) => (
              <div
                key={node.id}
                className={`p-4 rounded-xl border transition-all ${
                  walkoffCompleted
                    ? 'border-emerald-500/50 bg-zinc-900/60'
                    : 'border-zinc-800 bg-zinc-950'
                } flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {index + 1}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{node.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-300">
                        {node.app}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">{node.action}</div>
                    {node.outputSnippet && (
                      <div className="text-xs font-mono text-emerald-400 p-2 rounded bg-zinc-950 border border-zinc-800/80 mt-1">
                        ➜ {node.outputSnippet}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    STATUS: OK
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SIMP & Hardening Profiles */}
      {activeSubTab === 'simp' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              NSA System Integrity Management Platform (SIMP) & DISA STIG Baselines
            </h3>
            <p className="text-xs text-zinc-300 max-w-3xl">
              Automated configuration management and crypto policy hardening. Applies NSA-mandated security benchmarks, enforces FIPS 140-3 cryptography levels, and updates host crypto policies to disallow pre-quantum key exchange.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
                Puppet Crypto Policy Module
              </div>
              <pre className="text-xs font-mono text-zinc-300 bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 overflow-x-auto leading-relaxed">
{`# SIMP Crypto Policy Definition (FIPS & CNSA 2.0)
class simp::crypto_policy {
  package { 'crypto-policies': ensure => installed }
  
  exec { 'enforce_cnsa_fips':
    command => '/usr/bin/update-crypto-policies --set FIPS:CNSA',
    unless  => '/usr/bin/update-crypto-policies --show | grep -q CNSA',
    notify  => Service['sshd', 'nginx'],
  }

  # Revoke classical RSA-2048 & non-PQC ciphers
  file { '/etc/crypto-policies/policies/modules/CNSA.pmod':
    content => @(EOT)
      cipher@SSH = -AES-128-CBC -3DES-CBC
      key_exchange@TLS = -ECDHE-RSA -DHE-RSA
      group@TLS = X25519_MLKEM768 MLKEM768
      hash@ALL = -SHA1 -MD5 +SHA384 +SHA512
      EOT
  }
}`}
              </pre>
              <button
                onClick={() =>
                  handleCopy(
                    `/usr/bin/update-crypto-policies --set FIPS:CNSA`,
                    'simp_cmd'
                  )
                }
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-mono bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-colors"
              >
                {copiedKey === 'simp_cmd' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied Command!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy SIMP update-crypto-policies CLI</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
              <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                NSA CSCS Industrial Control OT Checklist
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 space-y-1">
                  <div className="font-bold text-zinc-200">1. Purdue Model Layer 3 Isolation</div>
                  <div className="text-zinc-400">Strict unidirectional security gateway preventing OT telemetry leaks.</div>
                </div>
                <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 space-y-1">
                  <div className="font-bold text-zinc-200">2. Hybrid PQC TLS 1.3 on Substation Routers</div>
                  <div className="text-zinc-400">Mandate X25519+ML-KEM-768 for all remote SCADA telemetry links.</div>
                </div>
                <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 space-y-1">
                  <div className="font-bold text-zinc-200">3. Continuous Modbus/DNP3 Packet Verification</div>
                  <div className="text-zinc-400">NSA CSCS Python sniffers detecting rogue coil writes and replay traffic.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
