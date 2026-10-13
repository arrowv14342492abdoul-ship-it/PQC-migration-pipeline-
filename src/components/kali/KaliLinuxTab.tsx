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
import { kaliLinuxService } from '../../services/kaliLinuxService';

interface KaliLinuxTabProps {
  onLoadCodeToPipeline?: (code: string) => void;
}

export const KaliLinuxTab: React.FC<KaliLinuxTabProps> = ({
  onLoadCodeToPipeline,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'terminal' | 'tools' | 'scenarios' | 'specs'
  >('terminal');

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
