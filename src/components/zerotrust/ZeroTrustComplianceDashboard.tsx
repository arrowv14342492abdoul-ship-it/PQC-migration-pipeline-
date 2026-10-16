import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  Lock,
  Unlock,
  AlertTriangle,
  Play,
  RotateCw,
  Server,
  Activity,
  Terminal,
  Filter,
  Search,
  Download,
  Copy,
  Check,
  Eye,
  ArrowRight,
  Flame,
  Zap,
  Globe,
  Layers,
  Cpu,
  Key,
  UserX,
  ExternalLink,
  Radar,
  Sliders,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  ZeroTrustComplianceOverview,
  IncomingConnectionAttempt,
  ConnectionVerdict,
} from '../../types/zeroTrustCompliance';
import { zeroTrustComplianceService } from '../../services/zeroTrustComplianceService';

interface ZeroTrustComplianceDashboardProps {
  onNavigateToNSA?: () => void;
  onNavigateToDefenseHoneypots?: () => void;
  onNotify?: (msg: string) => void;
}

export const ZeroTrustComplianceDashboard: React.FC<ZeroTrustComplianceDashboardProps> = ({
  onNavigateToNSA,
  onNavigateToDefenseHoneypots,
  onNotify,
}) => {
  const [overview, setOverview] = useState<ZeroTrustComplianceOverview | null>(null);
  const [connections, setConnections] = useState<IncomingConnectionAttempt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [verdictFilter, setVerdictFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Selected Connection for Deep Forensic Inspection
  const [selectedConnection, setSelectedConnection] = useState<IncomingConnectionAttempt | null>(null);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [selectedScenario, setSelectedScenario] = useState<
    | 'QUANTUM_DOWNGRADE_ATTEMPT'
    | 'GHIDRA_RMI_DESERIALIZATION'
    | 'LATTICE_MODULUS_POISONING'
    | 'CANARY_ELF_ACCESS'
    | 'SUSPICIOUS_INSIDER_PROBE'
    | 'VALID_ZERO_TRUST_MTLS'
  >('QUANTUM_DOWNGRADE_ATTEMPT');
  const [customSimIp, setCustomSimIp] = useState<string>('198.51.100.114');
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);

  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);

      const [ovRes, connRes] = await Promise.all([
        zeroTrustComplianceService.getOverview(),
        zeroTrustComplianceService.getConnections(),
      ]);

      setOverview(ovRes);
      setConnections(connRes.connections);
      if (!selectedConnection && connRes.connections.length > 0) {
        setSelectedConnection(connRes.connections[0]);
      }
    } catch (err) {
      console.error('Failed to load Zero Trust compliance data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await zeroTrustComplianceService.simulateConnection(selectedScenario, customSimIp);
      setConnections((prev) => [res.connection, ...prev]);
      setOverview(res.overview);
      setSelectedConnection(res.connection);
      setSimulationNotice(
        `SIMULATED INBOUND CONNECTION: ${res.connection.sourceIp} -> ${res.connection.targetEndpoint} (${res.connection.verdict})`
      );
      if (onNotify) {
        onNotify(`Zero Trust Ingress Trapped: ${res.connection.anomalySignature?.name || res.connection.verdict}`);
      }
      setTimeout(() => setSimulationNotice(null), 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSeverConnection = async (connId: string) => {
    try {
      const res = await zeroTrustComplianceService.severConnection(connId);
      setConnections((prev) =>
        prev.map((c) => (c.id === connId ? { ...c, isSevered: true, verdict: 'SEVERED_BLOCKED' } : c))
      );
      if (selectedConnection && selectedConnection.id === connId) {
        setSelectedConnection((prev) =>
          prev ? { ...prev, isSevered: true, verdict: 'SEVERED_BLOCKED' } : null
        );
      }
      if (onNotify) {
        onNotify(res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeverAllQuarantined = async () => {
    try {
      const res = await zeroTrustComplianceService.severAllQuarantined();
      setConnections((prev) =>
        prev.map((c) =>
          c.verdict === 'QUARANTINED_ANOMALOUS' ? { ...c, isSevered: true, verdict: 'SEVERED_BLOCKED' } : c
        )
      );
      await loadData(true);
      if (onNotify) {
        onNotify(res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = () => {
    if (!overview) return;
    zeroTrustComplianceService.exportComplianceReport(overview, connections);
    if (onNotify) {
      onNotify('Zero Trust compliance audit report exported as STIX 2.1 JSON');
    }
  };

  // Filtered connections
  const filteredConnections = connections.filter((conn) => {
    // Verdict filter
    if (verdictFilter !== 'ALL' && conn.verdict !== verdictFilter) return false;

    // Severity filter
    if (severityFilter !== 'ALL') {
      if (!conn.anomalySignature || conn.anomalySignature.severity !== severityFilter) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchIp = conn.sourceIp.toLowerCase().includes(q);
      const matchEndpoint = conn.targetEndpoint.toLowerCase().includes(q);
      const matchProto = conn.protocol.toLowerCase().includes(q);
      const matchAsn = conn.sourceAsnOrOrg.toLowerCase().includes(q);
      const matchSig = conn.anomalySignature?.name.toLowerCase().includes(q);
      const matchHoneypot = conn.honeypotDecoyHit?.honeypotName.toLowerCase().includes(q);
      if (!matchIp && !matchEndpoint && !matchProto && !matchAsn && !matchSig && !matchHoneypot) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Zero Trust Compliance & Ingress Deception Overview */}
      <div className="p-5 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/80 via-zinc-950 to-blue-950/60 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 flex items-center gap-1.5 uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Zero Trust Ingress Monitor
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-500/60 text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                NIST SP 800-207 & DoD ZTA 2.0 Hardened
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-700 flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-purple-400" />
                Deception Honeypot Intercepts Active
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-700 text-zinc-300">
                FIPS 203 ML-KEM / FIPS 204 ML-DSA Enforced
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Zero Trust Compliance & Network Ingress Telemetry
            </h2>
            <p className="text-xs text-zinc-300 max-w-4xl leading-relaxed">
              Real-time aggregation and mathematical verification of all inbound and intra-agency network connection attempts. Default-deny policy enforces <strong className="text-cyan-300">NIST FIPS 203 ML-KEM-1024</strong> and <strong className="text-emerald-300">FIPS 204 ML-DSA-87</strong> client hardware attestations. Any unauthorized probe or cryptographic downgrade automatically trips high-interaction <strong className="text-purple-300">Defense Honeypots</strong> and is quarantined via eBPF netfilter.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="px-3 py-2 rounded-xl text-xs font-mono bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Refresh Telemetry"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isRefreshing ? 'Polling...' : 'Refresh'}</span>
            </button>

            <button
              onClick={handleExport}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export STIX 2.1 Audit</span>
            </button>

            {onNavigateToNSA && (
              <button
                onClick={onNavigateToNSA}
                className="px-3.5 py-2 rounded-xl text-xs font-mono bg-blue-900/60 hover:bg-blue-800/80 border border-blue-700 text-blue-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>NSA Insider Defense</span>
              </button>
            )}

            {onNavigateToDefenseHoneypots && (
              <button
                onClick={onNavigateToDefenseHoneypots}
                className="px-3.5 py-2 rounded-xl text-xs font-mono bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700 text-purple-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                <span>Defense Decoy Grid</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Simulation Feedback Alert */}
      {simulationNotice && (
        <div className="p-3.5 rounded-xl border border-cyan-500/60 bg-cyan-950/40 text-cyan-200 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
            <span>{simulationNotice}</span>
          </div>
          <button
            onClick={() => setSimulationNotice(null)}
            className="text-zinc-400 hover:text-white cursor-pointer text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards: Zero Trust Compliance & Network Defense Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Global Compliance Score */}
        <div className="p-4 rounded-xl border border-cyan-500/40 bg-zinc-950 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">Zero Trust Compliance</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-cyan-300">
              {overview?.globalComplianceScore ?? '98.6'}%
            </span>
            <span className="text-xs text-emerald-400 font-mono">Continuous PEP Active</span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-400 h-1.5 rounded-full"
              style={{ width: `${overview?.globalComplianceScore ?? 98.6}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">
            NIST SP 800-207: {overview?.nistSp800207Alignment ?? 99.2}% · DoD: {overview?.dodZta20Alignment ?? 98.4}%
          </p>
        </div>

        {/* Card 2: Total Ingress Connections & Verification Rate */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">Total Inbound Probes (24h)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">
              {(overview?.totalConnections24h ?? 38450).toLocaleString()}
            </span>
            <span className="text-xs text-cyan-400 font-mono">
              {(overview?.continuousVerificationsSec ?? 18450).toLocaleString()} /sec
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">
            Mutual TLS 1.3 Handshakes & Token Quotes Audited
          </p>
        </div>

        {/* Card 3: Honeypot Intercepts & Anomalies */}
        <div className="p-4 rounded-xl border border-purple-500/40 bg-zinc-950 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">Honeypot Intercepts</span>
            <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-purple-300">
              {(overview?.honeypotTrippedCount ?? 840).toLocaleString()}
            </span>
            <span className="text-xs text-rose-400 font-mono">
              {overview?.quarantinedCount ?? 420} Quarantined
            </span>
          </div>
          <p className="text-[10px] text-purple-300 font-mono">
            6 Active Decoy Services · 48 Exploit Signatures
          </p>
        </div>

        {/* Card 4: Severed / Blocked Traffic & eBPF Netfilter Drops */}
        <div className="p-4 rounded-xl border border-rose-500/40 bg-zinc-950 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">Severed & Blocked</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-rose-300">
              {(overview?.severedCount ?? 1260).toLocaleString()}
            </span>
            <button
              onClick={handleSeverAllQuarantined}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300 hover:bg-rose-900 cursor-pointer transition-colors"
            >
              Sever All Quarantined
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">
            eBPF Kernel SYN-Drop Active on unauthorized origins
          </p>
        </div>
      </div>

      {/* Interactive Simulator: Inject Inbound Connection Probe */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/70 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-mono font-bold text-white uppercase">
              Inbound Connection Probe Simulator (Test Honeypot & Zero-Trust Gates)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            Simulate adversary reconnaissance, downgrade attacks, or rogue insider sweeps
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5">
            <label className="text-[10px] font-mono text-zinc-400 block mb-1">Attack Scenario / Traffic Type:</label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-cyan-300 focus:outline-hidden focus:border-cyan-500 cursor-pointer"
            >
              <option value="QUANTUM_DOWNGRADE_ATTEMPT">
                Adversary Quantum Downgrade Probe (Stripped ML-KEM-1024)
              </option>
              <option value="GHIDRA_RMI_DESERIALIZATION">
                Ghidra Server Java RMI Deserialization Exploit (Port 13100)
              </option>
              <option value="LATTICE_MODULUS_POISONING">
                Lattice Modulus Fault Injection (q=3328 parameter poisoning)
              </option>
              <option value="CANARY_ELF_ACCESS">
                Decoy Honeyfile Harvesting (CNSA Keyloader .elf)
              </option>
              <option value="SUSPICIOUS_INSIDER_PROBE">
                Suspicious Insider Sweep (Port Scan on Deception Grid)
              </option>
              <option value="VALID_ZERO_TRUST_MTLS">
                Authorized Peer Handshake (Valid FIPS 204 ML-DSA Cert)
              </option>
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="text-[10px] font-mono text-zinc-400 block mb-1">Source IP Address:</label>
            <input
              type="text"
              value={customSimIp}
              onChange={(e) => setCustomSimIp(e.target.value)}
              placeholder="e.g. 198.51.100.114 or 10.14.88.99"
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-white focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full py-2 px-3 rounded-lg text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/60"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Injecting Connection...' : 'Simulate Ingress Probe'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* NIST 6-Pillar Compliance Matrix */}
      {overview?.pillarAuditScores && (
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-mono font-bold text-white uppercase">
                DoD & NIST SP 800-207 Zero Trust 6-Pillar Compliance Health
              </h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              100% Policy Enforcement Points Active
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {overview.pillarAuditScores.map((pil) => (
              <div
                key={pil.pillar}
                className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-white">{pil.pillar}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      pil.status === 'HARDENED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                    }`}
                  >
                    {pil.status}
                  </span>
                </div>
                <div className="text-xl font-mono font-bold text-cyan-300">{pil.score}%</div>
                <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                  {pil.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Section: Connection Aggregator & Deep Signature Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Aggregated Incoming Connections Stream (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3 shadow-xl">
            {/* Header, Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Radar className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-mono font-bold text-white uppercase">
                  Aggregated Ingress Stream ({filteredConnections.length})
                </h4>
              </div>

              {/* Verdict Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                {(['ALL', 'HONEYPOT_TRIPPED', 'QUARANTINED_ANOMALOUS', 'ALLOWED_ZERO_TRUST'] as const).map(
                  (v) => (
                    <button
                      key={v}
                      onClick={() => setVerdictFilter(v)}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        verdictFilter === v
                          ? 'bg-cyan-600 text-white font-bold'
                          : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {v === 'ALL'
                        ? 'ALL'
                        : v === 'HONEYPOT_TRIPPED'
                        ? 'TRIPPED HONEYPOT'
                        : v === 'QUARANTINED_ANOMALOUS'
                        ? 'QUARANTINED'
                        : 'ALLOWED'}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Search Bar & Severity Quick Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by IP, endpoint, signature, or honeypot name..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-1 shrink-0 text-[10px] font-mono">
                <span className="text-zinc-500">Severity:</span>
                {(['ALL', 'CRITICAL', 'HIGH'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2 py-1 rounded cursor-pointer ${
                      severityFilter === sev
                        ? 'bg-rose-950 text-rose-300 border border-rose-700 font-bold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Connection Attempt List */}
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredConnections.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                  No connection attempts match the specified filters.
                </div>
              ) : (
                filteredConnections.map((conn) => {
                  const isSelected = selectedConnection?.id === conn.id;
                  const isHoneypotHit = conn.verdict === 'HONEYPOT_TRIPPED';
                  const isQuarantined = conn.verdict === 'QUARANTINED_ANOMALOUS';
                  const isAllowed = conn.verdict === 'ALLOWED_ZERO_TRUST';
                  const isSevered = conn.isSevered;

                  return (
                    <div
                      key={conn.id}
                      onClick={() => setSelectedConnection(conn)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-950/20 shadow-md ring-1 ring-cyan-500/50'
                          : isHoneypotHit
                          ? 'border-purple-500/30 bg-zinc-900/80 hover:border-purple-500/60'
                          : isQuarantined
                          ? 'border-rose-500/30 bg-zinc-900/80 hover:border-rose-500/60'
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-white">
                              {conn.sourceIp}:{conn.sourcePort}
                            </span>
                            <ArrowRight className="w-3 h-3 text-zinc-500" />
                            <span className="text-xs font-mono text-cyan-300">
                              {conn.targetEndpoint}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-zinc-400">
                            {conn.sourceGeo} · {conn.sourceAsnOrOrg}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Verdict Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              isHoneypotHit
                                ? 'bg-purple-950 border border-purple-600 text-purple-300'
                                : isQuarantined
                                ? 'bg-rose-950 border border-rose-600 text-rose-300'
                                : isSevered
                                ? 'bg-zinc-900 border border-zinc-700 text-zinc-400 line-through'
                                : 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                            }`}
                          >
                            {isSevered ? 'SEVERED / DROPPED' : conn.verdict.replace(/_/g, ' ')}
                          </span>

                          {conn.anomalySignature && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                conn.anomalySignature.severity === 'CRITICAL'
                                  ? 'bg-rose-600 text-white animate-pulse'
                                  : 'bg-amber-600 text-white'
                              }`}
                            >
                              {conn.anomalySignature.severity}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Honeypot Decoy Hit Banner */}
                      {conn.honeypotDecoyHit && (
                        <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-800/50 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-1.5 text-purple-300">
                            <Radio className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>Tripped Decoy: <strong>{conn.honeypotDecoyHit.honeypotName}</strong></span>
                          </div>
                          <span className="text-[10px] text-purple-400">
                            {conn.honeypotDecoyHit.decoyType}
                          </span>
                        </div>
                      )}

                      {/* Signature Name if detected */}
                      {conn.anomalySignature && (
                        <div className="text-xs text-rose-300 font-mono flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>
                            <strong>Signature:</strong> {conn.anomalySignature.name} ({conn.anomalySignature.patternId})
                          </span>
                        </div>
                      )}

                      {/* Bottom row: Protocol, Attestation & Sever Button */}
                      <div className="flex flex-wrap items-center justify-between pt-1 text-[10px] font-mono text-zinc-400 border-t border-zinc-800/60">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-300">{conn.protocol}</span>
                          <span>·</span>
                          <span className="text-zinc-500">{conn.clientAttestationStatus}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">{new Date(conn.timestamp).toLocaleTimeString()}</span>
                          {!conn.isSevered && conn.verdict !== 'ALLOWED_ZERO_TRUST' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeverConnection(conn.id);
                              }}
                              className="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold cursor-pointer transition-colors"
                            >
                              Sever
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Deep Forensic Signature Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedConnection ? (
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4 shadow-xl sticky top-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-mono font-bold text-white uppercase">
                    Forensic Signature Inspector
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  ID: {selectedConnection.id}
                </span>
              </div>

              {/* Anomaly Signature Card if present */}
              {selectedConnection.anomalySignature ? (
                <div className="p-4 rounded-xl border border-rose-500/50 bg-rose-950/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-rose-300 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-500" />
                      {selectedConnection.anomalySignature.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-600 text-white font-bold">
                      ANOMALY SCORE: {selectedConnection.anomalySignature.anomalyScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block">MITRE ATT&CK:</span>
                      <span className="text-white font-bold">
                        {selectedConnection.anomalySignature.mitreAttackTechnique}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block">MITRE D3FEND:</span>
                      <span className="text-emerald-300 font-bold">
                        {selectedConnection.anomalySignature.mitreDefendTactic}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-zinc-950 border border-rose-900/40 text-xs text-rose-200 font-mono">
                    <span className="text-zinc-400 block text-[10px]">Rule Triggered:</span>
                    <code>{selectedConnection.anomalySignature.ruleTriggered}</code>
                  </div>

                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-900/50 text-xs text-emerald-300 font-mono">
                    <span className="text-zinc-400 block text-[10px]">Automated Containment:</span>
                    {selectedConnection.anomalySignature.containmentEnforced}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Valid Zero Trust Connection. Full mutual attestation verified with zero anomalies.</span>
                </div>
              )}

              {/* Connection Parameters & Fingerprints */}
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Source Host:</span>
                    <span className="text-white font-bold">{selectedConnection.sourceIp}:{selectedConnection.sourcePort}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Origin Classification:</span>
                    <span className="text-cyan-300 font-bold">{selectedConnection.subnetClass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Target Endpoint:</span>
                    <span className="text-white">{selectedConnection.targetEndpoint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Negotiated Protocol:</span>
                    <span className="text-emerald-300">{selectedConnection.protocol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Requested Cipher:</span>
                    <span className="text-zinc-300 truncate max-w-[200px]" title={selectedConnection.requestedCipherSuite}>
                      {selectedConnection.requestedCipherSuite}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Client Attestation:</span>
                    <span className="text-amber-300 font-bold">{selectedConnection.clientAttestationStatus}</span>
                  </div>
                </div>

                {/* JA4+ Fingerprint */}
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">JA4+ Client TLS Fingerprint:</span>
                    <code className="text-cyan-300 text-xs">{selectedConnection.ja4Fingerprint}</code>
                  </div>
                  <button
                    onClick={() => handleCopy(selectedConnection.ja4Fingerprint, 'ja4')}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    title="Copy Fingerprint"
                  >
                    {copiedKey === 'ja4' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Raw Payload Hex / String Snippet */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Raw Ingress Payload / ClientHello Trace:</span>
                    <button
                      onClick={() => handleCopy(selectedConnection.rawPayloadSnippet, 'raw')}
                      className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      {copiedKey === 'raw' ? 'Copied' : 'Copy Payload'}
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap break-all max-h-36">
                    {selectedConnection.rawPayloadSnippet}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center gap-2">
                {!selectedConnection.isSevered ? (
                  <button
                    onClick={() => handleSeverConnection(selectedConnection.id)}
                    className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/60"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Sever Socket & Drop in eBPF</span>
                  </button>
                ) : (
                  <div className="flex-1 py-2 rounded-lg bg-zinc-900 border border-rose-900/50 text-rose-400 text-xs font-mono text-center font-bold">
                    CONNECTION SEVERED & IP NULL-ROUTED
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-950 text-center text-zinc-500 text-xs font-mono">
              Select an inbound connection attempt to view deep forensic signature details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
