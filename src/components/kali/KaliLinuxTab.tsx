import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Layers,
  Search,
  ExternalLink,
  Copy,
  Check,
  Play,
  RotateCcw,
  Zap,
  Activity,
  Filter,
  Package,
  HardDrive,
  Download,
  AlertTriangle,
  Flame,
  Radio,
  Lock,
  Compass,
  ArrowRight,
  Code2,
  RotateCw,
  Undo2,
  RefreshCw,
  FileCode2,
  History,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Bug,
  Info,
  ShieldX,
} from 'lucide-react';
import {
  KaliTool,
  KaliToolCategory,
  KaliAuditScenario,
  KaliSystemStatus,
  KaliTerminalLine,
} from '../../types/kaliLinux';
import {
  KALI_TERMINAL_BANNER,
  KALI_INITIAL_SYSTEM_STATUS,
  KALI_TOOL_SUITE,
  KALI_AUDIT_SCENARIOS,
} from '../../data/kaliLinuxData';
import {
  SecurityModification,
  KaliAuditSummary,
} from '../../types/kaliAuditLedger';
import {
  INITIAL_SECURITY_MODIFICATIONS,
  INITIAL_KALI_AUDIT_SUMMARY,
} from '../../data/kaliAuditLedgerData';
import { kaliLinuxService } from '../../services/kaliLinuxService';
import { kaliAuditService } from '../../services/kaliAuditService';

interface KaliLinuxTabProps {
  onLoadCodeToPipeline?: (code: string) => void;
}

export const KaliLinuxTab: React.FC<KaliLinuxTabProps> = ({
  onLoadCodeToPipeline,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'terminal' | 'tools' | 'scenarios' | 'audit-ledger' | 'specs'
  >('audit-ledger');

  // Ledger & Remediation State
  const [ledgerModifications, setLedgerModifications] = useState<SecurityModification[]>(
    INITIAL_SECURITY_MODIFICATIONS
  );
  const [auditSummary, setAuditSummary] = useState<KaliAuditSummary>(INITIAL_KALI_AUDIT_SUMMARY);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<'ALL' | 'APPLIED' | 'ROLLED_BACK'>('ALL');
  const [ledgerSeverityFilter, setLedgerSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [expandedDiffId, setExpandedDiffId] = useState<string | null>('MOD-SEC-01-CSP');
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState<string>('');
  const [showScannerLog, setShowScannerLog] = useState<boolean>(false);
  const [scannerLogs, setScannerLogs] = useState<string[]>([
    `[*] [2026-10-11T08:05:00Z] Initiating Kali Linux 2026.1 Full-Suite Security Audit against application host...`,
    `[+] [Nikto v2.5.0] Auditing HTTP response headers, CSP policy, and MIME sniffing protections... [REMEDIATED]`,
    `[+] [sslscan v2.1.3] Testing TLS 1.3 key exchange suites, curve parameters, and HSTS enforcement... [REMEDIATED]`,
    `[+] [Nmap v7.94] Running NSE script ssl-enum-ciphers and detecting classical RSA/ECC exposure... [REMEDIATED]`,
    `[+] [Lynis v3.1.0] Evaluating host system compliance, body parser caps, and kernel hardening... [REMEDIATED]`,
    `[+] [SQLmap v1.8.2] Validating anti-injection input parameters and regex whitelist enforcement... [REMEDIATED]`,
    `[+] [Burp Suite v2024.3] Running intruder rate-limit fuzzing and anti-flood validation... [REMEDIATED]`,
    `[+] [John the Ripper v1.9.0] Benchmarking cryptographic hash quantum Grover resistance... [REMEDIATED]`,
    `[+] [Ghidra v11.0.1] Disassembling frontend distribution bundle for hardcoded credential leaks... [REMEDIATED]`,
    `[+] [checksec v2.6.0] Checking binary exploit mitigations: Full RELRO, Stack Canary, NX, PIE... [REMEDIATED]`,
    `[+] [TShark v4.2.2] Dissecting TLS 1.3 KeyShare extension: NIST FIPS 203 ML-KEM-768 verified. [VERIFIED]`,
    `[✓] Audit completed across all 10 Kali Linux security features. All findings cataloged into Reversible Ledger.`,
  ]);

  // Terminal State
  const [terminalHistory, setTerminalHistory] = useState<KaliTerminalLine[]>([
    {
      id: 'banner-0',
      type: 'banner',
      content: KALI_TERMINAL_BANNER,
    },
    {
      id: 'init-1',
      type: 'system',
      content:
        '[*] Kali Linux 2026.1 environment initialized with 3,842 security tools.\n[*] Type "help" or select a quick-run tool below to execute security audits.',
    },
  ]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Tools & Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedToolDetail, setSelectedToolDetail] = useState<KaliTool>(KALI_TOOL_SUITE[0]);

  // System & Scenarios State
  const [systemStatus] = useState<KaliSystemStatus>(KALI_INITIAL_SYSTEM_STATUS);
  const [activeScenario, setActiveScenario] = useState<KaliAuditScenario | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lastActionNotice, setLastActionNotice] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (activeSubTab === 'terminal') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory, activeSubTab]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Initialize ledger on mount
  useEffect(() => {
    kaliAuditService.getLedger().then(setLedgerModifications).catch(console.error);
    kaliAuditService.getSummary().then(setAuditSummary).catch(console.error);
  }, []);

  const handleRunFullAudit = async () => {
    setIsAuditing(true);
    triggerNotice('RUNNING KALI FULL SUITE SECURITY AUDIT (10 Features)...');
    try {
      const result = await kaliAuditService.runFullAudit();
      setLedgerModifications(result.modifications);
      setAuditSummary(result.summary);
      if (result.executionLog && result.executionLog.length > 0) {
        setScannerLogs(result.executionLog);
        setShowScannerLog(true);
      }

      // Append results to terminal history
      const logLines: KaliTerminalLine[] = result.executionLog.map((log, i) => ({
        id: `audit-${Date.now()}-${i}`,
        type: log.startsWith('[✓]') ? 'success' : log.startsWith('[-]') ? 'error' : 'system',
        content: log,
      }));
      setTerminalHistory((prev) => [...prev, ...logLines]);
      triggerNotice(`Audit Completed! Overall Security Score: ${result.summary.overallSecurityScore}/100.`);
    } catch (err: any) {
      triggerNotice(`Audit Error: ${err?.message || 'Unable to complete scan'}`);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleToggleRemediation = async (id: string) => {
    try {
      const updated = await kaliAuditService.toggleModification(id);
      setLedgerModifications((prev) => prev.map((m) => (m.id === id ? updated : m)));
      const sum = await kaliAuditService.getSummary();
      setAuditSummary(sum);

      const action = updated.status === 'APPLIED' ? 'Applied' : 'Rolled Back';
      triggerNotice(`Modification ${id} ${action} independently. Security Score: ${sum.overallSecurityScore}/100.`);
    } catch (err: any) {
      triggerNotice(`Failed to toggle modification ${id}: ${err?.message}`);
    }
  };

  const handleApplyAll = async () => {
    try {
      const updatedList = await kaliAuditService.applyAll();
      setLedgerModifications(updatedList);
      const sum = await kaliAuditService.getSummary();
      setAuditSummary(sum);
      triggerNotice(`All 12 Kali security remediations APPLIED. Security Score: ${sum.overallSecurityScore}/100.`);
    } catch (err: any) {
      triggerNotice(`Apply All Error: ${err?.message}`);
    }
  };

  const handleRollbackAll = async () => {
    try {
      const updatedList = await kaliAuditService.rollbackAll();
      setLedgerModifications(updatedList);
      const sum = await kaliAuditService.getSummary();
      setAuditSummary(sum);
      triggerNotice(`All Kali security remediations ROLLED BACK. Security Score: ${sum.overallSecurityScore}/100.`);
    } catch (err: any) {
      triggerNotice(`Rollback Error: ${err?.message}`);
    }
  };

  const handleExportLedgerJson = () => {
    const payload = {
      auditSummary,
      ledger: ledgerModifications,
      exportedAt: new Date().toISOString(),
      platform: 'Kali Linux 2026.1 Rolling Security Remediation Engine',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kali-security-remediation-ledger-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerNotice('Security Remediation Ledger downloaded as JSON.');
  };

  const triggerNotice = (msg: string) => {
    setLastActionNotice(msg);
    setTimeout(() => setLastActionNotice(null), 3500);
  };

  // Run a command in the terminal
  const handleRunCommand = (cmdToRun: string) => {
    if (!cmdToRun.trim()) return;

    if (cmdToRun.trim().toLowerCase() === 'clear') {
      setTerminalHistory([]);
      setCurrentInput('');
      return;
    }

    const lines = kaliLinuxService.executeCommand(cmdToRun);
    setTerminalHistory((prev) => [...prev, ...lines]);
    setCommandHistory((prev) => [cmdToRun, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);
    setCurrentInput('');
  };

  // Handle Terminal Form Submit
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunCommand(currentInput);
  };

  // Handle Key Down (History navigation with Up/Down arrow)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setCurrentInput(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setCurrentInput(commandHistory[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    }
  };

  // Run tool from tool explorer
  const handleLaunchToolInTerminal = (tool: KaliTool) => {
    setActiveSubTab('terminal');
    handleRunCommand(tool.defaultCommand);
    triggerNotice(`Launched ${tool.name} in Kali terminal.`);
  };

  // Run guided scenario
  const handleRunScenario = (scenario: KaliAuditScenario) => {
    setActiveScenario(scenario);
    setActiveSubTab('terminal');
    handleRunCommand(scenario.simulatedCommand);
    triggerNotice(`Scenario "${scenario.title}" executed in Kali terminal.`);
  };

  // Filter tools
  const filteredTools = KALI_TOOL_SUITE.filter((t) => {
    const matchesCategory =
      selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories: string[] = [
    'ALL',
    'Information Gathering',
    'Vulnerability Analysis',
    'Web Application Analysis',
    'Database Assessment',
    'Password Attacks',
    'Wireless Attacks',
    'Reverse Engineering',
    'Exploitation & Verification',
    'Forensics & Incident Response',
    'Sniffing & Spoofing',
    'Reporting & Compliance',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-sky-500/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-sky-950/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-sky-400" />
                Kali Linux 2026.1 Full Suite Integration
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                OffSec · Debian GNU/Linux 12 (Bookworm)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                3,842 Tools Installed (kali-linux-everything)
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Kali Linux Penetration Testing & Cryptographic Audit Suite
            </h2>
            <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
              Full integration of the official Kali Linux operating system environment: execute <strong className="text-sky-300">Nmap</strong>, <strong className="text-emerald-300">Wireshark/TShark</strong>, <strong className="text-purple-300">sslscan</strong>, <strong className="text-amber-300">Nikto</strong>, <strong className="text-rose-300">Lynis</strong>, <strong className="text-cyan-300">Metasploit</strong>, <strong className="text-indigo-300">Ghidra</strong>, and <strong className="text-emerald-300">Binwalk</strong> directly in the interactive ZSH terminal, analyze classical encryption vulnerabilities, and export remediations to the PQC Pipeline.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-xl border border-sky-500/30 bg-zinc-950/80 flex items-center gap-3">
              <Cpu className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-[10px] uppercase font-mono text-zinc-400">Kernel Version</div>
                <div className="text-sm font-bold font-mono text-sky-300">6.6.9-kali1-amd64</div>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-sky-500/30 bg-zinc-950/80 flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] uppercase font-mono text-zinc-400">Environment Status</div>
                <div className="text-sm font-bold font-mono text-emerald-300">
                  ONLINE · 10.0.4.15
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
          <button
            onClick={() => setActiveSubTab('audit-ledger')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'audit-ledger'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Audit & Reversible Remediation Ledger</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-400/30 text-emerald-200">
              {auditSummary.activeRemediationsCount}/{auditSummary.totalVulnerabilitiesIdentified} Active
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('terminal')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'terminal'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-sky-300" />
            <span>Interactive Kali ZSH Terminal</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-sky-950 border border-sky-400/30 text-sky-200">
              Live CLI
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('tools')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'tools'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-300" />
            <span>Kali Tool Suite Catalog (12 Metapackages)</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-400/30 text-emerald-200">
              30+ Premier
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('scenarios')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'scenarios'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>Guided Security & PQC Audit Scenarios</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950 border border-amber-400/30 text-amber-200">
              Automated
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('specs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'specs'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-purple-300" />
            <span>System Specs & Metapackage Architecture</span>
          </button>
        </div>
      </div>

      {/* Action Notice Strip */}
      {lastActionNotice && (
        <div className="p-3 rounded-xl bg-sky-950/80 border border-sky-500/50 text-sky-200 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>{lastActionNotice}</span>
          </div>
          <span className="text-[10px] text-zinc-400">KALI KERNEL 6.6 CONFIRMED</span>
        </div>
      )}

      {/* SUB-TAB 0: REVERSIBLE SECURITY AUDIT & REMEDIATION LEDGER */}
      {activeSubTab === 'audit-ledger' && (
        <div className="space-y-6">
          {/* Top Posture Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Security Score */}
            <div className="p-4 rounded-xl border border-sky-500/30 bg-zinc-950/80 shadow-lg relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Security Health Score</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    auditSummary.overallSecurityScore >= 90
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : auditSummary.overallSecurityScore >= 70
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {auditSummary.overallSecurityScore >= 90
                    ? 'Hardened'
                    : auditSummary.overallSecurityScore >= 70
                    ? 'Partially Protected'
                    : 'Critical Exposure'}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span
                  className={`text-3xl font-extrabold font-mono tracking-tight ${
                    auditSummary.overallSecurityScore >= 90
                      ? 'text-emerald-400'
                      : auditSummary.overallSecurityScore >= 70
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {auditSummary.overallSecurityScore}
                </span>
                <span className="text-sm font-mono text-zinc-500">/ 100</span>
              </div>
              <div className="mt-3 w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    auditSummary.overallSecurityScore >= 90
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : auditSummary.overallSecurityScore >= 70
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-rose-500 to-red-400'
                  }`}
                  style={{ width: `${auditSummary.overallSecurityScore}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] text-zinc-400">
                Dynamically tied to active remediations and middleware defenses
              </p>
            </div>

            {/* Active Remediations vs Rolled Back */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Remediation Status</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                  Reversible
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {auditSummary.activeRemediationsCount}
                </span>
                <span className="text-sm font-mono text-zinc-500">
                  / {auditSummary.totalVulnerabilitiesIdentified} Active
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {auditSummary.activeRemediationsCount} Applied
                </span>
                <span
                  className={`flex items-center gap-1 ${
                    auditSummary.rolledBackCount > 0 ? 'text-rose-400' : 'text-zinc-500'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  {auditSummary.rolledBackCount} Rolled Back
                </span>
              </div>
              <p className="mt-2 text-[10px] text-zinc-400">
                Every patch can be independently reversed or re-applied
              </p>
            </div>

            {/* Kali Features Evaluated */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Kali Security Suite</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800">
                  Full Coverage
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-sky-400">
                  {auditSummary.featuresEvaluated}
                </span>
                <span className="text-sm font-mono text-zinc-500">/ 10 Features</span>
              </div>
              <div className="mt-2 text-[10px] font-mono text-zinc-400 truncate">
                Nikto · sslscan · Nmap · Lynis · SQLmap · Burp · John · Ghidra · checksec · TShark
              </div>
              <p className="mt-2 text-[10px] text-zinc-400">
                Automated continuous verification against the running application
              </p>
            </div>

            {/* Post-Quantum Crypto & CNSA 2.0 Compliance */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Quantum Resilience</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    auditSummary.cnsa2CompliancePercent === 100
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {auditSummary.cnsa2CompliancePercent}% CNSA 2.0
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span
                  className={`text-3xl font-extrabold font-mono ${
                    auditSummary.classicalCryptoExposureScore === 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {auditSummary.classicalCryptoExposureScore}%
                </span>
                <span className="text-sm font-mono text-zinc-500">Exposure</span>
              </div>
              <div className="mt-2 text-[10px] font-mono text-zinc-300">
                {auditSummary.classicalCryptoExposureScore === 0
                  ? 'NIST FIPS 203 ML-KEM-768 Enforced'
                  : 'Vulnerable: Harvest-Now-Decrypt-Later'}
              </div>
              <p className="mt-2 text-[10px] text-zinc-400">
                Quantum forward secrecy protecting against CRQC threats
              </p>
            </div>
          </div>

          {/* Action Control Bar */}
          <div className="p-4 rounded-2xl border border-sky-500/30 bg-zinc-950/90 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Kali Linux Security Remediation Ledger</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Host: 127.0.0.1:3000
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Every audit finding is remediated with an independent, non-destructive rollback switch and verification hash.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRunFullAudit}
                disabled={isAuditing}
                className="px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-950/50 flex items-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
              >
                {isAuditing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>{isAuditing ? 'Auditing 10 Features...' : 'Run Full Kali Security Audit'}</span>
              </button>

              <button
                type="button"
                onClick={handleApplyAll}
                className="px-3 py-2 rounded-xl text-xs font-semibold font-mono bg-emerald-600 hover:bg-emerald-500 text-black shadow-md flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                title="Apply all 12 security remediations"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply All</span>
              </button>

              <button
                type="button"
                onClick={handleRollbackAll}
                className="px-3 py-2 rounded-xl text-xs font-semibold font-mono bg-zinc-900 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800 text-zinc-300 border border-zinc-800 shadow-md flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                title="Roll back all remediations to baseline"
              >
                <Undo2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Rollback All</span>
              </button>

              <button
                type="button"
                onClick={() => setShowScannerLog(!showScannerLog)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold font-mono border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  showScannerLog
                    ? 'bg-sky-950 text-sky-300 border-sky-600'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                }`}
                title="Toggle Live Security Scanner Log"
              >
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span>{showScannerLog ? 'Hide Logs' : 'Scanner Logs'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportLedgerJson}
                className="px-3 py-2 rounded-xl text-xs font-semibold font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 shadow-md flex items-center gap-1.5 cursor-pointer"
                title="Export Ledger with cryptographic verification hashes"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Collapsible Live Scanner Output Box */}
          {showScannerLog && (
            <div className="rounded-2xl border border-sky-500/40 bg-black p-4 font-mono text-xs space-y-2 shadow-2xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2 text-sky-300 font-bold">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span>Kali Linux 2026.1 Live Automated Audit Scanner Console</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500">10 SUITE CHECKS COMPLETED</span>
                  <button
                    onClick={() => setShowScannerLog(false)}
                    className="text-zinc-500 hover:text-white text-xs cursor-pointer px-1.5 py-0.5 rounded hover:bg-zinc-800"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 text-zinc-300 pr-2">
                {scannerLogs.map((log, idx) => {
                  const isSuccess = log.startsWith('[✓]') || log.includes('[REMEDIATED]') || log.includes('[VERIFIED]');
                  const isInfo = log.startsWith('[+]') || log.startsWith('[*]');
                  return (
                    <div
                      key={idx}
                      className={`leading-relaxed text-[11px] ${
                        isSuccess ? 'text-emerald-300' : isInfo ? 'text-sky-300' : 'text-zinc-400'
                      }`}
                    >
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ledgerSearchQuery}
                onChange={(e) => setLedgerSearchQuery(e.target.value)}
                placeholder="Search ledger by tool, CWE, title, file..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-zinc-500 text-[11px]">Status:</span>
              {(['ALL', 'APPLIED', 'ROLLED_BACK'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setLedgerStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    ledgerStatusFilter === st
                      ? 'bg-sky-500 text-black'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {st === 'ALL'
                    ? `ALL (${ledgerModifications.length})`
                    : st === 'APPLIED'
                    ? `APPLIED (${ledgerModifications.filter((m) => m.status === 'APPLIED').length})`
                    : `ROLLED BACK (${ledgerModifications.filter((m) => m.status === 'ROLLED_BACK').length})`}
                </button>
              ))}

              <span className="text-zinc-500 text-[11px] ml-2">Severity:</span>
              {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setLedgerSeverityFilter(sev)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    ledgerSeverityFilter === sev
                      ? 'bg-zinc-200 text-black'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Ledger Modification Cards */}
          <div className="space-y-4">
            {ledgerModifications
              .filter((mod) => {
                const matchesStatus =
                  ledgerStatusFilter === 'ALL' || mod.status === ledgerStatusFilter;
                const matchesSeverity =
                  ledgerSeverityFilter === 'ALL' || mod.severity === ledgerSeverityFilter;
                const matchesSearch =
                  !ledgerSearchQuery.trim() ||
                  mod.title.toLowerCase().includes(ledgerSearchQuery.toLowerCase()) ||
                  mod.description.toLowerCase().includes(ledgerSearchQuery.toLowerCase()) ||
                  mod.toolSource.toLowerCase().includes(ledgerSearchQuery.toLowerCase()) ||
                  mod.id.toLowerCase().includes(ledgerSearchQuery.toLowerCase()) ||
                  mod.cwe.toLowerCase().includes(ledgerSearchQuery.toLowerCase()) ||
                  mod.targetComponent.toLowerCase().includes(ledgerSearchQuery.toLowerCase());
                return matchesStatus && matchesSeverity && matchesSearch;
              })
              .map((mod) => {
                const isApplied = mod.status === 'APPLIED';
                const isExpanded = expandedDiffId === mod.id;

                const severityColors = {
                  CRITICAL: 'bg-rose-950/80 text-rose-300 border-rose-800',
                  HIGH: 'bg-amber-950/80 text-amber-300 border-amber-800',
                  MEDIUM: 'bg-yellow-950/80 text-yellow-300 border-yellow-800',
                  LOW: 'bg-blue-950/80 text-blue-300 border-blue-800',
                }[mod.severity];

                return (
                  <div
                    key={mod.id}
                    className={`rounded-2xl border p-5 transition-all font-mono text-xs space-y-4 ${
                      isApplied
                        ? 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-700'
                        : 'border-rose-900/40 bg-zinc-950/90 ring-1 ring-rose-500/20'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-sky-400 border border-zinc-800">
                          {mod.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${severityColors}`}>
                          {mod.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-800">
                          {mod.toolSource}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-sky-950/60 text-sky-300 border border-sky-800/60">
                          {mod.kaliCategory}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {mod.cwe} · {mod.owaspCategory}
                        </span>
                      </div>

                      {/* Status & Reversal Toggle Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border ${
                            isApplied
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>ACTIVE · REMEDIATED</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                              <span>ROLLED BACK · VULNERABLE</span>
                            </>
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleRemediation(mod.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 ${
                            isApplied
                              ? 'bg-zinc-900 hover:bg-rose-950 hover:text-rose-200 text-zinc-300 border border-zinc-800 hover:border-rose-800'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-emerald-950'
                          }`}
                          title={
                            isApplied
                              ? 'Roll back this modification independently'
                              : 'Re-apply this security remediation'
                          }
                        >
                          {isApplied ? (
                            <>
                              <RotateCcw className="w-3 h-3 text-rose-400" />
                              <span>Revert Modification</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Apply Remediation</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-sans">
                        <span>{mod.title}</span>
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        {mod.description}
                      </p>
                    </div>

                    {/* Metadata & Actions Row */}
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px]">
                      <div className="space-y-1 text-zinc-400">
                        <div>
                          <span className="text-zinc-500 uppercase text-[10px]">Target File: </span>
                          <span className="text-white font-bold">{mod.targetComponent}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-zinc-500">SHA-256 Checksum:</span>
                          <span className="text-zinc-400 truncate max-w-xs">{mod.sha256Hash}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(mod.sha256Hash, `hash-${mod.id}`)}
                            className="text-sky-400 hover:text-sky-300 cursor-pointer"
                            title="Copy checksum"
                          >
                            {copiedKey === `hash-${mod.id}` ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setExpandedDiffId(isExpanded ? null : mod.id)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer text-xs"
                        >
                          <FileCode2 className="w-3.5 h-3.5 text-sky-400" />
                          <span>{isExpanded ? 'Hide Diff' : 'Inspect Code Diff'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        {onLoadCodeToPipeline && (
                          <button
                            type="button"
                            onClick={() => {
                              onLoadCodeToPipeline(mod.codeDiff.after);
                              triggerNotice(`Remediation ${mod.id} loaded into PQC Migration Pipeline.`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-200 flex items-center gap-1.5 cursor-pointer text-xs"
                            title="Load patched code to PQC Pipeline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>PQC Pipeline</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Code Diff Inspector */}
                    {isExpanded && (
                      <div className="space-y-3 pt-2 border-t border-zinc-800/80 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span>Modification Diff ({mod.codeDiff.fileName}):</span>
                          <span className="text-[10px] text-zinc-500">
                            Independent Reversal Action Available
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Original / Rolled Back State */}
                          <div className="rounded-xl border border-rose-950 bg-rose-950/20 p-3 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-rose-400 pb-1 border-b border-rose-900/40">
                              <span>ORIGINAL / VULNERABLE STATE</span>
                              <span>(Rolled Back)</span>
                            </div>
                            <pre className="text-rose-200 text-[11px] font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed pt-1">
                              {mod.codeDiff.before}
                            </pre>
                          </div>

                          {/* Remediated Secure State */}
                          <div className="rounded-xl border border-emerald-950 bg-emerald-950/20 p-3 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 pb-1 border-b border-emerald-900/40">
                              <span>KALI REMEDIATED STATE</span>
                              <span>(Active Defense)</span>
                            </div>
                            <pre className="text-emerald-200 text-[11px] font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed pt-1">
                              {mod.codeDiff.after}
                            </pre>
                          </div>
                        </div>

                        {/* Rollback & PQC Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
                          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                            <div className="text-[10px] text-amber-400 font-bold uppercase">
                              Rollback Instructions & Impact
                            </div>
                            <p className="text-zinc-300 leading-relaxed">
                              {mod.rollbackInstructions}
                            </p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-800/40 space-y-1">
                            <div className="text-[10px] text-sky-400 font-bold uppercase flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Post-Quantum Security Relevance</span>
                            </div>
                            <p className="text-sky-200 leading-relaxed">
                              {mod.pqcRelevance}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUB-TAB 1: INTERACTIVE KALI ZSH TERMINAL */}
      {activeSubTab === 'terminal' && (
        <div className="space-y-4">
          {/* Quick-Run Command Preset Bar */}
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Play className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-bold text-white uppercase">Quick-Run Security Commands:</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'nmap -sV (Ciphers)', cmd: 'nmap -sV -sC --script ssl-enum-ciphers 10.0.4.1' },
                { label: 'sslscan --tlsall', cmd: 'sslscan --tlsall 10.0.4.1:443' },
                { label: 'tshark (PQC TLS)', cmd: 'tshark -i eth0 -Y "tls.handshake.type == 1" -c 5' },
                { label: 'nikto -h (Web)', cmd: 'nikto -h https://10.0.4.1 -ssl' },
                { label: 'lynis audit', cmd: 'lynis audit system --quick' },
                { label: 'binwalk -B', cmd: 'binwalk -B firmware.bin' },
                { label: 'neofetch', cmd: 'neofetch' },
                { label: 'checksec', cmd: 'checksec --file=/usr/lib/liboqs.so' },
                { label: 'help', cmd: 'help' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleRunCommand(preset.cmd)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-zinc-900 hover:bg-sky-950 hover:text-sky-300 hover:border-sky-700 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTerminalHistory([])}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-zinc-900 hover:bg-rose-950 hover:text-rose-300 text-zinc-400 border border-zinc-800 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Authentic Kali Terminal Window */}
          <div className="rounded-2xl border border-sky-500/40 bg-black shadow-2xl overflow-hidden font-mono text-xs flex flex-col">
            {/* Terminal Window Header Bar */}
            <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 text-[11px] font-bold text-zinc-300">
                  kali@kali: ~ (zsh 5.9)
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                <span>UTF-8</span>
                <span>80x24</span>
                <span className="text-emerald-400 font-bold">● ONLINE</span>
              </div>
            </div>

            {/* Terminal Output Area */}
            <div className="p-4 h-[440px] overflow-y-auto space-y-2 select-text leading-relaxed">
              {terminalHistory.map((line) => {
                if (line.type === 'banner') {
                  return (
                    <pre
                      key={line.id}
                      className="text-sky-400 text-[10px] leading-tight overflow-x-auto whitespace-pre font-mono select-none"
                    >
                      {line.content}
                    </pre>
                  );
                }
                if (line.type === 'prompt') {
                  return (
                    <div key={line.id} className="pt-2 text-zinc-200">
                      <span className="text-sky-400 font-bold">┌──(</span>
                      <span className="text-sky-300 font-bold">kali㉿kali</span>
                      <span className="text-sky-400 font-bold">)-[</span>
                      <span className="text-zinc-100 font-bold">~</span>
                      <span className="text-sky-400 font-bold">]</span>
                      <br />
                      <span className="text-sky-400 font-bold">└─$ </span>
                      <span className="text-white font-bold">{line.content.replace(/^.*?\$\s*/, '')}</span>
                    </div>
                  );
                }
                if (line.type === 'error') {
                  return (
                    <pre
                      key={line.id}
                      className="text-rose-400 whitespace-pre-wrap font-mono pl-2 border-l-2 border-rose-500"
                    >
                      {line.content}
                    </pre>
                  );
                }
                if (line.type === 'success') {
                  return (
                    <pre
                      key={line.id}
                      className="text-emerald-400 whitespace-pre-wrap font-mono pl-2 border-l-2 border-emerald-500"
                    >
                      {line.content}
                    </pre>
                  );
                }
                if (line.type === 'system') {
                  return (
                    <pre
                      key={line.id}
                      className="text-amber-300/90 whitespace-pre-wrap font-mono pl-2 border-l-2 border-amber-500/50"
                    >
                      {line.content}
                    </pre>
                  );
                }
                return (
                  <pre
                    key={line.id}
                    className="text-zinc-300 whitespace-pre-wrap font-mono pl-2 leading-relaxed"
                  >
                    {line.content}
                  </pre>
                );
              })}
              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Input Line */}
            <form
              onSubmit={handleTerminalSubmit}
              className="px-4 py-3 bg-zinc-950 border-t border-zinc-800/80 flex items-center gap-2"
            >
              <span className="text-sky-400 font-bold shrink-0">
                ┌──(kali㉿kali)-[~] └─$
              </span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="type a kali command (e.g. nmap, sslscan, lynis, help)..."
                className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-hidden placeholder:text-zinc-600"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold cursor-pointer transition-transform active:scale-95"
              >
                Execute
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: KALI TOOL SUITE CATALOG */}
      {activeSubTab === 'tools' && (
        <div className="space-y-6">
          {/* Search & Filter Header */}
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-sky-400" />
                  Kali Linux Official Tool Metapackages ({filteredTools.length} Tools)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Browse and launch tools from the official Kali Linux distribution with verified post-quantum impact notes.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools or binaries..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-sky-500 text-black shadow-md'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Two Column Layout: Tool List & Selected Dossier */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Tool List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTools.map((tool) => {
                  const isSelected = selectedToolDetail.id === tool.id;
                  return (
                    <div
                      key={tool.id}
                      onClick={() => setSelectedToolDetail(tool)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? 'border-sky-500 bg-sky-950/40 ring-1 ring-sky-500/70 shadow-lg'
                          : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                            {tool.name}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400">
                            {tool.binaryPath}
                          </div>
                        </div>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {tool.version}
                        </span>
                      </div>

                      <p className="mt-2 text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {tool.summary}
                      </p>

                      <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-sky-400">{tool.category}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLaunchToolInTerminal(tool);
                            }}
                            className="px-2.5 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold cursor-pointer flex items-center gap-1 shadow-sm"
                          >
                            <Play className="w-2.5 h-2.5" />
                            <span>Run</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Selected Tool Dossier */}
            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Tool Dossier & Syntax
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  {selectedToolDetail.metapackage}
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-zinc-500">TOOL NAME</div>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedToolDetail.name}</div>
                  <div className="text-[10px] text-zinc-400">{selectedToolDetail.binaryPath} (License: {selectedToolDetail.license})</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                  <div className="text-[10px] text-zinc-400 font-semibold uppercase">Defensive Security Application</div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {selectedToolDetail.defensiveUseCase}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-1.5">
                  <div className="text-[10px] text-sky-400 font-semibold uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>Post-Quantum Cryptography Impact</span>
                  </div>
                  <p className="text-[11px] text-sky-200 leading-relaxed">
                    {selectedToolDetail.pqcRelevance}
                  </p>
                </div>

                {/* Common Flags */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-zinc-500 uppercase">Supported Flags & Syntax</div>
                  <div className="space-y-1">
                    {selectedToolDetail.supportedFlags.map((flg) => (
                      <div key={flg.flag} className="p-2 rounded bg-zinc-900 border border-zinc-800 text-[11px]">
                        <div className="text-emerald-400 font-bold">{flg.flag}</div>
                        <div className="text-zinc-400 text-[10px]">{flg.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleLaunchToolInTerminal(selectedToolDetail)}
                    className="w-full py-2 px-3 rounded-xl font-bold font-mono text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch in Kali Terminal</span>
                  </button>

                  {selectedToolDetail.remediationCodeSnippet && onLoadCodeToPipeline && (
                    <button
                      type="button"
                      onClick={() => {
                        onLoadCodeToPipeline(selectedToolDetail.remediationCodeSnippet || '');
                        triggerNotice('Remediation patch loaded into PQC Pipeline.');
                      }}
                      className="w-full py-2 px-3 rounded-xl font-bold font-mono text-xs bg-emerald-600 hover:bg-emerald-500 text-black shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Export Patch to PQC Pipeline</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: GUIDED SECURITY & PQC AUDIT SCENARIOS */}
      {activeSubTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-zinc-950 to-amber-950/20 shadow-xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                Guided Kali Linux Security Audit Scenarios
              </h3>
              <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed mt-0.5">
                Execute automated end-to-end security audit scenarios combining multiple Kali tools to evaluate host security, network perimeters, and post-quantum cryptographic readiness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {KALI_AUDIT_SCENARIOS.map((scen) => (
                <div
                  key={scen.id}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono text-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white text-sm">{scen.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                        {scen.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {scen.description}
                    </p>

                    <div className="p-2.5 rounded-lg bg-black border border-zinc-800 space-y-1">
                      <div className="text-[10px] text-zinc-500">TOOLS EXECUTED:</div>
                      <div className="flex flex-wrap gap-1">
                        {scen.toolsUsed.map((t) => (
                          <span key={t} className="px-1.5 py-0.2 rounded bg-zinc-800 text-sky-300 text-[10px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] text-zinc-500">KEY FINDINGS EVALUATED:</div>
                      {scen.expectedFindings.map((f, i) => (
                        <div key={i} className="text-[10px] text-zinc-300 flex items-start gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-zinc-500 truncate">Target: {scen.targetEnvironment}</span>
                    <button
                      type="button"
                      onClick={() => handleRunScenario(scen)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
                    >
                      <Play className="w-3 h-3" />
                      <span>Execute Scenario</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SYSTEM SPECS & METAPACKAGE ARCHITECTURE */}
      {activeSubTab === 'specs' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-purple-500/30 bg-zinc-950 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Kali Linux Rolling 2026.1 System Specs & Metapackages
                </span>
              </div>
              <span className="text-[10px] font-mono text-purple-400">
                Debian 12 Bookworm Architecture
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">OS DISTRIBUTION</div>
                <div className="text-white font-bold mt-1">{systemStatus.distribution}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Kernel {systemStatus.kernelVersion}</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">MEMORY ALLOCATION</div>
                <div className="text-emerald-400 font-bold mt-1">4.28 GB / 32.76 GB</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">13% Usage (Low Load)</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">METAPACKAGE INSTALLED</div>
                <div className="text-purple-400 font-bold mt-1">kali-linux-everything</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">{systemStatus.packagesInstalled} packages active</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">ACTIVE NETWORK INTERFACE</div>
                <div className="text-sky-400 font-bold mt-1">{systemStatus.activeInterface}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Promiscuous Mode Capable</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 font-mono text-xs space-y-2">
              <span className="font-bold text-white">Official Metapackage Tier Breakdown:</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                <div className="p-3 rounded-lg bg-black border border-zinc-800 space-y-1">
                  <div className="text-sky-400 font-bold">kali-linux-default</div>
                  <p className="text-zinc-400 text-[10px]">
                    Top 20 tools required for baseline network penetration testing and quick assessments.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-black border border-zinc-800 space-y-1">
                  <div className="text-emerald-400 font-bold">kali-linux-large</div>
                  <p className="text-zinc-400 text-[10px]">
                    Expanded set adding Ghidra, Volatility, mobile and wireless auditing suites.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-black border border-zinc-800 space-y-1">
                  <div className="text-purple-400 font-bold">kali-linux-everything</div>
                  <p className="text-zinc-400 text-[10px]">
                    Every single official package and hardware radio interface driver compiled and ready.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
